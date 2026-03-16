import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) console.warn('❌ NEXT_PUBLIC_SUPABASE_URL is missing');
if (!supabaseAnonKey) console.warn('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');

// Solo inicializar si tenemos las credenciales para evitar errores de compilación
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn('⚠️ Supabase client not initialized: Missing credentials');
}
