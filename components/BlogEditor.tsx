'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BlogPost } from '@/types';

interface BlogEditorProps {
  initialData?: Partial<BlogPost>;
}

export default function BlogEditor({ initialData }: BlogEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    category: initialData?.category || 'tecnologia',
    imageUrl: initialData?.imageUrl || '',
    featured: initialData?.featured || false,
    author: initialData?.author || 'ShopHub Team',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return alert('Supabase no está configurado');
    
    setLoading(true);
    
    try {
      const generatedSlug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const postData = {
        title: formData.title,
        slug: generatedSlug,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        image_url: formData.imageUrl,
        featured: formData.featured,
        author: formData.author,
        updated_at: new Date().toISOString(),
        tags: initialData?.tags || [],
        search_query: `${formData.title} ${formData.excerpt}`.toLowerCase(),
      };

      let error;
      if (initialData?.id) {
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', initialData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('blog_posts')
          .insert([{ 
            ...postData, 
            published_at: new Date().toISOString() 
          }]);
        error = insertError;
      }

      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(`${error.message} (${error.code})`);
      }
      
      alert('¡Post guardado con éxito!');
      router.push('/admin/blog');
      router.refresh();
    } catch (err: any) {
      console.error('Error detallado:', err);
      alert('Error guardando el post: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted-sh">Título de la Entrada</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-surface2-sh border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-accent-sh transition-colors text-xl font-bold"
              placeholder="Ej: Cómo elegir la mejor cafetera..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted-sh">Contenido (Markdown)</label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-surface2-sh border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-accent-sh transition-colors font-mono text-sm h-[500px]"
              placeholder="Escribe el contenido de tu post aquí..."
            />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-surface-sh border border-white/10 rounded-[24px] p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted-sh">Slug (URL)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-2 text-white text-xs"
                placeholder="slug-del-post"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted-sh">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-2 text-white text-xs appearance-none"
              >
                <option value="tecnologia">Tecnología</option>
                <option value="hogar">Hogar</option>
                <option value="belleza">Belleza</option>
                <option value="deportes">Deportes</option>
                <option value="gaming">Gaming</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted-sh">Imagen de Portada (URL)</label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-2 text-white text-xs"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted-sh">Resumen Corto</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-2 text-white text-xs h-24"
                placeholder="Un breve resumen para la tarjeta..."
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 bg-black/20 text-accent-sh focus:ring-accent-sh"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted-sh group-hover:text-white transition-colors">Destacar Post</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-sh text-black-sh py-4 rounded-xl font-syne font-black tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_10px_30px_rgba(232,255,71,0.2)]"
            >
              {loading ? 'Guardando...' : initialData?.id ? 'Guardar Cambios' : 'Publicar Ahora'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
