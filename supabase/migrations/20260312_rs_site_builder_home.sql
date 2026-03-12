-- RS Site builder schema
-- Foco inicial: pagina Home / Inicio
-- Observacao: a persistencia deve passar pelo rs-api / service role.

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create table if not exists public.site_pages (
    id uuid primary key default gen_random_uuid(),
    site_key text not null default 'rs-site',
    slug text not null,
    route text,
    title text not null,
    show_in_nav boolean not null default false,
    linked_product_id text,
    is_static boolean not null default false,
    sort_order integer not null default 0,
    status text not null default 'draft' check (status in ('draft', 'published')),
    seo jsonb not null default '{}'::jsonb,
    background_banner jsonb not null default '{"enabled": false, "imageUrl": "", "opacity": 0.42}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (site_key, slug)
);

create table if not exists public.site_page_blocks (
    id uuid primary key default gen_random_uuid(),
    page_id uuid not null references public.site_pages(id) on delete cascade,
    block_key text not null,
    type text not null,
    title text,
    subtitle text,
    interstitial_text text,
    content text,
    image_url text,
    alt_text text,
    cta_text text,
    cta_link text,
    is_enabled boolean not null default true,
    sort_order integer not null default 0,
    styles jsonb not null default '{}'::jsonb,
    settings jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (page_id, block_key)
);

create table if not exists public.site_block_items (
    id uuid primary key default gen_random_uuid(),
    block_id uuid not null references public.site_page_blocks(id) on delete cascade,
    item_key text not null,
    item_type text not null default 'feature',
    title text,
    description text,
    icon_svg text,
    image_url text,
    alt_text text,
    sort_order integer not null default 0,
    content jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (block_id, item_key)
);

create table if not exists public.site_global_content (
    site_key text primary key,
    header_content jsonb not null default '{}'::jsonb,
    footer_content jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.site_theme_settings (
    site_key text primary key,
    theme jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.site_banner_settings (
    site_key text primary key,
    settings jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
    site_key text primary key,
    settings jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.site_media_assets (
    id uuid primary key default gen_random_uuid(),
    site_key text not null default 'rs-site',
    page_slug text,
    block_key text,
    asset_role text not null,
    storage_path text,
    public_url text,
    mime_type text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_site_pages_site_slug
    on public.site_pages(site_key, slug);

create index if not exists idx_site_page_blocks_page_sort
    on public.site_page_blocks(page_id, sort_order);

create index if not exists idx_site_block_items_block_sort
    on public.site_block_items(block_id, sort_order);

create index if not exists idx_site_media_assets_site_page
    on public.site_media_assets(site_key, page_slug, block_key);

drop trigger if exists tr_site_pages_updated_at on public.site_pages;
create trigger tr_site_pages_updated_at
before update on public.site_pages
for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_site_page_blocks_updated_at on public.site_page_blocks;
create trigger tr_site_page_blocks_updated_at
before update on public.site_page_blocks
for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_site_block_items_updated_at on public.site_block_items;
create trigger tr_site_block_items_updated_at
before update on public.site_block_items
for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_site_global_content_updated_at on public.site_global_content;
create trigger tr_site_global_content_updated_at
before update on public.site_global_content
for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_site_theme_settings_updated_at on public.site_theme_settings;
create trigger tr_site_theme_settings_updated_at
before update on public.site_theme_settings
for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_site_banner_settings_updated_at on public.site_banner_settings;
create trigger tr_site_banner_settings_updated_at
before update on public.site_banner_settings
for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_site_settings_updated_at on public.site_settings;
create trigger tr_site_settings_updated_at
before update on public.site_settings
for each row execute procedure public.handle_updated_at();

drop trigger if exists tr_site_media_assets_updated_at on public.site_media_assets;
create trigger tr_site_media_assets_updated_at
before update on public.site_media_assets
for each row execute procedure public.handle_updated_at();

alter table public.site_pages enable row level security;
alter table public.site_page_blocks enable row level security;
alter table public.site_block_items enable row level security;
alter table public.site_global_content enable row level security;
alter table public.site_theme_settings enable row level security;
alter table public.site_banner_settings enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_media_assets enable row level security;

insert into public.site_global_content (site_key, header_content, footer_content)
values (
    'rs-site',
    '{"title":"RS Prolipsi","ctaText":"Login"}'::jsonb,
    '{"title":"RS Prolipsi","subtitle":"Junte-se a revolucao do marketing digital e de rede."}'::jsonb
)
on conflict (site_key) do nothing;

insert into public.site_theme_settings (site_key, theme)
values (
    'rs-site',
    '{
      "colors": {
        "accent": "#D4AF37",
        "background": "#121212",
        "textPrimary": "#FFFFFF",
        "textSecondary": "#a0aec0",
        "buttonBg": "#D4AF37",
        "buttonText": "#121212",
        "surface": "rgba(255,255,255,0.05)",
        "border": "rgba(255,255,255,0.1)"
      }
    }'::jsonb
)
on conflict (site_key) do nothing;

insert into public.site_banner_settings (site_key, settings)
values (
    'rs-site',
    '{
      "sideBanner": {
        "enabled": false,
        "imageUrl": "",
        "link": "#",
        "position": "left",
        "top": 120,
        "width": 200
      },
      "backgroundBanner": {
        "enabled": true,
        "imageUrl": "https://picsum.photos/seed/dark-office/1920/1080?grayscale&blur=2",
        "opacity": 0.30
      }
    }'::jsonb
)
on conflict (site_key) do nothing;

insert into public.site_settings (site_key, settings)
values (
    'rs-site',
    '{
      "socialLinks": [
        {"id":"sl1","platform":"facebook","url":"#"},
        {"id":"sl2","platform":"instagram","url":"#"},
        {"id":"sl3","platform":"linkedin","url":"#"},
        {"id":"sl4","platform":"youtube","url":"#"}
      ]
    }'::jsonb
)
on conflict (site_key) do nothing;

with upsert_home as (
    insert into public.site_pages (
        site_key,
        slug,
        route,
        title,
        show_in_nav,
        is_static,
        sort_order,
        status,
        seo,
        background_banner
    )
    values (
        'rs-site',
        'home',
        'home',
        'Inicio',
        false,
        true,
        0,
        'published',
        '{
          "metaTitle": "RS Prolipsi - Marketing Digital e Networking Global",
          "metaDescription": "Ecossistema que une marketing digital e marketing multinivel."
        }'::jsonb,
        '{
          "enabled": false,
          "imageUrl": "",
          "opacity": 0.42
        }'::jsonb
    )
    on conflict (site_key, slug)
    do update set
        route = excluded.route,
        title = excluded.title,
        is_static = excluded.is_static,
        sort_order = excluded.sort_order,
        status = excluded.status,
        seo = excluded.seo,
        background_banner = excluded.background_banner
    returning id
),
home_page as (
    select id from upsert_home
    union all
    select id from public.site_pages where site_key = 'rs-site' and slug = 'home' limit 1
)
insert into public.site_page_blocks (
    page_id,
    block_key,
    type,
    title,
    subtitle,
    interstitial_text,
    content,
    image_url,
    alt_text,
    cta_text,
    cta_link,
    is_enabled,
    sort_order,
    styles,
    settings
)
select
    home_page.id,
    block_data.block_key,
    block_data.type,
    block_data.title,
    block_data.subtitle,
    block_data.interstitial_text,
    block_data.content,
    block_data.image_url,
    block_data.alt_text,
    block_data.cta_text,
    block_data.cta_link,
    true,
    block_data.sort_order,
    block_data.styles,
    block_data.settings
