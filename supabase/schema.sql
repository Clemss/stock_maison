-- =============================================================
--  Stock Maison — schéma de base de données Supabase
--  À coller en une fois dans Supabase > SQL Editor > New query > Run
-- =============================================================

-- ---------- Foyer (partagé entre toi et ta copine) ----------
create table if not exists foyers (
  id            uuid primary key default gen_random_uuid(),
  nom           text not null default 'Maison',
  code_invit    text not null unique default upper(substr(md5(random()::text), 1, 6)),
  nb_personnes  int  not null default 2,
  budget_drive  numeric(6,2) not null default 50,
  aliments_refuses text[] not null default '{}',
  cree_le       timestamptz not null default now()
);

create table if not exists membres (
  foyer_id  uuid not null references foyers(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  prenom    text,
  primary key (foyer_id, user_id)
);

-- ---------- Emplacements (frigo, congélateurs, placards…) ----------
create table if not exists emplacements (
  id        uuid primary key default gen_random_uuid(),
  foyer_id  uuid not null references foyers(id) on delete cascade,
  nom       text not null,
  type      text not null default 'placard'   -- frigo | congelateur | placard | autre
            check (type in ('frigo','congelateur','placard','autre')),
  icone     text not null default '📦',
  ordre     int  not null default 0
);

-- ---------- Produits en stock ----------
create table if not exists produits (
  id             uuid primary key default gen_random_uuid(),
  foyer_id       uuid not null references foyers(id) on delete cascade,
  emplacement_id uuid references emplacements(id) on delete set null,
  nom            text not null,
  categorie      text not null default 'Autre',
  quantite       numeric(8,2) not null default 1 check (quantite >= 0),
  unite          text not null default 'pièce', -- pièce | g | kg | L | paquet | boîte…
  seuil_min      numeric(8,2) not null default 0,
  toujours_stock boolean not null default false, -- ex : yaourts, lait, œufs
  peremption     date,
  code_barres    text,
  note           text,
  maj_le         timestamptz not null default now(),
  maj_par        uuid references auth.users(id)
);

create index if not exists produits_foyer_idx on produits(foyer_id);
create index if not exists emplacements_foyer_idx on emplacements(foyer_id);

-- Vue pratique : produits sous le seuil (utile pour les alertes et les drives)
create or replace view produits_stock_bas
with (security_invoker = true) as
  select p.*, e.nom as emplacement
  from produits p left join emplacements e on e.id = p.emplacement_id
  where p.toujours_stock and p.quantite <= p.seuil_min;

-- ---------- Sécurité : chacun ne voit que son foyer ----------
alter table foyers       enable row level security;
alter table membres      enable row level security;
alter table emplacements enable row level security;
alter table produits     enable row level security;

create or replace function mes_foyers() returns setof uuid
language sql stable security definer set search_path = public as $$
  select foyer_id from membres where user_id = auth.uid()
$$;

drop policy if exists "foyer lisible"   on foyers;
drop policy if exists "foyer modifiable" on foyers;
create policy "foyer lisible"    on foyers for select using (id in (select mes_foyers()));
create policy "foyer modifiable" on foyers for update using (id in (select mes_foyers()));

drop policy if exists "membres lisibles" on membres;
create policy "membres lisibles" on membres for select using (foyer_id in (select mes_foyers()));

drop policy if exists "emplacements du foyer" on emplacements;
create policy "emplacements du foyer" on emplacements for all
  using (foyer_id in (select mes_foyers()))
  with check (foyer_id in (select mes_foyers()));

drop policy if exists "produits du foyer" on produits;
create policy "produits du foyer" on produits for all
  using (foyer_id in (select mes_foyers()))
  with check (foyer_id in (select mes_foyers()));

-- ---------- Créer un foyer (1er utilisateur) ----------
create or replace function creer_foyer(p_nom text, p_prenom text) returns uuid
language plpgsql security definer set search_path = public as $$
declare f uuid;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  insert into foyers(nom) values (coalesce(nullif(p_nom,''),'Maison')) returning id into f;
  insert into membres(foyer_id, user_id, prenom) values (f, auth.uid(), p_prenom);
  insert into emplacements(foyer_id, nom, type, icone, ordre) values
    (f, 'Frigo',               'frigo',       '🧊', 1),
    (f, 'Congélateur du frigo', 'congelateur', '❄️', 2),
    (f, 'Congélateur garage',  'congelateur', '🥶', 3),
    (f, 'Placards cuisine',    'placard',     '🗄️', 4);
  return f;
end $$;

-- ---------- Rejoindre un foyer avec le code (2e utilisateur) ----------
create or replace function rejoindre_foyer(p_code text, p_prenom text) returns uuid
language plpgsql security definer set search_path = public as $$
declare f uuid;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  select id into f from foyers where code_invit = upper(trim(p_code));
  if f is null then raise exception 'Code inconnu'; end if;
  insert into membres(foyer_id, user_id, prenom) values (f, auth.uid(), p_prenom)
    on conflict do nothing;
  return f;
end $$;

grant execute on function creer_foyer(text, text)     to authenticated;
grant execute on function rejoindre_foyer(text, text) to authenticated;

-- ---------- Synchro temps réel entre les deux téléphones ----------
do $$ begin
  alter publication supabase_realtime add table produits;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table emplacements;
exception when others then null; end $$;

-- =============================================================
--  V2 — Recettes
-- =============================================================
create table if not exists recettes (
  id             uuid primary key default gen_random_uuid(),
  foyer_id       uuid not null references foyers(id) on delete cascade,
  nom            text not null,
  portions       int  not null default 2 check (portions > 0),
  temps_min      int,
  etapes         text,
  source         text not null default 'manuel',  -- manuel | claude
  favori         boolean not null default false,
  derniere_fois  date,
  nb_fois        int not null default 0,
  cree_le        timestamptz not null default now()
);

create table if not exists recette_ingredients (
  id          uuid primary key default gen_random_uuid(),
  recette_id  uuid not null references recettes(id) on delete cascade,
  nom         text not null,
  quantite    numeric(8,2),
  unite       text,
  produit_id  uuid references produits(id) on delete set null,  -- lien vers le stock
  ordre       int not null default 0
);

create index if not exists recettes_foyer_idx on recettes(foyer_id);
create index if not exists recette_ing_idx on recette_ingredients(recette_id);

alter table recettes            enable row level security;
alter table recette_ingredients enable row level security;

drop policy if exists "recettes du foyer" on recettes;
create policy "recettes du foyer" on recettes for all
  using (foyer_id in (select mes_foyers()))
  with check (foyer_id in (select mes_foyers()));

drop policy if exists "ingredients du foyer" on recette_ingredients;
create policy "ingredients du foyer" on recette_ingredients for all
  using (recette_id in (select id from recettes where foyer_id in (select mes_foyers())))
  with check (recette_id in (select id from recettes where foyer_id in (select mes_foyers())));

do $$ begin
  alter publication supabase_realtime add table recettes;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table recette_ingredients;
exception when others then null; end $$;

-- V3 — étiquettes de recettes (végé, poisson, rapide…)
alter table recettes add column if not exists tags text[] not null default '{}';

-- V4 — prix Carrefour des ingrédients (rempli par supabase/seed_prix.sql)
create table if not exists prix_ingredients (
  id uuid primary key default gen_random_uuid(),
  foyer_id uuid not null references foyers(id) on delete cascade,
  nom text not null, prix numeric(7,2) not null, quantite numeric(8,2) not null, unite text not null,
  produit text, estime boolean not null default false, maj date not null default current_date,
  unique (foyer_id, nom)
);
alter table prix_ingredients enable row level security;
drop policy if exists "prix du foyer" on prix_ingredients;
create policy "prix du foyer" on prix_ingredients for all using (foyer_id in (select mes_foyers())) with check (foyer_id in (select mes_foyers()));
