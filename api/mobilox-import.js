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

      // Images - handle multiple XML structures
      // Structure 1: <afbeeldingen><afbeelding url="..."/></afbeeldingen>
      // Structure 2: <afbeeldingen><afbeelding>URL</afbeelding></afbeeldingen>
      // Structure 3: <foto's><foto url="..."/></foto's>
      let imageUrls = '';
      console.log('=== IMAGE EXTRACTION DEBUG ===');
      console.log('data.afbeeldingen:', JSON.stringify(data.afbeeldingen));
      console.log('data.fotos:', JSON.stringify(data.fotos));

      // Try afbeeldingen first
      if (data.afbeeldingen && data.afbeeldingen.afbeelding) {
        const imgs = Array.isArray(data.afbeeldingen.afbeelding)
          ? data.afbeeldingen.afbeelding
          : [data.afbeeldingen.afbeelding];

        console.log('Found afbeelding elements:', imgs.length);
        console.log('First image raw:', JSON.stringify(imgs[0]));

        imageUrls = imgs
          .map(img => {
            if (typeof img === 'string') return img;
            // Try different attribute names
            if (img['@_url']) return img['@_url'];
            if (img['@_URL']) return img['@_URL'];
            if (img['#text']) return img['#text'];
            if (img.url) return getTextValue(img.url);
            return null;
          })
          .filter(Boolean)
          .join(',');
      }

      // Try fotos if afbeeldingen didn't work
      if (!imageUrls && data.fotos && data.fotos.foto) {
        const imgs = Array.isArray(data.fotos.foto)
          ? data.fotos.foto
          : [data.fotos.foto];

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
      console.log('Final image URLs:', imageUrls);
      console.log('Image count:', imageUrls ? imageUrls.split(',').length : 0);

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

      // Extract accessories/options - handle multiple XML structures
      console.log('=== OPTIONS EXTRACTION DEBUG ===');
      console.log('data.accessoires:', JSON.stringify(data.accessoires));

      let options = [];
      if (data.accessoires) {
        // Structure 1: <accessoires><accessoire><naam>...</naam></accessoire></accessoires>
        // Structure 2: <accessoires><accessoire>Name</accessoire></accessoires>
        // Structure 3: <accessoires><standaard><accessoire>...</accessoire></standaard><optioneel>...</optioneel></accessoires>

        let accs = [];

        // Check for direct accessoire elements
        if (data.accessoires.accessoire) {
          accs = Array.isArray(data.accessoires.accessoire)
            ? data.accessoires.accessoire
            : [data.accessoires.accessoire];
        }

        // Also check for standaard/optioneel categories
        if (data.accessoires.standaard && data.accessoires.standaard.accessoire) {
          const standaard = Array.isArray(data.accessoires.standaard.accessoire)
            ? data.accessoires.standaard.accessoire
            : [data.accessoires.standaard.accessoire];
          accs = [...accs, ...standaard];
        }

        if (data.accessoires.optioneel && data.accessoires.optioneel.accessoire) {
          const optioneel = Array.isArray(data.accessoires.optioneel.accessoire)
            ? data.accessoires.optioneel.accessoire
            : [data.accessoires.optioneel.accessoire];
          accs = [...accs, ...optioneel];
        }

        console.log('Found accessoire elements:', accs.length);
        if (accs.length > 0) console.log('First accessoire raw:', JSON.stringify(accs[0]));

        options = accs
          .map(acc => {
            if (typeof acc === 'string') return acc;
            if (acc.naam) return getTextValue(acc.naam);
            if (acc['#text']) return acc['#text'];
            return null;
          })
          .filter(Boolean);
      }
      console.log('Options extracted:', options.length, options.slice(0, 5));

      // Debug color fields
      console.log('=== COLOR EXTRACTION DEBUG ===');
      console.log('data.basiskleur:', JSON.stringify(data.basiskleur));
      console.log('data.kleur:', JSON.stringify(data.kleur));
      console.log('data.laksoort:', JSON.stringify(data.laksoort));
      console.log('data.basisinterieurkleur:', JSON.stringify(data.basisinterieurkleur));
      console.log('data.interieurkleur:', JSON.stringify(data.interieurkleur));
      console.log('data.bekleding:', JSON.stringify(data.bekleding));

      // Extract colors with fallbacks - combine with paint type for full description
      const baseColor = getTextValue(data.basiskleur) || getTextValue(data.kleur) || null;
      const paintType = getTextValue(data.laksoort) || null;
      // Combine color with paint type (e.g., "Zwart Metallic")
      let exteriorColor = baseColor;
      if (baseColor && paintType) {
        // Capitalize first letter of color
        const capitalizedColor = baseColor.charAt(0).toUpperCase() + baseColor.slice(1).toLowerCase();
        const capitalizedPaint = paintType.charAt(0).toUpperCase() + paintType.slice(1).toLowerCase();
        exteriorColor = `${capitalizedColor} ${capitalizedPaint}`;
      } else if (baseColor) {
        exteriorColor = baseColor.charAt(0).toUpperCase() + baseColor.slice(1).toLowerCase();
      }

      const interiorColor = getTextValue(data.basisinterieurkleur) || getTextValue(data.interieurkleur) || null;

      console.log('Extracted exterior color:', exteriorColor);
      console.log('Extracted interior color:', interiorColor);

      // Map fuel codes to full Dutch names
      const fuelMap = {
        'D': 'Diesel',
        'B': 'Benzine',
        'E': 'Elektrisch',
        'H': 'Hybride',
        'L': 'LPG',
        'C': 'CNG',
        'W': 'Waterstof',
        'P': 'Plug-in Hybride'
      };
      const fuelCode = getTextValue(data.brandstof) || '';
      const fuelType = fuelMap[fuelCode.toUpperCase()] || fuelCode || null;

      // Map transmission codes to full Dutch names
      const transmissionMap = {
        'A': 'Automaat',
        'H': 'Handgeschakeld',
        'S': 'Semi-automaat',
        'V': 'CVT'
      };
      const transCode = getTextValue(data.transmissie) || '';
      const transmissionType = transmissionMap[transCode.toUpperCase()] || transCode || null;

      console.log('Fuel code:', fuelCode, '→', fuelType);
      console.log('Transmission code:', transCode, '→', transmissionType);

      // Build vehicle data object - CORE FIELDS ONLY (existing columns)
      // Extended fields require running the ALTER TABLE SQL first!
      const vehicleData = {
        hexon_nr: hexonNr,
        make: getTextValue(data.merk) || null,
        model: getTextValue(data.model) || null,
        price: price,
        year: year,
        mileage: mileage,
        fuel_type: fuelType,
        transmission: transmissionType,
        image_urls: imageUrls,
        status: 'active',
        // Extended fields - uncomment after running ALTER TABLE SQL:
        variant: getTextValue(data.type) || null,
        model_year: parseInt(getTextValue(data.modeljaar)) || year,
        first_registration: getTextValue(data.datum_deel_1) || null,
        construction_date: getTextValue(data.constructiedatum) || null,
        vehicle_type: getTextValue(data.voertuigsoort) || null,
        body_type: bodyType,
        doors: parseInt(getTextValue(data.aantal_deuren)) || null,
        seats: parseInt(getTextValue(data.aantal_zitplaatsen)) || null,
        color: exteriorColor,
        color_code: getTextValue(data.kleurcode) || null,
        paint_type: getTextValue(data.laksoort) || null,
        interior_color: interiorColor,
        upholstery: getTextValue(data.bekleding) || null,
        gears: parseInt(getTextValue(data.aantal_versnellingen)) || null,
        engine_cc: parseInt(getTextValue(data.cilinder_inhoud)) || null,
        cylinders: parseInt(getTextValue(data.cilinder_aantal)) || null,
        horsepower: parseInt(getTextValue(data.vermogen_motor_pk)) || null,
        kw_power: parseInt(getTextValue(data.vermogen_motor_kw)) || null,
        torque: parseInt(getTextValue(data.koppel)) || null,
        top_speed: parseInt(getTextValue(data.topsnelheid)) || null,
        acceleration: parseFloat(getTextValue(data.acceleratie)?.replace(',', '.')) || null,
        fuel_city: parseFloat(getTextValue(data.verbruik_stad)?.replace(',', '.')) || null,
        fuel_highway: parseFloat(getTextValue(data.verbruik_snelweg)?.replace(',', '.')) || null,
        fuel_combined: parseFloat(getTextValue(data.gemiddeld_verbruik)?.replace(',', '.')) || null,
        fuel_range: parseInt(getTextValue(data.actieradius)) || null,
        co2_emission: parseInt(getTextValue(data.co2_uitstoot)) || null,
        energy_label: getTextValue(data.energielabel) || null,
        emission_class: getTextValue(data.emissieklasse) || null,
        particulate_filter: getTextValue(data.roetfilter) === 'J' ? true : (getTextValue(data.roetfilter) === 'N' ? false : null),
        weight: parseInt(getTextValue(data.massa)) || null,
        max_weight: parseInt(getTextValue(data.max_massa)) || null,
        payload: parseInt(getTextValue(data.laadvermogen)) || null,
        tow_weight_braked: parseInt(getTextValue(data.max_trekgewicht_geremd)) || null,
        tow_weight_unbraked: parseInt(getTextValue(data.max_trekgewicht_ongeremd)) || null,
        wheelbase: parseInt(getTextValue(data.wielbasis)) || null,
        length: parseInt(getTextValue(data.lengte)) || null,
        width: parseInt(getTextValue(data.breedte)) || null,
        height: parseInt(getTextValue(data.hoogte)) || null,
        license_plate: getTextValue(data.kenteken) || null,
        vin: getTextValue(data.vin) || getTextValue(data.chassisnr) || null,
        btw_marge: getTextValue(data.btw_marge) || null,
        is_new: getTextValue(data.nieuw_voertuig) === 'j' || getTextValue(data.nieuw_voertuig) === 'J',
        apk_until: getTextValue(data.apk?.['@_tot']) || null,
        warranty_months: parseInt(getTextValue(data.garantie_maanden)) || null,
        warranty_km: parseInt(getTextValue(data.garantie_km)) || null,
        previous_owners: parseInt(getTextValue(data.aantal_eigenaren)) || null,
        options: options,
        categories: categories,
        description: getTextValue(data.opmerkingen) || null,
      };

      console.log('=== EXTRACTED DATA SUMMARY ===');
      console.log('Make:', vehicleData.make);
      console.log('Model:', vehicleData.model);
      console.log('Variant:', vehicleData.variant);
      console.log('Price:', vehicleData.price);
      console.log('Year:', vehicleData.year);
      console.log('Mileage:', vehicleData.mileage);
      console.log('Color:', vehicleData.color);
      console.log('Interior:', vehicleData.interior_color);
      console.log('Upholstery:', vehicleData.upholstery);
      console.log('Horsepower:', vehicleData.horsepower);
      console.log('Fuel Combined:', vehicleData.fuel_combined);
      console.log('Image URLs:', vehicleData.image_urls ? vehicleData.image_urls.substring(0, 100) : 'NONE');
      console.log('Options count:', options.length);
      console.log('Categories:', vehicleData.categories);

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