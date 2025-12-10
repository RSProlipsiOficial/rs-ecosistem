/**
 * RS PRÓLIPSI - PRODUCT HANDLERS
 * Handlers integrados com API para gerenciamento de produtos
 */

import marketplaceAPI from '../services/marketplaceAPI';
// Using any temporarily to avoid type conflicts - TODO: update Product type
type ProductType = any;

// =====================================================
// PRODUTOS
// =====================================================

export const createProductHandlers = (
    setProducts: React.Dispatch<React.SetStateAction<any[]>>,
    handleNavigate: (view: string) => void
) => {
    
    // Carregar produtos do backend
    const loadProducts = async () => {
        const res = await marketplaceAPI.products.getAll();
        if (res.success && res.data) {
            // Mapear dados do backend para formato do frontend
            const mappedProducts = res.data.map((p: any) => ({
                id: p.id,
                name: p.name,
                description: p.description,
                price: parseFloat(p.price),
                originalPrice: p.original_price ? parseFloat(p.original_price) : undefined,
                images: Array.isArray(p.images) ? p.images : [],
                rating: 4.5, // TODO: Calcular rating real
                reviews: 0, // TODO: Contar reviews reais
                stock: p.stock,
                sku: p.sku,
                category: p.category,
                collections: Array.isArray(p.collections) ? p.collections : [],
                published: p.published,
                featured: p.featured,
                specifications: p.specifications || {},
                seoTitle: p.seo_title,
                seoDescription: p.seo_description,
                seoKeywords: Array.isArray(p.seo_keywords) ? p.seo_keywords : []
            }));
            setProducts(mappedProducts);
        } else {
            console.error('Erro ao carregar produtos:', res.error);
        }
    };

    // Salvar produto (criar ou atualizar)
    const handleSaveProduct = async (product: any) => {
        try {
            // Mapear dados do frontend para backend
            const productData = {
                name: product.name,
                description: product.description,
                price: product.price,
                originalPrice: product.originalPrice,
                stock: product.stock,
                sku: product.sku,
                images: product.images || [],
                category: product.category,
                collections: product.collections || [],
                published: product.published !== false,
                featured: product.featured || false,
                specifications: product.specifications || {},
                seoTitle: product.seoTitle,
                seoDescription: product.seoDescription,
                seoKeywords: product.seoKeywords || []
            };

            let res;
            if (product.id) {
                // Atualizar produto existente
                res = await marketplaceAPI.products.update(product.id, productData);
            } else {
                // Criar novo produto
                res = await marketplaceAPI.products.create(productData);
            }

            if (res.success) {
                // Recarregar produtos
                await loadProducts();
                handleNavigate('manageProducts');
                return { success: true };
            } else {
                console.error('Erro ao salvar produto:', res.error);
                return { success: false, error: res.error };
            }
        } catch (error: any) {
            console.error('Erro ao salvar produto:', error);
            return { success: false, error: error.message };
        }
    };

    // Deletar produto
    const handleDeleteProduct = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
            return;
        }

        try {
            const res = await marketplaceAPI.products.delete(id);
            if (res.success) {
                // Remover do state local
                setProducts(prev => prev.filter(p => p.id !== id));
                return { success: true };
            } else {
                console.error('Erro ao deletar produto:', res.error);
                alert(`Erro ao deletar produto: ${res.error}`);
                return { success: false, error: res.error };
            }
        } catch (error: any) {
            console.error('Erro ao deletar produto:', error);
            alert(`Erro ao deletar produto: ${error.message}`);
            return { success: false, error: error.message };
        }
    };

    // Atualizar estoque
    const handleUpdateStock = async (id: string, newStock: number) => {
        try {
            const res = await marketplaceAPI.products.updateStock(id, newStock);
            if (res.success) {
                // Atualizar state local
                setProducts(prev => prev.map(p => 
                    p.id === id ? { ...p, stock: newStock } : p
                ));
                return { success: true };
            } else {
                console.error('Erro ao atualizar estoque:', res.error);
                return { success: false, error: res.error };
            }
        } catch (error: any) {
            console.error('Erro ao atualizar estoque:', error);
            return { success: false, error: error.message };
        }
    };

    return {
        loadProducts,
        handleSaveProduct,
        handleDeleteProduct,
        handleUpdateStock
    };
};

// =====================================================
// COLEÇÕES
// =====================================================

export const createCollectionHandlers = (
    setCollections: React.Dispatch<React.SetStateAction<any[]>>,
    handleNavigate: (view: string) => void
) => {
    
    // Carregar coleções
    const loadCollections = async () => {
        const res = await marketplaceAPI.collections.getAll();
        if (res.success && res.data) {
            const mappedCollections = res.data.map((c: any) => ({
                id: c.id,
                name: c.name,
                description: c.description,
                image: c.image,
                productIds: c.product_ids || []
            }));
            setCollections(mappedCollections);
        }
    };

    // Salvar coleção
    const handleSaveCollection = async (collection: any) => {
        try {
            const collectionData = {
                name: collection.name,
                description: collection.description,
                image: collection.image,
                productIds: collection.productIds || []
            };

            let res;
            if (collection.id) {
                res = await marketplaceAPI.collections.update(collection.id, collectionData);
            } else {
                res = await marketplaceAPI.collections.create(collectionData);
            }

            if (res.success) {
                await loadCollections();
                handleNavigate('manageCollections');
                return { success: true };
            } else {
                return { success: false, error: res.error };
            }
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    // Deletar coleção
    const handleDeleteCollection = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta coleção?')) {
            return;
        }

        try {
            const res = await marketplaceAPI.collections.delete(id);
            if (res.success) {
                setCollections(prev => prev.filter(c => c.id !== id));
                return { success: true };
            } else {
                alert(`Erro ao deletar coleção: ${res.error}`);
                return { success: false, error: res.error };
            }
        } catch (error: any) {
            alert(`Erro ao deletar coleção: ${error.message}`);
            return { success: false, error: error.message };
        }
    };

    // Criar coleção
    const handleCreateCollection = async (name: string, description: string) => {
        try {
            const res = await marketplaceAPI.collections.create({
                name,
                description,
                productIds: []
            });

            if (res.success) {
                await loadCollections();
                return { success: true };
            } else {
                return { success: false, error: res.error };
            }
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    return {
        loadCollections,
        handleSaveCollection,
        handleDeleteCollection,
        handleCreateCollection
    };
};

// =====================================================
// PEDIDOS
// =====================================================

export const createOrderHandlers = (
    setOrders: React.Dispatch<React.SetStateAction<any[]>>
) => {
    
    // Carregar pedidos
    const loadOrders = async () => {
        const res = await marketplaceAPI.orders.getAll();
        if (res.success && res.data) {
            // TODO: Mapear dados do backend para formato do frontend
            setOrders(res.data);
        }
    };

    // Criar pedido
    const handleCreateOrder = async (orderData: any) => {
        try {
            const res = await marketplaceAPI.orders.create(orderData);
            if (res.success) {
                await loadOrders();
                return { success: true, data: res.data };
            } else {
                return { success: false, error: res.error };
            }
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    // Atualizar status do pedido
    const handleUpdateOrderStatus = async (id: string, status: string) => {
        try {
            const res = await marketplaceAPI.orders.updateStatus(id, status);
            if (res.success) {
                await loadOrders();
                return { success: true };
            } else {
                return { success: false, error: res.error };
            }
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    return {
        loadOrders,
        handleCreateOrder,
        handleUpdateOrderStatus
    };
};
