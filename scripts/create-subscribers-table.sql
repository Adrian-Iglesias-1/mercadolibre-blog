-- ============================================================
--  Tabla de suscriptores del newsletter — ShopHub AR
--  Correr una sola vez en: Supabase → SQL Editor → New query
-- ============================================================

create table if not exists public.subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  source      text default 'homepage',
  confirmed   boolean default false,
  created_at  timestamptz default now()
);

-- Habilitar Row Level Security (deniega todo por defecto)
alter table public.subscribers enable row level security;

-- ── Política: cualquiera (anon) puede SUSCRIBIRSE (INSERT) ──
-- No se crea política de SELECT a propósito: nadie puede leer la
-- lista de emails desde el front. Solo vos, desde el panel de
-- Supabase o con la service_role key, podés verlos.
drop policy if exists "anon can subscribe" on public.subscribers;
create policy "anon can subscribe"
  on public.subscribers
  for insert
  to anon, authenticated
  with check (true);

-- Índice por fecha para exportar/ordenar suscriptores cómodamente
create index if not exists subscribers_created_at_idx
  on public.subscribers (created_at desc);
