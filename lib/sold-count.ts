/**
 * Convierte el texto de "vendidos" que devuelve Mercado Libre
 * (ej. "Nuevo  |  +100 mil vendidos") a un número.
 */
export function parseSoldCount(soldStr?: string): number {
  if (!soldStr) return 0;

  const cleaned = soldStr
    .toLowerCase()
    .replace(/nuevo\s*\|\s*/i, '')
    .replace(/vendidos/i, '')
    .replace(/\+/g, '')
    .trim();

  if (cleaned.includes('millón') || cleaned.includes('millon')) {
    const num = parseFloat(cleaned.replace(/millon|millón/, '').replace(',', '.').trim());
    return Number.isFinite(num) ? num * 1000000 : 0;
  }

  if (cleaned.includes('mil')) {
    const num = parseFloat(cleaned.replace('mil', '').replace(',', '.').trim());
    return Number.isFinite(num) ? num * 1000 : 0;
  }

  const num = parseInt(cleaned.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(num) ? num : 0;
}
