import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useRef } from 'react';
import { CartItem, Product, ProductVariant } from '../types';
import { useAbandonedCart } from './AbandonedCartContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  toggleCart: () => void;
  subtotal: number;
  totalShipping: number;
  totalPrice: number;
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  applyCoupon: (code: string) => void;
  discount: number;
  couponCode: string;
  couponError: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'rsprolipsi_cart';

const getInitialCart = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Failed to parse cart from localStorage", error);
    return [];
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(getInitialCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const { addAbandonedCart } = useAbandonedCart();
  // FIX: Changed NodeJS.Timeout to number for browser compatibility.
  const abandonmentTimer = useRef<number | null>(null);


  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  }, [cartItems]);

  const totalShipping = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.shippingCost || 0), 0);
  }, [cartItems]);

  const applyCoupon = (code: string) => {
    setCouponError('');
    setDiscount(0);
    setCouponCode('');

    if (code.toUpperCase() === 'PROMO10') {
      const newDiscount = subtotal * 0.10;
      setDiscount(newDiscount);
      setCouponCode(code.toUpperCase());
    } else if (code.toUpperCase() === 'FRETEGRATIS') {
        if (totalShipping > 0) {
            setDiscount(totalShipping);
            setCouponCode(code.toUpperCase());
        } else {
            setCouponError('Não há custo de frete para aplicar este cupom.');
        }
    } else {
      setCouponError('Cupom inválido ou expirado.');
    }
  };
  
  // Recalculate discount if cart changes
  useEffect(() => {
    if (couponCode) {
        applyCoupon(couponCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, totalShipping]);


  const totalPrice = useMemo(() => {
    const total = subtotal + totalShipping - discount;
    return Math.max(0, total);
  }, [subtotal, totalShipping, discount]);

  const toggleCart = () => {
      const closing = isCartOpen;
      setIsCartOpen(prev => !prev);
      
      if(closing && cartItems.some(item => item.product.eligibleForCartRecovery) && !isCheckoutOpen) {
          if (abandonmentTimer.current) clearTimeout(abandonmentTimer.current);
          abandonmentTimer.current = setTimeout(() => {
              addAbandonedCart({
                  // In a real app, you'd get this from a logged-in user or a form.
                  customerEmail: 'customer.simulation@example.com',
                  items: cartItems,
                  cartValue: totalPrice,
                  lastSeen: new Date().toISOString(),
              });
          }, 30 * 1000); // 30 second delay to simulate abandonment
      } else if (!closing) {
          if (abandonmentTimer.current) clearTimeout(abandonmentTimer.current);
      }
  };
  
  const openCheckout = () => {
    setIsCartOpen(false); // Close cart when opening checkout
    setIsCheckoutOpen(true);
    if (abandonmentTimer.current) clearTimeout(abandonmentTimer.current);
  };
  const closeCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const addToCart = (newItem: CartItem) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.product.id === newItem.product.id && item.variant.id === newItem.variant.id
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      } else {
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (productId: string, variantId: string) => {
    setCartItems(prevItems =>
      prevItems.filter(item => !(item.product.id === productId && item.variant.id === variantId))
    );
  };

  const updateQuantity = (productId: string, variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product.id === productId && item.variant.id === variantId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscount(0);
    setCouponCode('');
    setCouponError('');
    if (abandonmentTimer.current) clearTimeout(abandonmentTimer.current);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, toggleCart, subtotal, totalShipping, totalPrice, isCheckoutOpen, openCheckout, closeCheckout, applyCoupon, discount, couponCode, couponError }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};