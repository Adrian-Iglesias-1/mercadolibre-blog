import { Product } from '@/types';

// Cache para productos scrapeados usando un Map para manejar múltiples búsquedas/categorías
const cacheMap = new Map<string, { products: Product[], timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

export function getCachedProducts(key: string = 'default'): Product[] | null {
  const now = Date.now();
  const cached = cacheMap.get(key);
  
  if (cached && (now - cached.timestamp < CACHE_DURATION)) {
    return cached.products;
  }
  return null;
}

export function setCachedProducts(products: Product[], key: string = 'default'): void {
  cacheMap.set(key, {
    products,
    timestamp: Date.now()
  });
}

// Sistema de notificación para cuando los datos reales estén listos
const subscribers: ((products: Product[]) => void)[] = [];

export function subscribeToRealTimeUpdates(callback: (products: Product[]) => void) {
  subscribers.push(callback);
  return () => {
    const index = subscribers.indexOf(callback);
    if (index > -1) {
      subscribers.splice(index, 1);
    }
  };
}

export function notifyRealTimeUpdates(products: Product[]) {
  subscribers.forEach(callback => callback(products));
}
