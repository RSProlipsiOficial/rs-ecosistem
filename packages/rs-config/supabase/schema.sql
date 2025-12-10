-- Comunicação RS Prólipsi - Tabelas necessárias

-- Tenants
create table if not exists tenants (
  id uuid primary key,
  name text,
  created_at timestamp with time zone default now()
);

-- Mural de Comunicados
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  title text not null,
  message text not null,
  type text default 'info',
  audience text[] default array['consultor','marketplace'],
  author text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Agenda Comemorativa
create table if not exists agenda_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  category text not null,
  title text not null,
  content text,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Treinamentos (lista)
create table if not exists trainings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  title text not null,
  description text,
  category text,
  cover_image text,
  order_index int default 0,
  is_published boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Módulos de Treinamento
create table if not exists training_modules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  training_id uuid references trainings(id) on delete cascade,
  title text not null,
  order_index int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Aulas do Treinamento
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  training_id uuid references trainings(id) on delete cascade,
  module_id uuid references training_modules(id) on delete cascade,
  title text not null,
  video_id text,
  video_type text,
  order_index int default 0,
  duration int,
  content text,
  quiz jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Catálogos
create table if not exists catalogs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  title text not null,
  description text,
  cover_image text,
  pdf_url text,
  is_published boolean default true,
  download_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Materiais para Download
create table if not exists download_materials (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  title text not null,
  description text,
  icon_type text,
  file_url text,
  file_type text,
  is_published boolean default true,
  download_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices úteis
create index if not exists idx_announcements_tenant_created on announcements (tenant_id, created_at desc);
create index if not exists idx_agenda_tenant_created on agenda_items (tenant_id, created_at desc);
create index if not exists idx_trainings_tenant_order on trainings (tenant_id, order_index asc);
create index if not exists idx_training_modules_training_order on training_modules (training_id, order_index asc);
create index if not exists idx_lessons_training_module_order on lessons (training_id, module_id, order_index asc);
create index if not exists idx_catalogs_tenant_created on catalogs (tenant_id, created_at desc);
create index if not exists idx_download_materials_tenant_created on download_materials (tenant_id, created_at desc);

-- Triggers de updated_at
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_announcements_updated') then
    create trigger trg_announcements_updated before update on announcements for each row execute procedure set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_agenda_updated') then
    create trigger trg_agenda_updated before update on agenda_items for each row execute procedure set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_trainings_updated') then
    create trigger trg_trainings_updated before update on trainings for each row execute procedure set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_training_modules_updated') then
    create trigger trg_training_modules_updated before update on training_modules for each row execute procedure set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_lessons_updated') then
    create trigger trg_lessons_updated before update on lessons for each row execute procedure set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_catalogs_updated') then
    create trigger trg_catalogs_updated before update on catalogs for each row execute procedure set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'trg_download_materials_updated') then
    create trigger trg_download_materials_updated before update on download_materials for each row execute procedure set_updated_at();
  end if;
end$$;

-- Confirmação de visualização de comunicados
create table if not exists announcement_acks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  announcement_id uuid references announcements(id) on delete cascade,
  user_id text not null,
  confirmed boolean default true,
  seen_at timestamp with time zone default now()
);
create index if not exists idx_acks_tenant_announcement_user on announcement_acks (tenant_id, announcement_id, user_id);

-- Progresso de treinamento por usuário
create table if not exists training_progress (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  user_id text not null,
  training_id uuid references trainings(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  completed boolean default true,
  completed_at timestamp with time zone default now()
);
create index if not exists idx_training_progress_tenant_user_training on training_progress (tenant_id, user_id, training_id);

-- Logs de download de materiais
create table if not exists download_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  user_id text,
  material_id uuid references download_materials(id) on delete cascade,
  catalog_id uuid references catalogs(id) on delete cascade,
  downloaded_at timestamp with time zone default now()
);
