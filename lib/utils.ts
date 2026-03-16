/**
 * Normaliza una cadena de texto para su uso en slugs o búsquedas.
 * Elimina acentos, caracteres especiales y convierte espacios en guiones.
 */
export const normalize = (str: string) => {
  if (!str) return '';
  
  return str.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

/**
 * Utilidad básica para condicionales de clases (opcional pero común)
 */
export const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};
