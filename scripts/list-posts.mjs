import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://plsubjhcrliclodjbyzd.supabase.co';
const supabaseKey = 'sb_publishable_sALFuyznVo3lRKZby0_WOQ_gPmGnfSI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*');

  if (error) {
    console.error('Error buscando:', error.message);
    return;
  }
  console.log('Cantidad total de posts:', data.length);
  data.forEach((p, i) => console.log(`${i+1}: ${p.title} (${p.slug})`));
}
main();
