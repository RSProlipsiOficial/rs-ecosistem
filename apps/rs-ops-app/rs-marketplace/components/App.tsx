

import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedProducts from './components/FeaturedProducts';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import ProductDetail from './components/ProductDetail';
import ConsultantLogin from './components/ConsultantLogin';
import ConsultantStore from './components/ConsultantStore';
import ManageProducts from './components/ManageProducts';
import AddEditProduct from './components/AddEditProduct';
import ManageInventory from './components/ManageInventory';
import ManageOrders from './components/ManageOrders';
import OrderDetail from './components/OrderDetail';
import CustomerChatWidget from './components/CustomerChatWidget';
import ManageReturns from './components/ManageReturns';
import ReturnDetail from './components/ReturnDetail';
import ManageDropshippingOrders from './components/ManageDropshippingOrders';
import StoreBannerEditor from './components/AnalyticsDashboard'; 
import ManagePromotions from './components/ManagePromotions';
import AddEditCoupon from './components/AddEditCoupon';
import VirtualOfficeMarketplace from './components/VirtualOfficeMarketplace';
import VirtualOfficeDropshipping from './components/VirtualOfficeDropshipping';
import ManageAffiliateLinks from './components/ManageAffiliateLinks';
import ManageMarketingPixels from './components/ManageMarketingPixels';
import LinkShortener from './components/LinkShortener';
import AddEditMarketingPixel from './components/AddEditMarketingPixel';
import { AdminLayout } from './components/AdminLayout';
import Carousel from './components/Carousel';
import Offers from './components/Offers';
import MidPageBanner from './components/MidPageBanner';
import ManagePayments from './components/ManagePayments';
import ManageShipping from './components/ManageShipping';
import CartView from './components/CartView';
import FloatingCartStatus from './components/FloatingCartStatus';
import CheckoutView from './components/CheckoutView';
import SellerRegistration from './components/SellerRegistration';
import CompensationPlan from './components/CompensationPlan';
import BannerDashboard from './components/SalesReport';
import DashboardEditor from './components/VirtualOfficeMyData';
import ManageCollections from './components/ManageCollections';
import AddEditCollection from './components/AddEditCollection';
import CollectionView from './components/CollectionView';
import CustomerLogin from './components/CustomerLogin';
import CustomerRegister from './components/CustomerRegister';
import CustomerAccount from './components/CustomerAccount';
import CustomerForgotPassword from './components/CustomerForgotPassword';
import Bestsellers from './components/Bestsellers';
import DropshippingCatalog from './components/DropshippingCatalog';
import ManageAffiliates from './components/ManageAffiliates';
import WalletSalesReport from './components/WalletSalesReport';
import WalletOverview from './components/WalletOverview';
import WalletTransfers from './components/WalletTransfers';
import WalletCharges from './components/WalletCharges';
import WalletSettingsComponent from './components/WalletSettings';
import UserProfileEditor from './components/UserProfileEditor';
import RSStudio from './components/RSStudio';
import Communication from './components/Communication';
import CommunicationCenter from './components/CommunicationCenter';
import OrderConfirmation from './components/OrderConfirmation';
import ManageOrderBump from './components/ManageOrderBump';
import ManageUpsell from './components/ManageUpsell';
import ManageAbandonedCarts from './components/ManageAbandonedCarts';
import ManageReviews from './components/ManageReviews';
import ManageAnnouncements from './components/ManageAnnouncements';
import AddEditAnnouncement from './components/AddEditAnnouncement';
import ManageTrainings from './components/ManageTrainings';
import AddEditTraining from './components/AddEditTraining';
import TrainingModuleDetail from './components/TrainingModuleDetail';
import ManageMarketingAssets from './components/ManageMarketingAssets';
import AddEditMarketingAsset from './components/AddEditMarketingAsset';
import CustomerWishlist from './components/CustomerWishlist';
import ProductQA from './components/ProductQA';
import RecentlyViewed from './components/RecentlyViewed';
import OrderLookupView from './components/OrderLookupView';
import OrderStatusView from './components/OrderStatusView';
import { productsAPI, collectionsAPI, ordersAPI } from '../services/marketplaceAPI';


import { Product, View, Order, ReturnRequest, DropshippingOrder, DropshippingProduct, Coupon, MarketingPixel, PartnerStore, ShortenedLink, StoreCustomization, PaymentSettings, ShippingSettings, CartItem, CompensationSettings, Banner, DashboardSettings, UserProfile, Collection, Customer, NetworkActivityItem, Charge, WalletSettings, ProductVariant, OrderItem, AbandonedCart, Review, Announcement, Training, MarketingAsset, Question, Answer, Distributor } from './types';

import { products as initialProducts } from './data/products';
import { orders as initialOrders } from './data/orders';
import { returns as initialReturns } from './data/returns';
import { dropshippingProducts as initialDropshippingProducts, dropshippingOrders as initialDropshippingOrders } from './data/dropshipping';
import { coupons as initialCoupons } from './data/promotions';
import { marketingPixels as initialMarketingPixels } from './data/marketingPixels';
import { partnerStores as initialPartnerStores } from './data/partnerStores';
import { shortenedLinks as initialShortenedLinks } from './data/shortenedLinks';
import { initialStoreCustomization } from './data/storeCustomization';
import { initialPaymentSettings } from './data/paymentSettings';
import { initialShippingSettings } from './data/shippingSettings';
import { initialCompensationSettings } from './data/compensationSettings';
import { collections as initialCollections } from './data/collections';
import { customers as initialCustomers } from './data/customers';
import { networkActivity as initialNetworkActivity } from './data/networkActivity';
import { weeklyBonuses as initialWeeklyBonuses } from './data/weeklyBonuses';
import { initialReviews } from './data/reviews';
import { initialQuestions } from './data/questions';
import { announcements as initialAnnouncements, trainings as initialTrainings, marketingAssets as initialMarketingAssets } from './data/communications';
import { initialAbandonedCarts } from './data/abandonedCarts';
import { initialCharges } from './data/charges';
import { affiliates as initialAffiliates } from './data/affiliates';
import { initialWalletSettings } from './data/walletSettings';
// Fix: Correct import path for distributors data.
import { distributors as initialDistributors } from './data/distributors';


const initialDashboardBanners: Banner[] = [
    {
      id: 'dash-banner-1',
      desktopImage: 'https://picsum.photos/seed/launch/1200/400',
      mobileImage: 'https://picsum.photos/seed/launch-m/400/300',
      link: '#',
    },
    {
      id: 'dash-banner-2',
      desktopImage: 'https://picsum.photos/seed/logistics/1200/400',
      mobileImage: 'https://picsum.photos/seed/logistics-m/400/300',
      link: '#',
    },
  ];

