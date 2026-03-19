'use client';

type SortOption = 'sales' | 'price_asc' | 'price_desc';

interface ProductFiltersProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function ProductFilters({ currentSort, onSortChange }: ProductFiltersProps) {
  const options = [
    { id: 'sales', label: 'Más Vendidos', icon: '🔥' },
    { id: 'price_asc', label: 'Menor Precio', icon: '💰' },
    { id: 'price_desc', label: 'Mayor Precio', icon: '💎' },
  ] as const;

  return (
    <div className="flex flex-wrap gap-2 mb-8 items-center">
      <span className="text-text-muted-sh text-[10px] font-bold uppercase tracking-[2px] mr-2">
        Ordenar por:
      </span>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSortChange(option.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${
            currentSort === option.id
              ? 'bg-accent-sh text-black-sh border-accent-sh shadow-[0_0_15px_rgba(232,255,71,0.2)]'
              : 'bg-surface2-sh text-white border-white/5 hover:border-white/10'
          }`}
        >
          <span>{option.icon}</span>
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
