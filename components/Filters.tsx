'use client';

import { FilterOptions, Category } from '@/types';

interface FiltersProps {
  categories: Category[];
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export default function Filters({ categories, filters, onFiltersChange }: FiltersProps) {
  const selectedCategory = filters.category || '';
  const selectedBrand = filters.brand || '';

  const handleCategoryChange = (categoryId: string) => {
    const newCategory = categoryId === selectedCategory ? '' : categoryId;
    onFiltersChange({ ...filters, category: newCategory });
  };

  const handleBrandChange = (brand: string) => {
    onFiltersChange({ ...filters, brand });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="font-syne font-bold text-white uppercase tracking-widest text-xs">Filtros</h3>
        <button
          onClick={clearFilters}
          className="text-[10px] text-accent-sh hover:underline font-bold uppercase tracking-widest"
        >
          Limpiar
        </button>
      </div>

      {/* Categories */}
      <div className="sidebar-section">
        <h4 className="sidebar-title font-syne text-[11px] font-bold text-text-muted-sh uppercase tracking-[2px] mb-4">Categorías</h4>
        <div className="space-y-1">
          {categories.map((category) => (
            <div 
              key={category.id} 
              onClick={() => handleCategoryChange(category.id)}
              className={`sidebar-item group flex items-center gap-3 py-2 text-sm cursor-pointer transition-colors ${
                selectedCategory === category.id ? 'text-white' : 'text-text-muted-sh hover:text-text-sh'
              }`}
            >
              <div className={`check w-4 h-4 rounded border border-white/10 flex items-center justify-center text-[10px] transition-all ${
                selectedCategory === category.id ? 'bg-accent-sh border-accent-sh text-black-sh' : 'group-hover:border-white/20'
              }`}>
                {selectedCategory === category.id && '✓'}
              </div>
              <span className="flex items-center gap-2">
                <span className="text-base group-hover:scale-110 transition-transform">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Search */}
      <div className="sidebar-section">
        <h4 className="sidebar-title font-syne text-[11px] font-bold text-text-muted-sh uppercase tracking-[2px] mb-4">Marca</h4>
        <input
          type="text"
          placeholder="Buscar por marca..."
          value={selectedBrand}
          onChange={(e) => handleBrandChange(e.target.value)}
          className="w-full bg-surface2-sh border border-white/10 rounded-lg px-4 py-2.5 text-sm text-text-sh placeholder:text-text-muted-sh focus:outline-none focus:border-accent-sh/30 transition-colors"
        />
      </div>

      {/* Price Info (Simplified) */}
      <div className="sidebar-section">
        <h4 className="sidebar-title font-syne text-[11px] font-bold text-text-muted-sh uppercase tracking-[2px] mb-4">Precios</h4>
        <p className="text-[11px] text-text-muted-sh leading-relaxed">
          Los precios se actualizan en tiempo real desde Mercado Libre Argentina.
        </p>
      </div>
    </div>
  );
}
