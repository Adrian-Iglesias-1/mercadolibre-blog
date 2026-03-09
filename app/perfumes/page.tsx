import { Metadata } from 'next';
import { Suspense } from 'react';
import ClientPage from './ClientPage';
import { getMLProducts } from '@/lib/mercadolibre';

export const metadata: Metadata = {
  title: 'Perfumes - ShopHub',
  description: 'Las mejores fragancias y perfumes exclusivos con ofertas imperdibles',
};

async function PerfumeProductsList({ searchParams }: { searchParams?: any }) {
  const products = await getMLProducts('perfume', 'perfumes');
  return <ClientPage products={products} searchParams={searchParams} />;
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i}>
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PerfumesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PerfumeProductsList searchParams={searchParams} />
    </Suspense>
  );
}
