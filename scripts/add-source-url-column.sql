-- Agrega source_url a products: la URL REAL del producto en Mercado Libre
-- (ej. https://www.mercadolibre.com.ar/p/MLA27829249 o /MLA-xxxx).
--
-- Por qué: product_url guarda el link de AFILIADO (meli.la/xxx), que redirige
-- al storefront del afiliado, NO a la página del producto. Leer el precio de
-- ahí daba valores equivocados. source_url apunta a la página real del producto
-- para que snapshot-prices.js lea el precio correcto. El link de afiliado
-- (product_url) NO se toca: sigue siendo el que clickea el usuario.
--
-- Correr en el SQL Editor de Supabase.

alter table public.products
  add column if not exists source_url text;
