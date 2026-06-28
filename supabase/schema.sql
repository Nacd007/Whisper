-- ═══════════════════════════════════════════════════
--  WhisperLink — Complete Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- ── PROFILES ────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  display_name  text,
  bio           text,
  avatar_url    text,
  is_anonymous  boolean default true,
  is_online     boolean default false,
  last_seen     timestamptz default now(),
  location      geography(point, 4326),
  location_city text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,30}$')
);

-- ── CONVERSATIONS ───────────────────────────────────
create table if not exists public.conversations (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  last_message    text,
  last_message_at timestamptz
);

-- ── CONVERSATION MEMBERS ────────────────────────────
create table if not exists public.conversation_members (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id         uuid references public.profiles(id) on delete cascade,
  joined_at       timestamptz default now(),
  is_anonymous    boolean default true,
  primary key (conversation_id, user_id)
);

-- ── MESSAGES ────────────────────────────────────────
create type if not exists public.message_type as enum ('text', 'location', 'file', 'image');

create table if not exists public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id       uuid references public.profiles(id) on delete set null,
  type            public.message_type default 'text',
  content         text,
  location_lat    double precision,
  location_lng    double precision,
  location_label  text,
  file_url        text,
  file_name       text,
  file_size       bigint,
  file_mime       text,
  is_anonymous    boolean default true,
  read_by         uuid[] default '{}',
  created_at      timestamptz default now()
);

-- ── INDEXES ─────────────────────────────────────────
create index if not exists profiles_location_idx    on public.profiles using gist(location);
create index if not exists messages_conv_idx        on public.messages(conversation_id, created_at);
create index if not exists cm_user_idx              on public.conversation_members(user_id);
create index if not exists cm_conv_idx              on public.conversation_members(conversation_id);

-- ── ROW LEVEL SECURITY ──────────────────────────────
alter table public.profiles              enable row level security;
alter table public.conversations         enable row level security;
alter table public.conversation_members  enable row level security;
alter table public.messages              enable row level security;

-- PROFILES
create policy "profiles_select"  on public.profiles for select using (true);
create policy "profiles_insert"  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update"  on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete"  on public.profiles for delete using (auth.uid() = id);

-- CONVERSATIONS
create policy "conv_select" on public.conversations for select
  using (exists (select 1 from public.conversation_members where conversation_id = id and user_id = auth.uid()));
create policy "conv_insert" on public.conversations for insert with check (auth.uid() is not null);
create policy "conv_update" on public.conversations for update
  using (exists (select 1 from public.conversation_members where conversation_id = id and user_id = auth.uid()));

-- CONVERSATION MEMBERS
create policy "cm_select" on public.conversation_members for select using (user_id = auth.uid());
create policy "cm_insert" on public.conversation_members for insert with check (auth.uid() is not null);

-- MESSAGES
create policy "msg_select" on public.messages for select
  using (exists (select 1 from public.conversation_members where conversation_id = messages.conversation_id and user_id = auth.uid()));
create policy "msg_insert" on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (select 1 from public.conversation_members where conversation_id = conversation_id and user_id = auth.uid())
    and (select count(*) from public.messages m where m.sender_id = auth.uid() and m.created_at > now() - interval '1 minute') < 30
  );
create policy "msg_delete" on public.messages for delete using (auth.uid() = sender_id);

-- ── TRIGGERS ────────────────────────────────────────

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(replace(new.id::text, '-', ''), 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Update conversation last_message on insert
create or replace function public.update_conversation_on_message()
returns trigger language plpgsql as $$
begin
  update public.conversations set
    last_message = case new.type
      when 'text'     then new.content
      when 'location' then '📍 Location shared'
      when 'file'     then '📎 ' || coalesce(new.file_name, 'File')
      when 'image'    then '🖼️ Image'
      else new.content end,
    last_message_at = new.created_at,
    updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_new_message on public.messages;
create trigger on_new_message
  after insert on public.messages
  for each row execute function public.update_conversation_on_message();

-- ── FUNCTIONS ───────────────────────────────────────

-- Get nearby users (requires PostGIS)
create or replace function public.get_nearby_users(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision default 5
)
returns table (
  id uuid, username text, display_name text, avatar_url text,
  is_anonymous boolean, is_online boolean, last_seen timestamptz,
  distance_km double precision
) language sql security definer as $$
  select
    p.id, p.username, p.display_name, p.avatar_url,
    p.is_anonymous, p.is_online, p.last_seen,
    round((st_distance(p.location, st_point(user_lng, user_lat)::geography) / 1000)::numeric, 1)::double precision
  from public.profiles p
  where p.id != auth.uid()
    and p.location is not null
    and st_dwithin(p.location, st_point(user_lng, user_lat)::geography, radius_km * 1000)
  order by distance_km asc
  limit 50;
$$;

-- Update own location (fuzzes to ~1km for privacy)
create or replace function public.update_my_location(
  user_lat double precision,
  user_lng double precision,
  city_name text default null
)
returns void language plpgsql security definer as $$
begin
  update public.profiles set
    location = st_point(round(user_lng::numeric,2)::double precision, round(user_lat::numeric,2)::double precision)::geography,
    location_city = coalesce(city_name, location_city),
    updated_at = now()
  where id = auth.uid();
end;
$$;

-- ── STORAGE BUCKETS ─────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',    'avatars',    true,  5242880,   array['image/jpeg','image/png','image/webp','image/gif']),
  ('chat-files', 'chat-files', false, 104857600, array['image/jpeg','image/png','image/webp','image/gif','application/pdf','text/plain','text/csv','application/zip','video/mp4','audio/mpeg'])
on conflict (id) do nothing;

-- Avatar storage policies
do $$ begin
  create policy "avatar_read"   on storage.objects for select using (bucket_id = 'avatars');
  create policy "avatar_insert" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
  create policy "avatar_update" on storage.objects for update using  (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
exception when duplicate_object then null; end $$;

-- Chat files storage policies
do $$ begin
  create policy "chat_files_read"   on storage.objects for select using (bucket_id = 'chat-files' and auth.uid() is not null);
  create policy "chat_files_insert" on storage.objects for insert with check (bucket_id = 'chat-files' and auth.uid() is not null);
exception when duplicate_object then null; end $$;

-- ── REALTIME ────────────────────────────────────────
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.profiles;
