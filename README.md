# TM CARS - Exclusive Automotive

Premium tweedehandswagens en exclusieve service. Bespoke 'Dark Gallery' automotive experience.

## 🚀 Deployment to Vercel

This project is configured for seamless deployment on Vercel.

### 1. Environment Variables
You must set the following environment variables in your Vercel Project Settings:

- `SUPABASE_URL`: Your Supabase Project URL
- `SUPABASE_SERVICE_KEY`: Your Supabase Service Role Key
- `MOBILOX_USER`: Basic Auth Username
- `MOBILOX_PASS`: Basic Auth Password

### 2. API Endpoints
The backend logic is handled via Vercel Serverless Functions found in `/api`.
- **Import Script**: `POST /api/mobilox-import`

### 3. Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## 📂 Project Structure

- `/api`: Serverless functions (Vercel)
- `/src` or `/`: Frontend source code (Vite + React)
- `vercel.json`: Vercel configuration
