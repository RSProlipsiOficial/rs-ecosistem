
import React, { useEffect, useState } from 'react';
import { Section, Theme, SocialPlatform, UserPlan, TrackingPixels, FaqItem, BentoItem, CarouselItem, CheckoutProfile } from '../types';
import { CheckoutModal } from './checkout/CheckoutModal';
import { usePixelTracking } from '../hooks/usePixelTracking';
import {
    ExternalLink, Calendar, Instagram, Linkedin, Mail, ArrowRight,
    Facebook, Twitter, Youtube, MessageCircle, Globe, ShoppingBag, Download, MapPin, ChevronDown, Timer, Send, Link as LinkIcon
} from 'lucide-react';

interface RendererProps {
    sections: Section[];
    theme: Theme;
    isPreview?: boolean; // If true, we act as the editor preview
    onSectionClick?: (id: string) => void;
    selectedSectionId?: string | null;
    plan?: UserPlan;
    tracking?: TrackingPixels;
}

export const Renderer: React.FC<RendererProps> = ({
    sections,
    theme,
    isPreview = false,
    onSectionClick,
    selectedSectionId,
    plan = 'free',
    tracking
}) => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [checkoutProduct, setCheckoutProduct] = useState<{ name: string, price: string, url: string } | null>(null);

    const handleCheckoutTrigger = (name: string, price: string, url: string) => {
        if (isPreview) return; // Don't trigger in editor preview (unless we want to test?)
        setCheckoutProduct({ name, price, url });
        setIsCheckoutOpen(true);
    };

    const handleCheckoutComplete = (profile: CheckoutProfile) => {
        setIsCheckoutOpen(false);
        console.log('Checkout Profile Captured:', profile);

        // Tracking logic here (optional)
        // @ts-ignore
        if (window.fbq) window.fbq('track', 'Lead');

        if (checkoutProduct?.url && checkoutProduct.url !== '#' && checkoutProduct.url !== '') {
            try {
                // Security check for checkout URL
                const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
                const urlObj = new URL(checkoutProduct.url);

                if (!safeProtocols.includes(urlObj.protocol)) {
                    throw new Error('Insecure protocol');
                }

                // Construct URL with lead data
                Object.entries(profile).forEach(([key, value]) => {
                    if (value) urlObj.searchParams.append(key, String(value));
                });
                window.location.href = urlObj.toString();
            } catch (e) {
                // If invalid or insecure URL, fallback to safe open or alert
                console.warn('Blocked insecure or invalid checkout redirect:', checkoutProduct.url);
                window.open(checkoutProduct.url, '_blank', 'noopener,noreferrer');
            }
        } else {
            alert(`Obrigado ${profile.nome_completo}! Seu cadastro foi recebido.`);
        }
    };

    useEffect(() => {
        // Only handle PWA install logic if not in editor preview mode
        if (isPreview) return;

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, [isPreview]);

    const handleInstallApp = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    // -- TRACKING PIXEL INJECTION --
    usePixelTracking(tracking, isPreview);

    // -- DYNAMIC SEO INJECTION --
    useEffect(() => {
        if (isPreview) return;

        // 1. Title
        const originalTitle = document.title;
        if (sections.find(s => s.type === 'hero')?.content.title) {
            document.title = (sections.find(s => s.type === 'hero')?.content.title || 'RS MiniSite') + ' | RS MiniSite';
        }

        // 2. Meta Tags (Fallback to defaults if not specifically provided in sitewide SEO config)
        const updateMetaTag = (property: string, content: string, isName = false) => {
            const attr = isName ? 'name' : 'property';
            let tag = document.querySelector(`meta[${attr}="${property}"]`);
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute(attr, property);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        };

        const heroContent = sections.find(s => s.type === 'hero')?.content;
        const description = (sections.find(s => s.type === 'text')?.content.subtitle || 'Confira meu link na bio profissional.').substring(0, 160);
        const image = heroContent?.imageSrc || '/og-image.jpg';

        updateMetaTag('description', description, true);
        updateMetaTag('og:title', document.title);
        updateMetaTag('og:description', description);
        updateMetaTag('og:image', image);
        updateMetaTag('twitter:title', document.title);
        updateMetaTag('twitter:description', description);
        updateMetaTag('twitter:image', image);

        return () => {
            document.title = originalTitle;
        };
    }, [sections, isPreview]);
    // We use flex-col and overflow-y-auto to ensure the content scrolls within the parent container (whether phone or desktop)
    const containerStyle = {
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
        height: '100%',
        width: '100%',
        position: 'relative' as const, // Ensure we can position absolute children relative to this
    };

    const showBranding = plan === 'free';

    return (
        <div style={containerStyle} className="flex flex-col items-center overflow-hidden relative">

            {/* GLOBAL BACKGROUND MEDIA LAYER */}
            {(theme.backgroundType === 'image' || theme.backgroundType === 'video') && (
                <div className="absolute inset-0 z-0">
                    {theme.backgroundType === 'image' && theme.backgroundImage && (
                        <img
                            src={theme.backgroundImage}
                            alt="Global Background"
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    )}
                    {theme.backgroundType === 'video' && theme.backgroundVideo && (
                        <video
                            src={theme.backgroundVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    )}
                    {/* Global Overlay */}
                    <div
                        className="absolute inset-0 bg-black transition-opacity duration-300 pointer-events-none"
                        style={{ opacity: theme.backgroundOverlayOpacity ?? 0 }}
                    />
                </div>
            )}

            {/* SCROLLABLE CONTENT AREA */}
            {/* z-10 ensures content sits on top of the global background */}
            <div className="w-full h-full overflow-y-auto scrollbar-hide relative z-10 flex flex-col items-center py-12 px-6">
                <div className="w-full max-w-md space-y-6">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            className={`relative group/block rounded-xl transition-all duration-300 ${!section.style.backgroundType || section.style.backgroundType === 'color' ? 'p-0' : ''}`}
                            style={{
                                backgroundColor: (section.style.backgroundType === 'color' || !section.style.backgroundType) ? section.style.backgroundColor : undefined,
                                color: section.style.textColor || theme.textColor
                            }}
                        >
                            {/* 
                    BLOCK BACKGROUND MEDIA LAYER
                    Renders behind the block content.
                */}
                            {(section.style.backgroundType === 'image' || section.style.backgroundType === 'video') && (
                                <div className="absolute inset-0 rounded-xl overflow-hidden z-0">
                                    {section.style.backgroundType === 'image' && section.style.backgroundImage && (
                                        <img
                                            src={section.style.backgroundImage}
                                            alt="Background"
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    )}
                                    {section.style.backgroundType === 'video' && section.style.backgroundVideo && (
                                        <video
                                            src={section.style.backgroundVideo}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    {/* Overlay for text readability */}
                                    <div
                                        className="absolute inset-0 bg-black transition-opacity duration-300"
                                        style={{ opacity: section.style.overlayOpacity ?? 0.4 }}
                                    />
                                </div>
                            )}

                            {/* 
                    Editor Selection Wrapper:
                    If we are in editor mode (onSectionClick exists), we wrap the block 
                    to handle selection and visualize the active state.
                */}
                            {onSectionClick && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSectionClick(section.id);
                                    }}
                                    className={`
                            absolute -inset-2 rounded-xl transition-all duration-200 z-20 cursor-pointer
                            ${selectedSectionId === section.id
                                            ? 'ring-2 ring-rs-gold bg-rs-gold/5'
                                            : 'hover:bg-rs-gold/5 hover:ring-1 hover:ring-rs-gold/30'}
                        `}
                                />
                            )}

                            {/* Render the actual block - relative + z-10 ensures it sits on top of bg */}
                            <div className="relative z-10">
                                <BlockRenderer section={section} theme={theme} onCheckout={handleCheckoutTrigger} />
                            </div>
                        </div>
                    ))}

                    {/* Footer Branding - Only for Free Plan */}
                    {showBranding && (
                        <div className="mt-16 pt-0 w-full flex flex-col gap-3">
                            {/* Editable Client Name/Mindset Area */}
                            <div className="text-center font-bold text-xs tracking-wider" style={{ color: theme.primaryColor }}>
                                {theme.customFooterText || "MINDSET"}
                            </div>

                            {/* Bottom Row: Rights & Privative */}
                            <div className="flex justify-between items-center text-[9px] uppercase tracking-widest opacity-50 w-full border-t pt-3" style={{ borderColor: `${theme.textColor}20` }}>
                                <span>Todos os direitos reservados</span>
                                <span>RS Privative</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SAVE TO PHONE BUTTON (PWA INSTALL) - Only in public view */}
            {deferredPrompt && !isPreview && (
                <button
                    onClick={handleInstallApp}
                    className="fixed bottom-6 right-6 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full p-3 shadow-2xl animate-bounce"
                    title="Salvar no Celular (Instalar App)"
                    style={{ color: theme.textColor, borderColor: theme.primaryColor }}
                >
                    <Download size={24} />
                </button>
            )}

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                onComplete={handleCheckoutComplete}
                productName={checkoutProduct?.name || 'Produto'}
                productPrice={checkoutProduct?.price || ''}
                theme={theme}
            />
        </div>
    );
};

