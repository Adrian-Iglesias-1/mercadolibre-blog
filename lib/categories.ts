import { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'tecnologia',
    name: 'Tecnología',
    slug: 'tecnologia',
    description: 'Los mejores productos tecnológicos del mercado',
    icon: '💻',
    color: 'bg-blue-500'
  },
  {
    id: 'perfumes',
    name: 'Perfumes',
    slug: 'perfumes',
    description: 'Fragancias exclusivas para hombres y mujeres',
    icon: '🌸',
    color: 'bg-pink-500'
  },
  {
    id: 'blog',
    name: 'Blog',
    slug: 'blog',
    description: 'Artículos y guías de compra',
    icon: '📝',
    color: 'bg-purple-500'
  }
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(cat => cat.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find(cat => cat.id === id);
}
