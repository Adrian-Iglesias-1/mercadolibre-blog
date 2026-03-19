require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthMethods() {
  try {
    console.log('🔍 Probando diferentes métodos de autenticación...');
    
    // Método 1: Sign up normal
    console.log('\n1️⃣ Probando signUp con formato estándar...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (signUpError) {
      console.log('   ❌ Error:', signUpError.message);
      console.log('   Detalles:', JSON.stringify(signUpError, null, 2));
    } else {
      console.log('   ✅ Éxito:', signUpData);
    }
    
    // Método 2: Sign in con usuario existente (si acaso)
    console.log('\n2️⃣ Probando signInWithPassword...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (signInError) {
      console.log('   ❌ Error:', signInError.message);
      console.log('   Detalles:', JSON.stringify(signInError, null, 2));
    } else {
      console.log('   ✅ Éxito:', signInData);
    }
    
    // Método 3: Verificar si podemos obtener la sesión actual
    console.log('\n3️⃣ Probando obtener sesión actual...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('   ❌ Error:', sessionError.message);
    } else {
      console.log('   ✅ Sesión actual:', sessionData);
    }
    
    // Método 4: Verificar usuario actual
    console.log('\n4️⃣ Probando obtener usuario actual...');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('   ❌ Error:', userError.message);
    } else {
      console.log('   ✅ Usuario actual:', userData);
    }
    
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
    console.error('Stack trace:', err.stack);
  }
}

// Ejecutar pruebas
testAuthMethods();