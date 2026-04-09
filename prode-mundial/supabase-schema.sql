-- =============================================
-- PRODE MUNDIAL 2026 - Schema Supabase
-- Ejecutar en: Supabase → SQL Editor → New Query
-- =============================================

-- Tabla de perfiles de usuario (extiende auth.users de Supabase)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Tabla de prodes (espacios privados)
create table public.prodes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- Miembros de cada prode
create table public.prode_members (
  id uuid default gen_random_uuid() primary key,
  prode_id uuid references public.prodes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('admin', 'player')) default 'player',
  joined_at timestamptz default now(),
  unique(prode_id, user_id)
);

-- Partidos del Mundial
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  home_team text not null,
  away_team text not null,
  home_flag text,
  away_flag text,
  match_date timestamptz not null,
  phase text check (phase in ('groups', 'r16', 'qf', 'sf', 'final')) not null default 'groups',
  group_name text, -- 'A', 'B', etc. solo en fase de grupos
  status text check (status in ('scheduled', 'live', 'finished')) default 'scheduled',
  home_score int,
  away_score int,
  minute int,
  external_id text unique, -- id de football-data.org
  created_at timestamptz default now()
);

-- Picks / predicciones de cada usuario por partido y prode
create table public.picks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  prode_id uuid references public.prodes(id) on delete cascade not null,
  match_id uuid references public.matches(id) on delete cascade not null,
  home_pick int not null check (home_pick >= 0),
  away_pick int not null check (away_pick >= 0),
  points int default 0,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, prode_id, match_id)
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

alter table public.profiles enable row level security;
alter table public.prodes enable row level security;
alter table public.prode_members enable row level security;
alter table public.matches enable row level security;
alter table public.picks enable row level security;

-- Profiles: cada uno ve y edita solo el suyo
create policy "Ver perfil propio" on public.profiles for select using (auth.uid() = id);
create policy "Editar perfil propio" on public.profiles for update using (auth.uid() = id);
create policy "Insertar perfil propio" on public.profiles for insert with check (auth.uid() = id);

-- Prodes: cualquier usuario autenticado puede ver prodes donde es miembro
create policy "Ver prodes propios" on public.prodes for select
  using (exists (
    select 1 from public.prode_members
    where prode_id = prodes.id and user_id = auth.uid()
  ));
create policy "Crear prode" on public.prodes for insert with check (auth.uid() = owner_id);
create policy "Editar prode propio" on public.prodes for update using (auth.uid() = owner_id);

-- Prode members
create policy "Ver miembros del prode" on public.prode_members for select
  using (exists (
    select 1 from public.prode_members pm
    where pm.prode_id = prode_members.prode_id and pm.user_id = auth.uid()
  ));
create policy "Unirse a un prode" on public.prode_members for insert with check (auth.uid() = user_id);

-- Matches: todos los autenticados pueden ver
create policy "Ver partidos" on public.matches for select using (auth.role() = 'authenticated');

-- Picks: cada usuario ve y edita solo los suyos
create policy "Ver picks propios" on public.picks for select using (auth.uid() = user_id);
create policy "Crear pick" on public.picks for insert with check (auth.uid() = user_id);
create policy "Editar pick propio" on public.picks for update using (auth.uid() = user_id);

-- Ver picks de todos en el mismo prode (para leaderboard)
create policy "Ver picks del prode" on public.picks for select
  using (exists (
    select 1 from public.prode_members
    where prode_id = picks.prode_id and user_id = auth.uid()
  ));

-- =============================================
-- Trigger: crear perfil automáticamente al registrarse
-- =============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- Vista: leaderboard por prode
-- =============================================
create or replace view public.leaderboard as
select
  pm.prode_id,
  p.id as user_id,
  p.username,
  coalesce(sum(pk.points), 0) as total_points,
  count(pk.id) filter (where pk.points = 3) as exact_hits,
  count(pk.id) filter (where pk.points = 1) as partial_hits,
  count(pk.id) filter (where pk.points = 0 and pk.id is not null) as misses
from public.prode_members pm
join public.profiles p on p.id = pm.user_id
left join public.picks pk on pk.user_id = pm.user_id and pk.prode_id = pm.prode_id
group by pm.prode_id, p.id, p.username
order by total_points desc;
