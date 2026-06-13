-- Tabla de historial de precios: un snapshot por producto cada vez que corre
-- scripts/snapshot-prices.js. Permite calcular bajadas de precio reales
-- comparando el último precio guardado contra los anteriores.

create table if not exists public.price_history (
  id          bigint generated always as identity primary key,
  product_url text not null,
  price       numeric not null,
  captured_at timestamptz not null default now()
);

create index if not exists price_history_product_url_idx
  on public.price_history (product_url, captured_at desc);

alter table public.price_history enable row level security;

-- El script de snapshot corre localmente con la anon key, igual que scrape-hub.js
drop policy if exists "anon can insert price history" on public.price_history;
create policy "anon can insert price history"
  on public.price_history
  for insert
  to anon, authenticated
  with check (true);

-- La app necesita leer el historial para calcular bajadas de precio (PR4)
drop policy if exists "anon can read price history" on public.price_history;
create policy "anon can read price history"
  on public.price_history
  for select
  to anon, authenticated
  using (true);
