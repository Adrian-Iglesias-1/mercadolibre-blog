import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '@/lib/blog';
import { getProductsFromSheet } from '@/lib/google-sheets';
import ProductCard from '@/components/ProductCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

async function RecommendedProducts({ query, category }: { query?: string, category: string }) {
  // Obtenemos los productos reales de la Google Sheet
  const allProducts = await getProductsFromSheet();
  
  // Filtrado inteligente:
  // 1. Primero intentamos matchear por la columna 'Categoría' de la sheet
  // 2. Si no, buscamos el query/category en el título del producto
  let recommended = allProducts.filter(p => {
    const sheetCategory = (p as any).category?.id || (p as any).category?.name || '';
    const matchCategory = sheetCategory.toLowerCase().includes(category.toLowerCase());
    const matchTitle = query ? p.title.toLowerCase().includes(query.toLowerCase()) : false;
    
    return matchCategory || matchTitle;
  });

  // Tomamos solo los primeros 3 que coincidan
  recommended = recommended.slice(0, 3);

  if (recommended.length === 0) return null;

  return (
    <section className="mt-16 pt-16 border-t border-white/10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent-sh">
              <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.56-7.43H5.05"/>
            </svg>
            <p className="text-accent-sh text-[11px] font-semibold tracking-[3px] uppercase">Recomendaciones</p>
          </div>
          <h2 className="font-syne text-3xl font-extrabold text-white tracking-tight">
            Productos Seleccionados
          </h2>
          <p className="text-text-muted-sh font-light mt-2">Basados en este artículo y verificados por nuestro equipo.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {recommended.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 border border-white/10 rounded-full px-8 py-4 text-sm font-bold text-white hover:border-accent-sh hover:text-accent-sh transition-all group"
        >
          Ver todos los destacados <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
        </Link>
      </div>
    </section>
  );
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black-sh pb-20">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* Header */}
        <header className="mb-12">
          <Link
            href="/blog"
            className="inline-flex items-center text-accent-sh hover:text-[#d4eb3a] font-bold mb-8 group"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">&larr;</span>
            Volver al blog
          </Link>

          <div className="mb-6">
            <span className="inline-block px-4 py-1 text-xs font-black rounded-full bg-surface2-sh text-accent-sh uppercase tracking-[0.2em] border border-white/5">
              {post.category}
            </span>
          </div>

          <h1 className="font-syne text-4xl md:text-6xl font-black text-white mb-8 leading-tight tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-text-muted-sh mb-10">
            <div className="h-10 w-10 bg-accent-sh rounded-full flex items-center justify-center text-black-sh font-bold">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-text-sh leading-none mb-1">{post.author}</p>
              <p className="text-sm">
                {new Date(post.publishedAt).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {post.imageUrl && (
            <div className="relative aspect-[21/9] bg-surface2-sh rounded-[40px] overflow-hidden shadow-2xl border border-white/5">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          )}
        </header>

        {/* Content with Markdown Support */}
        <div className="prose prose-invert prose-lg prose-purple max-w-none bg-surface-sh p-8 md:p-16 rounded-[48px] shadow-sm border border-white/10 
          prose-headings:font-syne prose-headings:font-black prose-headings:text-white 
          prose-p:text-text-sh prose-p:leading-relaxed
          prose-img:rounded-3xl prose-img:shadow-lg">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Recommended Products (Top 3) */}
        <RecommendedProducts 
          query={post.searchQuery} 
          category={post.category.toLowerCase()} 
        />
        
        {/* Newsletter / CTA */}
        <div className="mt-20 bg-surface2-sh rounded-[48px] p-10 md:p-16 text-center text-white relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-sh/10 blur-[100px] rounded-full"></div>
          <h2 className="font-syne text-3xl md:text-4xl font-black mb-6 relative z-10">¿Te gustó esta guía?</h2>
          <p className="text-text-muted-sh text-lg mb-10 max-w-2xl mx-auto relative z-10">
            Suscribite para recibir más guías de compra y las mejores ofertas directamente en tu email.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto relative z-10">
            <input 
              type="email" 
              placeholder="tu@email.com" 
              className="flex-1 px-6 py-4 rounded-full bg-surface3-sh border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent-sh text-white placeholder:text-text-muted-sh"
            />
            <button className="bg-accent-sh hover:bg-[#d4eb3a] text-black-sh px-8 py-4 rounded-full font-black transition-colors">
              Suscribirme
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
