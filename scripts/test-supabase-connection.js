require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a Supabase...');
    
    // Intentar leer datos de la tabla blog_posts
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error al leer datos:', error.message);
      console.error('Código de error:', error.code);
      return;
    }
    
    console.log('✅ Conexión exitosa');
    console.log(`📊 Encontrados ${data.length} registros`);
    console.log('📋 Primeros registros:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
  }
}

testConnection();