const SocialIcon = ({ platform, size = 20 }: { platform: SocialPlatform, size?: number }) => {
    switch (platform) {
        case 'instagram': return <Instagram size={size} />;
        case 'facebook': return <Facebook size={size} />;
        case 'linkedin': return <Linkedin size={size} />;
        case 'twitter': return <Twitter size={size} />;
        case 'youtube': return <Youtube size={size} />;
        case 'whatsapp': return <MessageCircle size={size} />;
        case 'website': return <Globe size={size} />;
        default: return <ExternalLink size={size} />;
    }
};

const getEmbedUrl = (url: string) => {
    if (!url) return '';
    let cleanUrl = url.trim();

    // Security: Prevent javascript: and other dangerous protocols
    const forbiddenProtocols = ['javascript:', 'data:', 'vbscript:'];
    if (forbiddenProtocols.some(p => cleanUrl.toLowerCase().startsWith(p))) {
        console.warn('Blocked malicious URL attempt:', cleanUrl);
        return '';
    }

    // 1. YouTube Parser (Aggressive)
    if (cleanUrl.match(/(youtube|youtu\.be)/)) {
        // Try standard ID extraction
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
        const match = cleanUrl.match(regExp);

        let videoId = (match && match[2].length === 11) ? match[2] : null;

        // Fallback: search for "v=" directly if regex failed
        if (!videoId && cleanUrl.includes('v=')) {
            const parts = cleanUrl.split('v=');
            videoId = parts[parts.length - 1].split('&')[0];
        }

        // If we found something that looks like an ID
        if (videoId && videoId.length >= 10) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    }

    // 2. Vimeo Parser
    if (cleanUrl.includes('vimeo')) {
        const match = cleanUrl.match(/(?:vimeo.com\/|player.vimeo.com\/video\/)(\d+)/);
        if (match && match[1]) {
            return `https://player.vimeo.com/video/${match[1]}`;
        }
    }

    // Return original if it looks like an embed link already
    if (cleanUrl.includes('/embed/') || cleanUrl.includes('player.')) return cleanUrl;

    return '';
};

