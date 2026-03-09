import { Metadata } from 'next';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog - ShopHub',
  description: 'Guías, reseñas y recomendaciones de productos',
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📝 Blog de ShopHub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre guías de compra, reseñas detalladas y las mejores recomendaciones 
            para tomar decisiones informadas.
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {post.imageUrl && (
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">
                      <span>Por {post.author}</span>
                      <span className="mx-2">•</span>
                      <time>{new Date(post.publishedAt).toLocaleDateString('es-AR')}</time>
                    </div>
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Leer más →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay artículos publicados aún
            </h3>
            <p className="text-gray-600 mb-6">
              Pronto tendrás contenido increíble para leer
            </p>
            <Link
              href="/"
              className="inline-flex items-center bg-mercado-yellow hover:bg-yellow-400 text-black font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
