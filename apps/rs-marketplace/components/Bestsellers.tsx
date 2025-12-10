import React from 'react';
import ProductCard from './ProductCard';
import { Product, Order } from '../types';
import { products as initialProducts } from '../data/products';

interface BestsellersProps {
  onProductClick: (product: Product) => void;
  products: Product[];
  orders: Order[];
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
}

const Bestsellers: React.FC<BestsellersProps> = ({ onProductClick, products, orders, wishlist, onToggleWishlist }) => {
  const sourceProducts = (products && products.length >= 4) ? products : initialProducts;
  const salesCount = new Map<string, number>();
  orders.forEach(order => {
    // Considera apenas pedidos pagos para determinar os mais vendidos
    if (order.paymentStatus === 'Pago') {
      order.items.forEach(item => {
        salesCount.set(item.productId, (salesCount.get(item.productId) || 0) + item.quantity);
      });
    }
  });

  const sortedProductIds = Array.from(salesCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);

  const bestsellers = sortedProductIds
    .map(id => sourceProducts.find(p => p.id === id && p.status === 'Ativo'))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 4);

  if (bestsellers.length === 0) {
    // Fallback para os mais avaliados se não houver dados de vendas
    const fallbackBestsellers = [...sourceProducts]
      .filter(p => p.status === 'Ativo')
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 4);
    if (fallbackBestsellers.length === 0) return null;

    return (
      <section id="bestsellers" className="py-16 sm:py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white">Populares</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
              Conheça os favoritos dos nossos clientes e as tendências do momento.
            </p>
          </div>
          <div className="featured-grid">
            {fallbackBestsellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onProductClick(product)}
                wishlist={wishlist}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="bestsellers" className="py-16 sm:py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white">Mais Vendidos</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
            Conheça os favoritos dos nossos clientes e as tendências do momento.
          </p>
        </div>
        <div className="featured-grid">
          {bestsellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick(product)}
              wishlist={wishlist}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Bestsellers;
