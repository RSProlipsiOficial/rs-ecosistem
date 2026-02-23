import React, { useState } from 'react';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { mockShopProducts } from '../data';
import { 
  IconExternalLink, 
  IconShop, 
  IconBot,
  IconFileClock,
  IconUsers,
  IconAward,
  IconRepeat,
  IconYoutube
} from '../../components/icons';
import { useUser } from '../ConsultantLayout';

type Product = typeof mockShopProducts[0];

const metricIcons: { [key: string]: React.ElementType } = {
  IconFileClock,
  IconUsers,
  IconAward,
  IconRepeat
};

const Marketplace: React.FC = () => {
  const { setCredits } = useUser();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleBuyCredits = () => {
    setCredits(100);
  };

  const renderProductCard = (product: Product) => {
    const isClickableCourse = product.id === 'prod-04' && 'details' in product;
    
    const CardContent = (
      <>
        <img src={product.imageUrl} alt={product.name} className="h-40 w-full object-cover" />
        <div className="p-4 flex flex-col justify-between flex-grow">
          <div>
            <span className={`inline-block px-2 py-1 text-xs rounded-full mb-2 ${
              product.category === 'RS Dropshipping' 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-green-500/20 text-green-400'
            }`}>
              {product.category}
            </span>
            <h3 className="font-bold text-white">{product.name}</h3>
          </div>
          <div className="mt-2">
            {product.category === 'RS Dropshipping' ? (
              <p className="text-lg font-semibold text-brand-gold">R$ {product.price.toFixed(2)}</p>
            ) : (
              <p className="text-lg font-semibold text-green-400">{product.commission}% de comissão</p>
            )}
          </div>
        </div>
      </>
    );

    if (isClickableCourse) {
      return (
        <button onClick={() => setSelectedProduct(product)} className="text-left w-full h-full block">
            <Card className="bg-brand-gray-light rounded-lg overflow-hidden flex flex-col h-full transition-shadow duration-300 hover:shadow-gold-glow">
                {CardContent}
            </Card>
        </button>
      )
    }

    return (
       <Card className="bg-brand-gray-light rounded-lg overflow-hidden flex flex-col h-full">
         {CardContent}
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <Card className="text-center bg-gradient-to-br from-brand-gray to-brand-gray-dark border-2 border-brand-gold shadow-gold-glow">
        <IconShop className="mx-auto h-12 w-12 text-brand-gold mb-4" />
        <h2 className="text-2xl font-bold text-white">Explore o Marketplace da RS Prólipsi</h2>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
          Um ecossistema de vendas completo onde você pode vender produtos da RS via dropshipping ou ganhar comissões como afiliado de nossos lojistas parceiros.
        </p>
        <a 
          href="#" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center justify-center space-x-2 bg-brand-gold text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-brand-gold/20"
        >
          <IconExternalLink size={20} />
          <span>Acessar Loja Externa</span>
        </a>
      </Card>

      <Card>
          <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6 bg-brand-gray-light p-6 rounded-lg">
              <IconBot size={48} className="mx-auto md:mx-0 text-brand-gold opacity-80 flex-shrink-0"/>
              <div>
                  <h2 className="text-2xl font-bold text-white">Créditos para IA - RSIA</h2>
                  <p className="text-gray-400 mt-2">
                     Potencialize sua produtividade. Adquira créditos para continuar recebendo assistência e estratégias personalizadas da sua coach virtual, RSIA.
                  </p>
              </div>
              <button 
                onClick={handleBuyCredits}
                className="mt-4 md:mt-0 flex-shrink-0 bg-brand-gold text-brand-dark font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg shadow-brand-gold/20"
              >
                Comprar 100 Créditos
              </button>
          </div>
      </Card>
      
      <Card>
        <h2 className="text-xl font-bold text-white mb-6">Produtos em Destaque</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockShopProducts.map(product => (
            <div key={product.id}>
              {renderProductCard(product)}
            </div>
          ))}
        </div>
      </Card>

      <Modal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} title={selectedProduct?.name || ''}>
        {selectedProduct && 'details' in selectedProduct && selectedProduct.details && (
          <div className="space-y-6">
            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-brand-gray-light">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${selectedProduct.details.mainVideoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {selectedProduct.details.keyMetrics.map(metric => {
                  const Icon = metricIcons[metric.icon];
                  return (
                      <div key={metric.label} className="bg-brand-gray-light p-3 rounded-lg">
                          <Icon className="mx-auto h-8 w-8 text-brand-gold mb-2" />
                          <p className="font-bold text-white text-lg">{metric.value}</p>
                          <p className="text-xs text-gray-400">{metric.label}</p>
                      </div>
                  );
              })}
            </div>

            <div>
              <h3 className="text-lg font-bold text-brand-gold">Sobre o Curso</h3>
              <p className="text-gray-300 text-sm mt-2">{selectedProduct.details.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-brand-gold">Galeria de Aulas</h3>
              <div className="grid grid-cols-3 gap-3 mt-2">
                  {selectedProduct.details.videoGallery.map(video => (
                      <div key={video.id} className="relative group cursor-pointer">
                          <img src={video.thumbnailUrl} alt={video.title} className="w-full rounded-md aspect-video object-cover"/>
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                              <IconYoutube className="h-8 w-8 text-white"/>
                          </div>
                          <p className="text-xs text-center text-gray-300 mt-1 truncate">{video.title}</p>
                      </div>
                  ))}
              </div>
            </div>

            <a 
              href="#"
              className="w-full mt-4 block text-center font-bold py-3 px-4 rounded-lg transition-colors bg-brand-gold text-brand-dark hover:bg-yellow-400 shadow-lg shadow-brand-gold/20"
            >
              Gerar Link de Afiliado ({selectedProduct.commission}% de comissão)
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Marketplace;