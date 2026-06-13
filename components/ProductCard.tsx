'use client';

import { Product } from '@/types';
import Link from 'next/link';
import { parseSoldCount } from '@/lib/sold-count';

interface ProductCardProps {
  product: Product;
  rank?: number;
}

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

  const drop = product.priceDrop;
  const fmtPrice = (value: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value);
  const displayPrice = drop ? drop.currentPrice : Number(product.price);

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

      {/* Price Drop Badge */}
      {drop && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-[#ff4747] text-white text-[11px] font-syne font-black px-2 py-1 rounded-lg shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
          {drop.dropPct}%
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
              +{new Intl.NumberFormat('es-AR').format(parseSoldCount(product.soldCount))} vendidos
            </span>
          )}
        </div>

        <h3 className="text-[14px] text-white font-bold leading-[1.4] line-clamp-3 mb-4 group-hover:text-accent-sh transition-colors min-h-[3.8rem]">
          {product.title}
        </h3>

        <div className="mt-auto pt-4 border-t border-white/5">
          {drop && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] text-white/35 line-through font-medium">
                {fmtPrice(drop.previousPrice)}
              </span>
              <span className="text-[10px] font-bold text-[#ff6b6b] uppercase tracking-wide">
                Bajó {drop.dropPct}%
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1 mb-3">
            <span className={`text-xl font-syne font-black ${drop ? 'text-[#e8ff47]' : 'text-white'}`}>
              {fmtPrice(displayPrice)}
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
