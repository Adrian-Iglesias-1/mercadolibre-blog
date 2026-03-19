require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
  try {
    console.log('🔧 Creando usuario de administrador...');
    
    // Probar con un email diferente para descartar problemas de formato
    const email = 'test@example.com';
    const password = 'Admin123!';
    
    // Intentar registrar el usuario
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    
    if (error) {
      // Si el usuario ya existe, intentar iniciar sesión
      if (error.message.includes('User already registered')) {
        console.log('ℹ️ El usuario ya existe, intentando iniciar sesión...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        
        if (loginError) {
          console.error('❌ Error al iniciar sesión:', loginError.message);
          return;
        }
        
        console.log('✅ Sesión iniciada correctamente');
        console.log('📧 Email:', loginData.user.email);
        console.log('🆔 ID de usuario:', loginData.user.id);
        return;
      }
      
      console.error('❌ Error al crear usuario:', error.message);
      return;
    }
    
    console.log('✅ Usuario creado correctamente');
    console.log('📧 Email:', data.user.email);
    console.log('🆔 ID de usuario:', data.user.id);
    console.log('📝 Nota: Se ha enviado un email de confirmación a', email);
    console.log('🔑 Credenciales de acceso:');
    console.log('   Email:', email);
    console.log('   Contraseña:', password);
    
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
  }
}

// Ejecutar la función
createAdminUser();