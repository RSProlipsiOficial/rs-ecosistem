import express from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../../lib/supabaseClient';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const DEFAULT_SITE_KEY = 'rs-site';
const APP_CONFIG_PREFIX = 'site_builder_bootstrap:';

type SiteBuilderPayload = {
  siteKey: string;
  pages?: any[];
  globalContent?: {
    header?: any;
    footer?: any;
  };
  theme?: Record<string, any> | null;
  bannerSettings?: Record<string, any> | null;
  siteSettings?: Record<string, any> | null;
};

const isMissingRelationError = (error: any) => {
  const code = String(error?.code || '');
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();

  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    message.includes('schema cache') ||
    message.includes('relation')
  );
};

const getAppConfigKey = (siteKey: string) => `${APP_CONFIG_PREFIX}${siteKey}`;

const getFallbackPayload = async (siteKey: string): Promise<SiteBuilderPayload | null> => {
  const { data, error } = await supabaseAdmin
    .from('app_configs')
    .select('value')
    .eq('key', getAppConfigKey(siteKey))
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data?.value as SiteBuilderPayload | null) || null;
};

const saveFallbackPayload = async (payload: SiteBuilderPayload) => {
  const { error } = await supabaseAdmin
    .from('app_configs')
    .upsert(
      {
        key: getAppConfigKey(payload.siteKey),
        value: payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

  if (error) {
    throw error;
  }
};

const buildContainerSettings = (container: any) => {
  const excludedKeys = new Set([
    'id',
    'type',
    'title',
    'subtitle',
    'interstitialText',
    'content',
    'imageUrl',
    'altText',
    'ctaText',
    'ctaLink',
    'styles',
    'features',
  ]);

  return Object.entries(container || {}).reduce<Record<string, any>>((acc, [key, value]) => {
    if (excludedKeys.has(key) || value === undefined) {
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});
};

const buildStructuredPayload = async (siteKey: string): Promise<SiteBuilderPayload | null> => {
  const { data: pagesData, error: pagesError } = await supabaseAdmin
    .from('site_pages')
    .select('id, slug, route, title, show_in_nav, linked_product_id, is_static, sort_order, seo, background_banner')
    .eq('site_key', siteKey)
    .order('sort_order', { ascending: true });

  if (pagesError) {
    throw pagesError;
  }

  const pageIds = (pagesData || []).map((page: any) => page.id);

  const { data: blocksData, error: blocksError } = pageIds.length > 0
    ? await supabaseAdmin
        .from('site_page_blocks')
        .select('id, page_id, block_key, type, title, subtitle, interstitial_text, content, image_url, alt_text, cta_text, cta_link, sort_order, styles, settings')
        .in('page_id', pageIds)
        .order('sort_order', { ascending: true })
    : { data: [], error: null as any };

  if (blocksError) {
    throw blocksError;
  }

  const blockIds = (blocksData || []).map((block: any) => block.id);

  const { data: itemsData, error: itemsError } = blockIds.length > 0
    ? await supabaseAdmin
        .from('site_block_items')
        .select('block_id, item_key, title, description, icon_svg, image_url, alt_text, sort_order, content')
        .in('block_id', blockIds)
        .order('sort_order', { ascending: true })
    : { data: [], error: null as any };

  if (itemsError) {
    throw itemsError;
  }

  const { data: globalContentData, error: globalContentError } = await supabaseAdmin
    .from('site_global_content')
    .select('header_content, footer_content')
    .eq('site_key', siteKey)
    .maybeSingle();

  if (globalContentError && !isMissingRelationError(globalContentError)) {
    throw globalContentError;
  }

  const { data: themeData, error: themeError } = await supabaseAdmin
    .from('site_theme_settings')
    .select('theme')
    .eq('site_key', siteKey)
    .maybeSingle();

  if (themeError && !isMissingRelationError(themeError)) {
    throw themeError;
  }

  const { data: bannerData, error: bannerError } = await supabaseAdmin
    .from('site_banner_settings')
    .select('settings')
    .eq('site_key', siteKey)
    .maybeSingle();

  if (bannerError && !isMissingRelationError(bannerError)) {
    throw bannerError;
  }

  const { data: siteSettingsData, error: siteSettingsError } = await supabaseAdmin
    .from('site_settings')
    .select('settings')
    .eq('site_key', siteKey)
    .maybeSingle();

  if (siteSettingsError && !isMissingRelationError(siteSettingsError)) {
    throw siteSettingsError;
  }

  const itemsByBlock = new Map<string, any[]>();
  for (const item of itemsData || []) {
    const list = itemsByBlock.get(item.block_id) || [];
    list.push(item);
    itemsByBlock.set(item.block_id, list);
  }

  const blocksByPage = new Map<string, any[]>();
  for (const block of blocksData || []) {
    const list = blocksByPage.get(block.page_id) || [];
    list.push(block);
    blocksByPage.set(block.page_id, list);
  }

  const pages = (pagesData || []).map((page: any) => ({
    id: page.id,
    slug: page.slug,
    route: page.route || undefined,
    title: page.title,
    showInNav: Boolean(page.show_in_nav),
    linkedProductId: page.linked_product_id || null,
    isStatic: Boolean(page.is_static),
    seo: page.seo || undefined,
    backgroundBanner: page.background_banner || undefined,
    containers: (blocksByPage.get(page.id) || []).map((block: any) => {
      const features = (itemsByBlock.get(block.id) || []).map((item: any) => ({
        iconSvg: item.icon_svg || '',
        title: item.title || '',
        description: item.description || '',
        imageUrl: item.image_url || undefined,
        imageAltText: item.alt_text || undefined,
        ...(item.content && typeof item.content === 'object' ? item.content : {}),
      }));

      return {
        id: block.block_key,
        type: block.type,
        title: block.title || undefined,
        subtitle: block.subtitle || undefined,
        interstitialText: block.interstitial_text || undefined,
        content: block.content || undefined,
        imageUrl: block.image_url || undefined,
        altText: block.alt_text || undefined,
        ctaText: block.cta_text || undefined,
        ctaLink: block.cta_link || undefined,
        styles: block.styles || undefined,
        ...(block.settings && typeof block.settings === 'object' ? block.settings : {}),
        ...(features.length > 0 ? { features } : {}),
      };
    }),
  }));

  const hasStructuredData =
    pages.length > 0 ||
    Boolean(globalContentData) ||
    Boolean(themeData?.theme) ||
    Boolean(bannerData?.settings) ||
    Boolean(siteSettingsData?.settings);

  if (!hasStructuredData) {
    return null;
  }

  return {
    siteKey,
    pages,
    globalContent: {
      header: globalContentData?.header_content || {},
      footer: globalContentData?.footer_content || {},
    },
    theme: themeData?.theme || null,
    bannerSettings: bannerData?.settings || null,
    siteSettings: siteSettingsData?.settings || null,
  };
};

const getCurrentPayload = async (siteKey: string): Promise<SiteBuilderPayload | null> => {
  try {
    const structuredPayload = await buildStructuredPayload(siteKey);
    if (structuredPayload) {
      return structuredPayload;
    }
  } catch (error) {
    if (!isMissingRelationError(error)) {
      throw error;
    }
  }

  return getFallbackPayload(siteKey);
};

const saveStructuredPayload = async (payload: SiteBuilderPayload) => {
  const { siteKey, pages = [], globalContent, theme, bannerSettings, siteSettings } = payload;

  const { data: existingPages, error: existingPagesError } = await supabaseAdmin
    .from('site_pages')
    .select('id, slug')
    .eq('site_key', siteKey);

  if (existingPagesError) {
    throw existingPagesError;
  }

  const incomingSlugs = new Set(pages.map((page: any) => page.slug));
  const stalePageIds = (existingPages || [])
    .filter((page: any) => !incomingSlugs.has(page.slug))
    .map((page: any) => page.id);

  if (stalePageIds.length > 0) {
    const { error: deletePagesError } = await supabaseAdmin
      .from('site_pages')
      .delete()
      .in('id', stalePageIds);

    if (deletePagesError) {
      throw deletePagesError;
    }
  }

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
    const page = pages[pageIndex];

    const { data: savedPage, error: upsertPageError } = await supabaseAdmin
      .from('site_pages')
      .upsert(
        {
          site_key: siteKey,
          slug: page.slug,
          route: page.route || null,
          title: page.title,
          show_in_nav: Boolean(page.showInNav),
          linked_product_id: page.linkedProductId || null,
          is_static: Boolean(page.isStatic),
          sort_order: pageIndex,
          status: 'published',
          seo: page.seo || {},
          background_banner: page.backgroundBanner || { enabled: false, imageUrl: '', opacity: 0.42 },
        },
        { onConflict: 'site_key,slug' }
      )
      .select('id')
      .single();

    if (upsertPageError) {
      throw upsertPageError;
    }

    const pageId = savedPage.id;

    const { data: existingBlocks, error: existingBlocksError } = await supabaseAdmin
      .from('site_page_blocks')
      .select('id, block_key')
      .eq('page_id', pageId);

    if (existingBlocksError) {
      throw existingBlocksError;
    }

    const containers = Array.isArray(page.containers) ? page.containers : [];
    const incomingBlockKeys = new Set(containers.map((container: any) => container.id));
    const staleBlockIds = (existingBlocks || [])
      .filter((block: any) => !incomingBlockKeys.has(block.block_key))
      .map((block: any) => block.id);

    if (staleBlockIds.length > 0) {
      const { error: deleteBlocksError } = await supabaseAdmin
        .from('site_page_blocks')
        .delete()
        .in('id', staleBlockIds);

      if (deleteBlocksError) {
        throw deleteBlocksError;
      }
    }

    for (let blockIndex = 0; blockIndex < containers.length; blockIndex += 1) {
      const container = containers[blockIndex];

      const { data: savedBlock, error: upsertBlockError } = await supabaseAdmin
        .from('site_page_blocks')
        .upsert(
          {
            page_id: pageId,
            block_key: container.id,
            type: container.type,
            title: container.title || null,
            subtitle: container.subtitle || null,
            interstitial_text: container.interstitialText || null,
            content: container.content || null,
            image_url: container.imageUrl || null,
            alt_text: container.altText || null,
            cta_text: container.ctaText || null,
            cta_link: container.ctaLink || null,
            is_enabled: true,
            sort_order: blockIndex,
            styles: container.styles || {},
            settings: buildContainerSettings(container),
          },
          { onConflict: 'page_id,block_key' }
        )
        .select('id')
        .single();

      if (upsertBlockError) {
        throw upsertBlockError;
      }

      const blockId = savedBlock.id;

      const { data: existingItems, error: existingItemsError } = await supabaseAdmin
        .from('site_block_items')
        .select('id, item_key')
        .eq('block_id', blockId);

      if (existingItemsError) {
        throw existingItemsError;
      }

      const features = Array.isArray(container.features) ? container.features : [];
      const incomingItemKeys = new Set(features.map((_: any, index: number) => `feature_${index + 1}`));
      const staleItemIds = (existingItems || [])
        .filter((item: any) => !incomingItemKeys.has(item.item_key))
        .map((item: any) => item.id);

      if (staleItemIds.length > 0) {
        const { error: deleteItemsError } = await supabaseAdmin
          .from('site_block_items')
          .delete()
          .in('id', staleItemIds);

        if (deleteItemsError) {
          throw deleteItemsError;
        }
      }

      if (features.length > 0) {
        const { error: upsertItemsError } = await supabaseAdmin
          .from('site_block_items')
          .upsert(
            features.map((feature: any, index: number) => ({
              block_id: blockId,
              item_key: `feature_${index + 1}`,
              item_type: 'feature',
              title: feature.title || null,
              description: feature.description || null,
              icon_svg: feature.iconSvg || null,
              image_url: feature.imageUrl || null,
              alt_text: feature.imageAltText || null,
              sort_order: index,
              content: {},
            })),
            { onConflict: 'block_id,item_key' }
          );

        if (upsertItemsError) {
          throw upsertItemsError;
        }
      }
    }
  }

  if (globalContent) {
    const { error: globalContentError } = await supabaseAdmin
      .from('site_global_content')
      .upsert(
        {
          site_key: siteKey,
          header_content: globalContent.header || {},
          footer_content: globalContent.footer || {},
        },
        { onConflict: 'site_key' }
      );

    if (globalContentError) {
      throw globalContentError;
    }
  }

  if (theme) {
    const { error: themeSaveError } = await supabaseAdmin
      .from('site_theme_settings')
      .upsert(
        {
          site_key: siteKey,
          theme,
        },
        { onConflict: 'site_key' }
      );

    if (themeSaveError) {
      throw themeSaveError;
    }
  }

  if (bannerSettings) {
    const { error: bannerSaveError } = await supabaseAdmin
      .from('site_banner_settings')
      .upsert(
        {
          site_key: siteKey,
          settings: bannerSettings,
        },
        { onConflict: 'site_key' }
      );

    if (bannerSaveError) {
      throw bannerSaveError;
    }
  }

  if (siteSettings) {
    const { error: siteSettingsSaveError } = await supabaseAdmin
      .from('site_settings')
      .upsert(
        {
          site_key: siteKey,
          settings: siteSettings,
        },
        { onConflict: 'site_key' }
      );

    if (siteSettingsSaveError) {
      throw siteSettingsSaveError;
    }
  }
};

router.get('/bootstrap', async (req, res) => {
  const siteKey = String(req.query.siteKey || DEFAULT_SITE_KEY).trim() || DEFAULT_SITE_KEY;

  try {
    const data = await getCurrentPayload(siteKey);

    return res.json({
      success: true,
      source: data ? 'database' : 'empty',
      data,
    });
  } catch (error: any) {
    console.error('[site-builder] bootstrap load failed:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Falha ao carregar o construtor do site.',
    });
  }
});

router.put('/bootstrap', async (req, res) => {
  const siteKey = String(req.body?.siteKey || DEFAULT_SITE_KEY).trim() || DEFAULT_SITE_KEY;

  try {
    const currentPayload = (await getCurrentPayload(siteKey)) || { siteKey };
    const mergedPayload: SiteBuilderPayload = {
      siteKey,
      pages: req.body?.pages ?? currentPayload.pages ?? [],
      globalContent: req.body?.globalContent ?? currentPayload.globalContent ?? { header: {}, footer: {} },
      theme: req.body?.theme ?? currentPayload.theme ?? null,
      bannerSettings: req.body?.bannerSettings ?? currentPayload.bannerSettings ?? null,
      siteSettings: req.body?.siteSettings ?? currentPayload.siteSettings ?? null,
    };

    let source = 'structured';

    try {
      await saveStructuredPayload(mergedPayload);
    } catch (error) {
      if (!isMissingRelationError(error)) {
        throw error;
      }

      source = 'app_configs';
    }

    await saveFallbackPayload(mergedPayload);

    return res.json({
      success: true,
      source,
      data: {
        siteKey,
      },
    });
  } catch (error: any) {
    console.error('[site-builder] bootstrap save failed:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Falha ao salvar o construtor do site.',
    });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado.',
      });
    }

    const siteKey = String(req.body?.siteKey || DEFAULT_SITE_KEY).trim() || DEFAULT_SITE_KEY;
    const folder = String(req.body?.folder || 'pages').trim() || 'pages';
    const bucketName = 'site-builder';
    const safeExtension = (req.file.originalname.split('.').pop() || 'webp').toLowerCase();
    const fileName = `${siteKey}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExtension}`;

    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    if (bucketsError) {
      throw bucketsError;
    }

    if (!buckets?.find(bucket => bucket.name === bucketName)) {
      const { error: createBucketError } = await supabaseAdmin.storage.createBucket(bucketName, { public: true });
      if (createBucketError) {
        throw createBucketError;
      }
    }

    const { data: uploaded, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(uploaded.path);

    return res.json({
      success: true,
      path: uploaded.path,
      url: publicData.publicUrl,
    });
  } catch (error: any) {
    console.error('[site-builder] image upload failed:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Falha ao enviar a imagem.',
    });
  }
});

export default router;
