-- Agrega la columna mla_id a products: el ID estable de Mercado Libre
-- (ej. "MLA1234567890"). Es la clave de deduplicación robusta del scraper.
--
-- Contexto: hasta ahora la dedup comparaba la URL original del hub contra el
-- product_url guardado, pero ese product_url es el link de afiliado (meli.la/xxx)
-- que NO contiene el MLA id (viaja encriptado en `ref`). Resultado: el scraper
-- re-procesaba los ~1000 productos existentes en cada corrida.
--
-- A partir de esta migración, scrape-hub.js guarda mla_id en cada producto nuevo
-- y deduplica por él. Los ~1000 legacy no tienen mla_id recuperable, así que para
-- ellos la dedup cae en el match por título normalizado (ver scrape-hub.js).
--
-- Correr en el SQL Editor de Supabase.

alter table public.products
  add column if not exists mla_id text;

create index if not exists products_mla_id_idx
  on public.products (mla_id);
