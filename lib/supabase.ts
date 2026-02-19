/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_KEY are set.');
}

export const supabase = createClient(
    supabaseUrl || 'missing_url',
    supabaseAnonKey || 'missing_key'
);
