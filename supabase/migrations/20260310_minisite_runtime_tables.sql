-- ============================================================================
-- RS ECOSYSTEM - MINISITE RUNTIME TABLES
-- Date: 2026-03-10
-- Purpose: create the runtime tables still used by the MiniSite app
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists public.minisite_biosites (
    id text primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    client_id text,
    slug varchar(100) not null unique,
    name varchar(255) not null,
    plan varchar(50) default 'free',
    sections jsonb not null default '[]'::jsonb,
    theme jsonb not null default '{}'::jsonb,
    is_published boolean not null default false,
    views integer not null default 0,
    seo jsonb not null default '{}'::jsonb,
    tracking jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.minisite_clients (
    id text primary key,
    agency_id uuid not null references auth.users(id) on delete cascade,
    name varchar(255) not null,
    email varchar(255),
    phone varchar(50),
    cpf text,
    birth_date text,
    address_line text,
    address_number text,
    address_city text,
    address_state text,
    address_zip text,
    notes text,
    status varchar(50) not null default 'active',
    monthly_fee numeric(10, 2) not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.minisite_payments (
    id text primary key,
    client_id text not null references public.minisite_clients(id) on delete cascade,
    amount numeric(10, 2) not null,
    date timestamptz default now(),
    due_date timestamptz,
    status varchar(50) not null default 'pending',
    method varchar(50) default 'pix',
    paid_at timestamptz,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.minisite_system_logs (
    id uuid primary key default gen_random_uuid(),
    actor_id uuid references auth.users(id) on delete set null,
    actor_name varchar(255),
    actor_email varchar(255),
    action varchar(100) not null,
    target varchar(255),
    timestamp timestamptz not null default now()
);

create table if not exists public.minisite_plans (
    id varchar(50) primary key,
    name varchar(255) not null,
    price varchar(100) not null,
    features jsonb not null default '[]'::jsonb,
    max_pages integer not null default 1,
    max_clients integer not null default 0,
    is_active boolean not null default true,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.minisite_setts (
    id integer primary key default 1,
    pix_key text,
    support_email text,
    platform_name text not null default 'RS MiniSite',
    mp_public_key text,
    mp_access_token text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint minisite_setts_single_row check (id = 1)
);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists tr_minisite_biosites_updated_at on public.minisite_biosites;
create trigger tr_minisite_biosites_updated_at
before update on public.minisite_biosites
for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_minisite_clients_updated_at on public.minisite_clients;
create trigger tr_minisite_clients_updated_at
before update on public.minisite_clients
for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_minisite_payments_updated_at on public.minisite_payments;
create trigger tr_minisite_payments_updated_at
before update on public.minisite_payments
for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_minisite_plans_updated_at on public.minisite_plans;
create trigger tr_minisite_plans_updated_at
before update on public.minisite_plans
for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_minisite_setts_updated_at on public.minisite_setts;
create trigger tr_minisite_setts_updated_at
before update on public.minisite_setts
for each row execute procedure public.handle_updated_at();

alter table public.minisite_biosites enable row level security;
alter table public.minisite_clients enable row level security;
alter table public.minisite_payments enable row level security;
alter table public.minisite_system_logs enable row level security;
alter table public.minisite_profiles enable row level security;
alter table public.minisite_plans enable row level security;
alter table public.minisite_setts enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_biosites' and policyname = 'minisite_biosites_select'
    ) then
        create policy minisite_biosites_select on public.minisite_biosites
            for select
            using (
                auth.uid() = user_id
                or is_published = true
                or exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_biosites' and policyname = 'minisite_biosites_insert'
    ) then
        create policy minisite_biosites_insert on public.minisite_biosites
            for insert
            with check (
                auth.uid() = user_id
                or exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_biosites' and policyname = 'minisite_biosites_update'
    ) then
        create policy minisite_biosites_update on public.minisite_biosites
            for update
            using (
                auth.uid() = user_id
                or exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            )
            with check (
                auth.uid() = user_id
                or exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_biosites' and policyname = 'minisite_biosites_delete'
    ) then
        create policy minisite_biosites_delete on public.minisite_biosites
            for delete
            using (
                auth.uid() = user_id
                or exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            );
    end if;
end
$$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_clients' and policyname = 'minisite_clients_select'
    ) then
        create policy minisite_clients_select on public.minisite_clients
            for select
            using (
                auth.uid() = agency_id
                or exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_clients' and policyname = 'minisite_clients_insert'
    ) then
        create policy minisite_clients_insert on public.minisite_clients
            for insert
            with check (
                auth.uid() = agency_id
                or exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_clients' and policyname = 'minisite_clients_update'
    ) then
        create policy minisite_clients_update on public.minisite_clients
            for update
            using (
                auth.uid() = agency_id
                or exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            )
            with check (
                auth.uid() = agency_id
                or exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_clients' and policyname = 'minisite_clients_delete'
    ) then
        create policy minisite_clients_delete on public.minisite_clients
            for delete
            using (
                auth.uid() = agency_id
                or exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            );
    end if;
end
$$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_payments' and policyname = 'minisite_payments_select'
    ) then
        create policy minisite_payments_select on public.minisite_payments
            for select
            using (
                exists (
                    select 1
                    from public.minisite_clients c
                    where c.id = minisite_payments.client_id
                      and (
                        c.agency_id = auth.uid()
                        or exists (
                            select 1
                            from public.minisite_profiles mp
                            where mp.id = auth.uid() and mp.plan = 'admin_master'
                        )
                      )
                )
            );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_payments' and policyname = 'minisite_payments_insert'
    ) then
        create policy minisite_payments_insert on public.minisite_payments
            for insert
            with check (
                exists (
                    select 1
                    from public.minisite_clients c
                    where c.id = minisite_payments.client_id
                      and (
                        c.agency_id = auth.uid()
                        or exists (
                            select 1
                            from public.minisite_profiles mp
                            where mp.id = auth.uid() and mp.plan = 'admin_master'
                        )
                      )
                )
            );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_payments' and policyname = 'minisite_payments_update'
    ) then
        create policy minisite_payments_update on public.minisite_payments
            for update
            using (
                exists (
                    select 1
                    from public.minisite_clients c
                    where c.id = minisite_payments.client_id
                      and (
                        c.agency_id = auth.uid()
                        or exists (
                            select 1
                            from public.minisite_profiles mp
                            where mp.id = auth.uid() and mp.plan = 'admin_master'
                        )
                      )
                )
            )
            with check (
                exists (
                    select 1
                    from public.minisite_clients c
                    where c.id = minisite_payments.client_id
                      and (
                        c.agency_id = auth.uid()
                        or exists (
                            select 1
                            from public.minisite_profiles mp
                            where mp.id = auth.uid() and mp.plan = 'admin_master'
                        )
                      )
                )
            );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_payments' and policyname = 'minisite_payments_delete'
    ) then
        create policy minisite_payments_delete on public.minisite_payments
            for delete
            using (
                exists (
                    select 1
                    from public.minisite_clients c
                    where c.id = minisite_payments.client_id
                      and (
                        c.agency_id = auth.uid()
                        or exists (
                            select 1
                            from public.minisite_profiles mp
                            where mp.id = auth.uid() and mp.plan = 'admin_master'
                        )
                      )
                )
            );
    end if;
