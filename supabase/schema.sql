-- Run in Supabase SQL Editor. Safe to run again.
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admins enable row level security;
create table if not exists public.scripts (
  id text primary key default gen_random_uuid()::text,
  title text not null check (char_length(trim(title)) between 1 and 200),
  english text not null check (char_length(trim(english)) between 1 and 200),
  author text not null check (char_length(trim(author)) between 1 and 200),
  genre text not null check (char_length(trim(genre)) between 1 and 100),
  minutes integer not null check (minutes between 1 and 10000),
  excerpt text not null check (char_length(trim(excerpt)) between 1 and 2000),
  color text not null default 'ochre',
  content jsonb not null check (jsonb_typeof(content) = 'array'),
  created_at timestamptz not null default now()
);
create table if not exists public.comments (
  id bigint generated always as identity primary key,
  script_id text not null,
  nickname text not null default 'مهمان' check (char_length(nickname) between 1 and 40),
  message text not null check (char_length(message) between 2 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists comments_script_created_idx on public.comments (script_id, created_at desc);
alter table public.scripts enable row level security;
alter table public.comments enable row level security;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
drop policy if exists "Public reads scripts" on public.scripts;
create policy "Public reads scripts" on public.scripts for select to anon, authenticated using (true);
drop policy if exists "Admins manage scripts" on public.scripts;
create policy "Admins manage scripts" on public.scripts for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Anyone can read comments" on public.comments;
create policy "Anyone can read comments" on public.comments for select to anon, authenticated using (true);
drop policy if exists "Anyone can post comments" on public.comments;
create policy "Anyone can post comments" on public.comments for insert to anon, authenticated with check (
  exists (select 1 from public.scripts where id = script_id)
  and char_length(trim(nickname)) between 1 and 40 and char_length(trim(message)) between 2 and 2000
);
drop policy if exists "Admins can delete comments" on public.comments;
create policy "Admins can delete comments"
on public.comments for delete
to authenticated
using (public.is_admin());
grant select on public.scripts to anon, authenticated;
grant insert, update, delete on public.scripts to authenticated;
grant select, insert on public.comments to anon, authenticated;
grant delete on public.comments to authenticated;
grant usage, select on sequence public.comments_id_seq to anon, authenticated;
-- Remove comments when their script is deleted, including on databases with the old schema.
create or replace function public.delete_script_comments() returns trigger language plpgsql security definer set search_path = '' as $$
begin delete from public.comments where script_id = old.id; return old; end; $$;
drop trigger if exists delete_script_comments on public.scripts;
create trigger delete_script_comments after delete on public.scripts for each row execute function public.delete_script_comments();

-- Original sample stories; existing records are never overwritten.
insert into public.scripts (id,title,english,author,genre,minutes,excerpt,color,content) values
('last-train','آخرین قطار','THE LAST TRAIN','رها نادری','درام',18,'در ایستگاهی دورافتاده، دو غریبه منتظر قطاری هستند که شاید دیگر هرگز نرسد.','ochre','[{"type":"scene","text":"داخلی. ایستگاه قطار — شب"},{"type":"action","text":"باران به شیشه‌های بخارگرفته می‌کوبد. ساعت دیواری ۲۳:۴۷ را نشان می‌دهد. سالن تقریباً خالی است."},{"type":"character","name":"مرد","text":"گفتن که قطار تأخیر داره."},{"type":"character","name":"زن","text":"قطارها همیشه یه دلیلی برای نرسیدن دارن."},{"type":"action","text":"مرد به بلیت مچاله‌شده‌ی دستش نگاه می‌کند. روی بلیت، تاریخ دیروز چاپ شده است."},{"type":"character","name":"مرد","text":"شما هم منتظر همین قطارین؟"},{"type":"character","name":"زن","text":"من منتظر کسی‌ام که قرار بود باهاش سوار بشم."},{"type":"action","text":"بلندگوی ایستگاه خش‌خش می‌کند. صدایی نامفهوم در سالن می‌پیچد."},{"type":"scene","text":"کات به سیاهی."}]'::jsonb),
('blue-room','اتاق آبی','THE BLUE ROOM','آرمان کیانی','معمایی',12,'هر شب، چراغ اتاقی در خانه‌ی روبه‌رو روشن می‌شود؛ خانه‌ای که سال‌هاست خالی است.','blue','[{"type":"scene","text":"خارجی. کوچه — غروب"},{"type":"action","text":"دختری نوجوان پشت پنجره ایستاده و به خانه‌ی روبه‌رو خیره شده است. تنها پنجره‌ی طبقه‌ی دوم نور آبی کم‌رنگی دارد."},{"type":"character","name":"نیلوفر","text":"بازم روشن شد."},{"type":"action","text":"مادر از داخل خانه صدایش می‌زند. نیلوفر پرده را می‌کشد، اما نور آبی هنوز روی صورتش افتاده است."},{"type":"scene","text":"داخلی. خانه‌ی نیلوفر — شب"},{"type":"character","name":"مادر","text":"با کی حرف می‌زدی؟"},{"type":"character","name":"نیلوفر","text":"با هیچ‌کس."},{"type":"action","text":"مادر به پنجره نگاه می‌کند. برای یک لحظه، در پنجره‌ی خانه‌ی روبه‌رو سایه‌ای دیده می‌شود."}]'::jsonb),
('small-hours','ساعت‌های کوچک','SMALL HOURS','مانی فرهمند','کمدی تلخ',9,'یک تعمیرکار ساعت تصمیم می‌گیرد فقط ساعت‌هایی را تعمیر کند که صاحبشان از زمان می‌ترسد.','rose','[{"type":"scene","text":"داخلی. ساعت‌سازی — صبح"},{"type":"action","text":"صدای تیک‌تاک ساعت‌ها مثل باران ریزی در مغازه پیچیده. پیرمردی یک ساعت جیبی روی پیشخوان می‌گذارد."},{"type":"character","name":"مشتری","text":"عقب می‌مونه. هر روز پنج دقیقه."},{"type":"character","name":"ساعت‌ساز","text":"شما جلو می‌رید یا ساعت عقب می‌مونه؟"},{"type":"character","name":"مشتری","text":"فرقش چیه؟"},{"type":"character","name":"ساعت‌ساز","text":"برای ساعت؟ هیچ. برای آدم‌ها؟ همه‌چی."}]'::jsonb)
on conflict (id) do nothing;
