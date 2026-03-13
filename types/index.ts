export interface Product {
  id: string;
  title: string;
  price: string;
  imageUrl: string;
  productUrl: string;
  category: Category;
  brand?: string;
  rating?: number;
  reviewsCount?: number;
  discount?: number;
  originalPrice?: string;
  soldCount?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  featured: boolean;
  imageUrl?: string;
  coverImage?: string;
  searchQuery?: string;
}

export interface FilterOptions {
  category?: string;
  priceRange?: [number, number];
  brand?: string;
  rating?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'relevance';
}

export interface SearchResult {
  products: Product[];
  total: number;
  hasMore: boolean;
}
