import { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/lib/blog';
import { getProductsFromSheet } from '@/lib/google-sheets';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://shophub.com.ar';
  
  // 1. Páginas estáticas principales
  const staticPages = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/categorias`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
  ];

  // 2. Posts del blog dinámicos
  const blogPosts = await getAllBlogPosts();
  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 3. Categorías dinámicas de la Sheet
  const allProducts = await getProductsFromSheet();
  const categories = Array.from(new Set(allProducts.map(p => (p as any).category.slug)));
  const categoryUrls = categories.map((slug) => ({
    url: `${baseUrl}/?category=${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogUrls, ...categoryUrls];
}
