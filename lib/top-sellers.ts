import { Product } from '@/types';
import { parseSoldCount } from './sold-count';
import { getMacroCategorySlug, getMacroCategory, MacroCategory } from './macro-categories';

export interface CategoryRanking {
  macro: MacroCategory;
  count: number;
  topProducts: Product[];
}

/**
 * Agrupa los productos por categoría madre y devuelve, para cada una,
 * el top N ordenado por cantidad de "vendidos" (dato real de ML).
 */
export function getTopSellersByMacroCategory(
  products: Product[],
  topN = 5
): CategoryRanking[] {
  const groups = new Map<string, Product[]>();

  for (const product of products) {
    const slug = getMacroCategorySlug((product as any).category?.name);
    if (!groups.has(slug)) groups.set(slug, []);
    groups.get(slug)!.push(product);
  }

  const rankings: CategoryRanking[] = [];

  for (const [slug, items] of groups.entries()) {
    const macro = getMacroCategory(slug);
    if (!macro) continue;

    const sorted = [...items].sort(
      (a, b) => parseSoldCount(b.soldCount) - parseSoldCount(a.soldCount)
    );

    rankings.push({
      macro,
      count: items.length,
      topProducts: sorted.slice(0, topN),
    });
  }

  return rankings.sort((a, b) => b.count - a.count);
}