const initialDashboardSettings: DashboardSettings = {
  components: [
    // Fix: Corrected component types and added 'column' property
    { id: 'comp-1', column: 'left', type: 'userInfo', enabled: true, visibleFields: { id: true, graduation: true, accountStatus: true, monthlyActivity: true, category: true, referralLink: true, affiliateLink: true } },
    { id: 'comp-2', column: 'right', type: 'adminBanner', enabled: true },
    { id: 'comp-3', column: 'right', type: 'bonusCards', enabled: true },
    { id: 'comp-4', column: 'left', type: 'qualificationProgress', enabled: true, title: 'Qualificação Atual', value: 4500, max: 15000, startLabel: 'Iniciante', endLabel: 'Prata', startIcon: 'StarOutlineIcon', endIcon: 'TrophyIcon' },
    { id: 'comp-5', column: 'left', type: 'qualificationProgress', enabled: true, title: 'Qualificação do Mês', value: 800, max: 2500, startLabel: 'Base', endLabel: 'Bronze', startIcon: 'UserIcon', endIcon: 'GlobalIcon' },
    { id: 'comp-6', column: 'right', type: 'incentivesProgram', enabled: true, title: 'Programa de Incentivos e Premiações', content: [{title: 'Viagem Nacional', progress: 60}, {title: 'Carro 0km', progress: 30}] },
    { id: 'comp-7', column: 'left', type: 'referralLinks', enabled: true },
    { id: 'comp-8', column: 'right', type: 'networkActivity', enabled: true, title: 'Atividade da Rede' },
    { id: 'comp-9', column: 'right', type: 'performanceChart', enabled: true, title: 'Bônus Semanal' },
    { id: 'comp-10', column: 'left', type: 'shortcut', enabled: true, title: 'Gerenciar Produtos', url: 'manageProducts', icon: 'ProductsIcon' },
    { id: 'comp-11', column: 'left', type: 'shortcut', enabled: true, title: 'Visão Geral WalletPay', url: 'walletOverview', icon: 'WalletIcon' },
  ],
  cards: [
    { id: 'card-1', title: 'Bônus Ciclo Global', icon: 'GlobalIcon', dataKey: 'cycleBonus' },
    { id: 'card-2', title: 'Bônus Top Sigme', icon: 'TrophyIcon', dataKey: 'topSigmeBonus' },
    { id: 'card-3', title: 'Bônus Plano de Carreira', icon: 'StarOutlineIcon', dataKey: 'careerPlanBonus' },
  ]
};

