import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabaseClient';

const router = Router();

// =====================================================
// PRODUTOS - CRUD COMPLETO
// =====================================================

// Listar todos os produtos
router.get('/v1/marketplace/products', async (req: Request, res: Response) => {
  try {
    const { tenantId, published } = req.query;
    if (!tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

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
      original_price: body.originalPrice,
      stock: body.stock,
      sku: body.sku,
      images: body.images || [],
      category: body.category,
      collections: body.collections || [],
      published: body.published !== false,
      featured: body.featured || false,
      specifications: body.specifications || {},
      seo_title: body.seoTitle,
      seo_description: body.seoDescription,
      seo_keywords: body.seoKeywords
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
    if (body.originalPrice !== undefined) productData.original_price = body.originalPrice;
    if (body.stock !== undefined) productData.stock = body.stock;
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
      .update({ stock, updated_at: new Date().toISOString() })
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

// Criar pedido
router.post('/v1/marketplace/orders', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.tenantId) return res.status(400).json({ success: false, error: 'tenantId requerido' });

    const orderData = {
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
      notes: body.notes
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (err: any) {
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

export default router;
