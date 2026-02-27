import { Router, Request, Response } from 'express';
import multer from 'multer';
import { supabase } from '../lib/supabaseClient';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// =====================================================
// PRODUTOS - CRUD COMPLETO
// =====================================================

// Listar todos os produtos
router.get('/v1/marketplace/products', async (req: Request, res: Response) => {
  try {
    const tenantId = req.query.tenantId || 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';
    const { published } = req.query;

    let query = supabase
      .from('products')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (published !== undefined) {
      query = query.eq('published', published === 'true');
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Obter produto por ID
router.get('/v1/marketplace/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ success: false, error: 'Produto não encontrado' });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Criar produto
router.post('/v1/marketplace/products', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

    const productData = {
      tenant_id: body.tenantId,
      name: body.name,
      description: body.description,
      price: body.price,
      compare_price: body.originalPrice,
      stock_quantity: body.stock,
      sku: body.sku,
      images: body.images || [],
      category: body.category,
      collections: body.collections || [],
      published: body.published !== false,
      featured: body.featured || false,
      specifications: body.specifications || {},
      seo_title: body.seoTitle,
      seo_description: body.seoDescription,
      seo_keywords: body.seoKeywords,
      member_price: body.memberPrice
    };

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Atualizar produto
router.put('/v1/marketplace/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const productData: any = {};
    if (body.name) productData.name = body.name;
    if (body.description) productData.description = body.description;
    if (body.price !== undefined) productData.price = body.price;
    if (body.memberPrice !== undefined) productData.member_price = body.memberPrice;
    if (body.originalPrice !== undefined) productData.compare_price = body.originalPrice;
    if (body.stock !== undefined) productData.stock_quantity = body.stock;
    if (body.sku) productData.sku = body.sku;
    if (body.images) productData.images = body.images;
    if (body.category) productData.category = body.category;
    if (body.collections) productData.collections = body.collections;
    if (body.published !== undefined) productData.published = body.published;
    if (body.featured !== undefined) productData.featured = body.featured;
    if (body.specifications) productData.specifications = body.specifications;
    if (body.seoTitle) productData.seo_title = body.seoTitle;
    if (body.seoDescription) productData.seo_description = body.seoDescription;
    if (body.seoKeywords) productData.seo_keywords = body.seoKeywords;

    productData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Deletar produto
router.delete('/v1/marketplace/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Atualizar estoque
router.patch('/v1/marketplace/products/:id/stock', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined) {
      return res.status(400).json({ success: false, error: 'stock requerido' });
    }

    const { data, error } = await supabase
      .from('products')
      .update({ stock_quantity: stock, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// COLEÇÕES - CRUD COMPLETO
// =====================================================

// Listar coleções
router.get('/v1/marketplace/collections', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.query;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Criar coleção
router.post('/v1/marketplace/collections', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

    const collectionData = {
      tenant_id: body.tenantId,
      name: body.name,
      description: body.description,
      image: body.image,
      product_ids: body.productIds || []
    };

    const { data, error } = await supabase
      .from('collections')
      .insert([collectionData])
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Atualizar coleção
router.put('/v1/marketplace/collections/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const collectionData: any = { updated_at: new Date().toISOString() };
    if (body.name) collectionData.name = body.name;
    if (body.description) collectionData.description = body.description;
    if (body.image) collectionData.image = body.image;
    if (body.productIds) collectionData.product_ids = body.productIds;

    const { data, error } = await supabase
      .from('collections')
      .update(collectionData)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Deletar coleção
router.delete('/v1/marketplace/collections/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// DASHBOARD LAYOUT - MARKETPLACE (stub)
// =====================================================

router.get('/v1/dashboard-layout/marketplace', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      config: {
        bonusCards: [
          { title: 'Bônus do Ciclo', icon: 'IconAward', source: 'bonusCicloGlobal' },
          { title: 'Top SIGMA', icon: 'IconTrophy', source: 'bonusTopSigme' },
          { title: 'Plano de Carreira', icon: 'IconBriefcase', source: 'bonusPlanoCarreira' }
        ]
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/v1/dashboard/marketplace', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      config: {
        bonusCards: [
          { title: 'Bônus do Ciclo', icon: 'IconAward', source: 'bonusCicloGlobal' },
          { title: 'Top SIGMA', icon: 'IconTrophy', source: 'bonusTopSigme' },
          { title: 'Plano de Carreira', icon: 'IconBriefcase', source: 'bonusPlanoCarreira' }
        ]
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// PEDIDOS - CRUD COMPLETO
// =====================================================

// Listar pedidos
router.get('/v1/marketplace/orders', async (req: Request, res: Response) => {
  try {
    const { tenantId, status } = req.query;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

    let query = supabase
      .from('orders')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Criar pedido (com sincronização para RS-CDS)
router.post('/v1/marketplace/orders', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

    // =====================================================
    // 1) INSERT NA TABELA PRINCIPAL (orders)
    // =====================================================
    const orderData: any = {
      tenant_id: body.tenantId,
      customer_id: body.customerId,
      items: body.items,
      subtotal: body.subtotal,
      shipping: body.shipping,
      discount: body.discount || 0,
      total: body.total,
      status: body.status || 'pending',
      payment_method: body.paymentMethod,
      payment_status: body.paymentStatus || 'pending',
      shipping_address: body.shippingAddress,
      notes: body.notes,
      distributor_id: body.distributorId || null,
      referrer_id: body.referrerId || null
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error('[MARKETPLACE] Erro ao criar pedido em orders:', orderError.message);
      return res.status(500).json({ success: false, error: orderError.message });
    }

    // =====================================================
    // 2) DUAL INSERT — SINCRONIZAR COM RS-CDS (cd_orders)
    // =====================================================
    const distributorId = body.distributorId;
    if (distributorId && distributorId !== 'cd-oficial-matriz' && distributorId !== 'cd-oficial-matriz-fallback') {
      try {
        // Extrair dados do cliente para cd_orders
        const shippingAddr = body.shippingAddress || {};
        const addressStr = [
          shippingAddr.street,
          shippingAddr.number,
          shippingAddr.complement,
          shippingAddr.neighborhood,
          shippingAddr.city,
          shippingAddr.state,
          shippingAddr.zipCode
        ].filter(Boolean).join(', ');

        const cdOrderData = {
          cd_id: distributorId,
          consultant_name: body.customerName || body.referrerName || 'Cliente Direto',
          consultant_pin: body.referrerId || null,
          sponsor_name: null,
          sponsor_id: null,
          buyer_cpf: body.customerCpf || null,
          buyer_email: body.customerEmail || body.email || null,
          buyer_phone: body.customerPhone || null,
          shipping_address: addressStr || null,
          order_date: new Date().toISOString().split('T')[0],
          order_time: new Date().toTimeString().split(' ')[0],
          total: body.total || 0,
          total_points: 0,
          status: 'PENDENTE',
          type: 'MARKETPLACE',
          items_count: Array.isArray(body.items) ? body.items.length : 0,
          tracking_code: null,
          vehicle_plate: null,
          marketplace_order_id: order.id
        };

        const { data: cdOrder, error: cdOrderError } = await supabase
          .from('cd_orders')
          .insert([cdOrderData])
          .select('id')
          .single();

        if (cdOrderError) {
          console.warn('[MARKETPLACE→CDS] Erro ao inserir cd_orders (não-crítico):', cdOrderError.message);
        } else if (cdOrder && Array.isArray(body.items) && body.items.length > 0) {
          // Inserir itens do pedido em cd_order_items
          const cdItems = body.items.map((item: any) => ({
            cd_order_id: cdOrder.id,
            product_id: item.productId || item.id || 'unknown',
            product_name: item.productName || item.name || 'Produto',
            quantity: item.quantity || 1,
            unit_price: item.price || 0,
            points: 0
          }));

          const { error: itemsError } = await supabase
            .from('cd_order_items')
            .insert(cdItems);

          if (itemsError) {
            console.warn('[MARKETPLACE→CDS] Erro ao inserir cd_order_items (não-crítico):', itemsError.message);
          } else {
            console.log(`[MARKETPLACE→CDS] ✅ Pedido sincronizado com CD ${distributorId} (cd_order_id: ${cdOrder.id})`);
          }
        }
      } catch (syncErr: any) {
        // Sincronização com CDS é não-crítica: pedido principal já foi criado com sucesso
        console.warn('[MARKETPLACE→CDS] Falha na sincronização (não-crítico):', syncErr.message);
      }
    }

    res.json({ success: true, data: order });
  } catch (err: any) {
    console.error('[MARKETPLACE] Erro crítico ao criar pedido:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Atualizar status do pedido
router.patch('/v1/marketplace/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'status requerido' });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================
// CUSTOMIZAÇÃO DA LOJA (STOREFRONT)
// =====================================================

router.get('/v1/marketplace/customization', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.query;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

    let { data, error } = await supabase
      .from('store_customizations')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Not found
      return res.json({ success: true, data: null });
    }
    if (error) return res.status(500).json({ success: false, error: error.message });

    // Map DB fields to camelCase if needed, but for now assuming direct mapping or frontend handles snake_case
    // Actually frontend expects camelCase. I should map it.
    // Or better: Use userProfile / storeCustomization matching.
    // Frontend uses: logoUrl, faviconUrl, etc.
    // DB likely has: logo_url, favicon_url.

    const mappedData = {
      id: data.id,
      tenantId: data.tenant_id,
      logoUrl: data.logo_url,
      faviconUrl: data.favicon_url,
      primaryColor: data.primary_color,
      secondaryColor: data.secondary_color,
      hero: data.hero || { title: '', subtitle: '', desktopImage: '', mobileImage: '', link: '' },
      carouselBanners: data.carousel_banners || [],
      midPageBanner: data.mid_page_banner || { desktopImage: '', mobileImage: '', link: '' },
      footer: data.footer || { description: '', socialLinks: [], businessAddress: '', contactEmail: '', cnpj: '' },
      customCss: data.custom_css
    };

    res.json({ success: true, data: mappedData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/v1/marketplace/customization', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

    const dbData = {
      tenant_id: body.tenantId,
      logo_url: body.logoUrl,
      favicon_url: body.faviconUrl,
      primary_color: body.primaryColor,
      secondary_color: body.secondaryColor,
      hero: body.hero,
      carousel_banners: body.carouselBanners,
      mid_page_banner: body.midPageBanner,
      footer: body.footer,
      custom_css: body.customCss,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('store_customizations')
      .upsert(dbData, { onConflict: 'tenant_id' })
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPLOAD DE ASSETS
router.post('/v1/marketplace/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    const { type } = req.body;

    if (!file) return res.status(400).json({ success: false, error: 'Arquivo requerido' });

    const filename = `${type || 'misc'}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;

    // Ensure bucket exists or just try upload
    const bucketName = 'marketplace-assets';

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('Supabase Storage Error:', error);
      // If bucket not found, maybe try to create it? (Requires admin key)
      // But for now, report error.
      return res.status(500).json({ success: false, error: error.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filename);

    res.json({ success: true, url: publicUrlData.publicUrl });
  } catch (err: any) {
    console.error('Upload Endpoint Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
