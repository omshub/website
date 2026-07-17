-- Keep extensions out of the Data API's exposed public schema.
create schema if not exists extensions;
create schema if not exists private;
revoke all on schema private from public;

do $$
begin
  if exists (
    select 1
    from pg_extension
    where extname = 'postgres_fdw'
      and extnamespace = 'public'::regnamespace
  ) then
    execute 'alter extension postgres_fdw set schema extensions';
  end if;
end
$$;

create extension if not exists pg_trgm with schema extensions;

-- Match the site's most frequent filters and sort order. The trigram index
-- prevents ILIKE '%term%' review searches from scanning every review body.
create index if not exists idx_reviews_course_created_at
  on public.reviews (course_id, created_at desc);
create index if not exists idx_reviews_course_year_sem_created_at
  on public.reviews (course_id, year, semester, created_at desc);
create index if not exists idx_reviews_reviewer_created_at
  on public.reviews (reviewer_id, created_at desc);
create index if not exists idx_reviews_body_trgm
  on public.reviews using gin (body extensions.gin_trgm_ops)
  where body is not null;
create index if not exists idx_user_mapping_supabase
  on public.user_id_mapping (supabase_uid);

-- Canonicalize policies from both the original migration and the current
-- production names. Wrapping auth.uid() in SELECT evaluates it once per query
-- instead of once per candidate row.
drop policy if exists "Reviews are viewable by everyone" on public.reviews;
drop policy if exists "Anyone can view reviews" on public.reviews;
drop policy if exists "Users can create their own reviews" on public.reviews;
drop policy if exists "Authenticated users can create reviews" on public.reviews;
drop policy if exists "Users can update their own reviews" on public.reviews;
drop policy if exists "Users can delete their own reviews" on public.reviews;

create policy "Anyone can view reviews"
  on public.reviews for select
  to anon, authenticated
  using (true);
create policy "Authenticated users can create reviews"
  on public.reviews for insert
  to authenticated
  with check ((select auth.uid()) = reviewer_id);
create policy "Users can update their own reviews"
  on public.reviews for update
  to authenticated
  using ((select auth.uid()) = reviewer_id)
  with check ((select auth.uid()) = reviewer_id);
create policy "Users can delete their own reviews"
  on public.reviews for delete
  to authenticated
  using ((select auth.uid()) = reviewer_id);

drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Users can view their own data" on public.users;
drop policy if exists "Users can insert own profile" on public.users;
drop policy if exists "Users can insert their own data" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Users can update their own data" on public.users;

create policy "Users can view their own data"
  on public.users for select
  to authenticated
  using ((select auth.uid()) = id);
create policy "Users can insert their own data"
  on public.users for insert
  to authenticated
  with check ((select auth.uid()) = id);
create policy "Users can update their own data"
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "User ID mapping is service role only"
  on public.user_id_mapping;
drop policy if exists "Users can view their own mapping"
  on public.user_id_mapping;
create policy "Users can view their own mapping"
  on public.user_id_mapping for select
  to authenticated
  using ((select auth.uid()) = supabase_uid);

-- Keep the security-definer trigger outside the Data API's exposed schemas.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, has_gt_email)
  values (new.id, coalesce(new.email, '') like '%@gatech.edu');
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;
revoke all on function private.handle_new_user() from anon;
revoke all on function private.handle_new_user() from authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

drop function if exists public.handle_new_user();
