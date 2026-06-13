import Link from 'next/link';
import { getProductsFromSheet } from '@/lib/google-sheets';
import { macroCategories, getMacroCategorySlug } from '@/lib/macro-categories';

export const metadata = {
  title: 'Categorías - ShopHub AR',
  description: 'Explora todas nuestras categorías de productos recomendados de Mercado Libre.',
};

export default async function CategoriesPage() {
  const allSheetProducts = await getProductsFromSheet();

  // Agrupar productos en ~16 categorías madre y contarlos
  const categoryCounts = allSheetProducts.reduce((acc: { [slug: string]: number }, p) => {
    const slug = getMacroCategorySlug((p as any).category?.name);
    acc[slug] = (acc[slug] || 0) + 1;
    return acc;
  }, {});

  const sheetCategories = macroCategories
    .filter((cat) => categoryCounts[cat.slug] > 0)
    .map((cat) => ({ ...cat, count: categoryCounts[cat.slug] }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-black-sh pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header Section */}
        <div className="mb-16">
          <Link
            href="/"
            className="inline-flex items-center text-accent-sh hover:text-[#d4eb3a] font-bold mb-8 group"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            Volver al inicio
          </Link>

          <div className="flex items-center gap-3 mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent-sh">
              <path d="m16 16 3-8 3 8c-.875 0-1.375-.5-2-1-.625.5-1.125 1-2 1Z"/><path d="m2 16 3-8 3 8c-.875 0-1.375-.5-2-1-.625.5-1.125 1-2 1Z"/><path d="M7 21h10"/><path d="M12 21v-7"/><path d="M3 9h18"/>
            </svg>
            <p className="text-accent-sh text-[11px] font-semibold tracking-[3px] uppercase">Explorar</p>
          </div>
          <h1 className="font-syne text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-none mb-6">
            Todas las <br />Categorías
          </h1>
          <p className="text-lg text-text-muted-sh font-light max-w-2xl leading-relaxed">
            Navegá por nuestra selección completa de temas y encontrá los mejores productos
            verificados y en oferta de Mercado Libre.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sheetCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/?category=${cat.slug}`}
              className="group bg-surface2-sh border border-white/5 p-6 rounded-[24px] hover:border-accent-sh/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500">{cat.icon}</span>
                <span className="text-[10px] font-bold text-accent-sh bg-accent-sh/5 px-2 py-1 rounded-full border border-accent-sh/10">
                  {cat.count} {cat.count === 1 ? 'Producto' : 'Productos'}
                </span>
              </div>
              <h3 className="font-syne text-xl font-bold text-white group-hover:text-accent-sh transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
