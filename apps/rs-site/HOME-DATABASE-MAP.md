# RS Site - Home / Banco de Dados

## Estado atual

Hoje a `Home` do `rs-site` ainda nao usa banco real.

Os dados estao em `localStorage` nestes pontos:

- `rsprolipsi_pages`: [PageBuilderContext.tsx](/d:/Rs%20%20Ecosystem/rs-ecosystem/apps/rs-site/context/PageBuilderContext.tsx)
- `rsprolipsi_theme`: [ThemeContext.tsx](/d:/Rs%20%20Ecosystem/rs-ecosystem/apps/rs-site/context/ThemeContext.tsx)
- `rsprolipsi_banner_settings`: [BannerContext.tsx](/d:/Rs%20%20Ecosystem/rs-ecosystem/apps/rs-site/context/BannerContext.tsx)
- `rsprolipsi_site_settings`: [SiteSettingsContext.tsx](/d:/Rs%20%20Ecosystem/rs-ecosystem/apps/rs-site/context/SiteSettingsContext.tsx)
- `rsprolipsi_products`: [ProductContext.tsx](/d:/Rs%20%20Ecosystem/rs-ecosystem/apps/rs-site/context/ProductContext.tsx)

## Estrutura criada no banco

Migration:

- [20260312_rs_site_builder_home.sql](/d:/Rs%20%20Ecosystem/rs-ecosystem/supabase/migrations/20260312_rs_site_builder_home.sql)

Tabelas:

- `public.site_pages`
- `public.site_page_blocks`
- `public.site_block_items`
- `public.site_global_content`
- `public.site_theme_settings`
- `public.site_banner_settings`
- `public.site_settings`
- `public.site_media_assets`

## Mapa da pagina Inicio

Arquivo de origem:

- [initialPages.ts](/d:/Rs%20%20Ecosystem/rs-ecosystem/apps/rs-site/config/initialPages.ts)

### Pagina

Registro em `site_pages`:

- `site_key = rs-site`
- `slug = home`
- `route = home`
- `title = Inicio`
- `seo`
- `background_banner`

### Bloco 1 - Banner principal

Origem:

- `home_hero_1`
- tipo `hero`

Destino:

- `site_page_blocks`

Campos principais:

- `block_key = home_hero_1`
- `type = hero`
- `title`
- `subtitle`
- `interstitial_text`
- `content`
- `cta_text`
- `cta_link`
- `styles.backgroundImage`
- `styles.minHeight`

### Bloco 2 - Secao institucional

Origem:

- `home_about_1`
- tipo `about`

Destino:

- `site_page_blocks`
- `site_block_items`

Campos do bloco:

- `title`
- `content`
- `image_url`
- `alt_text`
- `styles.backgroundColor`

Itens filhos:

- `features.0` a `features.3`
- cada item vai para `site_block_items`

Campos dos itens:

- `title`
- `description`
- `icon_svg`

### Bloco 3 - Diferenciais

Origem:

- `home_differentiators_1`
- tipo `differentiators`

Destino:

- `site_page_blocks`
- `site_block_items`

Campos do bloco:

- `title`
- `subtitle`
- `styles.backgroundColor`

Itens filhos:

- `features.0` a `features.2`

Campos dos itens:

- `title`
- `description`
- `icon_svg`

### Bloco 4 - Vitrine de produtos

Origem:

- `home_products_carousel_1`
- tipo `productsCarousel`

Destino:

- `site_page_blocks`

Campos do bloco:

- `title`
- `cta_text`
- `cta_link`
- `settings.productIds`
- `styles.backgroundColor`

Dependencia externa:

- produtos hoje ainda vem de [ProductContext.tsx](/d:/Rs%20%20Ecosystem/rs-ecosystem/apps/rs-site/context/ProductContext.tsx)
- na proxima etapa o certo e trocar isso para produto real do ecossistema ou para tabela propria do `rs-site`

## Midias

Toda imagem da `Home` deve deixar de ser salva como `data:image/...` no navegador.

Destino correto:

- upload para Supabase Storage
- registro da URL final em `site_media_assets`
- referencia da URL final em `site_page_blocks` ou `site_pages.background_banner`

## Proxima etapa

Depois desta migration, o passo certo e:

1. criar leitura da `Home` a partir de `site_pages` + `site_page_blocks` + `site_block_items`
2. salvar a `Home` via `rs-api`
3. trocar upload base64 por Storage real
4. so depois passar para `Sobre Nos`, `Conheca-nos`, `Loja` e demais paginas
