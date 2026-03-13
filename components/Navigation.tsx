'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { categories } from '@/lib/categories';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      isScrolled ? 'bg-black/80 backdrop-blur-xl h-20 border-b border-white/5' : 'bg-transparent h-24'
    }`}>
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6 md:px-12">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-syne font-extrabold text-2xl text-white tracking-tighter">
            🛒 ShopHub
          </span>
          <span className="bg-accent-sh text-black-sh px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase transition-transform group-hover:scale-110">
            AR
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <div className="relative group">
            <form action="/search" method="GET" className="relative">
              <input 
                type="text" 
                name="q"
                placeholder="Buscar productos..."
                className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/20 w-48 focus:w-64 focus:bg-white/10 focus:border-accent-sh/50 transition-all outline-none font-medium"
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-2.5 text-white/30 group-focus-within:text-accent-sh">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </form>
          </div>

          <Link href="/" className={`text-sm font-bold tracking-widest uppercase transition-colors ${
            pathname === '/' ? 'text-accent-sh' : 'text-white/60 hover:text-white'
          }`}>
            Inicio
          </Link>
          
          <Link
            href="/blog"
            className={`group text-[12px] px-6 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2 font-black border tracking-widest uppercase ${
              pathname.startsWith('/blog') 
                ? 'bg-accent-sh text-black-sh border-accent-sh shadow-[0_0_30px_rgba(232,255,71,0.3)]' 
                : 'bg-white/5 text-white border-white/10 hover:border-accent-sh hover:text-accent-sh hover:bg-black-sh'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:rotate-12">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" />
              <path d="M15 18h-5" />
              <path d="M10 6h8v4h-8V6Z" />
            </svg>
            {pathname.startsWith('/blog') ? 'Magazine' : 'Nuestro Blog'}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-white bg-white/5 rounded-xl border border-white/10"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-0 z-[110] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center text-white bg-white/5 rounded-2xl border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          <div className="flex flex-col items-center gap-10">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-syne text-4xl font-black text-white hover:text-accent-sh transition-colors"
            >
              Inicio
            </Link>
            <Link 
              href="/blog" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-syne text-4xl font-black text-accent-sh"
            >
              Blog
            </Link>
            
            <div className="mt-10 flex gap-6">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-accent-sh">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01"/><path d="M18 12h.01"/></svg>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-accent-sh">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 8-4 8 4-8 4-8-4Z"/><path d="m12 12 8-4V5l-8 4-8-4v3l8 4Z"/><path d="m12 22 8-4V9l-8 4-8-4v9l8 4Z"/></svg>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-accent-sh">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
