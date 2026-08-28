import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Faltan las variables de entorno de Supabase. Revisa tu archivo .env.local');
}

// Exportamos una única instancia del cliente para usarla en toda la app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
