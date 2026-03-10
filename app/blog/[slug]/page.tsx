import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '@/lib/blog';
import { getMLProducts } from '@/lib/mercadolibre';
import ProductCard from '@/components/ProductCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return { title: 'Post no encontrado' };

  return {
    title: `${post.title} - ShopHub Blog`,
    description: post.excerpt,
  };
}

async function RecommendedProducts({ query, category }: { query?: string, category: string }) {
  const searchQuery = query || category;
  const products = await getMLProducts(searchQuery, category);
  const topProducts = products.slice(0, 3);

  if (topProducts.length === 0) return null;

  return (
    <section className="mt-16 pt-16 border-t border-gray-200">
      <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
        <span className="text-4xl">🛒</span>
        Productos Recomendados
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {topProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link 
          href={`/search?q=${encodeURIComponent(searchQuery)}`}
          className="inline-block bg-mercado-yellow text-gray-900 px-8 py-3 rounded-full font-black hover:bg-yellow-400 transition-colors shadow-md"
        >
          Ver más opciones en Mercado Libre
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-12">
          <Link
            href="/blog"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 font-bold mb-8 group"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            Volver al blog
          </Link>

          <div className="mb-6">
            <span className="inline-block px-4 py-1 text-xs font-black rounded-full bg-purple-100 text-purple-800 uppercase tracking-[0.2em]">
              {post.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-tight tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-gray-500 mb-10">
            <div className="h-10 w-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-none mb-1">{post.author}</p>
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
            <div className="relative aspect-[21/9] bg-gray-200 rounded-[40px] overflow-hidden shadow-2xl">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}
        </header>

        {/* Content with Markdown Support */}
        <div className="prose prose-lg prose-purple max-w-none bg-white p-8 md:p-16 rounded-[48px] shadow-sm border border-gray-100 
          prose-headings:font-black prose-headings:text-gray-900 
          prose-p:text-gray-700 prose-p:leading-relaxed
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
        <div className="mt-20 bg-slate-900 rounded-[48px] p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full"></div>
          <h2 className="text-3xl md:text-4xl font-black mb-6 relative z-10">¿Te gustó esta guía?</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto relative z-10">
            Suscribite para recibir más guías de compra y las mejores ofertas directamente en tu email.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto relative z-10">
            <input 
              type="email" 
              placeholder="tu@email.com" 
              className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder:text-slate-500"
            />
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-black transition-colors">
              Suscribirme
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
