import { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'tecnologia',
    name: 'Tecnología',
    slug: 'computacion',
    description: 'Los mejores productos tecnológicos del mercado',
    icon: '💻',
    color: 'bg-blue-500'
  },
  {
    id: 'perfumes',
    name: 'Perfumes',
    slug: 'belleza-y-cuidado-personal',
    description: 'Fragancias exclusivas para hombres y mujeres',
    icon: '🌸',
    color: 'bg-pink-500'
  },
  {
    id: 'hogar',
    name: 'Hogar',
    slug: 'hogar-muebles-y-jardin',
    description: 'Todo para decorar y mejorar tu casa',
    icon: '🏠',
    color: 'bg-orange-500'
  },
  {
    id: 'gaming',
    name: 'Gaming',
    slug: 'consolas-y-videojuegos',
    description: 'Equipamiento profesional para gamers',
    icon: '🎮',
    color: 'bg-indigo-600'
  },
  {
    id: 'electrodomesticos',
    name: 'Pequeños Electrodomésticos',
    slug: 'pequenos-electrodomesticos',
    description: 'Electrodomésticos prácticos para tu hogar',
    icon: '🍳',
    color: 'bg-yellow-500'
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