const App: React.FC = () => {
    const [view, setView] = useState<View>('home');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [selectedMarketingPixel, setSelectedMarketingPixel] = useState<MarketingPixel | null>(null);
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
    const [viewBeforeCheckout, setViewBeforeCheckout] = useState<View>('home');

    // Data states
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [returns, setReturns] = useState<ReturnRequest[]>(initialReturns);
    const [dropshippingOrders, setDropshippingOrders] = useState<DropshippingOrder[]>(initialDropshippingOrders);
    const [dropshippingProducts] = useState<DropshippingProduct[]>(initialDropshippingProducts);
    const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
    const [marketingPixels, setMarketingPixels] = useState<MarketingPixel[]>(initialMarketingPixels);
    const [partnerStores, setPartnerStores] = useState<PartnerStore[]>(initialPartnerStores);
    const [shortenedLinks, setShortenedLinks] = useState<ShortenedLink[]>(initialShortenedLinks);
    const [storeCustomization, setStoreCustomization] = useState<StoreCustomization>(initialStoreCustomization);
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(initialPaymentSettings);
    const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(initialShippingSettings);
    const [compensationSettings, setCompensationSettings] = useState<CompensationSettings>(initialCompensationSettings);
    const [dashboardBanners, setDashboardBanners] = useState<Banner[]>(initialDashboardBanners);
    const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>(initialDashboardSettings);
    const [collections, setCollections] = useState<Collection[]>(initialCollections);
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [questions, setQuestions] = useState<Question[]>(initialQuestions);
    const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
    const [trainings, setTrainings] = useState<Training[]>(initialTrainings);
    const [marketingAssets, setMarketingAssets] = useState<MarketingAsset[]>(initialMarketingAssets);
    const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>(initialAbandonedCarts);
    const [charges, setCharges] = useState<Charge[]>(initialCharges);
    const [distributors, setDistributors] = useState<Distributor[]>(initialDistributors);

    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: 'Ana Carolina',
        id: 'C0000111000000',
        graduation: 'DIAMANTE PRESIDENCIAL',
        accountStatus: 'Ativo',
        monthlyActivity: 'Ativo',
        category: 'DIAMANTE',
        referralLink: 'https://rsprolipsi.com/register/anacaro',
        affiliateLink: 'https://rs-shop.com/loja/anacarolina',
        avatarUrl: 'https://i.pravatar.cc/80?u=anacarolina'
    });
    // Fix: Renamed 'earnings' state to 'bonuses' to match prop expected by ConsultantStore
    const [bonuses, setBonuses] = useState({
        cycleBonus: 500.00,
        topSigmeBonus: 250.00,
        careerPlanBonus: 1000.00,
        affiliateBonus: 1572.50,
        dropshipBonus: 834.75,
        logisticsBonus: 212.30,
    });
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [lastConfirmedOrder, setLastConfirmedOrder] = useState<Order | null>(null);
    const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);


    // Cart State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showFloatingCartStatus, setShowFloatingCartStatus] = useState(false);


    // Scroll to top on view change
  useEffect(() => {
      window.scrollTo(0, 0);
  }, [view]);

  useEffect(() => {
    (async () => {
      const prodRes: any = await productsAPI.getAll(true);
      if (prodRes && prodRes.success !== false && Array.isArray(prodRes.data)) {
        const mapped: Product[] = prodRes.data.map((it: any) => ({
          id: String(it.id ?? ''),
          name: String(it.name ?? it.title ?? 'Produto'),
          seller: String(it.seller ?? ''),
          price: Number(it.price ?? it.sale_price ?? 0),
          costPerItem: Number(it.cost ?? it.cost_per_item ?? 0),
          currency: String(it.currency ?? 'BRL'),
          shortDescription: String(it.short_description ?? it.description ?? ''),
          description: String(it.description ?? ''),
          images: Array.isArray(it.images) ? it.images : [String(it.image_url ?? '')].filter(Boolean),
          rating: Number(it.rating ?? 0),
          reviewCount: Number(it.review_count ?? 0),
          collectionId: it.collection_id ?? null,
          status: String(it.status ?? 'Publicado'),
          inventory: Number(it.inventory ?? 0),
          type: String(it.type ?? 'Produto'),
          requiresShipping: Boolean(it.requires_shipping ?? true),
          trackQuantity: Boolean(it.track_quantity ?? true),
          chargeTax: Boolean(it.charge_tax ?? true),
          continueSelling: Boolean(it.continue_selling ?? false),
          seoTitle: String(it.seo_title ?? it.name ?? ''),
          seoDescription: String(it.seo_description ?? it.short_description ?? ''),
          urlHandle: String(it.url_handle ?? ''),
          options: Array.isArray(it.options) ? it.options : [],
          variants: Array.isArray(it.variants) ? it.variants : [],
        }));
        setProducts(mapped.length > 0 ? mapped : initialProducts);
      } else {
        setProducts(initialProducts);
      }
      const colRes: any = await collectionsAPI.getAll();
      if (colRes && colRes.success !== false && Array.isArray(colRes.data)) {
        const cols: Collection[] = colRes.data.map((c: any) => ({
          id: String(c.id ?? ''),
          title: String(c.title ?? c.name ?? 'Coleção'),
          description: String(c.description ?? ''),
          imageUrl: String(c.image_url ?? c.banner_url ?? ''),
        }));
        setCollections(cols.length > 0 ? cols : initialCollections);
      } else {
        setCollections(initialCollections);
      }
    })();
  }, []);

    useEffect(() => {
        const favicon = document.getElementById('favicon') as HTMLLinkElement;
        if (favicon && storeCustomization.faviconUrl) {
            favicon.href = storeCustomization.faviconUrl;
        }
    }, [storeCustomization.faviconUrl]);

    // Cart Handlers
    const handleAddToCart = (product: Product, quantity: number, selectedVariant: ProductVariant) => {
        setCart(prevCart => {
            // Check if an item with the same product ID and variant ID already exists
            const existingItem = prevCart.find(item => item.productId === product.id && item.variantId === selectedVariant.id);
    
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === existingItem.id // Match by cart item's unique ID
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            
            // Generate a unique ID for the new cart item
            const newCartItemId = `${product.id}-${selectedVariant.id}-${Date.now()}`;
            const variantText = Object.values(selectedVariant.options).join(' / ');

            return [...prevCart, { 
                id: newCartItemId, 
                productId: product.id,
                variantId: selectedVariant.id,
                name: product.name, 
                price: selectedVariant.price, 
                image: product.images[0], // Assuming first image is always product image
                quantity, 
                variantText 
            }];
        });

        setShowFloatingCartStatus(true);
        setTimeout(() => setShowFloatingCartStatus(false), 5000);
    };

    const handleUpdateCartQuantity = (cartItemId: string, newQuantity: number) => {
        setCart(prevCart => {
            if (newQuantity <= 0) {
                return prevCart.filter(item => item.id !== cartItemId);
            }
            return prevCart.map(item =>
                item.id === cartItemId ? { ...item, quantity: newQuantity } : item
            );
        });
    };

    const handleRemoveFromCart = (cartItemId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== cartItemId));
    };
    
    const handleFinalizePurchase = async (order: Order) => {
        try {
            const apiRes: any = await ordersAPI.create(order);
            if (!apiRes || apiRes.success === false) {
                console.warn('Falha ao registrar pedido na API, mantendo local:', apiRes?.error);
                setOrders(prev => [...prev, order]);
                setLastConfirmedOrder(order);
            } else {
                const saved = apiRes.data ?? order;
                setOrders(prev => [...prev, saved]);
                setLastConfirmedOrder(saved);
            }
        } catch (e) {
            console.error('Erro ao criar pedido:', e);
            setOrders(prev => [...prev, order]);
            setLastConfirmedOrder(order);
        }
        setCart([]);
        setIsCartOpen(false);
        setView('orderConfirmation');
    }

    const handleAcceptUpsell = (originalOrder: Order, upsellProduct: Product, offerPrice: number) => {
        const upsellItem: OrderItem = {
            productId: upsellProduct.id,
            variantId: upsellProduct.variants?.[0]?.id || 'default',
            productName: `${upsellProduct.name} (Upsell)`,
            quantity: 1,
            price: offerPrice,
        };

        const updatedOrder: Order = {
            ...originalOrder,
            items: [...originalOrder.items, upsellItem],
            total: originalOrder.total + offerPrice,
            subtotal: originalOrder.subtotal + offerPrice,
        };
        setOrders(prev => prev.map(o => o.id === originalOrder.id ? updatedOrder : o));
        setLastConfirmedOrder(updatedOrder); // Update the last confirmed order for display
    };


    const handleNavigate = (newView: View, data?: any) => {
        if (newView === 'checkout') {
            setViewBeforeCheckout(view);
            setIsCartOpen(false);
        }
        if (newView === 'productDetail' && data) {
            const productId = (data as Product).id;
            setRecentlyViewedIds(prev => 
                [productId, ...prev.filter(id => id !== productId)].slice(0, 4)
            );
        }

        setView(newView);

        setSelectedProduct(null);
        setSelectedOrder(null);
        setSelectedReturn(null);
        setSelectedCoupon(null);
        setSelectedMarketingPixel(null);
        setSelectedCollection(null);

        if (data) {
            if (newView === 'productDetail') setSelectedProduct(data as Product);
            else if (newView === 'orderDetail' || newView === 'orderStatus') setSelectedOrder(data as Order);
            else if (newView === 'returnDetail') setSelectedReturn(data as ReturnRequest);
            else if (newView === 'addEditCoupon') setSelectedCoupon(data as Coupon);
            else if (newView === 'addEditMarketingPixel') setSelectedMarketingPixel(data as MarketingPixel);
            else if (newView === 'addEditProduct') setSelectedProduct(data as Product);
            else if (newView === 'collectionView') setSelectedCollection(data as Collection);
            else if (newView === 'addEditCollection') setSelectedCollection(data as Collection);
            else if (newView === 'trainingModuleDetail') setSelectedTrainingModule(data as Training);
            else if (newView === 'addEditAnnouncement') setSelectedAnnouncement(data as Announcement);
            else if (newView === 'addEditMarketingAsset') setSelectedMarketingAsset(data as MarketingAsset);
            else if (newView === 'addEditTraining') setSelectedTrainingModule(data as Training);
        }
    };
    
    const handleStoreCustomizationChange = (updatedData: Partial<StoreCustomization>) => {
        setStoreCustomization(prev => ({ ...prev, ...updatedData }));
        alert('Aparência da loja atualizada com sucesso!');
    };

    const handleDashboardBannersUpdate = (newBanners: Banner[]) => {
        setDashboardBanners(newBanners);
        alert('Banners do painel atualizados com sucesso!');
    };
    
    const handleDashboardSettingsUpdate = (newSettings: DashboardSettings) => {
        setDashboardSettings(newSettings);
        alert('Painel atualizado com sucesso!');
    };

    const handlePaymentSettingsSave = (newSettings: PaymentSettings) => {
        setPaymentSettings(newSettings);
        alert('Configurações de pagamento salvas com sucesso!');
    };
    
    const handleShippingSettingsSave = (newSettings: ShippingSettings) => {
        setShippingSettings(newSettings);
        alert('Configurações de frete salvas com sucesso!');
    };

    const handleCompensationSettingsSave = (newSettings: CompensationSettings) => {
        setCompensationSettings(newSettings);
        alert('Plano de compensação salvo com sucesso!');
    };
    
    // @ts-ignore
    const handleProfileUpdate = (updatedProfile: UserProfile) => {
        setUserProfile(updatedProfile);
        alert('Perfil atualizado com sucesso!');
    };

    const slugify = (text: string) =>
        text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/-+$/, '');

    const handleProductSave = async (productToSave: Product) => {
        try {
            let apiRes: any;
            if (!productToSave.id || productToSave.id === '') {
                apiRes = await productsAPI.create(productToSave);
            } else {
                apiRes = await productsAPI.update(productToSave.id, productToSave);
            }
            if (!apiRes || apiRes.success === false) {
                console.warn('Falha ao salvar produto na API, mantendo local:', apiRes?.error);
                setProducts(prevProducts => {
                    const exists = prevProducts.find(p => p.id === productToSave.id);
                    if (exists) {
                        return prevProducts.map(p => p.id === productToSave.id ? productToSave : p);
                    }
                    return [...prevProducts, { ...productToSave, id: productToSave.id || String(Date.now()) }];
                });
            } else {
                const saved = apiRes.data ?? productToSave;
                // Recarregar lista da API
                const listRes: any = await productsAPI.getAll(true);
                if (listRes && listRes.success !== false && Array.isArray(listRes.data)) {
                    const mapped: Product[] = listRes.data.map((it: any) => ({
                        id: String(it.id ?? ''),
                        name: String(it.name ?? it.title ?? 'Produto'),
                        seller: String(it.seller ?? ''),
                        price: Number(it.price ?? it.sale_price ?? 0),
                        costPerItem: Number(it.cost ?? it.cost_per_item ?? 0),
                        currency: String(it.currency ?? 'BRL'),
                        shortDescription: String(it.short_description ?? it.description ?? ''),
                        description: String(it.description ?? ''),
                        images: Array.isArray(it.images) ? it.images : [String(it.image_url ?? '')].filter(Boolean),
                        rating: Number(it.rating ?? 0),
                        reviewCount: Number(it.review_count ?? 0),
                        collectionId: it.collection_id ?? null,
                        status: String(it.status ?? 'Publicado'),
                        inventory: Number(it.inventory ?? 0),
                        type: String(it.type ?? 'Produto'),
                        requiresShipping: Boolean(it.requires_shipping ?? true),
                        trackQuantity: Boolean(it.track_quantity ?? true),
                        chargeTax: Boolean(it.charge_tax ?? true),
                        continueSelling: Boolean(it.continue_selling ?? false),
                        seoTitle: String(it.seo_title ?? it.name ?? ''),
                        seoDescription: String(it.seo_description ?? it.short_description ?? ''),
                        urlHandle: String(it.url_handle ?? ''),
                        options: Array.isArray(it.options) ? it.options : [],
                        variants: Array.isArray(it.variants) ? it.variants : [],
                    }));
                    setProducts(mapped.length > 0 ? mapped : initialProducts);
                } else {
                    setProducts(prev => {
                        const exists = prev.find(p => p.id === saved.id);
                        return exists ? prev.map(p => p.id === saved.id ? saved : p) : [...prev, saved];
                    });
                }
            }
        } catch (e) {
            console.error('Erro ao salvar produto:', e);
            setProducts(prevProducts => {
                const exists = prevProducts.find(p => p.id === productToSave.id);
                if (exists) {
                    return prevProducts.map(p => p.id === productToSave.id ? productToSave : p);
                }
                return [...prevProducts, { ...productToSave, id: productToSave.id || String(Date.now()) }];
            });
        }
        handleNavigate('manageProducts');
    };

    const handleProductDelete = async (productIds: string[]) => {
        if (!window.confirm(`Tem certeza de que deseja excluir ${productIds.length} produto(s)?`)) return;
        try {
            await Promise.all(productIds.map(id => productsAPI.delete(id)));
        } catch (e) {
            console.warn('Falha ao excluir na API, removendo local:', e);
        }
        setProducts(prev => prev.filter(p => !productIds.includes(p.id)));
    };
    
    const handleInventorySave = (updatedProducts: Product[]) => {
        setProducts(updatedProducts);
        alert('Estoque atualizado com sucesso!');
    };
    
    const handleOrderUpdate = (orderId: string, updates: Partial<Order>) => {
        setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, ...updates } : o));
    };

    const handleDropshippingOrderUpdate = (orderId: string, updates: Partial<DropshippingOrder>) => {
        setDropshippingOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, ...updates } : o));
    };
    
    const handleReturnStatusUpdate = (returnIds: string[], status: ReturnRequest['status']) => {
        setReturns(prev => prev.map(r => returnIds.includes(r.id) ? { ...r, status } : r));
    };

    const handleReturnDelete = (returnIds: string[]) => {
        if (window.confirm(`Tem certeza de que deseja excluir ${returnIds.length} devolução(ões)?`)) {
            setReturns(prev => prev.filter(r => !returnIds.includes(r.id)));
        }
    };
    
    const handleCouponSave = (couponToSave: Coupon) => {
        setCoupons(prevCoupons => {
            const exists = prevCoupons.find(c => c.id === couponToSave.id);
            if (exists) {
                return prevCoupons.map(c => c.id === couponToSave.id ? couponToSave : c);
            }
            return [...prevCoupons, { ...couponToSave, id: `CUP-${Date.now()}` }];
        });
        handleNavigate('managePromotions');
    };

    const handleCouponDelete = (couponId: string) => {
        if (window.confirm(`Tem certeza de que deseja excluir este cupom?`)) {
            setCoupons(prev => prev.filter(c => c.id !== couponId));
        }
    };
    
    const handleCouponStatusToggle = (couponId: string, newStatus: 'Ativo' | 'Inativo') => {
        setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, status: newStatus } : c));
    };

    const handleMarketingPixelSave = (pixelToSave: MarketingPixel) => {
        setMarketingPixels(prev => {
            const exists = prev.find(p => p.id === pixelToSave.id);
            if (exists) {
                return prev.map(p => p.id === pixelToSave.id ? pixelToSave : p);
            }
            return [...prev, { ...pixelToSave, id: `PIX-${Date.now()}` }];
        });
        handleNavigate('virtualOfficePixels');
    };

    const handleMarketingPixelDelete = (pixelId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este pixel?')) {
            setMarketingPixels(prev => prev.filter(p => p.id !== pixelId));
        }
    };

    const handleMarketingPixelStatusToggle = (pixelId: string) => {
        setMarketingPixels(prev => prev.map(p => p.id === pixelId ? { ...p, status: p.status === 'Ativo' ? 'Inativo' : 'Ativo' } : p));
    };
    
    const handleMarketingPixelDuplicate = (pixelId: string) => {
        const pixelToDuplicate = marketingPixels.find(p => p.id === pixelId);
        if (pixelToDuplicate) {
            const newPixel = {
                ...pixelToDuplicate,
                id: `PIX-${Date.now()}`,
                name: `${pixelToDuplicate.name} (Cópia)`
            };
            setMarketingPixels(prev => [...prev, newPixel]);
        }
    };
    
    const handlePartnerStoreCommissionChange = (storeId: string, newCommission: number) => {
        setPartnerStores(prevStores => 
            prevStores.map(store => 
                store.id === storeId ? { ...store, commission: newCommission } : store
            )
        );
    };
            
    const handleImportDropshippingProduct = (productToImport: DropshippingProduct) => {
        const newProduct: Product = {
            id: `imported-${productToImport.id}-${Date.now()}`,
            name: productToImport.name,
            seller: 'Ana Carolina', // Current consultant/admin name
            price: productToImport.suggestedRetailPrice,
            costPerItem: productToImport.costPrice,
            currency: 'BRL',
            shortDescription: productToImport.description.substring(0, 150) + (productToImport.description.length > 150 ? '...' : ''),
            description: productToImport.description,
            images: productToImport.images,
            rating: 0,
            reviewCount: 0,
            collectionId: null,
            status: 'Rascunho',
            inventory: productToImport.inventory,
            type: 'Dropshipping',
            requiresShipping: true,
            trackQuantity: true,
            chargeTax: true,
            continueSelling: false,
            seoTitle: productToImport.name,
            seoDescription: productToImport.description.substring(0, 320),
            urlHandle: slugify(productToImport.name),
            options: [],
            variants: [],
        };

        setProducts(prevProducts => {
            const exists = prevProducts.find(p => p.name === newProduct.name && p.type === 'Dropshipping');
            if (exists) {
                alert('Este produto já foi importado para a sua loja.');
                return prevProducts;
            }
            alert(`Produto "${newProduct.name}" importado com sucesso! Ele está disponível como rascunho em "Gerenciar Produtos".`);
            return [...prevProducts, newProduct];
        });
    };

    const handleNavigateToEditDropshipping = (productToEdit: DropshippingProduct) => {
        const productTemplate: Product = {
            id: '', // Empty id signifies a new product for the editor
            name: productToEdit.name,
            seller: 'Ana Carolina',
            price: productToEdit.suggestedRetailPrice,
            costPerItem: productToEdit.costPrice,
            currency: 'BRL',
            shortDescription: productToEdit.description.substring(0, 150) + (productToEdit.description.length > 150 ? '...' : ''),
            description: productToEdit.description,
            images: productToEdit.images,
            rating: 0,
            reviewCount: 0,
            collectionId: null,
            status: 'Rascunho',
            inventory: productToEdit.inventory,
            type: 'Dropshipping',
            requiresShipping: true,
            trackQuantity: true,
            chargeTax: true,
            continueSelling: false,
            seoTitle: productToEdit.name,
            // Fix: Changed 'productToToEdit' to 'productToEdit'
            seoDescription: productToEdit.description.substring(0, 320),
            urlHandle: slugify(productToEdit.name),
            options: [],
            variants: [],
        };
        setSelectedProduct(productTemplate);
        handleNavigate('addEditProduct'); // Use addEditProduct for dropshipping edit, as it handles new/existing
    };

    const handleCollectionSave = (collectionToSave: Collection) => {
        setCollections(prev => {
            const exists = prev.find(c => c.id === collectionToSave.id);
            if (exists) {
                return prev.map(c => c.id === collectionToSave.id ? collectionToSave : c);
            }
            return [...prev, { ...collectionToSave, id: `col-${Date.now()}` }];
        });
        handleNavigate('manageCollections');
    };

  const handleCollectionDelete = async (collectionId: string) => {
      if (!window.confirm('Tem certeza que deseja excluir esta coleção?')) return;
      const res: any = await collectionsAPI.delete(collectionId);
      if (res && res.success === false) {
          alert(res.error || 'Falha ao excluir a coleção');
          return;
      }
      setCollections(prev => prev.filter(c => c.id !== collectionId));
  };

    const handleCustomerLogin = (customer: Customer) => {
        setCurrentCustomer(customer);
        handleNavigate('home');
    };
    
    const handleCustomerRegister = (customerData: Omit<Customer, 'id'>) => {
        const newCustomer: Customer = {
            id: `cust-${Date.now()}`,
            ...customerData,
        };
        setCustomers(prev => [...prev, newCustomer]);
        alert('Cadastro realizado com sucesso! Faça seu login para continuar.');
        handleNavigate('customerLogin');
    };

    const handleReviewUpdateStatus = (ids: string[], status: Review['status']) => setReviews(prev => prev.map(r => ids.includes(r.id) ? { ...r, status } : r));
    const handleReviewDelete = (ids: string[]) => { if (window.confirm(`Tem certeza?`)) setReviews(prev => prev.filter(r => !ids.includes(r.id))); };
    const handleReviewSubmit = (reviewData: Omit<Review, 'id' | 'createdAt' | 'status'>) => {
        const newReview: Review = {
            ...reviewData,
            id: `rev-${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: 'Pendente'
        };
        setReviews(prev => [newReview, ...prev]);
        alert('Sua avaliação foi enviada para moderação. Obrigado!');
    };

    const handleAnnouncementSave = (data: Announcement) => {
        setAnnouncements(prev => {
            const exists = prev.find(a => a.id === data.id);
            if (exists) return prev.map(a => a.id === data.id ? { ...exists, ...data } : a);
            return [{ ...data, id: `ann-${Date.now()}` }, ...prev];
        });
        handleNavigate('manageAnnouncements');
    };
    const handleAnnouncementsDelete = (ids: string[]) => {
        if (window.confirm(`Tem certeza?`)) setAnnouncements(prev => prev.filter(a => !ids.includes(a.id)));
    };
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    const handleTrainingSave = (data: Training) => {
        setTrainings(prev => {
            const exists = prev.find(t => t.id === data.id);
            if (exists) return prev.map(t => t.id === data.id ? { ...exists, ...data } : t);
            return [{ ...data, id: `train-${Date.now()}` }, ...prev];
        });
        handleNavigate('manageTrainings');
    };
    const handleTrainingsDelete = (ids: string[]) => {
        if (window.confirm(`Tem certeza?`)) setTrainings(prev => prev.filter(t => !ids.includes(t.id)));
    };
    const [selectedTrainingModule, setSelectedTrainingModule] = useState<Training | null>(null);

    const handleMarketingAssetSave = (data: MarketingAsset) => {
        setMarketingAssets(prev => {
            const exists = prev.find(a => a.id === data.id);
            if (exists) return prev.map(a => a.id === data.id ? { ...exists, ...data } : a);
            return [{ ...data, id: `asset-${Date.now()}` }, ...prev];
        });
        handleNavigate('manageMarketingAssets');
    };
    const handleMarketingAssetsDelete = (ids: string[]) => {
        if (window.confirm(`Tem certeza?`)) setMarketingAssets(prev => prev.filter(a => !ids.includes(a.id)));
    };
    const [selectedMarketingAsset, setSelectedMarketingAsset] = useState<MarketingAsset | null>(null);
    
    const handleToggleLessonComplete = (lessonId: string) => {
        setCompletedLessons(prev => {
            if (prev.includes(lessonId)) {
                return prev.filter(id => id !== lessonId);
            }
            return [...prev, lessonId];
        });
    };

    const handleLikeLesson = (moduleId: string, lessonId: string) => {
        setTrainings(prev => prev.map(module => {
            if (module.id === moduleId) {
                return {
                    ...module,
                    lessons: module.lessons.map(lesson => {
                        if (lesson.id === lessonId) {
                            return { ...lesson, likes: (lesson.likes || 0) + 1 };
                        }
                        return lesson;
                    })
                };
            }
            return module;
        }));
    };

    const handleToggleWishlist = (productId: string) => {
        if (!currentCustomer) {
            alert('Por favor, faça login para adicionar itens à sua lista de desejos.');
            handleNavigate('customerLogin');
            return;
        }
        setWishlist(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            }
            return [...prev, productId];
        });
    };

    const handleQuestionSubmit = (questionData: Omit<Question, 'id' | 'createdAt' | 'answers'>) => {
        const newQuestion: Question = {
            ...questionData,
            id: `q-${Date.now()}`,
            createdAt: new Date().toISOString(),
            answers: []
        };
        setQuestions(prev => [newQuestion, ...prev]);
        alert('Sua pergunta foi enviada e será respondida em breve.');
    };
    
    const handleAnswerSubmit = (questionId: string, answerData: Omit<Answer, 'id' | 'createdAt'>) => {
        const newAnswer: Answer = {
            ...answerData,
            id: `a-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        setQuestions(prev => prev.map(q => 
            q.id === questionId ? { ...q, answers: [...q.answers, newAnswer] } : q
        ));
    };

    const handleChargeSave = (chargeData: Omit<Charge, 'id' | 'paymentLink'>): Charge => {
        const newCharge: Charge = {
            ...chargeData,
            id: `CHG-${Date.now()}`,
            paymentLink: `https://rs.shp/pay/${Math.random().toString(36).substring(2, 10)}`,
        };
        setCharges(prev => [newCharge, ...prev]);
        return newCharge;
    };


    const adminViewTitles: Partial<Record<View, string>> = {
        consultantStore: 'Painel do Consultor',
        manageProducts: 'Produtos',
        addEditProduct: 'Adicionar/Editar Produto',
        editDropshippingProduct: 'Editar Produto Dropshipping',
        manageInventory: 'Gerenciar Estoque',
        manageOrders: 'Pedidos',
        orderDetail: 'Detalhes do Pedido',
        manageReturns: 'Gerenciar Devoluções',
        returnDetail: 'Detalhes da Devolução',
        manageDropshippingOrders: 'Pedidos Dropshipping',
        dropshippingCatalog: 'Catálogo Dropshipping',
        managePromotions: 'Cupons de Desconto',
        addEditCoupon: 'Adicionar/Editar Cupom',
        manageAffiliates: 'Programa de Afiliados',
        storeEditor: 'Aparência da Loja',
        storeBannerEditor: 'Banners da Loja',
        virtualOfficeDropshipping: 'Produtos Dropshipping',
        virtualOfficeAffiliateLinks: 'Links de Afiliado',
        virtualOfficePixels: 'Pixels de Marketing',
        virtualOfficeLinkShortener: 'Encurtador de Link',
        addEditMarketingPixel: 'Adicionar/Editar Pixel',
        bannerDashboard: 'Banners do Painel',
        dashboardEditor: 'Editor do Painel',
        managePayments: 'Configurações de Pagamento',
        manageShipping: 'Configurações de Frete',
        compensationPlan: 'Plano de Compensação',
        manageCollections: 'Coleções',
        addEditCollection: 'Adicionar/Editar Coleção',
        userProfileEditor: 'Meu Perfil',
        walletOverview: 'WalletPay - Visão Geral',
        walletReports: 'WalletPay - Extrato e Relatórios',
        walletTransfers: 'WalletPay - Transferências',
        walletCharges: 'WalletPay - Cobranças',
        walletSettings: 'WalletPay - Configurações',
        rsStudio: 'RS Studio',
        communication: 'Central de Comunicação',
        orderConfirmation: 'Confirmação de Pedido',
        manageOrderBump: 'Order Bump',
        manageUpsell: 'Upsell Pós-Compra',
        manageAbandonedCarts: 'Carrinhos Abandonados',
        manageReviews: 'Moderar Avaliações',
        manageAnnouncements: 'Gerenciar Comunicados',
        addEditAnnouncement: 'Adicionar/Editar Comunicado',
        manageTrainings: 'Gerenciar Treinamentos',
        addEditTraining: 'Adicionar/Editar Treinamento',
        trainingModuleDetail: 'Detalhes do Treinamento',
        manageMarketingAssets: 'Gerenciar Materiais de Marketing',
        addEditMarketingAsset: 'Adicionar/Editar Material de Marketing',
        customerWishlist: 'Minha Lista de Desejos',
        manageDistributors: 'CDs (Centrais de Distribuição)',
        addEditDistributor: 'Adicionar/Editar CD',
    };

    const renderAdminContent = () => {
        let content;
        switch(view) {
            case 'consultantStore': content = <ConsultantStore onNavigate={handleNavigate} banners={dashboardBanners} settings={dashboardSettings} userProfile={userProfile} bonuses={bonuses} networkActivity={initialNetworkActivity} userPoints={4500} monthlyUserPoints={800} compensationSettings={compensationSettings} weeklyBonuses={initialWeeklyBonuses} />; break;
            case 'manageProducts': content = <ManageProducts onNavigate={handleNavigate} products={products} onDelete={handleProductDelete} />; break;
            case 'addEditProduct': content = <AddEditProduct product={selectedProduct} collections={collections} onSave={handleProductSave} onCancel={() => handleNavigate('manageProducts')} />; break;
            case 'editDropshippingProduct': content = <AddEditProduct product={selectedProduct} collections={collections} onSave={handleProductSave} onCancel={() => handleNavigate('virtualOfficeDropshipping')} />; break;
            case 'manageInventory': content = <ManageInventory products={products} onSave={handleInventorySave} onNavigate={handleNavigate}/>; break;
            case 'manageOrders': content = <ManageOrders orders={orders} onNavigate={handleNavigate} />; break;
            case 'orderDetail': content = selectedOrder && <OrderDetail order={selectedOrder} onUpdateOrder={handleOrderUpdate} onBack={() => handleNavigate('manageOrders')} />; break;
            case 'manageReturns': content = <ManageReturns returns={returns} onUpdateStatus={handleReturnStatusUpdate} onDelete={handleReturnDelete} onNavigate={handleNavigate} />; break;
            case 'returnDetail': content = selectedReturn && <ReturnDetail returnRequest={selectedReturn} onUpdateStatus={(id, status) => handleReturnStatusUpdate([id], status)} onNavigate={handleNavigate} />; break;
            case 'manageDropshippingOrders': content = <ManageDropshippingOrders orders={dropshippingOrders} mainOrders={orders} onUpdateOrder={handleDropshippingOrderUpdate} onNavigate={handleNavigate} />; break;
            case 'dropshippingCatalog': content = <DropshippingCatalog products={dropshippingProducts} onImport={handleImportDropshippingProduct} onEdit={handleNavigateToEditDropshipping} onNavigate={handleNavigate} />; break;
            case 'managePromotions': content = <ManagePromotions coupons={coupons} onNavigate={handleNavigate} onDelete={handleCouponDelete} onStatusToggle={handleCouponStatusToggle} />; break;
            case 'addEditCoupon': content = <AddEditCoupon coupon={selectedCoupon} onSave={handleCouponSave} onCancel={() => handleNavigate('managePromotions')} />; break;
            case 'manageAffiliates': content = <ManageAffiliates affiliates={initialAffiliates} onNavigate={handleNavigate} />; break;
            case 'storeEditor': content = <VirtualOfficeMarketplace customization={storeCustomization} onUpdate={handleStoreCustomizationChange} />; break;
            case 'storeBannerEditor': content = <StoreBannerEditor customization={storeCustomization} onUpdate={handleStoreCustomizationChange} />; break;
            case 'virtualOfficeDropshipping': content = <VirtualOfficeDropshipping products={dropshippingProducts} onEditProduct={handleNavigateToEditDropshipping} />; break;
            case 'virtualOfficeAffiliateLinks': content = <ManageAffiliateLinks stores={partnerStores} onCommissionChange={handlePartnerStoreCommissionChange} />; break;
            case 'virtualOfficePixels': content = <ManageMarketingPixels pixels={marketingPixels} onNavigate={handleNavigate} onDelete={handleMarketingPixelDelete} onStatusToggle={handleMarketingPixelStatusToggle} onDuplicate={handleMarketingPixelDuplicate} />; break;
            case 'virtualOfficeLinkShortener': content = <LinkShortener links={shortenedLinks} setLinks={setShortenedLinks} />; break;
            case 'addEditMarketingPixel': content = <AddEditMarketingPixel pixel={selectedMarketingPixel} onSave={handleMarketingPixelSave} onCancel={() => handleNavigate('virtualOfficePixels')} />; break;
            case 'bannerDashboard': content = <BannerDashboard banners={dashboardBanners} onUpdate={handleDashboardBannersUpdate} />; break;
            case 'dashboardEditor': content = <DashboardEditor settings={dashboardSettings} onUpdate={handleDashboardSettingsUpdate} />; break;
            case 'managePayments': content = <ManagePayments settings={paymentSettings} onSave={handlePaymentSettingsSave} onNavigate={handleNavigate} />; break;
            case 'manageShipping': content = <ManageShipping settings={shippingSettings} onSave={handleShippingSettingsSave} onNavigate={handleNavigate} />; break;
            case 'compensationPlan': content = <CompensationPlan settings={compensationSettings} onSave={handleCompensationSettingsSave} onNavigate={handleNavigate} />; break;
            case 'manageCollections': content = <ManageCollections collections={collections} products={products} onNavigate={handleNavigate} onDelete={handleCollectionDelete} />; break;
            case 'addEditCollection': content = <AddEditCollection collection={selectedCollection} products={products} onSave={handleCollectionSave} onCancel={() => handleNavigate('manageCollections')} onNavigate={handleNavigate} />; break;
            case 'userProfileEditor': content = <UserProfileEditor userProfile={userProfile} onSave={handleProfileUpdate} />; break;
            case 'walletOverview': content = <WalletOverview orders={orders} onNavigate={handleNavigate} />; break;
            case 'walletReports': content = <WalletSalesReport orders={orders} onNavigate={handleNavigate} />; break;
            case 'walletTransfers': content = <WalletTransfers orders={orders} products={products} onNavigate={handleNavigate} paymentSettings={paymentSettings} />; break;
            case 'walletCharges': content = <WalletCharges charges={charges} products={products} onSave={handleChargeSave} />; break;
            case 'walletSettings': content = <WalletSettingsComponent settings={initialWalletSettings} onSave={() => alert('Settings saved!')} paymentSettings={paymentSettings} onNavigate={handleNavigate} />; break;
            case 'rsStudio': content = <RSStudio products={products} onNavigate={handleNavigate} />; break;
            case 'communication': content = <CommunicationCenter />; break;
            case 'manageOrderBump': content = <ManageOrderBump settings={storeCustomization.orderBump} products={products} onSave={(s) => handleStoreCustomizationChange({ orderBump: s })} />; break;
            case 'manageUpsell': content = <ManageUpsell settings={storeCustomization.upsell} products={products} onSave={(s) => handleStoreCustomizationChange({ upsell: s })} />; break;
            case 'manageAbandonedCarts': content = <ManageAbandonedCarts carts={abandonedCarts} />; break;
            case 'manageReviews': content = <ManageReviews reviews={reviews} onUpdateStatus={handleReviewUpdateStatus} onDelete={handleReviewDelete} />; break;
            case 'manageAnnouncements': content = <ManageAnnouncements announcements={announcements} onNavigate={handleNavigate} onDelete={handleAnnouncementsDelete} />; break;
            case 'addEditAnnouncement': content = <AddEditAnnouncement announcement={selectedAnnouncement} onSave={handleAnnouncementSave} onCancel={() => handleNavigate('manageAnnouncements')} />; break;
            case 'manageTrainings': 
                const updatedSelectedTrainingModule = selectedTrainingModule 
                    ? trainings.find(t => t.id === selectedTrainingModule.id) 
                    : null;
                content = <ManageTrainings trainings={trainings} onNavigate={handleNavigate} completedLessons={completedLessons} />; 
                break;
            case 'addEditTraining': 
                const currentEditTrainingModule = selectedTrainingModule 
                    ? trainings.find(t => t.id === selectedTrainingModule.id) 
                    : null;
                content = <AddEditTraining training={currentEditTrainingModule} onSave={handleTrainingSave} onCancel={() => handleNavigate('manageTrainings')} />;
                break;
            case 'trainingModuleDetail': 
                const currentTrainingModule = selectedTrainingModule 
                    ? trainings.find(t => t.id === selectedTrainingModule.id) 
                    : null;
                content = currentTrainingModule && <TrainingModuleDetail module={currentTrainingModule} onNavigate={handleNavigate} completedLessons={completedLessons} onToggleLessonComplete={handleToggleLessonComplete} onLikeLesson={handleLikeLesson} />; 
                break;
            case 'manageMarketingAssets': content = <ManageMarketingAssets assets={marketingAssets} onNavigate={handleNavigate} onDelete={handleMarketingAssetsDelete} />; break;
            case 'addEditMarketingAsset': content = <AddEditMarketingAsset asset={selectedMarketingAsset} onSave={handleMarketingAssetSave} onCancel={() => handleNavigate('manageMarketingAssets')} />; break;
            default: content = <div>View not found</div>;
        }
        return (
            <AdminLayout title={adminViewTitles[view]} currentView={view} onNavigate={handleNavigate} onLogout={() => {setCurrentCustomer(null); setView('home');}}>
                {content}
            </AdminLayout>
        );
    };

    const renderPublicContent = () => {
        const offerProducts = products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price);
        const recentlyViewedProducts = useMemo(() => recentlyViewedIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => Boolean(p)), [recentlyViewedIds, products]);
        
        switch (view) {
            case 'productDetail':
                return selectedProduct && <ProductDetail 
                    product={selectedProduct} 
                    collections={collections} 
                    onBack={() => handleNavigate('home')} 
                    onAddToCart={handleAddToCart} 
                    onNavigate={handleNavigate} 
                    reviews={reviews} 
                    onReviewSubmit={handleReviewSubmit}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    questions={questions}
                    onQuestionSubmit={handleQuestionSubmit}
                    onAnswerSubmit={handleAnswerSubmit}
                />;
            case 'collectionView':
                return selectedCollection && <CollectionView collection={selectedCollection} products={products} onProductClick={(p) => handleNavigate('productDetail', p)} onBack={() => handleNavigate('home')} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />;
            case 'customerAccount':
                return currentCustomer && <CustomerAccount customer={currentCustomer} orders={orders} onNavigate={handleNavigate} />;
            case 'customerWishlist':
                return currentCustomer && <CustomerWishlist wishlist={wishlist} products={products} onNavigate={handleNavigate} onToggleWishlist={handleToggleWishlist} />;
            case 'orderConfirmation':
                return <OrderConfirmation order={lastConfirmedOrder} onContinueShopping={() => handleNavigate('home')} upsellSettings={storeCustomization.upsell} allProducts={products} onAcceptUpsell={handleAcceptUpsell} />;
            case 'orderLookup':
                return <OrderLookupView orders={orders} onOrderFound={(order) => handleNavigate('orderStatus', order)} />;
            case 'orderStatus':
                return selectedOrder && <OrderStatusView order={selectedOrder} onBack={() => handleNavigate('home')} />;
            case 'home':
            default:
                return (
                    <>
                        <Hero 
                            content={storeCustomization.hero} 
                            onBecomeSellerClick={() => handleNavigate('sellerRegistration')} 
                        />
                        <Carousel banners={storeCustomization.carouselBanners} />
                        <FeaturedProducts products={products} onProductClick={(p) => handleNavigate('productDetail', p)} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />
                        {offerProducts.length > 0 && <Offers products={offerProducts} onProductClick={(p) => handleNavigate('productDetail', p)} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />}
                        <Bestsellers products={products} onProductClick={(p) => handleNavigate('productDetail', p)} orders={orders} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />
                        <RecentlyViewed products={recentlyViewedProducts} onProductClick={(p) => handleNavigate('productDetail', p)} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />
                        <MidPageBanner banner={storeCustomization.midPageBanner} />
                        <CallToAction onConsultantClick={() => handleNavigate('consultantLogin')} onBecomeSellerClick={() => handleNavigate('sellerRegistration')} />
                        <CustomerChatWidget orders={orders} />
                    </>
                );
        }
    };

    const isAuthView = ['consultantLogin', 'sellerRegistration', 'customerLogin', 'customerRegister', 'customerForgotPassword'].includes(view);
    // Fix: Replaced Object.keys(adminViewTitles).includes(view) with explicit list of admin dashboard views
    const isAdminDashboardView = [
        'consultantStore', 'manageProducts', 'addEditProduct', 'editDropshippingProduct', 'manageInventory', 
        'manageOrders', 'orderDetail', 'manageReturns', 'returnDetail', 'manageDropshippingOrders', 
        'dropshippingCatalog', 'managePromotions', 'addEditCoupon', 'manageAffiliates', 'storeEditor', 
        'storeBannerEditor', 'virtualOfficeDropshipping', 'virtualOfficeAffiliateLinks', 
        'virtualOfficePixels', 'virtualOfficeLinkShortener', 'addEditMarketingPixel', 'bannerDashboard', 
        'dashboardEditor', 'managePayments', 'manageShipping', 'compensationPlan', 'manageCollections', 
        'addEditCollection', 'userProfileEditor', 'walletOverview', 'walletReports', 'walletTransfers', 
        'walletCharges', 'walletSettings', 'rsStudio', 'communication', 'manageOrderBump', 'manageUpsell',
        'manageAbandonedCarts', 'manageReviews', 'manageAnnouncements', 'addEditAnnouncement', 
        'manageTrainings', 'addEditTraining', 'trainingModuleDetail', 'manageMarketingAssets', 
        'addEditMarketingAsset', 'manageDistributors', 'addEditDistributor'
    ].includes(view);

    if (isAuthView) {
        switch (view) {
            case 'consultantLogin': return <ConsultantLogin onLoginSuccess={() => handleNavigate('consultantStore')} onBackToHome={() => handleNavigate('home')} />;
            case 'sellerRegistration': return <SellerRegistration onRegisterSuccess={() => handleNavigate('home')} onBackToHome={() => handleNavigate('home')} />;
            case 'customerLogin': return <CustomerLogin customers={customers} onLoginSuccess={handleCustomerLogin} onBackToHome={() => handleNavigate('home')} onNavigateToRegister={() => handleNavigate('customerRegister')} onNavigateToForgotPassword={() => handleNavigate('customerForgotPassword')} />;
            case 'customerRegister': return <CustomerRegister existingCustomers={customers} onRegister={handleCustomerRegister} onBackToHome={() => handleNavigate('home')} onNavigateToLogin={() => handleNavigate('customerLogin')} />;
            case 'customerForgotPassword': return <CustomerForgotPassword onForgotPasswordRequest={(email) => alert(`Link de recuperação enviado para ${email}`)} onBackToLogin={() => handleNavigate('customerLogin')} />;
            default: return null; // Should not happen
        }
    }
    
    if (view === 'checkout') {
         return (
             <>
                <style>{storeCustomization.customCss}</style>
                <CheckoutView 
                    cartItems={cart} 
                    onBack={() => { handleNavigate(viewBeforeCheckout); setIsCartOpen(true); }}
                    onFinalizePurchase={handleFinalizePurchase}
                    currentCustomer={currentCustomer}
                    coupons={coupons}
                    orderBumpConfig={storeCustomization.orderBump}
                    allProducts={products}
                    paymentSettings={paymentSettings}
                    onUpdateQuantity={handleUpdateCartQuantity}
                    onRemoveItem={handleRemoveFromCart}
                />
            </>
        )
    }

    if (isAdminDashboardView) {
        return (
            <>
                <style>{storeCustomization.customCss}</style>
                {renderAdminContent()}
            </>
        );
    }
    
    return (
        <>
            <style>{storeCustomization.customCss}</style>
            <div className="bg-[rgb(var(--color-brand-dark))] text-[rgb(var(--color-brand-text-light))] font-sans">
                <Header 
                    logoUrl={storeCustomization.logoUrl} 
                    onLogoClick={() => handleNavigate('home')} 
                    onConsultantClick={() => handleNavigate(currentCustomer ? 'consultantStore' : 'consultantLogin')}
                    cartItems={cart}
                    onCartClick={() => setIsCartOpen(true)}
                    collections={collections}
                    onNavigate={handleNavigate}
                    currentCustomer={currentCustomer}
                    onLogout={() => setCurrentCustomer(null)}
                />
                <main>
                    {renderPublicContent()}
                </main>
                <Footer logoUrl={storeCustomization.logoUrl} content={storeCustomization.footer} onConsultantClick={() => handleNavigate('consultantLogin')} onNavigate={handleNavigate} />
            </div>
             {showFloatingCartStatus && cart.length > 0 && (
                <FloatingCartStatus cartItems={cart} onViewCart={() => {
                    setIsCartOpen(true);
                    setShowFloatingCartStatus(false);
                }} />
            )}
            <CartView 
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cart}
                onUpdateQuantity={handleUpdateCartQuantity}
                onRemoveItem={handleRemoveFromCart}
                onNavigate={handleNavigate}
            />
        </>
    );
};

export default App;
