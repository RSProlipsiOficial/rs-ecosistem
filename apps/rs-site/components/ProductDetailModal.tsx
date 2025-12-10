import React, { useState, useEffect } from 'react';
import { useProductContext } from '../context/ProductContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { ProductVariant } from '../types';
import { CloseIcon, HeartIcon, ShoppingCartIcon, StarIcon } from './Icons';

interface ProductDetailModalProps {
  productId: string;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ productId, onClose }) => {
  const { products, addReview, likeReview } = useProductContext();
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(products.find(p => p.id === productId));

  const [selectedImage, setSelectedImage] = useState(product?.imageUrls[0] || '');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product?.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [zipCode, setZipCode] = useState('');
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [newReview, setNewReview] = useState({ author: '', rating: 5, text: '' });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const updatedProduct = products.find(p => p.id === productId);
    setProduct(updatedProduct);
    if (!selectedImage && updatedProduct) {
      setSelectedImage(updatedProduct.imageUrls[0]);
    }
    if (!selectedVariant && updatedProduct) {
      setSelectedVariant(updatedProduct.variants[0]);
    }
  }, [products, productId, selectedImage, selectedVariant]);
  
  if (!product) return null;
  
  const { name, description } = product.translations[language] || product.translations.pt;

  const handleVariantChange = (variantId: string) => {
    const variant = product.variants.find(v => v.id === variantId);
    setSelectedVariant(variant);
    setQuantity(1);
    setShippingCost(null); // Reset shipping on variant change
  };
  
  const handleCalculateShipping = () => {
    if (!zipCode) return;
    setIsCalculatingShipping(true);
    setTimeout(() => {
      setShippingCost(Math.random() * 20 + 10);
      setIsCalculatingShipping(false);
    }, 1000);
  };

  const handleAddToCart = () => {
    if (product && selectedVariant) {
        addToCart({
            product,
            variant: selectedVariant,
            quantity,
            shippingCost: product.category === 'Physical' ? shippingCost : 0,
        });
        onClose();
    }
  };

  const isAddToCartDisabled = product.category === 'Physical' && shippingCost === null;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.author && newReview.text) {
      addReview(product.id, { author: newReview.author, rating: newReview.rating, text: newReview.text });
      setNewReview({ author: '', rating: 5, text: '' });
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const price = selectedVariant?.price || 0;
  const originalPrice = selectedVariant?.originalPrice;
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-center justify-center animate-fade-in">
      <div className="bg-background border border-border rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col m-4">
        <header className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-accent truncate">{name}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><CloseIcon/></button>
        </header>

        <main className="flex-grow p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Image Gallery (smaller) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="relative aspect-square bg-surface rounded-lg overflow-hidden border border-border flex items-center justify-center">
              <img src={selectedImage} alt="Main product view" className="max-w-full max-h-full object-contain" />
              {hasDiscount && (
                <div className="absolute top-3 right-3 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full z-10">
                    -{discountPercentage}%
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.imageUrls.map((url, index) => (
                <button key={index} onClick={() => setSelectedImage(url)} className={`aspect-square bg-surface rounded-md overflow-hidden border-2 transition-colors ${selectedImage === url ? 'border-accent' : 'border-border hover:border-gray-600'}`}>
                  <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details & Actions (larger) */}
          <div className="lg:col-span-3 flex flex-col space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">{name}</h1>
              <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-accent">{formatCurrency(price)}</span>
                  {hasDiscount && originalPrice && (
                      <span className="text-xl text-text-secondary line-through">
                          {formatCurrency(originalPrice)}
                      </span>
                  )}
              </div>
              {selectedVariant && <p className="text-sm text-text-secondary mt-1">SKU: {selectedVariant.sku}</p>}
            </div>

            {product.variants.length > 1 && (
                <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Opção:</label>
                <select onChange={(e) => handleVariantChange(e.target.value)} value={selectedVariant?.id} className="w-full bg-surface border border-border rounded-md p-2 text-text-primary focus:ring-accent focus:border-accent">
                    {product.variants.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                </div>
            )}
            
            <div className="flex items-center space-x-4">
              <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))} min="1" className="w-20 bg-surface border border-border rounded-md p-2 text-center" />
              <button onClick={handleAddToCart} disabled={isAddToCartDisabled} title={isAddToCartDisabled ? "Calcule o frete para continuar" : ""} className="flex-grow bg-accent text-button-text font-bold py-3 px-6 rounded-md hover:opacity-80 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
                <ShoppingCartIcon /> 
                <span>Adicionar ao Carrinho</span>
              </button>
            </div>
            
            {product.category === 'Physical' && (
                <div className="border-t border-border pt-6">
                <label className="block text-sm font-medium text-text-secondary mb-2">Calcular Frete</label>
                <div className="flex space-x-2">
                    <input type="text" placeholder="Seu CEP" value={zipCode} onChange={e => setZipCode(e.target.value)} className="flex-grow bg-surface border border-border rounded-md p-2" />
                    <button onClick={handleCalculateShipping} disabled={isCalculatingShipping} className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50">
                        {isCalculatingShipping ? 'Calculando...' : 'Calcular'}
                    </button>
                </div>
                {shippingCost !== null && <p className="text-sm text-green-400 mt-2">Custo estimado do frete: {formatCurrency(shippingCost)}</p>}
                </div>
            )}

            {/* Description & Reviews Tabs */}
            <div className="border-t border-border pt-6 flex-grow flex flex-col min-h-0">
              <div className="flex border-b border-border mb-4 flex-shrink-0">
                <button onClick={() => setActiveTab('description')} className={`py-2 px-4 font-semibold ${activeTab === 'description' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary'}`}>Descrição</button>
                <button onClick={() => setActiveTab('reviews')} className={`py-2 px-4 font-semibold ${activeTab === 'reviews' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary'}`}>Avaliações ({product.reviews.length})</button>
              </div>
              <div className="prose-static flex-grow overflow-y-auto pr-2">
                {activeTab === 'description' && <div dangerouslySetInnerHTML={{ __html: description }} />}
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {product.reviews.length > 0 ? product.reviews.map(review => (
                      <div key={review.id} className="border-b border-border pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold">{review.author}</p>
                                <div className="flex items-center text-yellow-400">
                                    {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current text-yellow-400' : 'fill-current text-gray-600'}`} />)}
                                </div>
                            </div>
                            <button onClick={() => likeReview(product.id, review.id)} className="flex items-center space-x-1 text-text-secondary hover:text-accent"><HeartIcon /> <span>{review.likes}</span></button>
                        </div>
                        <p className="mt-2 text-text-secondary">{review.text}</p>
                      </div>
                    )) : <p className="text-text-secondary">Ainda não há avaliações para este produto.</p>}
                    <form onSubmit={handleReviewSubmit} className="pt-4">
                      <h4 className="font-bold mb-2">Deixe sua avaliação</h4>
                      <input type="text" placeholder="Seu nome" value={newReview.author} onChange={(e) => setNewReview(p => ({...p, author: e.target.value}))} className="w-full bg-surface border border-border rounded-md p-2 mb-2"/>
                      <textarea placeholder="Sua opinião" value={newReview.text} onChange={(e) => setNewReview(p => ({...p, text: e.target.value}))} className="w-full bg-surface border border-border rounded-md p-2 mb-2" rows={3}/>
                      <button type="submit" className="bg-accent text-button-text font-bold py-2 px-4 rounded-md">Enviar</button>
                    </form>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductDetailModal;