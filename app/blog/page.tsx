import { Metadata } from 'next';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Blog - ShopHub AR',
  description: 'Guías, reseñas y recomendaciones de productos verificados de Mercado Libre.',
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="min-h-screen bg-black-sh pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header Section */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-accent-sh">
              <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.446Z"/>
              <path d="M12 3v19" className="opacity-0"/>
              <path d="m19 12-7-7-7 7" className="opacity-0"/>
            </svg>
            <p className="text-accent-sh text-[11px] font-semibold tracking-[3px] uppercase">Nuestro Magazine</p>
          </div>
          <h1 className="font-syne text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-none mb-6">
            Guías de Compra <br />&amp; Artículos
          </h1>
          <p className="text-lg text-text-muted-sh font-light max-w-2xl leading-relaxed">
            Explorá nuestras recomendaciones expertas, análisis detallados y las mejores ofertas 
            para que compres con confianza en Mercado Libre.
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-surface2-sh border border-white/5 rounded-[32px] overflow-hidden hover:border-accent-sh/30 hover:-translate-y-2 transition-all duration-500 shadow-2xl"
              >
                {post.imageUrl && (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-5 left-6">
                      <span className="bg-accent-sh text-black-sh text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded">
                        {post.category}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="p-8 flex flex-col flex-1">
                  <div className="text-[11px] text-text-muted-sh font-bold tracking-[2px] uppercase mb-4">
                    {new Date(post.publishedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  
                  <h2 className="font-syne text-2xl font-bold text-white mb-4 line-clamp-2 leading-tight group-hover:text-accent-sh transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-text-muted-sh text-sm font-light line-clamp-3 mb-8 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-surface3-sh flex items-center justify-center text-[10px] font-bold text-white uppercase border border-white/10">
                        {post.author ? post.author.charAt(0) : 'S'}
                      </div>
                      <span className="text-xs text-text-sh font-medium">Por {post.author || 'ShopHub Team'}</span>
                    </div>
                    <span className="text-accent-sh text-sm font-bold tracking-widest uppercase group-hover:translate-x-1 transition-transform">
                      Leer más &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-surface2-sh border border-dashed border-white/10 rounded-[48px]">
            <div className="text-6xl mb-6">📝</div>
            <h3 className="font-syne text-2xl font-bold text-white mb-2">
              No hay artículos publicados aún
            </h3>
            <p className="text-text-muted-sh font-light mb-10 max-w-sm mx-auto">
              Pronto tendrás contenido increíble para leer y guías de compra exclusivas.
            </p>
            <Link
              href="/"
              className="inline-flex items-center bg-accent-sh hover:bg-[#d4eb3a] text-black-sh font-bold px-8 py-4 rounded-full transition-all"
            >
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
