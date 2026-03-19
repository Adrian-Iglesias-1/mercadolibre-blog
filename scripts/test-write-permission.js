require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWritePermission() {
  try {
    console.log('🔍 Probando permisos de escritura en blog_posts...');
    
    const testPost = {
      title: 'Test Post - ' + new Date().toISOString(),
      slug: 'test-post-' + Date.now(),
      excerpt: 'This is a test post',
      content: '# Test Content\n\nThis is a test post to verify write permissions.',
      author: 'Test User',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: 'test',
      tags: ['test'],
      featured: false,
      image_url: '',
      search_query: 'test'
    };

    console.log('📝 Intentando insertar post de prueba...');
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([testPost])
      .select();

    if (error) {
      console.error('❌ Error al insertar:', error.message);
      console.error('Código:', error.code);
      console.error('Detalles:', JSON.stringify(error, null, 2));
      
      // Intentar con upsert
      console.log('\n🔄 Intentando con upsert...');
      const { data: upsertData, error: upsertError } = await supabase
        .from('blog_posts')
        .upsert(testPost, { onConflict: 'slug' })
        .select();
        
      if (upsertError) {
        console.error('❌ Error al upsert:', upsertError.message);
        console.error('Código:', upsertError.code);
      } else {
        console.log('✅ Upsert exitoso:', upsertData);
      }
    } else {
      console.log('✅ Inserción exitosa:', data);
      
      // Limpiar el post de prueba
      console.log('\n🧹 Limpiando post de prueba...');
      const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('slug', testPost.slug);
        
      if (deleteError) {
        console.warn('⚠️  Error al limpiar post de prueba:', deleteError.message);
      } else {
        console.log('✅ Post de prueba eliminado');
      }
    }
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
  }
}

testWritePermission();