import { createClient } from '@supabase/supabase-js';
import { XMLParser } from 'fast-xml-parser';

// Configure Vercel to accept larger bodies (images/XML can be large)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(req, res) {
  console.log('=== Mobilox Import Request Started ===');

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
    console.error('ERROR: Invalid credentials - user:', user);
    return res.status(401).send('0');
  }

  // Only allow POST
  if (req.method !== 'POST') {
    console.error('ERROR: Method not allowed:', req.method);
    return res.status(405).send('0');
  }

  try {
    // 2. Parse XML Body
    let xmlData = req.body;
    console.log('Request body type:', typeof xmlData);

    // Vercel/Next.js body parsing quirks: sometimes it's already an object, sometimes a string (if content-type text/xml)
    // If it's an object (because bodyParser parsed it automatically), we might need to stringify perfectly or handle it.
    // However, fast-xml-parser expects a string or buffer. 
    // If req.body is an object (empty or parsed), we check if we can get the raw body or if it's just the string passed through.

    if (typeof xmlData !== 'string' && !Buffer.isBuffer(xmlData)) {
      // If bodyParser parsed it as JSON or something else, try to interpret, but for XML it's usually best to trust it's a string if content-type is correct.
      // In Vercel serverless, if no parser matches, it might be a string.
      // If the client sends 'application/xml', Vercel might not auto-parse it, leaving it as string?
      // Let's assume standard behavior: if object, try to convert back or it might be raw. 
      // Actually simplest is:
      if (typeof xmlData === 'object') {
        // This is risky if it's already a partial object. strict enforcement:
        // Ideally we'd use raw-body but Vercel handles this. 
        // We'll trust fast-xml-parser can handle what's passed or json stringify it if safe.
        xmlData = JSON.stringify(xmlData);
      }
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      isArray: (name) => name === 'afbeelding' || name === 'optie', // Force arrays
    });

    const jsonObj = parser.parse(xmlData);

    const rootKey = Object.keys(jsonObj)[0];
    const data = jsonObj[rootKey];

    if (!data) {
      console.error('ERROR: Invalid XML Structure - no data found');
      throw new Error("Invalid XML Structure");
    }

    const action = data.actie;
    const hexonNr = parseInt(data.voertuignr_hexon);

    console.log('Parsed - Action:', action, '| Hexon Nr:', hexonNr, '| Make:', data.merk, '| Model:', data.model);

    // 3. Initialize Supabase
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('ERROR: Missing Supabase configuration');
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 4. Handle Actions
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
      // 5. Data Mapping & Cleaning
      console.log('Action:', action.toUpperCase(), 'vehicle', hexonNr);

      // Helper: Get text value from XML element (handles elements with attributes)
      const getTextValue = (val) => {
        if (val === null || val === undefined || val === '') return null;
        if (typeof val === 'string' || typeof val === 'number') return val;
        if (typeof val === 'object') {
          // Element with attributes but text content is in '#text'
          if (val['#text'] !== undefined) return val['#text'];
          return null; // Element with only attributes, no text content
        }
        return null;
      };

      // Price Cleaning
      let priceRaw = data.verkoopprijs || data.prijs || '0';
      if (typeof priceRaw === 'object') {
        priceRaw = getTextValue(priceRaw) || '0';
      }
      let priceClean = priceRaw.toString().replace(/\./g, '').replace(',', '.');
      const price = parseFloat(priceClean) || 0;

      // Images
      let imageUrls = '';
      if (data.afbeeldingen && data.afbeeldingen.afbeelding) {
        const imgs = Array.isArray(data.afbeeldingen.afbeelding)
          ? data.afbeeldingen.afbeelding
          : [data.afbeeldingen.afbeelding];
        imageUrls = imgs.filter(Boolean).join(',');
      }

      // Categories Logic (Auto-tagging)
      const categories = [];
      const bodyType = data.carrosserie || 'Overig';
      const bodyLower = bodyType.toLowerCase();
      const fuel = data.brandstof || '';
      const year = parseInt(data.bouwjaar) || 0;

      if (bodyLower.includes('suv') || bodyLower.includes('4x4') || bodyLower.includes('terrein')) categories.push('SUV');
      if (bodyLower.includes('cabrio')) categories.push('Cabriolet');
      if (bodyLower.includes('station') || bodyLower.includes('break') || bodyLower.includes('touring') || bodyLower.includes('avant')) categories.push('Gezinswagens');
      if (bodyLower.includes('bestel') || bodyLower.includes('lichte vracht')) categories.push('Bestelwagens');
      if (bodyLower.includes('hatchback') || bodyLower.includes('stads')) categories.push('Stadswagens');
      if (bodyLower.includes('coupé') || bodyLower.includes('sport')) categories.push('Sportief');

      if (fuel === 'Elektrisch' || fuel === 'Hybride') categories.push('Elek/Hybrid');

      // Mark as "Recent" if newer than 2 years
      if (year >= new Date().getFullYear() - 2) categories.push('Recent');

      // Options (Handle comma separated string or array)
      let options = [];
      if (data.opties) {
        if (Array.isArray(data.opties)) options = data.opties;
        else if (typeof data.opties === 'string') options = data.opties.split(',').map(s => s.trim());
        // Handle specific nested XML structures like <opties><optie>...</optie></opties>
        else if (data.opties.optie && Array.isArray(data.opties.optie)) options = data.opties.optie;
      }

      // Parse mileage safely (handles <tellerstand eenheid="K"></tellerstand>)
      const mileageRaw = getTextValue(data.tellerstand);
      const mileage = mileageRaw ? parseInt(mileageRaw) : 0;

      const vehicleData = {
        hexon_nr: hexonNr,
        license_plate: getTextValue(data.kenteken) || null,
        make: data.merk || null,
        model: data.model || null,
        price: isNaN(price) ? 0 : price,
        year: isNaN(year) ? 0 : year,
        mileage: isNaN(mileage) ? 0 : mileage,
        fuel_type: data.brandstof || null,
        transmission: data.transmissie || null,
        image_urls: imageUrls,
        body_type: bodyType,
        categories: categories,
        options: options,
        status: 'active',
        updated_at: new Date().toISOString(),
      };

      console.log('Vehicle data to save:', JSON.stringify(vehicleData));

      const { error } = await supabase
        .from('vehicles')
        .upsert(vehicleData, { onConflict: 'hexon_nr' });

      if (error) {
        console.error('Supabase UPSERT error:', JSON.stringify(error));
        throw error;
      }
    }

    console.log('=== Mobilox Import SUCCESS ===');
    res.status(200).send('1');

  } catch (error) {
    console.error('=== Mobilox Import FAILED ===');
    console.error('Error:', error.message || JSON.stringify(error));
    res.status(500).send('0');
  }
}