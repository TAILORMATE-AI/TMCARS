import { createClient } from '@supabase/supabase-js';
import { XMLParser } from 'fast-xml-parser';

// Configure Vercel to accept raw body for XML
export const config = {
  api: {
    bodyParser: false, // We'll handle raw body ourselves for XML
  },
};

// Helper to read raw body
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

export default async function handler(req, res) {
  console.log('=== Mobilox Import Request Started ===');
  console.log('Content-Type:', req.headers['content-type']);

  // 1. Basic Authentication
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.error('ERROR: No authorization header');
    return res.status(401).send('0');
  }

  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];

  // Credentials from Environment Variables
  const validUser = process.env.MOBILOX_USER;
  const validPass = process.env.MOBILOX_PASS;

  console.log('ENV Check - MOBILOX_USER:', validUser ? 'SET' : 'MISSING');
  console.log('ENV Check - MOBILOX_PASS:', validPass ? 'SET' : 'MISSING');
  console.log('ENV Check - SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
  console.log('ENV Check - SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING');

  if (!validUser || !validPass) {
    console.error('ERROR: Missing MOBILOX_USER or MOBILOX_PASS environment variables');
    return res.status(500).send('0');
  }

  if (user !== validUser || pass !== validPass) {
    console.error('ERROR: Invalid credentials - received:', user, '- expected:', validUser);
    return res.status(401).send('0');
  }

  console.log('Authentication: PASSED');

  // Only allow POST
  if (req.method !== 'POST') {
    console.error('ERROR: Method not allowed:', req.method);
    return res.status(405).send('0');
  }

  try {
    // 2. Get raw XML body
    const xmlData = await getRawBody(req);
    console.log('Received XML length:', xmlData.length, 'bytes');
    console.log('XML start:', xmlData.substring(0, 200));

    // 3. Parse XML with attribute support
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_', // Prefix attributes with @_
      textNodeName: '#text',
      isArray: (name) => ['afbeelding', 'accessoire', 'as'].includes(name),
    });

    const jsonObj = parser.parse(xmlData);
    console.log('Parsed JSON keys:', Object.keys(jsonObj));

    // Get the root element (should be 'voertuig')
    const data = jsonObj.voertuig;

    if (!data) {
      console.error('ERROR: No <voertuig> element found in XML');
      console.error('Available keys:', Object.keys(jsonObj));
      throw new Error("Invalid XML Structure - no voertuig element");
    }

    // Get action from attribute (actie="add" on <voertuig> element)
    const action = data['@_actie'];
    const hexonNr = parseInt(data.voertuignr_hexon);

    console.log('Parsed - Action:', action, '| Hexon Nr:', hexonNr);
    console.log('Vehicle:', data.merk, data.model, data.type);

    if (!action) {
      console.error('ERROR: No actie attribute found on voertuig element');
      throw new Error("Missing actie attribute");
    }

    // 4. Initialize Supabase
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('ERROR: Missing Supabase configuration');
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 5. Handle Actions
    if (action === 'delete') {
      console.log('Action: DELETE vehicle', hexonNr);
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('hexon_nr', hexonNr);

      if (error) {
        console.error('Supabase DELETE error:', error);
        throw error;
      }

    } else if (action === 'add' || action === 'change') {
      console.log('Action:', action.toUpperCase(), 'vehicle', hexonNr);

      // Helper: Get text value from XML element (handles elements with attributes)
      const getTextValue = (val) => {
        if (val === null || val === undefined || val === '') return null;
        if (typeof val === 'string') return val;
        if (typeof val === 'number') return String(val);
        if (typeof val === 'object') {
          // Element with attributes - text content is in '#text'
          if (val['#text'] !== undefined) return String(val['#text']);
          return null; // Element with only attributes, no text content
        }
        return null;
      };

      // Helper: Extract price from nested XML structure
      const getPrice = () => {
        // Try different price fields in order of preference
        const priceFields = [
          data.verkoopprijs_particulier,
          data.actieprijs,
          data.verkoopprijs_handel,
          data.meeneemprijs
        ];

        for (const field of priceFields) {
          if (field && field.prijzen) {
            let prijzen = field.prijzen;

            // Handle array of prijzen (multiple countries)
            if (Array.isArray(prijzen)) {
              prijzen = prijzen[0];
            }

            // Navigate to prijs element
            if (prijzen && prijzen.prijs) {
              let prijs = prijzen.prijs;
              // Handle array of prijs elements
              if (Array.isArray(prijs)) {
                prijs = prijs[0];
              }

              if (prijs && prijs.bedrag) {
                const bedrag = getTextValue(prijs.bedrag);
                console.log('Found bedrag:', bedrag);
                if (bedrag) {
                  return parseFloat(bedrag.toString().replace(/\./g, '').replace(',', '.')) || 0;
                }
              }
            }
          }
        }
        return 0;
      };

      const price = getPrice();
      console.log('Extracted price:', price);

      // Parse mileage safely (handles <tellerstand eenheid="K">125000</tellerstand>)
      console.log('Raw tellerstand data:', JSON.stringify(data.tellerstand));
      const mileageRaw = getTextValue(data.tellerstand);
      const mileage = mileageRaw ? parseInt(mileageRaw) : 0;
      console.log('Extracted mileage:', mileage);

      // Year
      const year = parseInt(data.bouwjaar) || 0;

      // Images - handle <afbeeldingen><afbeelding url="..."/></afbeeldingen>
      let imageUrls = '';
      if (data.afbeeldingen && data.afbeeldingen.afbeelding) {
        const imgs = Array.isArray(data.afbeeldingen.afbeelding)
          ? data.afbeeldingen.afbeelding
          : [data.afbeeldingen.afbeelding];

        // Extract URLs from attributes or text content
        imageUrls = imgs
          .map(img => {
            if (typeof img === 'string') return img;
            if (img['@_url']) return img['@_url'];
            if (img['#text']) return img['#text'];
            return null;
          })
          .filter(Boolean)
          .join(',');
      }
      console.log('Image URLs count:', imageUrls ? imageUrls.split(',').length : 0);

      // Categories Logic (Auto-tagging)
      const categories = [];
      const bodyType = getTextValue(data.carrosserie) || 'Overig';
      const bodyLower = bodyType.toLowerCase();
      const fuel = getTextValue(data.brandstof) || '';

      if (bodyLower.includes('suv') || bodyLower.includes('4x4') || bodyLower.includes('terrein')) categories.push('SUV');
      if (bodyLower.includes('cabrio')) categories.push('Cabriolet');
      if (bodyLower.includes('sedan')) categories.push('Sedan');
      if (bodyLower.includes('station') || bodyLower.includes('break') || bodyLower.includes('touring') || bodyLower.includes('avant')) categories.push('Gezinswagens');
      if (bodyLower.includes('bestel') || bodyLower.includes('lichte vracht')) categories.push('Bestelwagens');
      if (bodyLower.includes('hatchback') || bodyLower.includes('stads')) categories.push('Stadswagens');
      if (bodyLower.includes('coupé') || bodyLower.includes('sport')) categories.push('Sportief');

      if (fuel === 'E' || fuel === 'Elektrisch') categories.push('Elek/Hybrid');
      if (fuel === 'H' || fuel === 'Hybride') categories.push('Elek/Hybrid');

      // Mark as "Recent" if newer than 2 years
      if (year >= new Date().getFullYear() - 2) categories.push('Recent');

      // Extract accessories/options from accessoires element
      let options = [];
      if (data.accessoires && data.accessoires.accessoire) {
        const accs = Array.isArray(data.accessoires.accessoire)
          ? data.accessoires.accessoire
          : [data.accessoires.accessoire];

        options = accs
          .map(acc => {
            if (typeof acc === 'string') return acc;
            if (acc.naam) return getTextValue(acc.naam);
            return null;
          })
          .filter(Boolean);
      }
      console.log('Options count:', options.length);

      // Build vehicle data object with ALL specifications
      const vehicleData = {
        hexon_nr: hexonNr,
        make: getTextValue(data.merk) || null,
        model: getTextValue(data.model) || null,
        price: price,
        year: year,
        mileage: mileage,
        fuel_type: fuel || null,
        transmission: getTextValue(data.transmissie) || null,
        image_urls: imageUrls,
        // Body & Exterior
        body_type: bodyType,
        color: getTextValue(data.basiskleur) || null,
        paint_type: getTextValue(data.laksoort) || null,
        doors: parseInt(getTextValue(data.aantal_deuren)) || null,
        // Interior
        interior_color: getTextValue(data.basisinterieurkleur) || getTextValue(data.interieurkleur) || null,
        upholstery: getTextValue(data.bekleding) || null,
        seats: parseInt(getTextValue(data.aantal_zitplaatsen)) || null,
        // Engine & Performance
        horsepower: parseInt(getTextValue(data.vermogen_motor_pk)) || null,
        engine_cc: parseInt(getTextValue(data.cilinder_inhoud)) || null,
        cylinders: parseInt(getTextValue(data.cilinder_aantal)) || null,
        torque: parseInt(getTextValue(data.koppel)) || null,
        top_speed: parseInt(getTextValue(data.topsnelheid)) || null,
        // Weight & Dimensions
        weight: parseInt(getTextValue(data.massa)) || null,
        // Registration & Legal
        license_plate: getTextValue(data.kenteken) || null,
        btw_marge: getTextValue(data.btw_marge) || null,
        // Rich data
        options: options,
        categories: categories,
        description: getTextValue(data.opmerkingen) || null,
        status: 'active',
      };

      console.log('Vehicle data to save:', JSON.stringify(vehicleData, null, 2));

      const { error } = await supabase
        .from('vehicles')
        .upsert(vehicleData, { onConflict: 'hexon_nr' });

      if (error) {
        console.error('Supabase UPSERT error:', JSON.stringify(error));
        throw error;
      }

      console.log('Vehicle saved successfully!');
    } else {
      console.error('ERROR: Unknown action:', action);
      throw new Error("Unknown action: " + action);
    }

    console.log('=== Mobilox Import SUCCESS ===');
    return res.status(200).send('1');

  } catch (error) {
    console.error('=== Mobilox Import FAILED ===');
    console.error('Error:', error.message || JSON.stringify(error));
    console.error('Stack:', error.stack);
    return res.status(500).send('0');
  }
}