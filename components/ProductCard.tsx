'use client';

import { Product } from '@/types';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  rank?: number;
}

const parseSoldCount = (soldStr: string | undefined): string => {
  if (!soldStr) return '';
  
  // Limpiar el string de "Nuevo | ", "vendidos", etc.
  let cleaned = soldStr.toLowerCase()
    .replace(/nuevo\s*\|\s*/i, '')
    .replace(/vendidos/i, '')
    .replace(/\+/g, '')
    .trim();

  if (cleaned.includes('mil')) {
    const num = parseFloat(cleaned.replace('mil', '').replace(',', '.').trim());
    return (num * 1000).toString();
  }
  
  if (cleaned.includes('millón') || cleaned.includes('millon')) {
    const num = parseFloat(cleaned.replace(/millon|millón/, '').replace(',', '.').trim());
    return (num * 1000000).toString();
  }

  return cleaned.replace(/[^\d]/g, '');
};

export default function ProductCard({ product, rank }: ProductCardProps) {
  let imageUrl = product.imageUrl || '';

  if (imageUrl.startsWith('//')) imageUrl = `https:${imageUrl}`;
  if (imageUrl.startsWith('http://')) imageUrl = imageUrl.replace('http://', 'https://');

  if (imageUrl.includes('mlstatic.com')) {
    imageUrl = imageUrl
      .replace(/-I\.(jpg|webp|jpeg)/i, '-O.$1')
      .replace(/-V\.(jpg|webp|jpeg)/i, '-O.$1')
      .replace(/-S\.(jpg|webp|jpeg)/i, '-O.$1');
  }

  const hasImage = imageUrl.length > 0;
  const proxiedUrl = hasImage
    ? `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
    : '';

  return (
    <div className="group relative bg-[#1a1a1a] border border-white/8 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[rgba(232,255,71,0.2)] hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col h-full">

      {/* Rank Badge */}
      {rank && (
        <div className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center font-syne text-xs font-black border shadow-xl ${
          rank <= 3
            ? 'bg-[#e8ff47] border-transparent text-black'
            : 'bg-black border-white/10 text-[#888]'
        }`}>
          {rank}
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square bg-[#242424] flex items-center justify-center overflow-hidden">
        {hasImage ? (
          <img
            src={proxiedUrl}
            alt={product.title}
            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.opacity = '0.1';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-10">📦</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <span className="inline-block bg-accent-sh/10 text-accent-sh text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded border border-accent-sh/20">
            {product.brand || 'Producto'}
          </span>
          {product.soldCount && (
            <span className="text-[9px] text-white/30 font-medium">
              +{new Intl.NumberFormat('es-AR').format(Number(parseSoldCount(product.soldCount)))} vendidos
            </span>
          )}
        </div>

        <h3 className="text-[14px] text-white font-bold leading-[1.4] line-clamp-3 mb-4 group-hover:text-accent-sh transition-colors min-h-[3.8rem]">
          {product.title}
        </h3>

        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-xl font-syne font-black text-white">
              {new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                maximumFractionDigits: 0,
              }).format(Number(product.price))}
            </span>
          </div>

          <Link
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#e8ff47] text-black py-3 rounded-xl font-syne font-bold text-[11px] tracking-widest uppercase transition-all hover:bg-white hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_20px_rgba(232,255,71,0.2)]"
          >
            Ver en Mercado Libre
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
