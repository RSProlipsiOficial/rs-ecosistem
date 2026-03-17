import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, ProductSupplier, User, AuditAction, AuditEntity, AuditChange, StockMovement } from '../types';
import { createRealProduct, deleteRealProduct, loadRealProductState, updateRealProduct } from '../services/realDataLoader';

const INITIAL_PRODUCTS: Product[] = [];
const INITIAL_PRODUCT_SUPPLIERS: ProductSupplier[] = [];

interface ProductContextType {
  products: Product[];
  productSuppliers: ProductSupplier[];
  stockMovements: StockMovement[];
  refreshProducts: () => Promise<void>;
  addProduct: (product: Product, supplierLinks?: ProductSupplier[]) => Promise<void>;
  updateProduct: (product: Product, supplierLinks?: ProductSupplier[]) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductStock: (productId: string, quantityChange: number, reason: StockMovement['reason'], orderId?: string) => void;
  updateProductSuppliers: (productId: string, suppliers: ProductSupplier[]) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: React.ReactNode;
  currentUser: User;
  onLogAction: (action: AuditAction, entity: AuditEntity, entityId: string, details: string, changes?: AuditChange[]) => void;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children, currentUser, onLogAction }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [productSuppliers, setProductSuppliers] = useState<ProductSupplier[]>(INITIAL_PRODUCT_SUPPLIERS);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);

  const refreshProducts = async () => {
    if (!currentUser?.id) {
      setProducts([]);
      setProductSuppliers([]);
      return;
    }

    const realState = await loadRealProductState(currentUser.id);
    setProducts(realState.products || []);
    setProductSuppliers(realState.productSuppliers || []);
  };

  useEffect(() => {
    let isMounted = true;

    const hydrateProducts = async () => {
      if (!currentUser?.id) {
        if (isMounted) {
          setProducts([]);
          setProductSuppliers([]);
        }
        return;
      }

      try {
        const realState = await loadRealProductState(currentUser.id);
        if (!isMounted) return;
        setProducts(realState.products || []);
        setProductSuppliers(realState.productSuppliers || []);
      } catch (error) {
        console.error('[RS Drop] Erro ao carregar produtos reais:', error);
        if (isMounted) {
          setProducts([]);
          setProductSuppliers([]);
        }
      }
    };

    void hydrateProducts();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  const logStockMovement = (productId: string, quantityChange: number, reason: StockMovement['reason'], orderId?: string) => {
    const newMovement: StockMovement = {
      id: crypto.randomUUID(),
      productId,
      date: new Date().toISOString(),
      quantityChange,
      reason,
      relatedOrderId: orderId,
    };
    setStockMovements((prev) => [newMovement, ...prev]);
  };

  const updateProductStock = (productId: string, quantityChange: number, reason: StockMovement['reason'], orderId?: string) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id !== productId) return product;
        const newStock = product.currentStock + quantityChange;
        logStockMovement(productId, quantityChange, reason, orderId);
        return { ...product, currentStock: newStock };
      })
    );
  };

  const addProduct = async (product: Product, supplierLinks: ProductSupplier[] = []) => {
    const productToAdd = { ...product };
    if (productToAdd.variants && productToAdd.variants.length > 0) {
      productToAdd.currentStock = productToAdd.variants.reduce((acc, variant) => acc + variant.stock, 0);
    }

    const created = await createRealProduct(currentUser.id, productToAdd, supplierLinks);
    setProducts((prev) => [...prev, created.product]);
    setProductSuppliers((prev) => {
      const others = prev.filter((item) => item.productId !== created.product.id);
      return [...others, ...(created.productSuppliers || [])];
    });
    onLogAction('CREATE', 'Product', created.product.id, `Produto ${created.product.name} criado.`);
  };

  const updateProduct = async (product: Product, supplierLinks?: ProductSupplier[]) => {
    const oldProduct = products.find((item) => item.id === product.id);
    if (!oldProduct) return;

    const productToUpdate = { ...product };
    if (productToUpdate.variants && productToUpdate.variants.length > 0) {
      productToUpdate.currentStock = productToUpdate.variants.reduce((acc, variant) => acc + variant.stock, 0);
    }

    const changes: AuditChange[] = [];
    if (oldProduct.salePrice !== productToUpdate.salePrice) {
      changes.push({ field: 'salePrice', old: oldProduct.salePrice, new: productToUpdate.salePrice });
    }
    if (oldProduct.status !== productToUpdate.status) {
      changes.push({ field: 'status', old: oldProduct.status, new: productToUpdate.status });
    }
    if (oldProduct.currentStock !== productToUpdate.currentStock && !productToUpdate.variants?.length) {
      const diff = productToUpdate.currentStock - oldProduct.currentStock;
      logStockMovement(product.id, diff, 'AJUSTE_MANUAL');
      changes.push({ field: 'currentStock', old: oldProduct.currentStock, new: productToUpdate.currentStock });
    }

    const nextSupplierLinks =
      supplierLinks ||
      productSuppliers.filter((item) => item.productId === product.id);

    const saved = await updateRealProduct(currentUser.id, productToUpdate, nextSupplierLinks);
    setProducts((prev) => prev.map((item) => (item.id === product.id ? saved.product : item)));
    setProductSuppliers((prev) => {
      const others = prev.filter((item) => item.productId !== product.id);
      return [...others, ...(saved.productSuppliers || [])];
    });

    if (changes.length > 0) {
      onLogAction('UPDATE', 'Product', product.id, `Produto ${saved.product.name} atualizado.`, changes);
    }
  };

  const deleteProduct = async (id: string) => {
    const product = products.find((item) => item.id === id);
    await deleteRealProduct(currentUser.id, id);
    setProducts((prev) => prev.filter((item) => item.id !== id));
    setProductSuppliers((prev) => prev.filter((item) => item.productId !== id));

    if (product) {
      onLogAction('DELETE', 'Product', id, `Produto ${product.name} excluído.`);
    }
  };

  const updateProductSuppliers = async (productId: string, suppliers: ProductSupplier[]) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    const saved = await updateRealProduct(currentUser.id, product, suppliers);
    setProducts((prev) => prev.map((item) => (item.id === productId ? saved.product : item)));
    setProductSuppliers((prev) => {
      const others = prev.filter((item) => item.productId !== productId);
      return [...others, ...(saved.productSuppliers || [])];
    });
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        productSuppliers,
        stockMovements,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStock,
        updateProductSuppliers,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