// Tracking Helper
const trackClick = (label: string, url?: string) => {
    // @ts-ignore
    if (window.fbq) window.fbq('trackCustom', 'Button Click', { label, url });
    // @ts-ignore
    if (window.gtag) {
        // @ts-ignore
        window.gtag('event', 'click', { event_category: 'Button', event_label: label, transport_type: 'beacon', event_callback: () => { } });
    }
    // @ts-ignore
    if (window.ttq) window.ttq.track('ClickButton', { content_name: label });
};

// --- SUB-COMPONENTS FOR NEW BLOCKS ---

const BentoBlock: React.FC<{ items: BentoItem[], theme: Theme }> = ({ items, theme }) => {
    return (
        <div className="grid grid-cols-2 gap-3 w-full">
            {items.map((item, idx) => (
                <a
                    key={idx}
                    href={item.url || '#'}
                    target={item.url ? "_blank" : undefined}
                    rel={item.url ? "noopener noreferrer" : undefined}
                    className="relative group overflow-hidden rounded-2xl aspect-[4/3] p-4 flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-95 shadow-md"
                    onClick={() => trackClick(item.title || 'Bento Item', item.url)}
                    style={{
                        backgroundColor: item.backgroundColor || 'rgba(255,255,255,0.05)',
                        color: item.textColor || theme.textColor,
                        border: `1px solid ${theme.textColor}10`,
                        // Full width for odd item if it's the last one
                        gridColumn: (items.length % 2 !== 0 && idx === items.length - 1) ? 'span 2' : 'span 1'
                    }}
                >
                    {/* Background Image if exists */}
                    {item.type === 'image' && item.imageSrc && (
                        <>
                            <img src={item.imageSrc} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40"></div>
                        </>
                    )}

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className={`p-1.5 rounded-full backdrop-blur-md ${item.type === 'image' ? 'bg-white/20' : 'bg-rs-gold/10 text-rs-gold'}`}>
                                {item.type === 'link' ? <LinkIcon size={14} /> : item.type === 'image' ? <ExternalLink size={14} /> : <ArrowRight size={14} />}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm leading-tight">{item.title || 'Título'}</h4>
                            <p className="text-[10px] opacity-70 mt-1 truncate">{item.subtitle || ''}</p>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
};

const CarouselBlock: React.FC<{ items: CarouselItem[], theme: Theme, autoplay?: boolean, speed?: number }> = ({ items, theme, autoplay, speed = 3000 }) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!autoplay || !scrollRef.current || items.length < 2) return;

        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;

                if (isAtEnd) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    // Try to scroll to next item (approx 160px + gap)
                    scrollRef.current.scrollBy({ left: 180, behavior: 'smooth' });
                }
            }
        }, speed);

        return () => clearInterval(interval);
    }, [autoplay, speed, items.length]);

    return (
        <div
            ref={scrollRef}
            className="w-full overflow-x-auto pb-4 pt-1 snap-x snap-mandatory flex gap-4 scrollbar-hide -mx-2 px-2"
        >
            {items.map((item, idx) => (
                <a
                    key={idx}
                    href={item.url || '#'}
                    target={item.url ? "_blank" : undefined}
                    rel={item.url ? "noopener noreferrer" : undefined}
                    className="snap-center shrink-0 w-40 aspect-[3/4] rounded-2xl overflow-hidden relative group shadow-lg border border-white/5 bg-white/5"
                    onClick={() => trackClick(item.title || 'Slide', item.url)}
                >
                    <img
                        src={item.imageSrc}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h4 className="text-white font-bold text-sm leading-tight">{item.title}</h4>
                        {item.url && <div className="mt-1 text-[10px] text-rs-gold flex items-center gap-1">Ver mais <ArrowRight size={10} /></div>}
                    </div>
                </a>
            ))}
        </div>
    );
};

