import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-surface-sh border-t border-white/10 py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="flex flex-col gap-4">
          <div className="font-syne font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
            🛒 ShopHub <span className="text-[10px] bg-accent-sh text-black-sh px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">AR</span>
          </div>
          <p className="text-sm text-text-muted-sh leading-relaxed max-w-xs">
            Recomendaciones verificadas de Mercado Libre Argentina. Actualizamos los productos diariamente para que siempre encuentres las mejores ofertas.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-syne font-bold text-sm text-white uppercase tracking-wider">Enlaces Rápidos</h4>
          <ul className="flex flex-col gap-2">
            <li><Link href="/" className="text-sm text-text-muted-sh hover:text-text-sh transition-colors">Inicio</Link></li>
            <li><Link href="/blog" className="text-sm text-text-muted-sh hover:text-text-sh transition-colors">Blog & Magazine</Link></li>
            <li><Link href="/categorias" className="text-sm text-text-muted-sh hover:text-text-sh transition-colors">Categorías de Productos</Link></li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-syne font-bold text-sm text-white uppercase tracking-wider">Blog</h4>
          <ul className="flex flex-col gap-2">
            <li><Link href="/blog" className="text-sm text-text-muted-sh hover:text-text-sh transition-colors">Guías de compra</Link></li>
            <li><Link href="/blog" className="text-sm text-text-muted-sh hover:text-text-sh transition-colors">Reviews</Link></li>
            <li><Link href="/blog" className="text-sm text-text-muted-sh hover:text-text-sh transition-colors">Top 10</Link></li>
            <li><Link href="/blog" className="text-sm text-text-muted-sh hover:text-text-sh transition-colors">Ofertas del día</Link></li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-syne font-bold text-sm text-white uppercase tracking-wider">Legal</h4>
          <ul className="flex flex-col gap-2">
            <li><Link href="/" className="text-sm text-text-muted-sh hover:text-text-sh transition-colors">Política de afiliados</Link></li>
            <li><Link href="/" className="text-sm text-text-muted-sh hover:text-text-sh transition-colors">Privacidad</Link></li>
            <li><Link href="/" className="text-sm text-text-muted-sh hover:text-text-sh transition-colors">Términos de uso</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-xs text-text-muted-sh">
          © 2026 ShopHub. Sitio de afiliados de <Link href="#" className="text-accent-sh hover:underline">Mercado Libre</Link>.
        </span>
        <span className="text-xs text-text-muted-sh">
          Hecho con ♥ en Argentina
        </span>
      </div>
    </footer>
  );
}
