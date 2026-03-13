'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section 
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 60% 40%, rgba(232,255,71,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 20% 80%, rgba(71,200,255,0.04) 0%, transparent 50%), #0a0a0a`
      }}
    >
      {/* Grid Lines Overlay */}
      <div className="absolute inset-0 hero-grid-lines opacity-30"></div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-surface2-sh border border-white/10 px-3.5 py-1.5 rounded-full text-xs text-text-muted-sh tracking-wider mb-8 animate-fade-up">
          <span className="w-1.5 h-1.5 bg-accent-sh rounded-full animate-pulse"></span>
          📡 Actualizado en tiempo real desde Mercado Libre
        </div>

        <h1 className="font-syne text-5xl md:text-[100px] font-extrabold leading-[0.95] tracking-[-3px] text-white animate-fade-up [animation-delay:100ms]">
          Encontrá lo <span className="text-[#e8ff47]">mejor</span><br /> de Argentina
        </h1>

        <p className="mt-6 text-lg text-text-muted-sh font-light leading-relaxed max-w-lg animate-fade-up [animation-delay:200ms]">
          Miles de productos analizados. Solo las mejores ofertas, verificadas y con envío gratis.
        </p>

        <form 
          onSubmit={handleSearch}
          className="mt-10 flex w-full max-w-lg animate-fade-up [animation-delay:300ms]"
        >
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos, marcas, categorías…" 
            className="flex-1 bg-surface2-sh border border-white/10 border-r-0 rounded-l-xl px-5 py-3.5 text-[#f0ede8] placeholder:text-[#666666] caret-[#e8ff47] font-dmsans focus:outline-none focus:border-accent-sh/30 transition-colors"
          />
          <button 
            type="submit"
            className="bg-accent-sh text-black-sh border-none rounded-r-xl px-6 py-3.5 font-syne font-bold text-sm tracking-wider hover:bg-[#d4eb3a] transition-colors whitespace-nowrap"
          >
            BUSCAR →
          </button>
        </form>

        <div className="mt-12 flex gap-8 items-center animate-fade-up [animation-delay:400ms]">
          <div className="flex flex-col items-center">
            <strong className="font-syne text-2xl font-extrabold text-white tracking-tight">24.000+</strong>
            <span className="text-[12px] text-text-muted-sh uppercase tracking-wider">Productos</span>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="flex flex-col items-center">
            <strong className="font-syne text-2xl font-extrabold text-white tracking-tight">100%</strong>
            <span className="text-[12px] text-text-muted-sh uppercase tracking-wider">Verificados</span>
          </div>
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted-sh text-[11px] tracking-[2px] uppercase opacity-50">
        <div className="w-px h-10 bg-gradient-to-b from-accent-sh to-transparent animate-scroll-pulse"></div>
        Scroll
      </div>
    </section>
  );
}
