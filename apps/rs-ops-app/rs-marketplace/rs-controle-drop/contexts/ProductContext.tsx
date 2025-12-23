import React, { createContext, useContext, useState } from 'react';
import { Product, ProductSupplier, User, AuditAction, AuditEntity, AuditChange, StockMovement } from '../types';

const INITIAL_PRODUCTS: Product[] = [
  { 
    id: '1', name: 'Inflamax Pro 60 Caps', sku: 'INF-001', category: 'Saúde',
    salePrice: 197.00, shippingCost: 18.00, shippingCharged: 0, gatewayFeeRate: 4.99,
    currentStock: 120, minStock: 20, status: 'Active', userId: 'logista1'
  },
  { 
    id: '2', name: 'Pro3+ Joint Relief', sku: 'PRO-002', category: 'Saúde',
    salePrice: 249.00, shippingCost: 22.00, shippingCharged: 0, gatewayFeeRate: 4.99,
    currentStock: 15, minStock: 20, status: 'Active', userId: 'logista1'
  },
  { 
    id: '3', name: 'Ultra Vision 30ml', sku: 'VIS-003', category: 'Beleza',
    salePrice: 149.00, shippingCost: 15.00, shippingCharged: 19.90, gatewayFeeRate: 4.99,
    currentStock: 80, minStock: 10, status: 'Active', userId: 'logista2'
  },
  {
    id: '4', name: 'Camiseta DryFit Pro', sku: 'TSH-DRY-001', category: 'Vestuário',
    salePrice: 89.90, shippingCost: 12.00, shippingCharged: 15.00, gatewayFeeRate: 4.99,
    currentStock: 50, minStock: 10, status: 'Active', userId: 'logista1',
    variants: [
        { id: 'v1', name: 'Preta - P', sku: 'TSH-DRY-BLK-S', price: 89.90, costPrice: 25.00, stock: 20, minStock: 5 },
        { id: 'v2', name: 'Preta - M', sku: 'TSH-DRY-BLK-M', price: 89.90, costPrice: 25.00, stock: 30, minStock: 5 }
    ]
  }
];

const INITIAL_PRODUCT_SUPPLIERS: ProductSupplier[] = [
  { productId: '1', supplierId: 'sup1', costPrice: 45.00, isDefault: true },
  { productId: '1', supplierId: 'sup2', costPrice: 42.50, isDefault: false },
  { productId: '2', supplierId: 'sup1', costPrice: 52.50, isDefault: true },
  { productId: '3', supplierId: 'sup2', costPrice: 38.00, isDefault: true },
  { productId: '4', supplierId: 'sup1', costPrice: 25.00, isDefault: true },
];

interface ProductContextType {
  products: Product[];
  productSuppliers: ProductSupplier[];
  stockMovements: StockMovement[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateProductStock: (productId: string, quantityChange: number, reason: StockMovement['reason'], orderId?: string) => void;
  updateProductSuppliers: (productId: string, suppliers: ProductSupplier[]) => void;
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

  const logStockMovement = (productId: string, quantityChange: number, reason: StockMovement['reason'], orderId?: string) => {
    const newMovement: StockMovement = {
        id: crypto.randomUUID(),
        productId,
        date: new Date().toISOString(),
        quantityChange,
        reason,
        relatedOrderId: orderId
    };
    setStockMovements(prev => [newMovement, ...prev]);
  };

  const updateProductStock = (productId: string, quantityChange: number, reason: StockMovement['reason'], orderId?: string) => {
      setProducts(prev => prev.map(p => {
          if (p.id === productId) {
              const newStock = p.currentStock + quantityChange;
              logStockMovement(productId, quantityChange, reason, orderId);
              return { ...p, currentStock: newStock };
          }
          return p;
      }));
  };

  const addProduct = (p: Product) => {
    // Logic for variants stock aggregation
    const productToAdd = { ...p };
    if (productToAdd.variants && productToAdd.variants.length > 0) {
        productToAdd.currentStock = productToAdd.variants.reduce((acc, v) => acc + v.stock, 0);
    }
    
    setProducts(prev => [...prev, productToAdd]);
    onLogAction('CREATE', 'Product', p.id, `Produto ${p.name} criado.`);
  };

  const updateProduct = (p: Product) => {
    const oldProduct = products.find(prod => prod.id === p.id);
    if (!oldProduct) return;

    // Logic for variants stock aggregation
    const productToUpdate = { ...p };
    if (productToUpdate.variants && productToUpdate.variants.length > 0) {
        productToUpdate.currentStock = productToUpdate.variants.reduce((acc, v) => acc + v.stock, 0);
    }

    const changes: AuditChange[] = [];
    if (oldProduct.salePrice !== productToUpdate.salePrice) changes.push({ field: 'salePrice', old: oldProduct.salePrice, new: productToUpdate.salePrice });
    if (oldProduct.status !== productToUpdate.status) changes.push({ field: 'status', old: oldProduct.status, new: productToUpdate.status });

    // Log manual stock adjustment
    if (oldProduct.currentStock !== productToUpdate.currentStock && !productToUpdate.variants?.length) {
        const diff = productToUpdate.currentStock - oldProduct.currentStock;
        logStockMovement(p.id, diff, 'AJUSTE_MANUAL');
        changes.push({ field: 'currentStock', old: oldProduct.currentStock, new: productToUpdate.currentStock });
    }

    setProducts(prev => prev.map(prod => prod.id === p.id ? productToUpdate : prod));
    
    if (changes.length > 0) {
      onLogAction('UPDATE', 'Product', p.id, `Produto ${p.name} atualizado.`, changes);
    }
  };

  const deleteProduct = (id: string) => {
    const p = products.find(prod => prod.id === id);
    setProducts(prev => prev.filter(prod => prod.id !== id));
    // Also cleanup suppliers
    setProductSuppliers(prev => prev.filter(ps => ps.productId !== id));
    
    if(p) onLogAction('DELETE', 'Product', id, `Produto ${p.name} excluído.`);
  };

  const updateProductSuppliers = (productId: string, newLinks: ProductSupplier[]) => {
      setProductSuppliers(prev => {
          const others = prev.filter(ps => ps.productId !== productId);
          return [...others, ...newLinks];
      });
  };

  return (
    <ProductContext.Provider value={{ products, productSuppliers, stockMovements, addProduct, updateProduct, deleteProduct, updateProductStock, updateProductSuppliers }}>
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