const CountdownBlock: React.FC<{ targetDate: string, theme: Theme, shape?: 'square' | 'circle' }> = ({ targetDate, theme, shape = 'square' }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft();
        return () => clearInterval(timer);
    }, [targetDate]);

    const TimeBox = ({ value, label }: { value: number, label: string }) => (
        <div className="flex flex-col items-center">
            <div className={`w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'} border border-white/10 shadow-lg text-xl font-bold font-mono`}>
                {String(value).padStart(2, '0')}
            </div>
            <span className="text-[10px] uppercase tracking-wider mt-1 opacity-70">{label}</span>
        </div>
    );

    return (
        <div className="flex gap-3 justify-center">
            <TimeBox value={timeLeft.days} label="Dias" />
            <TimeBox value={timeLeft.hours} label="Hrs" />
            <TimeBox value={timeLeft.minutes} label="Min" />
            <TimeBox value={timeLeft.seconds} label="Seg" />
        </div>
    );
};

const FaqBlock: React.FC<{ items: FaqItem[], theme: Theme }> = ({ items, theme }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="space-y-2 w-full">
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className="rounded-lg overflow-hidden border border-white/5 bg-white/5 backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left text-sm font-semibold"
                        style={{ color: theme.textColor }}
                    >
                        <span>{item.question}</span>
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}
                            style={{ color: theme.primaryColor }}
                        />
                    </button>
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        <div className="p-4 pt-0 text-xs opacity-80 leading-relaxed border-t border-white/5 mt-2">
                            {item.answer}

                            {(item.buttonLabel && item.buttonUrl) && (
                                <a
                                    href={item.buttonUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackClick(item.buttonLabel || 'FAQ Button', item.buttonUrl)}
                                    className="mt-4 w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-wide transition-all active:scale-95 bg-rs-gold text-black shadow-lg hover:scale-[1.02]"
                                >
                                    <ExternalLink size={12} />
                                    {item.buttonLabel}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const NewsletterBlock: React.FC<{ content: any, theme: Theme }> = ({ content, theme }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would submit to an API endpoint
        setSubmitted(true);
        setTimeout(() => {
            setEmail('');
            setSubmitted(false);
        }, 3000);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <div className="relative">
                <input
                    type="email"
                    required
                    placeholder={content.placeholderText || 'Seu melhor e-mail'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-sm outline-none focus:border-opacity-50 transition-colors placeholder:text-gray-400"
                    style={{ borderColor: theme.primaryColor, color: theme.textColor }}
                />
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50" />
            </div>
            <button
                type="submit"
                disabled={submitted}
                className="w-full py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                style={{ backgroundColor: theme.primaryColor, color: theme.backgroundColor === '#0a0a0a' ? '#000' : '#fff' }}
            >
                {submitted ? 'Inscrito com sucesso!' : (
                    <>
                        {content.buttonText || 'Inscrever-se'}
                        <Send size={16} />
                    </>
                )}
            </button>
        </form>
    );
};


const BlockRenderer: React.FC<{ section: Section; theme: Theme; onCheckout?: (name: string, price: string, url: string) => void }> = ({ section, theme, onCheckout }) => {
    // Helper: If custom background is set, transparentize default backgrounds to let image show through
    const hasCustomBg = section.style.backgroundType === 'image' || section.style.backgroundType === 'video';

    switch (section.type) {
        case 'hero':
            return (
                <div className={`flex flex-col items-center ${section.style.textAlign === 'left' ? 'items-start' : section.style.textAlign === 'right' ? 'items-end' : ''} space-y-4 animate-fade-in p-6`}>
                    <div className="relative p-1 rounded-full bg-gradient-to-tr from-transparent via-transparent to-transparent" style={{ borderColor: theme.primaryColor }}>
                        {/* Gold ring effect */}
                        <div className="absolute inset-0 rounded-full border-2 border-opacity-50" style={{ borderColor: theme.primaryColor }}></div>
                        <img
                            src={section.content.imageSrc || 'https://picsum.photos/200'}
                            alt={section.content.title}
                            className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-transparent"
                            loading="lazy"
                        />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight font-serif text-shadow-sm">{section.content.title}</h1>
                    {section.content.subtitle && (
                        <p className="text-sm opacity-90 max-w-xs leading-relaxed text-shadow-sm font-medium">{section.content.subtitle}</p>
                    )}
                </div>
            );

        case 'button':
            return (
                <a
                    href={section.content.checkoutEnabled ? undefined : (section.content.url || '#')}
                    target={section.content.checkoutEnabled ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="group w-full block transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer"
                    onClick={(e) => {
                        trackClick(section.content.title || 'Botão', section.content.url);
                        if (section.content.checkoutEnabled && onCheckout) {
                            e.preventDefault();
                            onCheckout(section.content.title || 'Botão', '0.00', section.content.url || '#');
                        }
                    }}
                >
                    <div
                        className="w-full py-4 px-6 rounded-xl flex items-center justify-between font-semibold shadow-md backdrop-blur-sm border border-opacity-10"
                        style={{
                            backgroundColor: hasCustomBg ? 'rgba(0,0,0,0.2)' : section.style.backgroundColor || theme.secondaryColor,
                            borderColor: theme.primaryColor,
                            color: section.style.textColor || (section.style.backgroundColor ? '#fff' : theme.textColor),
                            borderRadius: section.style.borderRadius || '12px'
                        }}
                    >
                        <span className="flex-1 text-center">{section.content.title}</span>
                        {section.content.icon && (
                            <span className="ml-2"><ArrowRight size={16} /></span>
                        )}
                    </div>
                </a >
            );

        case 'social':
            return (
                <div className={`w-full flex flex-wrap gap-4 justify-center py-4 ${hasCustomBg ? 'bg-black/20 backdrop-blur-sm rounded-xl' : ''}`}>
                    {section.content.socialLinks?.map((link, idx) => (
                        <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:-translate-y-1 active:scale-90 border border-white/5 bg-white/5 backdrop-blur-md"
                            style={{
                                color: section.style.textColor || theme.primaryColor,
                                backgroundColor: section.style.backgroundColor || undefined,
                                borderColor: theme.primaryColor
                            }}
                            onClick={() => trackClick(link.platform, link.url)}
                            title={link.platform}
                        >
                            <SocialIcon platform={link.platform} size={24} />
                        </a>
                    ))}
                    {!section.content.socialLinks?.length && (
                        <div className="text-center w-full opacity-50 text-xs italic">Adicione redes sociais no editor</div>
                    )}
                </div>
            );

        case 'text':
            return (
                <div
                    className="w-full p-6 animate-fade-in"
                    style={{
                        textAlign: section.style.textAlign || 'left',
                    }}
                >
                    {section.content.title && <h3 className="text-lg font-semibold mb-2" style={{ color: section.style.textColor || theme.primaryColor }}>{section.content.title}</h3>}
                    <p className="text-sm opacity-90 leading-relaxed font-medium">{section.content.subtitle}</p>
                </div>
            );

        case 'product':
            return (
                <div
                    className="w-full rounded-2xl overflow-hidden shadow-lg border border-opacity-10 group bg-black/10 transition-all duration-300"
                    style={{
                        borderColor: theme.primaryColor,
                    }}
                >
                    {/* Product Image */}
                    <div className="w-full h-48 bg-black/20 overflow-hidden relative">
                        <img
                            src={section.content.imageSrc || 'https://via.placeholder.com/400x300'}
                            alt={section.content.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                        <h3 className="font-bold text-lg mb-1 leading-tight">{section.content.title}</h3>
                        <p className="text-sm opacity-70 mb-4 line-clamp-2">{section.content.subtitle}</p>

                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-xl font-bold" style={{ color: section.style.textColor || theme.primaryColor }}>
                                {section.content.price}
                            </span>
                            {section.content.oldPrice && (
                                <span className="text-sm line-through opacity-50 mb-1">
                                    {section.content.oldPrice}
                                </span>
                            )}
                        </div>

                        <button
                            onClick={(e) => {
                                if (section.content.checkoutEnabled && onCheckout) {
                                    e.preventDefault();
                                    onCheckout(section.content.title || 'Produto', section.content.price || '0.00', section.content.url || '#');
                                } else if (section.content.url) {
                                    trackClick(section.content.title || 'Produto', section.content.url);
                                    window.open(section.content.url, '_blank');
                                }
                            }}
                            className="w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wide transition-all active:scale-95 cursor-pointer"
                            style={{
                                backgroundColor: theme.primaryColor,
                                color: theme.backgroundColor === '#0a0a0a' ? '#000' : '#fff'
                            }}
                        >
                            <ShoppingBag size={16} />
                            {section.content.label || 'Comprar Agora'}
                        </button>
                    </div>
                </div>
            );

        case 'gallery':
            return (
                <div className="grid grid-cols-2 gap-2 w-full p-2">
                    {section.content.items?.map((img, idx) => (
                        <img key={idx} src={img} alt="Gallery" className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer" />
                    )) || <div className="p-4 text-center text-xs opacity-50 border border-dashed rounded w-full col-span-2">Galeria Vazia</div>}
                </div>
            );

        case 'social':
            return (
                <div
                    className={`flex flex-wrap gap-4 w-full p-6 ${section.style.textAlign === 'left' ? 'justify-start' : section.style.textAlign === 'right' ? 'justify-end' : 'justify-center'}`}
                >
                    {section.content.socialLinks?.map((link, idx) => (
                        <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-md"
                            style={{
                                backgroundColor: hasCustomBg ? 'rgba(255,255,255,0.1)' : theme.secondaryColor,
                                color: section.style.textColor || theme.primaryColor,
                                border: `1px solid ${section.style.textColor || theme.primaryColor}40`
                            }}
                        >
                            <SocialIcon platform={link.platform} size={22} />
                        </a>
                    ))}
                </div>
            );

        case 'video':
            const embedUrl = getEmbedUrl(section.content.url || section.content.videoUrl || '');
            return (
                <div
                    className={`w-full flex flex-col p-6 ${section.style.textAlign === 'left' ? 'items-start text-left' : section.style.textAlign === 'right' ? 'items-end text-right' : 'items-center text-center'} space-y-4`}
                >
                    {/* Title Above */}
                    {section.content.title && (
                        <h3 className="text-lg font-bold leading-tight text-shadow-sm" style={{ color: section.style.textColor || theme.primaryColor }}>
                            {section.content.title}
                        </h3>
                    )}

                    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-opacity-10 relative" style={{ borderColor: section.style.textColor || theme.textColor }}>
                        {embedUrl ? (
                            <iframe
                                src={embedUrl}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5 text-xs opacity-50 px-4 text-center">
                                URL inválida. Use um link de vídeo (ex: youtube.com/watch?v=...)
                            </div>
                        )}
                    </div>

                    {/* Description Below */}
                    {section.content.subtitle && (
                        <p className="text-sm opacity-90 leading-relaxed max-w-full break-words text-shadow-sm font-medium">
                            {section.content.subtitle}
                        </p>
                    )}
                </div>
            );

        case 'image-text':
            return (
                <div
                    className="w-full p-6 flex gap-4 items-center opacity-90"
                    style={{
                        flexDirection: section.style.textAlign === 'right' ? 'row-reverse' : 'row'
                    }}
                >
                    <img
                        src={section.content.imageSrc || 'https://via.placeholder.com/150'}
                        alt={section.content.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className={`flex-1 ${section.style.textAlign === 'right' ? 'text-right' : 'text-left'}`}>
                        <h3 className="font-bold text-base leading-tight mb-1" style={{ color: section.style.textColor || theme.primaryColor }}>
                            {section.content.title}
                        </h3>
                        <p className="text-xs opacity-80 leading-relaxed">
                            {section.content.subtitle}
                        </p>
                    </div>
                </div>
            );

        case 'whatsapp':
            // WhatsApp Block Rendering
            const waNumber = section.content.whatsappNumber?.replace(/\D/g, '') || '';
            const waMessage = encodeURIComponent(section.content.whatsappMessage || '');
            const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : '#';

            return (
                <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full block transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg active:scale-95"
                >
                    <div
                        className="w-full py-4 px-6 rounded-xl flex items-center justify-between font-semibold shadow-md backdrop-blur-sm"
                        style={{
                            backgroundColor: hasCustomBg ? 'rgba(37, 211, 102, 0.9)' : section.style.backgroundColor || '#25D366',
                            color: section.style.textColor || '#FFFFFF',
                        }}
                    >
                        <span className="flex items-center gap-3">
                            <MessageCircle size={22} className="fill-current" />
                            <span className="text-lg">{section.content.label || 'WhatsApp'}</span>
                        </span>
                        <ArrowRight size={20} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                </a>
            );

        // --- NEW BLOCKS ---
        case 'bento':
            return <BentoBlock items={section.content.bentoItems || []} theme={theme} />;

        case 'carousel':
            return <CarouselBlock
                items={section.content.carouselItems || []}
                theme={theme}
                autoplay={section.content.autoplay}
                speed={section.content.autoplaySpeed}
            />;

        case 'countdown':
            return (
                <div
                    className="w-full p-6 flex flex-col items-center"
                >
                    {section.content.title && (
                        <h3 className="text-lg font-bold mb-4" style={{ color: section.style.textColor || theme.primaryColor }}>{section.content.title}</h3>
                    )}
                    <CountdownBlock
                        targetDate={section.content.targetDate || new Date().toISOString()}
                        theme={theme}
                        shape={section.content.countdownShape}
                    />
                    {section.content.subtitle && (
                        <p className="text-xs opacity-70 mt-4 text-center">{section.content.subtitle}</p>
                    )}
                </div>
            );

        case 'faq':
            return (
                <div
                    className="w-full p-6"
                >
                    {section.content.title && (
                        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: section.style.textColor || theme.primaryColor }}>{section.content.title}</h3>
                    )}
                    <FaqBlock items={section.content.faqItems || []} theme={theme} />
                </div>
            );

        case 'newsletter':
            return (
                <div
                    className="w-full p-6 flex flex-col items-center"
                >
                    {section.content.title && (
                        <h3 className="text-lg font-bold mb-2" style={{ color: section.style.textColor || theme.primaryColor }}>{section.content.title}</h3>
                    )}
                    {section.content.subtitle && (
                        <p className="text-xs opacity-80 mb-6 text-center">{section.content.subtitle}</p>
                    )}
                    <NewsletterBlock content={section.content} theme={theme} />
                </div>
            );

        case 'map':
            const mapUrl = section.content.mapAddress
                ? `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(section.content.mapAddress)}`
                : '';
            // Note: In production, user needs a Google Maps API Key or use a static map generator. 
            // For this demo, we use an iframe placeholder logic that works with standard embed links if user provides them,
            // or a visual placeholder.

            return (
                <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-gray-800 relative aspect-video flex items-center justify-center">
                    {section.content.mapAddress ? (
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(section.content.mapAddress)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        ></iframe>
                    ) : (
                        <div className="text-center p-4 opacity-50 flex flex-col items-center">
                            <MapPin size={32} className="mb-2" />
                            <span className="text-xs">Endereço não configurado</span>
                        </div>
                    )}
                    {/* Overlay Gradient for integration */}
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
                </div>
            );

        case 'divider':
            return (
                <div className="w-full py-4 flex items-center justify-center">
                    <div
                        className="rounded-full opacity-50"
                        style={{
                            width: section.style.dividerWidth || '100%',
                            height: section.style.dividerThickness || '1px',
                            backgroundColor: section.style.textColor || theme.textColor
                        }}
                    />
                </div>
            );

        case 'spacer':
            return (
                <div
                    style={{ height: section.style.height || '32px' }}
                    className="w-full transition-all duration-300"
                />
            );

        default:
            return null;
    }
};