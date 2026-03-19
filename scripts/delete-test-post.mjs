import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://plsubjhcrliclodjbyzd.supabase.co';
const supabaseKey = 'sb_publishable_sALFuyznVo3lRKZby0_WOQ_gPmGnfSI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Buscando posts de test...');
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug')
    .ilike('title', '%test%');

  if (error) {
    console.error('Error buscando:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No se encontraron posts de test (buscando por title). Buscando por slug...');
    const { data: data2, error: err2 } = await supabase
        .from('blog_posts')
        .select('id, title, slug')
        .ilike('slug', '%test%');
    
    if (data2 && data2.length > 0) {
        await deletePosts(data2);
    } else {
        console.log('No test posts found by slug either.');
    }
    return;
  }

  await deletePosts(data);
}

async function deletePosts(posts) {
  for (const post of posts) {
    console.log(`Encontrado: ${post.title} (${post.slug}) con id ${post.id}`);
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', post.id);

    if (error) {
      console.error(`Error eliminando ${post.id}:`, error.message);
    } else {
      console.log(`✅ Post ${post.id} eliminado exitosamente.`);
    }
  }
}

main();
