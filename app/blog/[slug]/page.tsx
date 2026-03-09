import { Metadata } from 'next';
import Link from 'next/link';
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/blog';
import { notFound } from 'next/navigation';

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Artículo no encontrado',
    };
  }

  return {
    title: `${post.title} - ShopHub`,
    description: post.excerpt,
  };
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium mb-6"
          >
            ← Volver al blog
          </Link>
          
          {post.imageUrl && (
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden mb-8">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}
          
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
              {post.category}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <span>Por {post.author}</span>
            <span className="mx-2">•</span>
            <time>{new Date(post.publishedAt).toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</time>
            {post.updatedAt !== post.publishedAt && (
              <>
                <span className="mx-2">•</span>
                <span>Actualizado {new Date(post.updatedAt).toLocaleDateString('es-AR')}</span>
              </>
            )}
          </div>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            {post.excerpt}
          </p>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: post.content.replace(/\n/g, '<br />') 
            }} 
            className="text-gray-700 leading-relaxed"
          />
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Etiquetas</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🛍️ Encuentra estos productos en MercadoLibre
            </h3>
            <p className="text-gray-600 mb-4">
              Visita nuestras secciones de tecnología para encontrar los mejores auriculares 
              y otros productos gaming con ofertas exclusivas.
            </p>
            <Link
              href="/tecnologia"
              className="inline-flex items-center bg-mercado-yellow hover:bg-yellow-400 text-black font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Ver productos recomendados →
            </Link>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-6">
            <p>Este artículo participa en el programa de afiliados de MercadoLibre.</p>
            <p>Las compras realizadas a través de nuestros enlaces pueden generar una comisión sin costo adicional para ti.</p>
          </div>
        </footer>
      </article>
    </div>
  );
}
