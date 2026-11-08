-- «Менталист»: схема базы для Supabase.
-- Выполнить один раз: Supabase → SQL Editor → New query → вставить весь файл → Run.
-- Повторный запуск безопасен (всё создаётся через "if not exists" / "or replace").

create extension if not exists citext;

-- ---------- профили (публичная часть аккаунта) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  nick        citext unique not null check (nick ~ '^[A-Za-z0-9_.А-Яа-яЁё]{3,20}$'),
  avatar      text check (avatar is null or length(avatar) < 60000),
  code        int unique not null default (floor(random()*900000)+100000)::int,
  clan_id     uuid,
  streak      int not null default 0 check (streak between 0 and 100000),
  created_at  timestamptz not null default now()
);

-- ---------- личные данные (видит только владелец) ----------
create table if not exists public.user_data (
  id          uuid primary key references auth.users on delete cascade,
  habits      jsonb not null default '[]',
  settings    jsonb not null default '{}',
  wall        text,
  ring        jsonb,
  updated_at  timestamptz not null default now()
);

-- ---------- аура по дням (максимум 600 в день, писать можно только за вчера/сегодня/завтра по UTC) ----------
create table if not exists public.aura_days (
  user_id  uuid not null references public.profiles(id) on delete cascade,
  day      date not null,
  points   int  not null check (points between 0 and 600),
  primary key (user_id, day)
);

-- ---------- друзья ----------
create table if not exists public.friends (
  requester  uuid not null references public.profiles(id) on delete cascade,
  addressee  uuid not null references public.profiles(id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  primary key (requester, addressee),
  check (requester <> addressee)
);

-- ---------- кланы ----------
create table if not exists public.clans (
  id         uuid primary key default gen_random_uuid(),
  name       citext unique not null check (length(name) between 3 and 24),
  emblem     text not null default '🛡️' check (length(emblem) <= 8),
  owner      uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
do $$ begin
  alter table public.profiles add constraint profiles_clan_fk foreign key (clan_id) references public.clans(id) on delete set null;
exception when duplicate_object then null; end $$;

-- ---------- права для API (в новых проектах таблицы не открываются автоматически) ----------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.user_data, public.aura_days, public.friends, public.clans to authenticated;

-- ---------- доступ (RLS) ----------
alter table public.profiles  enable row level security;
alter table public.user_data enable row level security;
alter table public.aura_days enable row level security;
alter table public.friends   enable row level security;
alter table public.clans     enable row level security;

drop policy if exists p_read  on public.profiles;
drop policy if exists p_ins   on public.profiles;
drop policy if exists p_upd   on public.profiles;
create policy p_read on public.profiles for select to authenticated using (true);
create policy p_ins  on public.profiles for insert to authenticated with check (id = auth.uid());
create policy p_upd  on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists d_own on public.user_data;
create policy d_own on public.user_data for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists a_read on public.aura_days;
drop policy if exists a_ins  on public.aura_days;
drop policy if exists a_upd  on public.aura_days;
create policy a_read on public.aura_days for select to authenticated using (true);
create policy a_ins  on public.aura_days for insert to authenticated
  with check (user_id = auth.uid() and day between current_date - 1 and current_date + 1);
create policy a_upd  on public.aura_days for update to authenticated
  using (user_id = auth.uid() and day between current_date - 1 and current_date + 1)
  with check (user_id = auth.uid() and day between current_date - 1 and current_date + 1);

drop policy if exists f_read on public.friends;
drop policy if exists f_ins  on public.friends;
drop policy if exists f_upd  on public.friends;
drop policy if exists f_del  on public.friends;
create policy f_read on public.friends for select to authenticated using (auth.uid() in (requester, addressee));
create policy f_ins  on public.friends for insert to authenticated with check (requester = auth.uid() and status = 'pending');
create policy f_upd  on public.friends for update to authenticated using (addressee = auth.uid()) with check (addressee = auth.uid());
create policy f_del  on public.friends for delete to authenticated using (auth.uid() in (requester, addressee));

drop policy if exists c_read on public.clans;
drop policy if exists c_ins  on public.clans;
drop policy if exists c_upd  on public.clans;
drop policy if exists c_del  on public.clans;
create policy c_read on public.clans for select to authenticated using (true);
create policy c_ins  on public.clans for insert to authenticated with check (owner = auth.uid());
create policy c_upd  on public.clans for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy c_del  on public.clans for delete to authenticated using (owner = auth.uid());

-- ---------- рейтинги ----------
create or replace view public.leaderboard with (security_invoker = on) as
select p.id, p.nick, p.avatar, p.code, p.clan_id, p.streak,
       coalesce(sum(a.points), 0)::int as aura,
       coalesce(sum(a.points) filter (where a.day >= date_trunc('week', current_date)::date), 0)::int as week_aura
from public.profiles p
left join public.aura_days a on a.user_id = p.id
group by p.id;

create or replace view public.clan_board with (security_invoker = on) as
select c.id, c.name, c.emblem, c.owner,
       count(l.id)::int as members,
       coalesce(sum(l.aura), 0)::int as aura,
       coalesce(sum(l.week_aura), 0)::int as week_aura
from public.clans c
left join public.leaderboard l on l.clan_id = c.id
group by c.id;

grant select on public.leaderboard, public.clan_board to authenticated;

-- ---------- вход по нику ----------
-- Возвращает служебный адрес аккаунта по нику (сам адрес случайный, настоящей почты нет).
create or replace function public.login_email(p_nick text) returns text
language sql security definer set search_path = public, auth stable as $$
  select u.email from auth.users u join public.profiles p on p.id = u.id where p.nick = p_nick::citext
$$;
create or replace function public.nick_free(p_nick text) returns boolean
language sql security definer set search_path = public stable as $$
  select not exists (select 1 from public.profiles where nick = p_nick::citext)
$$;
revoke all on function public.login_email(text) from public;
revoke all on function public.nick_free(text) from public;
grant execute on function public.login_email(text) to anon, authenticated;
grant execute on function public.nick_free(text) to anon, authenticated;
