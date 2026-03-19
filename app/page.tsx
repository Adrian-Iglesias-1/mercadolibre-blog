import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blog';
import { getProductsFromSheet } from '@/lib/google-sheets';
import InfiniteProductGrid from '@/components/InfiniteProductGrid';
import HeroSection from '@/components/HeroSection';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage({ 
  searchParams 
}: { 
  searchParams: { category?: string } 
}) {
  const allSheetProducts = await getProductsFromSheet();
  const blogPosts = await getAllBlogPosts();
  
  // Función de normalización consistente con el resto de la app
  const normalize = (str: string) => 
    str.toLowerCase()
       .normalize("NFD")
       .replace(/[\u0300-\u036f]/g, "")
       .replace(/[^a-z0-9\s-]/g, '')
       .trim()
       .replace(/\s+/g, '-');
  
  // Extraer categorías únicas de la Sheet y contarlas
  const categoryCounts = allSheetProducts.reduce((acc: {[key: string]: number}, p) => {
    const catName = (p as any).category.name;
    acc[catName] = (acc[catName] || 0) + 1;
    return acc;
  }, {});

  // Mapeo simple de iconos para categorías comunes
  const iconMap: { [key: string]: string } = {
    perros: '🐶', gatos: '🐱', mascotas: '🐾',
    audio: '🎧', musica: '🎵', parlantes: '🔊',
    tecnologia: '💻', celulares: '📱', smartwatches: '⌚',
    hogar: '🏠', cocina: '🍳', muebles: '🛋️',
    herramientas: '🛠️', jardin: '🌱',
    belleza: '✨', perfumes: '🌸', cabello: '💇',
    deportes: '⚽', fitness: '🏋️',
    libros: '📚', juguetes: '🧸',
    gaming: '🎮', consolas: '🕹️'
  };

  const sheetCategories = Object.entries(categoryCounts)
    .map(([name, count]) => {
      const slug = normalize(name);
      // Buscar icono por palabra clave
      const keyword = Object.keys(iconMap).find(k => slug.includes(k));
      const icon = iconMap[keyword || ''] || allSheetProducts.find(p => (p as any).category.name === name)?.category.icon || '📦';
      
      return { name, count, slug, icon };
    })
    .sort((a, b) => b.count - a.count);

  const selectedCategory = searchParams.category;
  
  // Filtrar productos de forma robusta
  const filteredProducts = selectedCategory 
    ? allSheetProducts.filter(p => {
        const productCatSlug = (p as any).category.slug;
        const productCatId = (p as any).category.id;
        const productCatName = (p as any).category.name;
        
        return productCatSlug === selectedCategory || 
               productCatId === selectedCategory ||
               normalize(productCatName) === selectedCategory;
      })
    : allSheetProducts;

  const bestSellers = filteredProducts.slice(0, 10);
  const featuredPost = blogPosts[0];
  const recentPosts = blogPosts.slice(1, 4);

  // Decidimos cuántas categorías mostrar por defecto para no saturar
  const mainCategories = sheetCategories.slice(0, 8);
  const hasMoreCategories = sheetCategories.length > 8;

  return (
    <div className="min-h-screen bg-black-sh">
      {/* HERO SECTION */}
      <HeroSection />

      {/* CATEGORY HUB */}
      <section className="py-12 px-6 md:px-12 bg-black-sh">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent-sh">
                <path d="m16 16 3-8 3 8c-.875 0-1.375-.5-2-1-.625.5-1.125 1-2 1Z"/><path d="m2 16 3-8 3 8c-.875 0-1.375-.5-2-1-.625.5-1.125 1-2 1Z"/><path d="M7 21h10"/><path d="M12 21v-7"/><path d="M3 9h18"/>
              </svg>
              <p className="text-accent-sh text-[11px] font-semibold tracking-[3px] uppercase">Explorar Por Categoría</p>
            </div>
            
            {hasMoreCategories && (
              <Link 
                href="/categorias" 
                className="text-[10px] font-bold text-text-muted-sh hover:text-white transition-colors uppercase tracking-widest border-b border-white/10 pb-1"
              >
                Ver todas las categorías ({sheetCategories.length})
              </Link>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link 
              href="/"
              className={`px-5 py-2.5 rounded-xl border text-[13px] font-bold transition-all ${
                !selectedCategory 
                  ? 'bg-accent-sh text-black-sh border-accent-sh shadow-[0_0_20px_rgba(232,255,71,0.2)]' 
                  : 'bg-surface2-sh text-white border-white/5 hover:border-white/10'
              }`}
            >
              Todos los Productos
            </Link>
            {mainCategories.map((cat) => (
              <Link 
                key={cat.slug}
                href={`/?category=${cat.slug}`}
                className={`px-5 py-2.5 rounded-xl border text-[13px] font-bold transition-all flex items-center gap-2 ${
                  selectedCategory === cat.slug
                    ? 'bg-accent-sh text-black-sh border-accent-sh shadow-[0_0_20px_rgba(232,255,71,0.2)]' 
                    : 'bg-surface2-sh text-white border-white/5 hover:border-white/10'
                }`}
              >
                <span className="opacity-70">{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TOP 10 SECTION */}
      <section className="py-24 px-6 md:px-12 bg-surface-sh border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-accent-sh text-[11px] font-semibold tracking-[3px] uppercase mb-4">🔥 Tendencia Nacional</p>
              <h2 className="font-syne text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
                {selectedCategory 
                  ? `Destacados en ${sheetCategories.find(c => c.slug === selectedCategory)?.name}` 
                  : 'Productos Destacados del Día'}
              </h2>
              <p className="text-text-muted-sh font-light mt-3">
                {selectedCategory 
                  ? `Los mejores productos de ${sheetCategories.find(c => c.slug === selectedCategory)?.name} verificados.` 
                  : 'Lo que todo el mundo está comprando hoy en Argentina.'}
              </p>
            </div>
          </div>

          <InfiniteProductGrid products={filteredProducts} />
        </div>
      </section>

      {/* MAGAZINE SECTION */}
      <section className="py-24 px-6 md:px-12 bg-black-sh">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent-sh">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
            </svg>
            <p className="text-accent-sh text-[11px] font-semibold tracking-[3px] uppercase">Nuestro Magazine</p>
          </div>
          <h2 className="font-syne text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
            Guías de Compra<br />&amp; Reviews
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mt-12">
            {/* Featured Post */}
            <Link href={`/blog/${featuredPost?.slug || ''}`} className="group relative aspect-video rounded-[20px] overflow-hidden bg-surface2-sh">
              <img 
                src={featuredPost?.imageUrl || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format"} 
                alt={featuredPost?.title || "Artículo Destacado"} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-8 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-black-sh">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                  </svg>
                  <span className="bg-accent-sh text-black-sh text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded w-fit">
                    Artículo Destacado
                  </span>
                </div>
                <h3 className="font-syne text-3xl font-extrabold text-white leading-none mb-3 group-hover:text-accent-sh transition-colors">
                  {featuredPost?.title || "Cargando guía..."}
                </h3>
                <p className="text-sm text-white/70 line-clamp-2 max-w-[500px]">
                  {featuredPost?.excerpt || "Descubre nuestras últimas recomendaciones para comprar mejor."}
                </p>
              </div>
            </Link>

            {/* List Posts */}
            <div className="bg-surface2-sh border border-white/10 rounded-[20px] overflow-hidden flex flex-col">
              <div className="px-6 pt-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted-sh">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <div className="text-[11px] font-bold tracking-[2px] text-text-muted-sh uppercase">
                  Últimas Guías
                </div>
              </div>
              <div className="flex-1">
                {recentPosts.map((post) => (
                  <Link 
                    key={post.slug} 
                    href={`/blog/${post.slug}`}
                    className="flex flex-col gap-1.5 px-6 py-5 border-b border-white/10 last:border-0 hover:bg-surface3-sh transition-colors"
                  >
                    <span className="text-[10px] font-bold tracking-widest text-accent2-sh uppercase">
                      {post.category}
                    </span>
                    <h4 className="font-syne text-base font-bold text-white leading-tight">
                      {post.title}
                    </h4>
                    <span className="text-[11px] text-text-muted-sh">
                      {new Date(post.publishedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="p-6">
                <Link href="/blog" className="inline-flex items-center gap-2 border border-white/10 rounded-lg px-4.5 py-2.5 text-sm font-medium hover:border-accent-sh hover:text-accent-sh transition-all">
                  Ver blog completo &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER / VALUE PROPOSITION */}
      <section className="py-24 px-6 md:px-12 bg-accent-sh relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-syne text-4xl md:text-5xl font-black text-black-sh tracking-tighter mb-6">
            ¿Querés recibir las mejores ofertas<br />en tu email?
          </h2>
          <p className="text-black-sh/70 text-lg mb-10 max-w-2xl mx-auto font-medium">
            Sin spam. Solo comparativas reales, bajadas de precio históricas y las mejores guías de compra de Argentina.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Tu mejor correo..."
              className="flex-1 px-6 py-4 rounded-2xl bg-black-sh/5 border border-black-sh/10 text-black-sh placeholder:text-black-sh/30 focus:outline-none focus:bg-black-sh/10 transition-colors font-bold"
            />
            <button className="bg-black-sh text-accent-sh px-8 py-4 rounded-2xl font-syne font-black tracking-widest uppercase hover:scale-105 transition-transform shadow-xl">
              ¡Me interesa!
            </button>
          </form>
          
          <p className="mt-8 text-black-sh/40 text-[10px] font-bold tracking-widest uppercase">
            Sumate a los +1.200 ahorradores que leen nuestro magazine
          </p>
        </div>
      </section>

    </div>
  );
}
