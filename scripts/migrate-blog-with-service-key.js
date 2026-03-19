/**
 * Script para migrar entradas de blog desde archivos Markdown a Supabase
 * Utiliza la clave de servicio (service_role key) para bypassar políticas RLS
 * 
 * PARA USAR ESTE SCRIPT:
 * 1. Obtén tu service_role key desde el dashboard de Supabase:
 *    - Ve a Supabase Dashboard → Settings → API
 *    - Busca "service_role key" bajo "Project API keys"
 * 2. Agrega esta variable a tu archivo .env.local:
 *    SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio_aqui
 * 3. Ejecuta: node scripts/migrate-blog-with-service-key.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validar variables de entorno
if (!supabaseUrl) {
  console.error('❌ Falta la variable de entorno NEXT_PUBLIC_SUPABASE_URL en .env.local');
  process.exit(1);
}

if (!supabaseServiceRoleKey) {
  console.error('❌ Falta la variable de entorno SUPABASE_SERVICE_ROLE_KEY en .env.local');
  console.error('   Obtén tu service_role key desde Supabase Dashboard → Settings → API');
  console.error('   Luego agrégala a .env.local como: SUPABASE_SERVICE_ROLE_KEY=tu_clave_aqui');
  process.exit(1);
}

// Crear cliente Supabase con la clave de servicio (bypassa RLS)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const postsDirectory = path.join(process.cwd(), 'content', 'blog');

async function migrateBlogPosts() {
  try {
    console.log('🚀 Iniciando migración de blog a Supabase (usando service_role key)...');
    console.log('🔑 La clave de servicio bypassará las políticas RLS');

    // Verificar si el directorio existe
    if (!fs.existsSync(postsDirectory)) {
      console.error(`❌ Directorio de posts no encontrado: ${postsDirectory}`);
      return;
    }

    // Leer todos los archivos markdown
    const fileNames = fs.readdirSync(postsDirectory)
      .filter(name => name.endsWith('.md'));

    console.log(`📝 Encontrados ${fileNames.length} archivos para migrar.`);

    let successCount = 0;
    let errorCount = 0;

    for (const fileName of fileNames) {
      try {
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        
        // Parsear frontmatter
        const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
        const match = fileContents.match(frontmatterRegex);
        
        if (!match) {
          console.warn(`⚠️  No se encontró frontmatter en ${fileName}, saltando...`);
          errorCount++;
          continue;
        }

        const frontmatter = match[1];
        const content = fileContents.replace(frontmatterRegex, '').trim();
        
        // Inicializar datos con valores por defecto
        const data = {
          title: '',
          slug: '',
          excerpt: '',
          author: 'ShopHub Team',
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          category: 'blog',
          tags: [],
          featured: false,
          imageUrl: '',
          searchQuery: '',
          content: content
        };
        
        // Parsear líneas del frontmatter
        frontmatter.split(/\r?\n/).forEach(line => {
          const separatorIndex = line.indexOf(':');
          if (separatorIndex !== -1) {
            const key = line.slice(0, separatorIndex).trim();
            const value = line.slice(separatorIndex + 1).trim();
            // Eliminar comillas si las hay
            const cleanedValue = value.replace(/^["']|["']$/g, '');
            data[key] = cleanedValue;
          }
        });

        // Procesar tags si es string
        if (typeof data.tags === 'string') {
          data.tags = data.tags.split(',').map(tag => tag.trim());
        } else if (!Array.isArray(data.tags)) {
          data.tags = [];
        }

        // Preparar datos para Supabase
        const postData = {
          title: data.title || 'Sin título',
          slug: data.slug || fileName.replace(/\.md$/, ''),
          excerpt: data.excerpt || '',
          content: data.content,
          author: data.author,
          published_at: data.publishedAt,
          updated_at: data.updatedAt,
          category: data.category,
          tags: data.tags,
          featured: data.featured === 'true' || data.featured === true,
          image_url: data.imageUrl,
          search_query: data.searchQuery
        };

        console.log(`🔄 Migrando: "${postData.title}"`);

        // Usar upsert para insertar o actualizar basado en slug
        const { error } = await supabase
          .from('blog_posts')
          .upsert(postData, { onConflict: 'slug' });

        if (error) {
          console.error(`❌ Error migrando "${postData.title}":`, error.message);
          errorCount++;
        } else {
          console.log(`✅ "${postData.title}" migrado con éxito.`);
          successCount++;
        }
      } catch (fileError) {
        console.error(`❌ Error procesando archivo ${fileName}:`, fileError.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Migración completada:`);
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📝 Total procesados: ${fileNames.length}`);
    
    if (successCount > 0) {
      console.log(`\n🎉 ¡Migración exitosa! Ahora puedes ver tus posts en el admin de Supabase.`);
      console.log(`💡 Recuerda que para el funcionamiento normal de tu app, deberías revisar`);
      console.log(`   las políticas RLS en Supabase para asegurar que tengan la configuración adecuada.`);
    }
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
}

// Ejecutar la migración
migrateBlogPosts();