from home_page
cross join (
    values
        (
            'home_hero_1',
            'hero',
            'FUSAO DO MARKETING DIGITAL',
            'O MARKETING MULTINIVEL',
            'COM',
            'Bem-vindo a nova era do empreendedorismo.',
            null,
            null,
            'Associe-se Ja',
            'store',
            1,
            '{"backgroundImage":"url(''https://picsum.photos/seed/dark-office/1920/1080?grayscale&blur=2'')","minHeight":"100vh"}'::jsonb,
            '{}'::jsonb
        ),
        (
            'home_about_1',
            'about',
            'Nossa Visao: Um Ecossistema Global para o Sucesso',
            null,
            null,
            'A RS Prolipsi esta na intersecao da tecnologia e da conexao humana.',
            'https://picsum.photos/seed/corporate/600/700',
            'Corporate Team',
            null,
            null,
            2,
            '{"backgroundColor":"var(--color-background)"}'::jsonb,
            '{}'::jsonb
        ),
        (
            'home_differentiators_1',
            'differentiators',
            'Nossos Diferenciais',
            'Descubra os pilares que tornam nosso ecossistema revolucionario.',
            null,
            null,
            null,
            null,
            null,
            null,
            3,
            '{"backgroundColor":"black"}'::jsonb,
            '{}'::jsonb
        ),
        (
            'home_products_carousel_1',
            'productsCarousel',
            'Conheca Nossos Produtos',
            null,
            null,
            null,
            null,
            null,
            'Ir para a Loja',
            'store',
            4,
            '{"backgroundColor":"var(--color-background)"}'::jsonb,
            '{"productIds":[]}'::jsonb
        )
) as block_data(
    block_key,
    type,
    title,
    subtitle,
    interstitial_text,
    content,
    image_url,
    alt_text,
    cta_text,
    cta_link,
    sort_order,
    styles,
    settings
)
on conflict (page_id, block_key) do nothing;

with home_blocks as (
    select pb.id, pb.block_key
    from public.site_page_blocks pb
    join public.site_pages p on p.id = pb.page_id
    where p.site_key = 'rs-site'
      and p.slug = 'home'
)
insert into public.site_block_items (
    block_id,
    item_key,
    item_type,
    title,
    description,
    icon_svg,
    sort_order,
    content
)
select
    home_blocks.id,
    item_data.item_key,
    'feature',
    item_data.title,
    item_data.description,
    item_data.icon_svg,
    item_data.sort_order,
    '{}'::jsonb
from home_blocks
join (
    values
        ('home_about_1', 'feature_1', 'Alcance Global', 'Modelos de matriz e ciclos globais.', '', 1),
        ('home_about_1', 'feature_2', 'Inovacao Digital', 'Ferramentas e produtos para ampliar esforcos.', '', 2),
        ('home_about_1', 'feature_3', 'Comunidade Prospera', 'Rede de apoio para crescimento.', '', 3),
        ('home_about_1', 'feature_4', 'Crescimento Ilimitado', 'Plano para recompensar trabalho e lideranca.', '', 4),
        ('home_differentiators_1', 'feature_1', 'Integracao de Marketing Digital', 'Ferramentas para social, ecommerce e leads.', '', 1),
        ('home_differentiators_1', 'feature_2', 'Modelos Avancados de MMN', 'Plano de compensacao com ciclos e matriz.', '', 2),
        ('home_differentiators_1', 'feature_3', 'Ecossistema Global Singular', 'Fusao do digital com o multinivel.', '', 3)
) as item_data(parent_block_key, item_key, title, description, icon_svg, sort_order)
    on item_data.parent_block_key = home_blocks.block_key
on conflict (block_id, item_key) do nothing;
