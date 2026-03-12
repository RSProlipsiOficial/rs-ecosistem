-- ============================================================================
-- RS ECOSYSTEM - MINISITE TEMPLATE LIBRARY
-- Date: 2026-03-10
-- Purpose: persist community and company templates for the MiniSite dashboard
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists public.minisite_templates (
    id uuid primary key default gen_random_uuid(),
    owner_user_id uuid references auth.users(id) on delete set null,
    name varchar(255) not null,
    niche varchar(255),
    category varchar(255),
    description text,
    sections jsonb not null default '[]'::jsonb,
    theme jsonb not null default '{}'::jsonb,
    seo jsonb not null default '{}'::jsonb,
    plan varchar(50) not null default 'free',
    preview_text varchar(255),
    preview_accent varchar(50),
    is_public boolean not null default false,
    is_company_library boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_minisite_templates_owner on public.minisite_templates(owner_user_id);
create index if not exists idx_minisite_templates_public on public.minisite_templates(is_public, is_company_library);
create index if not exists idx_minisite_templates_category on public.minisite_templates(category);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists tr_minisite_templates_updated_at on public.minisite_templates;
create trigger tr_minisite_templates_updated_at
before update on public.minisite_templates
for each row execute procedure public.handle_updated_at();

alter table public.minisite_templates enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_templates' and policyname = 'minisite_templates_select'
    ) then
        create policy minisite_templates_select on public.minisite_templates
            for select
            using (
                owner_user_id = auth.uid()
                or is_public = true
                or is_company_library = true
                or exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_templates' and policyname = 'minisite_templates_insert'
    ) then
        create policy minisite_templates_insert on public.minisite_templates
            for insert
            with check (
                owner_user_id = auth.uid()
                or exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_templates' and policyname = 'minisite_templates_update'
    ) then
        create policy minisite_templates_update on public.minisite_templates
            for update
            using (
                owner_user_id = auth.uid()
                or exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            )
            with check (
                owner_user_id = auth.uid()
                or exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_templates' and policyname = 'minisite_templates_delete'
    ) then
        create policy minisite_templates_delete on public.minisite_templates
            for delete
            using (
                owner_user_id = auth.uid()
                or exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            );
    end if;
end
$$;
