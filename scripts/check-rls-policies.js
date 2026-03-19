require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRLSPolicies() {
  try {
    console.log('🔍 Consultando políticas RLS de la tabla blog_posts...');
    
    // Consultar información sobre políticas RLS
    const { data, error } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'blog_posts');
    
    if (error) {
      console.error('❌ Error al consultar políticas RLS:', error.message);
      return;
    }
    
    if (data.length === 0) {
      console.log('ℹ️ No se encontraron políticas RLS para la tabla blog_posts');
      return;
    }
    
    console.log(`📋 Encontradas ${data.length} políticas RLS:`);
    data.forEach((policy, index) => {
      console.log(`\n--- Política ${index + 1} ---`);
      console.log(`Nombre: ${policy.policyname}`);
      console.log(`Comando: ${policy.cmd}`);
      console.log(`Roles: ${policy.roles}`);
      console.log(`Expresión USING: ${policy.using}`);
      console.log(`Expresión WITH CHECK: ${policy.with_check}`);
    });
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
  }
}

checkRLSPolicies();