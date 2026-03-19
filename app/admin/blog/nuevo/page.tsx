import BlogEditor from '@/components/BlogEditor';
import Link from 'next/link';

export default function NewPostPage() {
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
            Nueva Entrada
          </h1>
        </div>

        <BlogEditor />
      </div>
    </div>
  );
}