end
$$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_system_logs' and policyname = 'minisite_system_logs_select'
    ) then
        create policy minisite_system_logs_select on public.minisite_system_logs
            for select
            using (
                actor_id = auth.uid()
                or exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_system_logs' and policyname = 'minisite_system_logs_insert'
    ) then
        create policy minisite_system_logs_insert on public.minisite_system_logs
            for insert
            with check (actor_id is null or actor_id = auth.uid());
    end if;
end
$$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_profiles' and policyname = 'minisite_profiles_select'
    ) then
        create policy minisite_profiles_select on public.minisite_profiles
            for select
            using (
                auth.uid() = id
                or exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            );
    end if;
end
$$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_plans' and policyname = 'minisite_plans_select'
    ) then
        create policy minisite_plans_select on public.minisite_plans
            for select
            using (true);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_plans' and policyname = 'minisite_plans_admin_write'
    ) then
        create policy minisite_plans_admin_write on public.minisite_plans
            for all
            using (
                exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            )
            with check (
                exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            );
    end if;
end
$$;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_setts' and policyname = 'minisite_setts_select'
    ) then
        create policy minisite_setts_select on public.minisite_setts
            for select
            using (true);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'minisite_setts' and policyname = 'minisite_setts_admin_write'
    ) then
        create policy minisite_setts_admin_write on public.minisite_setts
            for all
            using (
                exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            )
            with check (
                exists (
                    select 1
                    from public.minisite_profiles mp
                    where mp.id = auth.uid() and mp.plan = 'admin_master'
                )
            );
    end if;
end
$$;

create or replace function public.increment_minisite_views(site_id text)
returns void as $$
begin
    update public.minisite_biosites
    set views = views + 1
    where id = site_id;
end;
$$ language plpgsql security definer;

create index if not exists idx_minisite_biosites_user on public.minisite_biosites(user_id);
create index if not exists idx_minisite_biosites_slug on public.minisite_biosites(slug);
create index if not exists idx_minisite_biosites_published on public.minisite_biosites(is_published);
create index if not exists idx_minisite_clients_agency on public.minisite_clients(agency_id);
create index if not exists idx_minisite_payments_client on public.minisite_payments(client_id);
create index if not exists idx_minisite_logs_actor on public.minisite_system_logs(actor_id);
create index if not exists idx_minisite_profiles_plan on public.minisite_profiles(plan);

insert into public.minisite_plans (id, name, price, features, max_pages, max_clients, sort_order)
values
    ('free', 'RS MiniSite Gratis', 'Gratis', '["1 MiniSite","Com marca RS Prolipsi"]'::jsonb, 1, 0, 1),
    ('start', 'RS MiniSite Start', 'R$ 5,90/mes', '["1 MiniSite","Recursos liberados","Sem marca RS Prolipsi"]'::jsonb, 1, 0, 2),
    ('pro', 'RS MiniSite Pro', 'R$ 19,90/mes', '["Ate 10 MiniSites","Recursos liberados","Sem marcas"]'::jsonb, 10, 0, 3),
    ('agency', 'RS MiniSite Agente', 'R$ 129,90/mes', '["Acessos e Sub-contas","Gestao de ate 100 clientes","Marca Propria"]'::jsonb, 500, 100, 4),
    ('admin_master', 'Admin Master', 'Acesso Global', '["Gestao de Usuarios","Gestao de Agencias","Controle Financeiro","Acesso a todos os sites"]'::jsonb, 999999, 999999, 5)
on conflict (id) do update
set
    name = excluded.name,
    price = excluded.price,
    features = excluded.features,
    max_pages = excluded.max_pages,
    max_clients = excluded.max_clients,
    sort_order = excluded.sort_order,
    updated_at = now();

insert into public.minisite_setts (id, platform_name, support_email)
values (1, 'RS MiniSite', 'rsprolipsioficial@gmail.com')
on conflict (id) do update
set
    platform_name = excluded.platform_name,
    support_email = coalesce(public.minisite_setts.support_email, excluded.support_email),
    updated_at = now();
