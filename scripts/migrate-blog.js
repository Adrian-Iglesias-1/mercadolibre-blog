const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan las variables de entorno de Supabase en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const postsDirectory = path.join(process.cwd(), 'content', 'blog');

async function migrate() {
  console.log('🚀 Iniciando migración de blog a Supabase...');

  if (!fs.existsSync(postsDirectory)) {
    console.log('⚠️ No se encontró el directorio de posts locales.');
    return;
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const mdFiles = fileNames.filter(name => name.endsWith('.md'));

  console.log(`📝 Encontrados ${mdFiles.length} archivos para migrar.`);

  for (const fileName of mdFiles) {
    try {
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
      const match = fileContents.match(frontmatterRegex);
      
      if (!match) {
        console.warn(`⚠️ No se encontró frontmatter en ${fileName}, saltando...`);
        continue;
      }

      const frontmatter = match[1];
      const content = fileContents.replace(frontmatterRegex, '').trim();
      
      const data = {};
      frontmatter.split(/\r?\n/).forEach(line => {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex !== -1) {
          const key = line.slice(0, separatorIndex).trim();
          const value = line.slice(separatorIndex + 1).trim();
          data[key] = value.replace(/^["']|["']$/g, '');
        }
      });

      const slug = data.slug || fileName.replace(/\.md$/, '');
      
      const postData = {
        title: data.title || 'Sin título',
        slug: slug,
        excerpt: data.excerpt || '',
        content: content,
        author: data.author || 'ShopHub Team',
        published_at: data.publishedAt || new Date().toISOString(),
        category: data.category || 'blog',
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        featured: data.featured === 'true' || data.featured === true,
        image_url: data.imageUrl || '',
        search_query: data.searchQuery || ''
      };

      console.log(`📤 Migrando: "${postData.title}"...`);

      const { error } = await supabase
        .from('blog_posts')
        .upsert(postData, { onConflict: 'slug' });

      if (error) {
        console.error(`❌ Error migrando ${fileName}:`, error.message);
      } else {
        console.log(`✅ "${postData.title}" migrado con éxito.`);
      }
    } catch (err) {
      console.error(`❌ Error procesando ${fileName}:`, err);
    }
  }

  console.log('✨ Migración finalizada.');
}

migrate();
function parseSoldCount(soldStr) {
    if (!soldStr) return 0;
    let cleaned = soldStr.toLowerCase().replace(/nuevo\s*\|\s*/, "").replace(/vendidos/, "").replace(/\+/, "").trim();
    if (cleaned.includes("mil")) {
        const num = parseFloat(cleaned.replace("mil", "").replace(",", ".").trim());
        return num * 1000;
    }
    if (cleaned.includes("millón") || cleaned.includes("millon")) {
        const num = parseFloat(cleaned.replace(/millon|millón/, "").replace(",", ".").trim());
        return num * 1000000;
    }
    return parseInt(cleaned.replace(/[^\d]/g, "") || "0");
}
