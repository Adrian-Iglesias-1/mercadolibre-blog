'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { BlogPost } from '@/types';
import Navigation from '@/components/Navigation';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar posts desde Supabase (Client Side para permitir borrar)
  const fetchPosts = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      
      setPosts(data.map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        author: p.author,
        publishedAt: p.published_at,
        updatedAt: p.updated_at || p.published_at,
        category: p.category,
        tags: p.tags || [],
        featured: p.featured,
        imageUrl: p.image_url,
        searchQuery: p.search_query
      })));
    } catch (err) {
      console.error('Error cargando posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!supabase) return;
    
    const confirmDelete = window.confirm(`¿Estás seguro de que quieres eliminar "${title}"? Esta acción no se puede deshacer.`);
    
    if (confirmDelete) {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // Actualizar lista localmente
        setPosts(posts.filter(post => post.id !== id));
        alert('Entrada eliminada con éxito');
      } catch (err: any) {
        alert('Error al eliminar: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black-sh pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="font-syne text-5xl font-extrabold text-white tracking-tight">
              Panel de Admin
            </h1>
            <p className="text-text-muted-sh mt-2">Gestiona las entradas de tu blog</p>
          </div>
          <Link 
            href="/admin/blog/nuevo"
            className="inline-flex items-center gap-2 bg-accent-sh text-black-sh px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Nueva Entrada
          </Link>
        </div>

        <div className="bg-surface-sh border border-white/10 rounded-[32px] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted-sh">Título</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted-sh">Categoría</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted-sh">Fecha</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted-sh text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-text-muted-sh">Cargando entradas...</td>
                </tr>
              ) : posts.map((post) => (
                <tr key={post.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-white font-bold">{post.title}</span>
                      <span className="text-[11px] text-text-muted-sh font-mono">{post.slug}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent2-sh bg-accent2-sh/10 px-2 py-0.5 rounded border border-accent2-sh/20">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-text-muted-sh">
                      {new Date(post.publishedAt).toLocaleDateString('es-AR')}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/blog/${post.slug}`} 
                        target="_blank"
                        className="p-2 hover:text-accent-sh transition-colors"
                        title="Ver post"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </Link>
                      <Link 
                        href={`/admin/blog/editar/${post.id}`}
                        className="p-2 hover:text-accent-sh transition-colors"
                        title="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </Link>
                      <button 
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-2 hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!loading && posts.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-text-muted-sh">No hay entradas aún. ¡Crea la primera!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
