import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product, Review } from '../types';
import { initialProducts } from '../config/initialProducts';

interface ProductContextType {
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'reviews'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addReview: (productId: string, reviewData: Omit<Review, 'id' | 'likes' | 'createdAt'>) => void;
  deleteReview: (productId: string, reviewId: string) => void;
  likeReview: (productId: string, reviewId: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const PRODUCT_STORAGE_KEY = 'rsprolipsi_products';

const getInitialProducts = (): Product[] => {
  try {
    const savedProducts = localStorage.getItem(PRODUCT_STORAGE_KEY);
    return savedProducts ? JSON.parse(savedProducts) : initialProducts;
  } catch (error) {
    console.error("Failed to parse products from localStorage", error);
    return initialProducts;
  }
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(getInitialProducts);
  
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
      console.error("Failed to save products to localStorage", error);
    }
  }, [products]);

  const addProduct = (productData: Omit<Product, 'id' | 'reviews'>): Product => {
    const newProduct: Product = {
      id: `prod_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`,
      ...productData,
      reviews: [], // Reviews are always new
    };
    setProducts(prevProducts => [newProduct, ...prevProducts]);
    return newProduct;
  };
  
  const updateProduct = (updatedProduct: Product) => {
    setProducts(prevProducts => 
      prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  };
  
  const deleteProduct = (productId: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    }
  };

  const addReview = (productId: string, reviewData: Omit<Review, 'id' | 'likes' | 'createdAt'>) => {
    const newReview: Review = {
      id: `review_${new Date().getTime()}`,
      ...reviewData,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, reviews: [newReview, ...p.reviews] } : p
      )
    );
  };

  const deleteReview = (productId: string, reviewId: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            reviews: p.reviews.filter(r => r.id !== reviewId),
          };
        }
        return p;
      })
    );
  };

  const likeReview = (productId: string, reviewId: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            reviews: p.reviews.map(r =>
              r.id === reviewId ? { ...r, likes: r.likes + 1 } : r
            ),
          };
        }
        return p;
      })
    );
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, addReview, deleteReview, likeReview }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};
