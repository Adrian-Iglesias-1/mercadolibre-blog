import BlogEditor from '@/components/BlogEditor';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params }: { params: { id: string } }) {
  if (!supabase) return <div>No hay conexión a base de datos</div>;

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !post) {
    notFound();
  }

  // Mapear de campos de DB a campos de componente
  const initialData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    imageUrl: post.image_url,
    featured: post.featured,
    author: post.author,
  };

  return (
    <div className="min-h-screen bg-black-sh pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <Link
            href="/admin/blog"
            className="inline-flex items-center text-accent-sh hover:text-[#d4eb3a] font-bold mb-8 group"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            Volver al panel
          </Link>
          <h1 className="font-syne text-5xl font-extrabold text-white tracking-tight">
            Editar Entrada
          </h1>
        </div>

        <BlogEditor initialData={initialData} />
      </div>
    </div>
  );
}
