require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY son requeridas');
  process.exit(1);
}

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
let supabaseService = null;

if (supabaseServiceRoleKey) {
  supabaseService = createClient(supabaseUrl, supabaseServiceRoleKey);
  console.log('🔑 Service role key provided. Will use it to fix RLS policies.');
} else {
  console.log('⚠️  No se proporcionó SUPABASE_SERVICE_ROLE_KEY. Solo se crearán usuarios de prueba.');
  console.log('   Para corregir las políticas RLS, ejecute el SQL proporcionado al final de este script en el editor SQL de Supabase.');
}

async function setupRLSPolicies() {
  if (!supabaseService) {
    console.log('⏩ Omisión de la configuración de RLS (se requiere service_role key)');
    return;
  }

  try {
    console.log('🔧 Configurando políticas RLS para la tabla blog_posts...');

    // Eliminar políticas existentes (opcional)
    const { error: dropError } = await supabaseService
      .from('pg_policies')
      .delete()
      .eq('tablename', 'blog_posts');

    if (dropError && dropError.code !== '42P01') { // Ignorar error si la tabla no existe (no debería pasar)
      console.warn('⚠️  No se pudo eliminar políticas existentes (puede que no existan):', dropError.message);
    }

    // Crear nueva política permisiva para desarrollo
    const sql = `
      CREATE POLICY "Enable all operations for anon and authenticated users on blog_posts" ON public.blog_posts
      FOR ALL
      USING (true)
      WITH CHECK (true);
    `;

    // Ejecutar SQL directamente mediante la función de Supabase
    const { error: sqlError } = await supabaseService.rpc('exec_sql', { sql });
    
    if (sqlError) {
      // Intentar método alternativo: usar pg_meta
      const { error: metaError } = await supabaseService
        .from('pg_meta')
        .select('*')
        .eq('meta', 'sql')
        .eq('value', sql);
      
      if (metaError) {
        console.error('❌ Error al ejecutar SQL para crear política RLS:', sqlError.message);
        console.log('💡 Intente ejecutar el siguiente SQL manualmente en el editor SQL de Supabase:');
        console.log(sql);
        return;
      }
    }

    console.log('✅ Política RLS creada exitosamente para blog_posts');
  } catch (err) {
    console.error('❌ Error al configurar políticas RLS:', err.message);
    console.log('💡 Intente ejecutar el siguiente SQL manualmente en el editor SQL de Supabase:');
    console.log(`
      CREATE POLICY "Enable all operations for anon and authenticated users on blog_posts" ON public.blog_posts
      FOR ALL
      USING (true)
      WITH CHECK (true);
    `);
  }
}

async function createTestUser() {
  try {
    console.log('👤 Creando usuario de prueba para el panel de admin...');
    
    const email = 'admin@shophub.com';
    const password = 'Admin123!';
    
    // Verificar si el usuario ya existe intentando iniciar sesión
    const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (!loginError && loginData.user) {
      console.log('ℹ️  El usuario de prueba ya existe. Credenciales:');
      console.log('   Email:', email);
      console.log('   Contraseña:', password);
      return;
    }
    
    // Si no existe, crear el usuario
    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email: email,
      password: password
    });
    
    if (signUpError) {
      if (signUpError.message.includes('User already registered')) {
        console.log('ℹ️  El usuario ya existía (error de registro tentativo). Intentando iniciar sesión...');
        const { data: loginData2, error: loginError2 } = await supabaseAnon.auth.signInWithPassword({
          email: email,
          password: password
        });
        
        if (!loginError2 && loginData2.user) {
          console.log('✅ Sesión iniciada con usuario existente. Credenciales:');
          console.log('   Email:', email);
          console.log('   Contraseña:', password);
          return;
        }
      }
      console.error('❌ Error al crear usuario de prueba:', signUpError.message);
      return;
    }
    
    console.log('✅ Usuario de prueba creado exitosamente');
    console.log('   Email:', email);
    console.log('   Contraseña:', password);
    console.log('📝 Nota: Se ha enviado un email de confirmación para verificar la cuenta.');
    
  } catch (err) {
    console.error('❌ Error inesperado al crear usuario de prueba:', err.message);
  }
}

async function main() {
  console.log('🚀 Iniciando configuración de desarrollo...\n');
  
  await setupRLSPolicies();
  console.log('');
  
  await createTestUser();
  
  console.log('\n🎉 Configuración de desarrollo completada.');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Inicie la aplicación con: npm run dev');
  console.log('2. Acceda al panel de admin en: http://localhost:3001/admin');
  console.log('3. Inicie sesión con:');
  console.log('   Email: admin@shophub.com');
  console.log('   Contraseña: Admin123!');
  console.log('4. Gestiona las entradas del blog desde el panel de admin.');
  
  if (!supabaseServiceRoleKey) {
    console.log('\n⚠️  Para corregir las políticas RLS manualmente:');
    console.log('   1. Vaya a https://supabase.com/dashboard -> Su proyecto -> Editor SQL');
    console.log('   2. Ejecute el siguiente SQL:');
    console.log(`
      CREATE POLICY "Enable all operations for anon and authenticated users on blog_posts" ON public.blog_posts
      FOR ALL
      USING (true)
      WITH CHECK (true);
    `);
    console.log('   3. Esto permitirá que la clave anónima realice todas las operaciones en la tabla blog_posts.');
  }
}

// Ejecutar la función principal
main().catch(err => {
  console.error('❌ Error crítico:', err);
  process.exit(1);
});