require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  try {
    console.log('🔐 Probando inicio de sesión con credenciales proporcionadas...');
    console.log('📧 Email: aiglesias1988@gmail.com');
    console.log('🔑 Contraseña: Fortinero1!');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'aiglesias1988@gmail.com',
      password: 'Fortinero1!'
    });
    
    if (error) {
      console.error('❌ Error al iniciar sesión:', error.message);
      console.error('Código:', error.code);
      
      // Sugerir verificar si el usuario necesita confirmación de email
      if (error.message.includes('email not confirmed')) {
        console.log('💡 Posible solución: Verifica tu correo electrónico para confirmar la cuenta.');
      }
      return;
    }
    
    console.log('✅ ¡Inicio de sesión exitoso!');
    console.log('🆔 ID de usuario:', data.user.id);
    console.log('📧 Email:', data.user.email);
    console.log('🕒 Último acceso:', data.user.last_sign_in_at);
    
    // Intentar obtener la sesión
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (!sessionError && sessionData.session) {
      console.log('🔑 Sesión activa obtenida');
    }
    
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
  }
}

testLogin();