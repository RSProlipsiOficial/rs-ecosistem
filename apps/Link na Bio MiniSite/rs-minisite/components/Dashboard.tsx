import React, { useState, useMemo, useEffect } from 'react';
import { BioSite, UserProfile, UserPlan, PlanDefinition, AgencyClient, ClientPayment, PaymentStatus, PaymentMethod, MiniSiteTemplate } from '../types';
import { Plus, Edit3, ExternalLink, BarChart3, MoreVertical, Moon, Sun, Crown, CheckCircle2, CreditCard, Lock, X, Loader2, ShieldCheck, QrCode, Copy, Smartphone, Users, Briefcase, UserPlus, ArrowLeft, Filter, MousePointer2, TrendingUp, LayoutDashboard, MapPin, Mail, Phone, Calendar, FileText, ChevronRight, Search, ArrowUpDown, Share2, Ticket, DollarSign, Wallet, TrendingDown, ArrowUpRight, Target, ArrowRight, Shield, Percent, Save, MessageCircle, Download, UserCircle, Key, AlertTriangle, RefreshCw, Camera, UserCheck, Link, LogOut, Trash2, Eye } from 'lucide-react';
import { PLANS } from '../constants';
import { CheckoutForm } from './CheckoutForm';
import { buildMiniSiteSignupUrl, MINISITE_API_ORIGIN } from '../ecosystemUrls';
import { supabase } from '../supabaseClient';
import { Renderer } from './Renderer';

interface DashboardProps {
    user: UserProfile;
    sites: BioSite[];
    templates?: MiniSiteTemplate[];
    clients?: AgencyClient[]; // New prop for agency clients
    payments?: ClientPayment[]; // New prop for financial data
    onCreateNew: (clientId?: string) => void;
    onCreateFromTemplate?: (template: MiniSiteTemplate, clientId?: string) => Promise<boolean> | boolean;
    onDeleteSite?: (siteId: string) => Promise<boolean> | boolean;
    onAddClient?: (clientData: Omit<AgencyClient, 'id' | 'agencyId' | 'createdAt' | 'updatedAt'>) => void;
    onUpdateClient?: (client: AgencyClient) => void;
    onAddPayment?: (payment: Omit<ClientPayment, 'id'>) => void;
    onSaveSiteAsTemplate?: (siteId: string, templateData: {
        name: string;
        niche: string;
        category: string;
        description: string;
        makePublic: boolean;
    }) => Promise<boolean> | boolean;
    onEdit: (site: BioSite) => void;
    onView: (slug: string) => void;
    onUpdatePlan: (plan: UserPlan) => void;
    plans?: Record<string, PlanDefinition>;
    isDarkMode: boolean;
    toggleTheme: () => void;
    onNavigateToAdmin?: () => void; // New prop for admin navigation
    onLog?: (action: string, target: string) => void; // New log prop
    onUpdateUser?: (userData: Partial<UserProfile>) => Promise<boolean> | boolean; // New prop for profile updates
    onSyncProfile?: () => Promise<Partial<UserProfile> | null>; // New prop for global sync
    platformSettings?: { platformName: string; mpPublicKey?: string; mpAccessToken?: string };
    branding?: { logo?: string; companyName?: string };
    onLogout?: () => void | Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, sites, templates = [], clients = [], payments = [], onCreateNew, onCreateFromTemplate, onDeleteSite, onAddClient, onUpdateClient, onAddPayment, onSaveSiteAsTemplate, onEdit, onView, onUpdatePlan, plans = {}, isDarkMode, toggleTheme, onNavigateToAdmin, onLog, onUpdateUser, onSyncProfile, platformSettings, branding, onLogout }) => {
    const availablePlans = useMemo(() => ({ ...PLANS, ...plans }), [plans]);
    const currentPlan = availablePlans[user.plan] || PLANS[user.plan];

    // ROLE CHECKS
    const isAdmin = user.plan === 'admin_master';
    const isAgency = user.plan === 'agency' || isAdmin;

    // FIXED: Only count sites that belong to the current user for usage limits (Admin has Infinity)
    const userSites = useMemo(() => sites.filter(s => s.userId === user.id), [sites, user.id]);
    const usageCount = userSites.length;

    const isLimitReached = usageCount >= currentPlan.maxPages;
    const usagePercentage = Math.min((usageCount / (currentPlan.maxPages === Infinity ? 100 : currentPlan.maxPages)) * 100, 100);

    // Client Limits
    const clientUsageCount = clients.length;
    const isClientLimitReached = clientUsageCount >= currentPlan.maxClients;

    // Upgrade Modal State
    const [showPlansModal, setShowPlansModal] = useState(false);
    const [upgradeTarget, setUpgradeTarget] = useState<UserPlan | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Agency Mode State
    // Default to 'dashboard' if Agency/Admin so they see stats immediately. 'sites' for users.
    const [dashboardTab, setDashboardTab] = useState<'dashboard' | 'sites' | 'clients' | 'invites' | 'finance'>(isAgency ? 'dashboard' : 'sites');
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<MiniSiteTemplate | null>(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [profileTab, setProfileTab] = useState<'identity' | 'avatar' | 'integration' | 'security'>('integration');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const avatarFileInputRef = React.useRef<HTMLInputElement>(null);
    const [templateSearch, setTemplateSearch] = useState('');
    const [templateCategory, setTemplateCategory] = useState('all');
    const [templateSiteId, setTemplateSiteId] = useState<string | null>(null);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [templateForm, setTemplateForm] = useState({
        name: '',
        niche: '',
        category: 'Biblioteca RS',
        description: '',
        makePublic: true
    });

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        name: user.name,
        cpf: user.cpf || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
        mercadoPagoPublicKey: user.mercadoPagoPublicKey || platformSettings?.mpPublicKey || '',
        mercadoPagoAccessToken: user.mercadoPagoAccessToken || platformSettings?.mpAccessToken || '',
        address: {
            street: user.address?.street || '',
            number: user.address?.number || '',
            neighborhood: user.address?.neighborhood || '',
            city: user.address?.city || '',
            state: user.address?.state || '',
            zip: user.address?.zip || ''
        },
        referralLink: user.referralLink || '',
        consultantId: user.consultantId || '',
        idNumerico: user.idNumerico || 1
    });

    const [isSyncing, setIsSyncing] = useState(false);
    const [isZipLoading, setIsZipLoading] = useState(false);
    const dashboardLogo = branding?.logo || '/logo-rs.png';
    const dashboardBrandName = branding?.companyName || 'RS Prólipsi';
    const buildEcosystemUrl = (port: number, withSso = false) => {
        const baseUrl = `http://${window.location.hostname}:${port}`;
        const token = localStorage.getItem('rs-minisite-sso-token') || '';

        if (!withSso || !token) {
            return baseUrl;
        }

        const payload = {
            autoLogin: true,
            source: 'minisite',
            token,
        };

        const encodedPayload = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
        return `${baseUrl}/#/sso?token=${encodeURIComponent(encodedPayload)}`;
    };
    const consultorOfficeUrl = buildEcosystemUrl(3002, true);
    const marketplaceUrl = buildEcosystemUrl(3003, false);
    const inviteSponsorRef = String(profileForm.consultantId || user.consultantId || user.referralCode || 'rsprolipsi').trim().toLowerCase();
    const sharedReferralLink = buildMiniSiteSignupUrl(inviteSponsorRef || 'rsprolipsi');

    const handleZipCodeBlur = async () => {
        const zip = profileForm.address.zip.replace(/\D/g, '');
        if (zip.length !== 8) return;

        setIsZipLoading(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setProfileForm(prev => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        street: data.logradouro || prev.address.street,
                        neighborhood: data.bairro || prev.address.neighborhood,
                        city: data.localidade || prev.address.city,
                        state: data.uf || prev.address.state
                    }
                }));
            }
        } catch (error) {
            console.error("ViaCEP Error:", error);
        } finally {
            setIsZipLoading(false);
        }
    };

    // Update form when user prop changes (e.g. after a save)
    useEffect(() => {
        setProfileForm({
            name: user.name,
            cpf: user.cpf || '',
            phone: user.phone || '',
            avatarUrl: user.avatarUrl || '',
            mercadoPagoPublicKey: user.mercadoPagoPublicKey || platformSettings?.mpPublicKey || '',
            mercadoPagoAccessToken: user.mercadoPagoAccessToken || platformSettings?.mpAccessToken || '',
            address: {
                street: user.address?.street || '',
                number: user.address?.number || '',
                neighborhood: user.address?.neighborhood || '',
                city: user.address?.city || '',
                state: user.address?.state || '',
                zip: user.address?.zip || ''
            },
            referralLink: user.referralLink || '',
            consultantId: user.consultantId || '',
            idNumerico: user.idNumerico || 1
        });
    }, [user, platformSettings?.mpAccessToken, platformSettings?.mpPublicKey]);

    const handleSyncProlipsi = async () => {
        if (!onSyncProfile) return;

        setIsSyncing(true);
        try {
            const globalData = await onSyncProfile();
            if (globalData) {
                setProfileForm(prev => ({
                    ...prev,
                    ...globalData,
                    // Preserve address fields if global one is partially provided
                    address: globalData.address ? { ...prev.address, ...globalData.address } : prev.address
                }));
                alert("Dados sincronizados com o Sistema Global RS Prólipsi!");

                // Log action
                if (onLog) onLog('sync_profile', 'Sincronização RS Prólipsi');
            } else {
                alert("Não foi possível encontrar dados globais correspondentes ao seu e-mail.");
            }
        } catch (e) {
            console.error(e);
            alert("Erro na sincronização.");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = loadEvent => {
            if (loadEvent.target?.result) {
                setProfileForm(prev => ({
                    ...prev,
                    avatarUrl: loadEvent.target?.result as string
                }));
            }
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const handleSaveProfile = async () => {
        if (!onUpdateUser) return;

        setIsSavingProfile(true);
        try {
            const saved = await Promise.resolve(onUpdateUser(profileForm));
            if (saved === false) {
                alert("Não foi possível salvar o perfil.");
                return;
            }
            alert("Perfil atualizado com sucesso!");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleLogoutClick = async () => {
        setIsUserMenuOpen(false);
        await onLogout?.();
    };

    const handleOpenExternal = (url: string) => {
        setIsUserMenuOpen(false);
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Analytics State
    const [analyticsPeriod, setAnalyticsPeriod] = useState<'7d' | '30d' | '90d'>('30d');

    // Client List Filtering & Sorting State
    const [clientSearch, setClientSearch] = useState('');
    const [clientFilterStatus, setClientFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [clientSort, setClientSort] = useState<'recent' | 'name'>('recent');

    // Invitation / Referral State
    const [linkCopied, setLinkCopied] = useState(false);

    // PWA Install State
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallApp = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    // CRM Form State
    const initialClientState = {
        name: '',
        email: '',
        cpf: '',
        phone: '',
        birthDate: '',
        address: {
            line: '',
            number: '',
            city: '',
            state: '',
            zip: ''
        },
        notes: '',
        status: 'active' as 'active' | 'inactive',
        monthlyFee: 0 // New field
    };
    const [clientForm, setClientForm] = useState(initialClientState);
    const [editingClientId, setEditingClientId] = useState<string | null>(null);

    // Payment Form State
    const initialPaymentState = {
        clientId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        status: 'paid' as PaymentStatus,
        method: 'pix' as PaymentMethod,
        notes: ''
    };
    const [paymentForm, setPaymentForm] = useState(initialPaymentState);

    const handlePlanSelect = (targetPlan: UserPlan) => {
        // If selecting current plan, do nothing
        if (targetPlan === user.plan) return;

        // If downgrading to free, just confirm
        if (targetPlan === 'free') {
            if (window.confirm('Tem certeza que deseja voltar para o plano Grátis? Seus sites extras podem ficar indisponíveis.')) {
                onUpdatePlan('free');
                if (onLog) onLog('change_plan', 'Downgrade para Free');
                setShowPlansModal(false);
            }
            return;
        }

        // If upgrading (Pro or Agency), open Checkout Form
        setUpgradeTarget(targetPlan);
        setShowPlansModal(false);
        setIsCheckoutOpen(true);
    };

    const handleConfirmPayment = async () => {
        if (!upgradeTarget) return;

        setIsProcessing(true);

        try {
            console.log("[Dashboard] Initializing real payment for:", upgradeTarget);
            const { data, error } = await supabase.functions.invoke('mercado-pago-payment', {
                body: {
                    planId: upgradeTarget,
                    userId: user.id,
                    origin: window.location.origin
                }
            });

            if (error) throw error;

            if (data?.init_point) {
                console.log("[Dashboard] Redirecting to checkout:", data.init_point);
                window.location.href = data.init_point;
            } else {
                throw new Error('Link de pagamento não gerado pela função.');
            }
        } catch (err: any) {
            console.error("[Dashboard] Payment initialization error:", err);
            alert("Erro ao processar pagamento: " + (err.message || "Tente novamente mais tarde."));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCreateClick = () => {
        if (isLimitReached) {
            // If limit reached, force open the Plans Modal
            setShowPlansModal(true);
        } else {
            // If in agency mode and inside a client view, create for that client
            if (selectedClientId) {
                onCreateNew(selectedClientId);
            } else {
                // Default creates for the agency owner
                onCreateNew();
            }
        }
    };

    const handleMiniSitePlanPayment = async (checkoutData?: any) => {
        if (!upgradeTarget) return;

        setIsProcessing(true);

        try {
            const selectedPlan = availablePlans[upgradeTarget] || PLANS[upgradeTarget];
            const buyer = {
                name: checkoutData?.name || user.name || '',
                email: checkoutData?.email || user.email || '',
                cpf: checkoutData?.cpf || user.cpf || '',
                phone: checkoutData?.phone || user.phone || '',
                birthDate: checkoutData?.birthDate || '',
                zip: checkoutData?.zip || '',
                street: checkoutData?.street || '',
                number: checkoutData?.number || '',
                neighborhood: checkoutData?.neighborhood || '',
                city: checkoutData?.city || '',
                state: checkoutData?.state || ''
            };

            const response = await fetch(`${MINISITE_API_ORIGIN}/api/payment/minisite-plan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    planId: upgradeTarget,
                    userId: user.id,
                    publicOrigin: `http://${window.location.hostname}:3030`,
                    buyer,
                    planSnapshot: {
                        id: selectedPlan?.id || upgradeTarget,
                        name: selectedPlan?.name || upgradeTarget,
                        price: selectedPlan?.price || ''
                    }
                })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data?.detail || data?.error || 'Nao foi possivel gerar o checkout do plano.');
            }

            if (!data?.init_point) {
                throw new Error('Link de pagamento nao gerado pela API.');
            }

            window.location.href = data.init_point;
        } catch (err: any) {
            console.error('[Dashboard] Real payment initialization error:', err);
            alert('Erro ao processar pagamento: ' + (err.message || 'Tente novamente mais tarde.'));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOpenTemplateLibrary = () => {
        setTemplateSearch('');
        setTemplateCategory('all');
        setIsTemplateModalOpen(true);
    };

    const handleUseTemplate = async (template: MiniSiteTemplate) => {
        if (!onCreateFromTemplate) return;

        const created = await Promise.resolve(onCreateFromTemplate(template, selectedClientId || undefined));
        if (created === false) return;
        setIsTemplateModalOpen(false);
        setPreviewTemplate(null);
    };

    const handlePreviewTemplate = (template: MiniSiteTemplate) => {
        setPreviewTemplate(template);
    };

    const handleOpenSaveTemplateModal = (site: BioSite) => {
        setTemplateSiteId(site.id);
        setTemplateForm({
            name: `${site.name} - Modelo`,
            niche: 'Template personalizado',
            category: 'Biblioteca RS',
            description: `Modelo criado a partir do MiniSite ${site.name}.`,
            makePublic: true
        });
        setIsSaveTemplateModalOpen(true);
    };

    const handleSaveCurrentSiteAsTemplate = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!onSaveSiteAsTemplate || !templateSiteId) return;

        setIsSavingTemplate(true);
        try {
            const saved = await Promise.resolve(onSaveSiteAsTemplate(templateSiteId, templateForm));
            if (saved === false) {
                alert('Nao foi possivel salvar o template.');
                return;
            }

            alert('Template salvo na biblioteca com sucesso!');
            setIsSaveTemplateModalOpen(false);
        } finally {
            setIsSavingTemplate(false);
        }
    };

    const handleAddClientClick = () => {
        if (isClientLimitReached) {
            alert(`Limite de clientes atingido (${currentPlan.maxClients}). Por favor, entre em contato com o suporte para aumentar seu limite.`);
            return;
        }
        setEditingClientId(null);
        setClientForm(initialClientState);
        setIsClientModalOpen(true);
    };

    const handleAddPaymentClick = () => {
        setPaymentForm(initialPaymentState);
        setIsPaymentModalOpen(true);
    };

    const handleEditClientClick = (client: AgencyClient) => {
        setEditingClientId(client.id);
        setClientForm({
            name: client.name,
            email: client.email,
            cpf: client.cpf || '',
            phone: client.phone || '',
            birthDate: client.birthDate || '',
            address: {
                line: client.address?.line || '',
                number: client.address?.number || '',
                city: client.address?.city || '',
                state: client.address?.state || '',
                zip: client.address?.zip || ''
            },
            notes: client.notes || '',
            status: client.status,
            monthlyFee: client.monthlyFee || 0
        });
        setIsClientModalOpen(true);
    };

    const handleSaveClient = (e: React.FormEvent) => {
        e.preventDefault();

        // Validação do valor mínimo
        if (clientForm.monthlyFee < 5) {
            alert("O valor mínimo da mensalidade deve ser R$ 5,00.");
            return;
        }

        if (editingClientId && onUpdateClient) {
            // Update Mode
            const existingClient = clients.find(c => c.id === editingClientId);
            if (existingClient) {
                onUpdateClient({
                    ...existingClient,
                    ...clientForm
                });
            }
        } else if (onAddClient) {
            // Create Mode
            onAddClient(clientForm);
        }

        setIsClientModalOpen(false);
        setClientForm(initialClientState);
        setEditingClientId(null);
    };

    const handleSavePayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentForm.clientId) {
            alert("Selecione um cliente.");
            return;
        }
        if (onAddPayment) {
            onAddPayment({
                clientId: paymentForm.clientId,
                amount: parseFloat(paymentForm.amount),
                date: new Date(paymentForm.date),
                dueDate: new Date(paymentForm.dueDate),
                status: paymentForm.status,
                method: paymentForm.method,
                notes: paymentForm.notes
            });
        }
        setIsPaymentModalOpen(false);
        setPaymentForm(initialPaymentState);
    };

    const handleCopyInviteLink = () => {
        navigator.clipboard.writeText(sharedReferralLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const handleDeleteSiteClick = async (site: BioSite) => {
        if (!onDeleteSite) return;

        const confirmed = window.confirm(`Excluir o MiniSite "${site.name}"? Isso remove apenas da galeria do consultor. O template da biblioteca continua salvo. Esta acao nao pode ser desfeita.`);
        if (!confirmed) return;

        const deleted = await Promise.resolve(onDeleteSite(site.id));
        if (deleted === false) {
            alert('Nao foi possivel excluir este MiniSite.');
        }
    };

    // Filter sites based on view (My Sites vs Client Sites vs All)
    const displayedSites = useMemo(() => {
        // 1. Specific Client Selected (Drill Down)
        // Show only sites linked to this client
        if (selectedClientId) {
            return sites.filter(s => s.clientId === selectedClientId);
        }

        // 2. Admin View Logic (Global)
        if (isAdmin) {
            // Dashboard Tab: Return ALL sites in the system for overview
            if (dashboardTab === 'dashboard' || dashboardTab === 'sites') {
                return sites;
            }
            // Other tabs logic handled elsewhere or returns filtered view
            return [];
        }

        // 3. Agency View Logic
        if (user.plan === 'agency') {
            // Dashboard Tab: Return ALL sites owned by Agency User (Global Stats for Agency)
            if (dashboardTab === 'dashboard') {
                return sites.filter(s => s.userId === user.id);
            }

            // My Sites Tab: Return ONLY Owner sites that are NOT linked to a client
            if (dashboardTab === 'sites') {
                return sites.filter(s => s.userId === user.id && !s.clientId);
            }

            // Clients, Invites, Finance Tabs: List handled separately
            return [];
        }

        // 4. Default (Free/Pro): Only user's own sites
        return sites.filter(s => s.userId === user.id);
    }, [sites, selectedClientId, user.id, user.plan, dashboardTab, clients, isAdmin]);

    // Filtered Clients Logic
    const filteredClients = useMemo(() => {
        let result = [...clients]; // Admin sees all clients passed in props (which ideally contains all system clients in this architecture)

        // 1. Search (Name, Email, Phone, CPF)
        if (clientSearch.trim()) {
            const lowerTerm = clientSearch.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(lowerTerm) ||
                c.email.toLowerCase().includes(lowerTerm) ||
                (c.phone && c.phone.includes(lowerTerm)) ||
                (c.cpf && c.cpf.includes(lowerTerm))
            );
        }

        // 2. Filter by Status
        if (clientFilterStatus !== 'all') {
            result = result.filter(c => c.status === clientFilterStatus);
        }

        // 3. Sort
        result.sort((a, b) => {
            if (clientSort === 'name') {
                return a.name.localeCompare(b.name);
            }
            // Default: Recent (createdAt desc)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return result;
    }, [clients, clientSearch, clientFilterStatus, clientSort]);

    const templateCategories = useMemo(() => {
        const categories = Array.from(new Set(templates.map(template => template.category).filter(Boolean)));
        return ['all', ...categories];
    }, [templates]);

    const filteredTemplates = useMemo(() => {
        return templates.filter(template => {
            const matchesCategory = templateCategory === 'all' || template.category === templateCategory;
            const haystack = `${template.name} ${template.niche} ${template.category} ${template.description}`.toLowerCase();
            const matchesSearch = haystack.includes(templateSearch.trim().toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [templates, templateCategory, templateSearch]);

    const previewTemplateCollection = useMemo(() => {
        if (!previewTemplate) return filteredTemplates;
        if (filteredTemplates.some(template => template.id === previewTemplate.id)) {
            return filteredTemplates;
        }
        return templates;
    }, [filteredTemplates, previewTemplate, templates]);

    const previewTemplateIndex = useMemo(() => {
        if (!previewTemplate) return -1;
        return previewTemplateCollection.findIndex(template => template.id === previewTemplate.id);
    }, [previewTemplate, previewTemplateCollection]);

    const handlePreviewPrevious = () => {
        if (previewTemplateIndex <= 0) return;
        setPreviewTemplate(previewTemplateCollection[previewTemplateIndex - 1]);
    };

    const handlePreviewNext = () => {
        if (previewTemplateIndex < 0 || previewTemplateIndex >= previewTemplateCollection.length - 1) return;
        setPreviewTemplate(previewTemplateCollection[previewTemplateIndex + 1]);
    };


    // ADVANCED ANALYTICS DATA PREPARATION
    const analyticsData = useMemo(() => {
        // If no sites to display, return empty
        if (displayedSites.length === 0) return {
            sortedSites: [],
            topClients: [],
            totalViews: 0,
            totalClicks: 0,
            totalLeads: 0,
            chartData: []
        };

        // 1. Aggregates
        let totalViews = 0;
        let totalClicks = 0;
        let totalLeads = 0; // Simulated: Clicks on 'whatsapp' or 'button' type blocks often indicate leads

        const sitesWithStats = displayedSites.map(site => {
            const siteClicks = site.sections.reduce((acc, sec) => acc + (sec.clicks || 0), 0);
            const siteLeads = site.sections.reduce((acc, sec) => {
                if (sec.type === 'whatsapp' || (sec.type === 'button' && (sec.content.label?.toLowerCase().includes('contato') || sec.content.label?.toLowerCase().includes('agendar')))) {
                    return acc + (sec.clicks || 0);
                }
                return acc;
            }, 0);

            totalViews += site.views;
            totalClicks += siteClicks;
            totalLeads += siteLeads;

            return { ...site, totalClicks, totalLeads };
        });

        // 2. Rankings
        const sortedSites = [...sitesWithStats].sort((a, b) => b.views - a.views).slice(0, 5);

        // Group by Client (for Agency/Admin view)
        const clientStatsMap = new Map<string, { name: string, views: number, clicks: number }>();
        sitesWithStats.forEach(site => {
            if (site.clientId) {
                const client = clients.find(c => c.id === site.clientId);
                if (client) {
                    const current = clientStatsMap.get(client.id) || { name: client.name, views: 0, clicks: 0 };
                    clientStatsMap.set(client.id, {
                        name: client.name,
                        views: current.views + site.views,
                        clicks: current.clicks + site.totalClicks
                    });
                }
            }
        });
        const topClients = Array.from(clientStatsMap.values()).sort((a, b) => b.views - a.views).slice(0, 5);

        // 3. Mock Chart Data (Daily breakdown based on Period)
        const days = analyticsPeriod === '7d' ? 7 : analyticsPeriod === '30d' ? 30 : 90;
        const chartData = [];

        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));

            const base = Math.max(5, Math.floor(totalViews / days));
            const variance = Math.floor(Math.random() * base * 0.5) * (Math.random() > 0.5 ? 1 : -1);
            const value = Math.max(0, base + variance);

            chartData.push({
                date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                value: value
            });
        }

        return { sortedSites, topClients, totalViews, totalClicks, totalLeads, chartData };
    }, [displayedSites, clients, analyticsPeriod]);

    // FINANCE DATA PREPARATION (MVP)
    const financeData = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const activeClients = clients.filter(c => c.status === 'active').length;

        const newClientsMonth = clients.filter(c => {
            const d = new Date(c.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        // Project Monthly Revenue based on client fees
        const projectedRevenue = clients
            .filter(c => c.status === 'active')
            .reduce((acc, curr) => acc + (curr.monthlyFee || 0), 0);

        // MRR Calculation based on actual payments
        const mrr = payments
            .filter(p => {
                const d = new Date(p.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear && p.status === 'paid';
            })
            .reduce((acc, curr) => acc + curr.amount, 0);

        const churnMonth = clients.filter(c => {
            const d = new Date(c.updatedAt || c.createdAt);
            return c.status === 'inactive' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        return {
            activeClients,
            newClientsMonth,
            mrr,
            projectedRevenue,
            churnMonth
        };
    }, [clients, payments]);


    const selectedClient = clients.find(c => c.id === selectedClientId);

    // Helper booleans to control rendering based on Plan + Tab
    const showBanner = !isAgency || (isAgency && dashboardTab === 'dashboard');

    // UI Logic: Distinction between tabs
    const showAnalytics = dashboardTab === 'dashboard';
    const showSiteGrid = (dashboardTab === 'sites') || (isAgency && dashboardTab === 'dashboard') || (selectedClientId !== null);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-rs-black text-gray-900 dark:text-white p-6 md:p-12 transition-colors duration-300 flex flex-col relative">
            <div className="max-w-6xl mx-auto w-full flex-1">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-start shrink-0">
                            <img
                                src={dashboardLogo}
                                alt={dashboardBrandName}
                                className="h-12 w-auto max-w-[180px] object-contain"
                                onError={event => {
                                    event.currentTarget.src = '/logo-rs.png';
                                }}
                            />
                            <span className="pl-1 text-[10px] font-bold uppercase tracking-[0.35em] text-rs-gold/80">MiniSite</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h1 className="text-lg md:text-xl font-serif font-bold text-rs-goldDark dark:text-rs-gold">Painel RS</h1>
                                {isAgency && !isAdmin && (
                                    <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-purple-200 dark:border-purple-800">Painel Agente</span>
                                )}
                                {isAdmin && (
                                    <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-red-200 dark:border-red-800">Admin Master</span>
                                )}
                            </div>
                            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Seu site profissional para bio em minutos.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">

                        {/* Install App Button */}
                        {deferredPrompt && (
                            <button
                                onClick={handleInstallApp}
                                className="p-3 rounded-full bg-rs-goldDark dark:bg-rs-gold text-white dark:text-black hover:opacity-90 transition-colors shadow-lg animate-pulse"
                                title="Instalar App no Computador/Celular"
                            >
                                <Download size={20} />
                            </button>
                        )}

                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(prev => !prev)}
                                className="flex items-center gap-3 rounded-full bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gray px-2 py-2 text-gray-600 dark:text-gray-300 hover:text-rs-goldDark dark:hover:text-rs-gold transition-colors shadow-sm"
                                title="Conta"
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-rs-gold/30 bg-black/30 flex items-center justify-center">
                                    <img
                                        src={user.avatarUrl || dashboardLogo}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                        onError={event => {
                                            event.currentTarget.src = dashboardLogo;
                                        }}
                                    />
                                </div>
                                <div className="hidden md:block text-left pr-2">
                                    <div className="text-xs font-bold uppercase tracking-wide text-gray-900 dark:text-white">{user.name}</div>
                                    <div className="text-[10px] font-mono text-gray-500">{user.consultantId || 'perfil'}</div>
                                </div>
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-gray-200 dark:border-rs-gray bg-white dark:bg-rs-dark shadow-2xl overflow-hidden z-20">
                                    <button
                                        onClick={() => handleOpenExternal(consultorOfficeUrl)}
                                        className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center gap-3"
                                    >
                                        <Briefcase size={16} />
                                        Escritorio RS
                                    </button>
                                    <button
                                        onClick={() => handleOpenExternal(marketplaceUrl)}
                                        className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center gap-3"
                                    >
                                        <ExternalLink size={16} />
                                        Marketplace
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsProfileModalOpen(true);
                                            setIsUserMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center gap-3"
                                    >
                                        <UserCircle size={16} />
                                        Meu Perfil
                                    </button>
                                    <button
                                        onClick={() => {
                                            void handleLogoutClick();
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                                    >
                                        <LogOut size={16} />
                                        Sair
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="p-3 rounded-full bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gray text-gray-600 dark:text-gray-300 hover:text-rs-goldDark dark:hover:text-rs-gold transition-colors shadow-sm"
                            title="Alternar Tema"
                        >
                            {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        {/* ADMIN BUTTON */}
                        {isAdmin && onNavigateToAdmin && (
                            <button
                                onClick={onNavigateToAdmin}
                                className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-lg bg-red-600 hover:bg-red-700 text-white hover:shadow-red-500/20 border-2 border-red-500/50"
                            >
                                <Shield size={20} />
                                Painel Master
                            </button>
                        )}

                        {/* Create Button: Show on Non-Agency OR Agency (Dashboard/Sites tabs only) */}
                        {(!isAgency || (isAgency && dashboardTab !== 'clients' && dashboardTab !== 'invites' && dashboardTab !== 'finance')) && (
                            <>
                                <button
                                    onClick={handleOpenTemplateLibrary}
                                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-lg border border-rs-gold/30 text-rs-gold hover:bg-rs-gold/10"
                                >
                                    <LayoutDashboard size={18} />
                                    Biblioteca de Templates
                                </button>
                                <button
                                    onClick={handleCreateClick}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-lg ${isLimitReached
                                        ? 'bg-gray-800 text-white border border-rs-gold hover:bg-black hover:shadow-rs-gold/40 animate-pulse'
                                        : 'bg-rs-goldDark dark:bg-rs-gold hover:bg-yellow-600 dark:hover:bg-yellow-500 text-white dark:text-black hover:shadow-rs-gold/20'
                                        }`}
                                >
                                    {isLimitReached ? <Crown size={20} className="text-rs-gold" /> : <Plus size={20} />}
                                    {isLimitReached ? 'Upgrade para Criar' : 'Criar Novo MiniSite'}
                                </button>
                            </>
                        )}

                        {/* Show "Add Client" button if in Client tab or Client List View */}
                        {isAgency && dashboardTab === 'clients' && !selectedClientId && (
                            <button
                                onClick={handleAddClientClick}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-lg ${isClientLimitReached
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-rs-goldDark dark:bg-rs-gold hover:bg-yellow-600 dark:hover:bg-yellow-500 text-white dark:text-black hover:shadow-rs-gold/20'
                                    }`}
                            >
                                <UserPlus size={20} />
                                Novo Cliente
                            </button>
                        )}

                        {/* Show "New Payment" button if in Finance tab */}
                        {isAgency && dashboardTab === 'finance' && (
                            <button
                                onClick={handleAddPaymentClick}
                                className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-lg bg-green-600 hover:bg-green-700 text-white hover:shadow-green-500/20"
                            >
                                <Plus size={20} />
                                Novo Pagamento
                            </button>
                        )}
                    </div>
                </header>

                {/* Navigation Tabs - Visible for ALL plans now */}
                <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-rs-gray justify-start items-center overflow-x-auto">
                    <button
                        onClick={() => { setDashboardTab('dashboard'); setSelectedClientId(null); }}
                        className={`pb-4 px-4 font-bold text-[13px] transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${dashboardTab === 'dashboard'
                            ? 'text-rs-goldDark dark:text-rs-gold border-rs-goldDark dark:border-rs-gold'
                            : 'text-gray-500 border-transparent hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <LayoutDashboard size={18} />
                        Dashboard
                    </button>
                    <button
                        onClick={() => { setDashboardTab('sites'); setSelectedClientId(null); }}
                        className={`pb-4 px-4 font-bold text-[13px] transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${dashboardTab === 'sites' && !selectedClientId
                            ? 'text-rs-goldDark dark:text-rs-gold border-rs-goldDark dark:border-rs-gold'
                            : 'text-gray-500 border-transparent hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <Briefcase size={18} />
                        {isAdmin ? 'Todos os Sites' : 'Meus Sites'}
                    </button>

                    {/* Agente-specific tabs hidden for standard users */}
                    {isAgency && (
                        <>
                            <button
                                onClick={() => { setDashboardTab('clients'); setSelectedClientId(null); }}
                                className={`pb-4 px-4 font-bold text-[13px] transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${dashboardTab === 'clients' || selectedClientId
                                    ? 'text-rs-goldDark dark:text-rs-gold border-rs-goldDark dark:border-rs-gold'
                                    : 'text-gray-500 border-transparent hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <Users size={18} />
                                {isAdmin ? 'Agências e Clientes' : 'Clientes'}
                            </button>
                            <button
                                onClick={() => { setDashboardTab('invites'); setSelectedClientId(null); }}
                                className={`pb-4 px-4 font-bold text-[13px] transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${dashboardTab === 'invites'
                                    ? 'text-rs-goldDark dark:text-rs-gold border-rs-goldDark dark:border-rs-gold'
                                    : 'text-gray-500 border-transparent hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <Ticket size={18} />
                                Convites
                            </button>
                            <button
                                onClick={() => { setDashboardTab('finance'); setSelectedClientId(null); }}
                                className={`pb-4 px-4 font-bold text-[13px] transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${dashboardTab === 'finance'
                                    ? 'text-rs-goldDark dark:text-rs-gold border-rs-goldDark dark:border-rs-gold'
                                    : 'text-gray-500 border-transparent hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <DollarSign size={18} />
                                Financeiro
                            </button>
                        </>
                    )}
                </div>

                {/* PLAN SELECTION / BANNER SECTION - Refined design */}
                {!isAdmin && !isAgency && (
                    <div className="mb-8 p-5 bg-gradient-to-r from-gray-900 to-black rounded-xl text-white relative overflow-hidden border border-rs-gold/20 shadow-xl animate-fade-in group">
                        <div className="absolute inset-0 bg-rs-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-rs-gold/10 flex items-center justify-center text-rs-gold shrink-0 border border-rs-gold/20">
                                    <Crown size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                                        Libere o Plano Agente
                                        <span className="text-[10px] bg-rs-gold/10 text-rs-gold px-2 py-0.5 rounded border border-rs-gold/20 font-sans uppercase tracking-widest">Recomendado</span>
                                    </h2>
                                    <p className="text-gray-400 text-xs mt-1 max-w-lg">
                                        Assuma o controle total: remova marca d'água, crie sites ilimitados e gerencie clientes do ecossistema.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowPlansModal(true)}
                                className="whitespace-nowrap bg-rs-gold hover:bg-rs-goldDark text-black font-bold py-2.5 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg text-sm flex items-center gap-2 active:scale-95"
                            >
                                <Target size={18} />
                                Começar Agora
                            </button>
                        </div>
                    </div>
                )}

                {/* Analytics Section (Visible on Dashboard Tab) */}
                {showAnalytics && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
                        <div className="bg-white dark:bg-rs-dark p-6 rounded-xl border border-gray-200 dark:border-rs-gray shadow-sm hover:shadow-md transition-shadow group/card">
                            <div className="flex justify-between items-start mb-2 text-rs-gold group-hover/card:scale-110 transition-transform">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Visualizações</p>
                                <BarChart3 size={18} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.totalViews.toLocaleString()}</h3>
                            <p className="text-[10px] text-green-500 mt-1 flex items-center gap-1"><TrendingUp size={10} /> +12% vs mês anterior</p>
                        </div>
                        <div className="bg-white dark:bg-rs-dark p-6 rounded-xl border border-gray-200 dark:border-rs-gray shadow-sm hover:shadow-md transition-shadow group/card">
                            <div className="flex justify-between items-start mb-2 text-blue-500 group-hover/card:scale-110 transition-transform">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Cliques Totais</p>
                                <MousePointer2 size={18} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.totalClicks.toLocaleString()}</h3>
                            <p className="text-[10px] text-gray-400 mt-1">Interações nos botões</p>
                        </div>
                        <div className="bg-white dark:bg-rs-dark p-6 rounded-xl border border-gray-200 dark:border-rs-gray shadow-sm hover:shadow-md transition-shadow group/card">
                            <div className="flex justify-between items-start mb-2 text-green-500 group-hover/card:scale-110 transition-transform">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Leads (WhatsApp)</p>
                                <MessageCircle size={18} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.totalLeads.toLocaleString()}</h3>
                            <p className="text-[10px] text-gray-400 mt-1">Cliques em contato</p>
                        </div>
                        <div className="bg-white dark:bg-rs-dark p-6 rounded-xl border border-gray-200 dark:border-rs-gray shadow-sm flex flex-col justify-center items-center text-center">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Seu Plano</p>
                            <span className="text-lg font-bold text-rs-goldDark dark:text-rs-gold">{currentPlan.name}</span>
                            <button onClick={() => setShowPlansModal(true)} className="text-[10px] text-gray-400 hover:text-white underline mt-1">Gerenciar Assinatura</button>
                        </div>
                    </div>
                )}

                {/* Sites Grid (Visible for standard users OR if Agency is on 'sites' tab) */}
                {showSiteGrid && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
                                    {selectedClientId ? `Sites de ${selectedClient?.name}` : 'Meus MiniSites'}
                                </h2>
                                <p className="text-sm text-gray-500">Gerencie suas páginas e acompanhe resultados.</p>
                            </div>
                            {!isAgency && (
                                <div className="text-right">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Uso do Plano</span>
                                    <div className="w-32 h-2 bg-gray-200 dark:bg-rs-gray rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-rs-gold" style={{ width: `${usagePercentage}%` }}></div>
                                    </div>
                                    <span className="text-[10px] text-gray-400">{usageCount} de {currentPlan.maxPages === Infinity ? 'Ilimitado' : currentPlan.maxPages} sites</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Create New Card */}
                            <button
                                onClick={handleCreateClick}
                                className="group relative h-64 rounded-2xl border-2 border-dashed border-gray-300 dark:border-rs-gray hover:border-rs-goldDark dark:hover:border-rs-gold bg-gray-50 dark:bg-transparent flex flex-col items-center justify-center gap-4 transition-all hover:bg-rs-gold/5"
                            >
                                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-rs-gray flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-500 group-hover:bg-rs-gold group-hover:text-black text-gray-400 shadow-inner">
                                    {isLimitReached ? <Crown size={32} /> : <Plus size={32} />}
                                </div>
                                <div className="text-center group-hover:translate-y-[-4px] transition-transform duration-300">
                                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-rs-goldDark dark:group-hover:text-rs-gold transition-colors">Criar Novo MiniSite</h3>
                                    <p className="text-xs text-gray-500 px-8 mt-1">
                                        {isLimitReached ? 'Limite atingido. Faça upgrade.' : 'Comece do zero ou use um template.'}
                                    </p>
                                </div>
                            </button>

                            <button
                                onClick={handleOpenTemplateLibrary}
                                className="group relative h-64 rounded-2xl border border-rs-gold/30 bg-gradient-to-br from-rs-gold/10 via-transparent to-transparent overflow-hidden flex flex-col items-start justify-between p-6 text-left transition-all hover:border-rs-gold hover:shadow-xl hover:shadow-rs-gold/10"
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-rs-gold/10 via-transparent to-rs-gold/5" />
                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-rs-gold/15 border border-rs-gold/30 text-rs-gold flex items-center justify-center mb-4">
                                        <LayoutDashboard size={28} />
                                    </div>
                                    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-rs-gold/80">
                                        <FileText size={12} />
                                        Templates prontos
                                    </span>
                                    <h3 className="mt-3 font-bold text-xl text-gray-900 dark:text-white">Usar Template RS</h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                                        Escolha entre modelos prontos de varios nichos e comece com o site praticamente montado.
                                    </p>
                                </div>
                                <div className="relative z-10 w-full flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Biblioteca ativa</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{templates.length} modelos disponiveis</p>
                                    </div>
                                    <span className="inline-flex items-center gap-2 text-xs font-bold text-rs-gold">
                                        Explorar
                                        <ChevronRight size={16} />
                                    </span>
                                </div>
                            </button>

                            {/* Existing Sites */}
                            {displayedSites.map((site) => (
                                <div key={site.id} className="group bg-white dark:bg-rs-dark rounded-2xl border border-gray-200 dark:border-rs-gray overflow-hidden hover:shadow-xl hover:border-rs-gold/50 transition-all duration-300 relative">
                                    {/* Card Header/Preview */}
                                    <div className="h-32 bg-gray-100 dark:bg-black/50 relative overflow-hidden group-hover:h-36 transition-all duration-300">
                                        {/* Mockup Preview Background */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-50 blur-sm scale-110">
                                            <div className="w-full h-full bg-gradient-to-tr from-gray-200 via-gray-300 to-gray-200 dark:from-rs-gray dark:via-black dark:to-rs-gray"></div>
                                        </div>

                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase backdrop-blur-md ${site.isPublished ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                                                {site.isPublished ? 'Online' : 'Rascunho'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 relative">
                                        {/* Overlapping Avatar */}
                                        <div className="absolute -top-8 left-6 w-16 h-16 rounded-full border-4 border-white dark:border-rs-dark bg-black flex items-center justify-center text-rs-gold font-serif font-bold text-xl shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                                            {site.name.charAt(0)}
                                        </div>

                                        <div className="mt-8">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{site.name}</h3>
                                            <a href={`/${site.slug}`} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-rs-goldDark dark:hover:text-rs-gold transition-colors flex items-center gap-1 mb-4">
                                                bio.rs/{site.slug} <ExternalLink size={10} />
                                            </a>

                                            <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100 dark:border-rs-gray">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Visualizações</p>
                                                    <p className="font-mono font-bold text-gray-800 dark:text-gray-200">{site.views}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Cliques</p>
                                                    <p className="font-mono font-bold text-gray-800 dark:text-gray-200">
                                                        {site.sections.reduce((acc, sec) => acc + (sec.clicks || 0), 0)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => onEdit(site)}
                                                    className="flex-1 bg-rs-goldDark dark:bg-rs-gold hover:bg-yellow-600 dark:hover:bg-yellow-500 text-white dark:text-black py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Edit3 size={16} /> Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSiteClick(site)}
                                                    className="px-3 border border-red-500/30 hover:border-red-500 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                                    title="Excluir MiniSite"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenSaveTemplateModal(site)}
                                                    className="px-3 border border-rs-gold/30 hover:border-rs-gold rounded-lg text-rs-gold hover:bg-rs-gold/10 transition-colors"
                                                    title="Salvar como template"
                                                >
                                                    <Save size={18} />
                                                </button>
                                                <button
                                                    onClick={() => onView(site.slug)}
                                                    className="px-3 border border-gray-300 dark:border-rs-gray hover:border-rs-goldDark dark:hover:border-rs-gold rounded-lg text-gray-500 hover:text-rs-goldDark dark:hover:text-rs-gold transition-colors"
                                                    title="Visualizar"
                                                >
                                                    <Smartphone size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CLIENTS TAB - AGENTE */}
                {isAgency && dashboardTab === 'clients' && !selectedClientId && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-rs-dark p-4 rounded-xl border border-gray-200 dark:border-rs-gray shadow-sm">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar cliente por nome, email ou CPF..."
                                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-rs-gray rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-rs-gold"
                                    value={clientSearch}
                                    onChange={(e) => setClientSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <select
                                    className="bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-rs-gray rounded-lg px-3 py-2 text-sm outline-none"
                                    value={clientFilterStatus}
                                    onChange={(e) => setClientFilterStatus(e.target.value as any)}
                                >
                                    <option value="all">Todos os Status</option>
                                    <option value="active">Ativos</option>
                                    <option value="inactive">Inativos</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredClients.map(client => (
                                <div key={client.id} className="bg-white dark:bg-rs-dark rounded-2xl border border-gray-200 dark:border-rs-gray overflow-hidden hover:shadow-lg transition-all">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-full bg-rs-gold/10 flex items-center justify-center text-rs-gold font-bold text-xl">
                                                {client.name.charAt(0)}
                                            </div>
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${client.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-400'}`}>
                                                {client.status === 'active' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{client.name}</h3>
                                        <p className="text-sm text-gray-500 mb-4">{client.email}</p>

                                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100 dark:border-rs-gray">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Sites</p>
                                                <p className="font-bold text-gray-800 dark:text-gray-200">{sites.filter(s => s.clientId === client.id).length}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Mensalidade</p>
                                                <p className="font-bold text-green-500">R$ {client.monthlyFee?.toFixed(2) || '0.00'}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => setSelectedClientId(client.id)}
                                                className="flex-1 bg-gray-100 dark:bg-rs-gray hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2"
                                            >
                                                <LayoutDashboard size={14} /> Ver Sites
                                            </button>
                                            <button
                                                onClick={() => handleEditClientClick(client)}
                                                className="px-3 border border-gray-300 dark:border-rs-gray hover:border-rs-gold rounded-lg text-gray-500 hover:text-rs-gold transition-colors"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredClients.length === 0 && (
                                <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-black/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-rs-gray">
                                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-400">Nenhum cliente encontrado</h3>
                                    <p className="text-sm text-gray-500">Adicione seu primeiro cliente para começar a faturar.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* INVITES TAB - AGENTE */}
                {isAgency && dashboardTab === 'invites' && (
                    <div className="max-w-4xl mx-auto animate-fade-in">
                        <div className="bg-gradient-to-br from-rs-gold/20 via-transparent to-transparent border border-rs-gold/30 rounded-3xl p-8 md:p-12 relative overflow-hidden mb-8">
                            <div className="relative z-10">
                                <span className="bg-rs-gold text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">Programa de Experts</span>
                                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-4">Expanda sua Rede Agente</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mb-8">
                                    Convide novos consultores para a plataforma. Quando eles assinam um plano através do seu link, você fortalece o ecossistema RS Prólipsi e ganha reconhecimento.
                                </p>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 bg-white dark:bg-rs-dark border border-rs-gold/50 rounded-2xl p-4 flex items-center justify-between shadow-xl">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <Link className="text-rs-gold shrink-0" size={20} />
                                            <span className="text-sm font-mono text-gray-500 truncate">{sharedReferralLink}</span>
                                        </div>
                                        <button
                                            onClick={handleCopyInviteLink}
                                            className="ml-4 bg-rs-gold hover:bg-rs-goldDark text-black px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap active:scale-95"
                                        >
                                            {linkCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                            {linkCopied ? 'Copiado!' : 'Copiar Link'}
                                        </button>
                                    </div>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2">
                                        <Share2 size={20} /> Compartilhar
                                    </button>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                                <Ticket size={240} className="transform rotate-12" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-rs-dark p-6 rounded-2xl border border-gray-200 dark:border-rs-gray shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-rs-gold/10 flex items-center justify-center text-rs-gold shrink-0">
                                    <Users size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Métricas de convites</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Esta aba agora exibe apenas o link real de indicação. Não estou mais mostrando números fictícios.
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Quando a coleta real de cliques, cadastros e conversões estiver ligada no backend, essas métricas entram aqui automaticamente.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FINANCE TAB CONTENT - AGENTE */}
                {isAgency && dashboardTab === 'finance' && !selectedClientId && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Financial KPIs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-rs-dark p-6 rounded-xl border border-gray-200 dark:border-rs-gray shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Receita Bruta (Projetada)</p>
                                    <DollarSign size={18} className="text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    R$ {financeData.projectedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </h3>
                                <p className="text-[10px] text-gray-400 mt-1">Soma das mensalidades cadastradas.</p>
                            </div>
                            <div className="bg-white dark:bg-rs-dark p-6 rounded-xl border border-gray-200 dark:border-rs-gray shadow-sm border-l-4 border-l-red-500">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Taxa da Plataforma (10%)</p>
                                    <Percent size={18} className="text-red-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    R$ {(financeData.projectedRevenue * 0.10).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </h3>
                                <p className="text-[10px] text-gray-400 mt-1">Custo operacional.</p>
                            </div>
                            <div className="bg-white dark:bg-rs-dark p-6 rounded-xl border border-gray-200 dark:border-rs-gray shadow-sm border-l-4 border-l-green-500">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Lucro Líquido Estimado</p>
                                    <TrendingUp size={18} className="text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    R$ {(financeData.projectedRevenue * 0.90).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </h3>
                                <p className="text-[10px] text-gray-400 mt-1">Seu lucro após taxas.</p>
                            </div>
                            <div className="bg-white dark:bg-rs-dark p-6 rounded-xl border border-gray-200 dark:border-rs-gray shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pagamentos Reais (Mês)</p>
                                    <Wallet size={18} className="text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    R$ {financeData.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </h3>
                                <p className="text-[10px] text-gray-400 mt-1">Confirmados via transações.</p>
                            </div>
                        </div>

                        {/* Transactions List */}
                        <div className="bg-white dark:bg-rs-dark rounded-xl border border-gray-200 dark:border-rs-gray overflow-hidden">
                            <div className="p-4 border-b border-gray-200 dark:border-rs-gray">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Histórico de Transações</h3>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-black/20 text-gray-500 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Data</th>
                                        <th className="p-4">Cliente</th>
                                        <th className="p-4">Descrição</th>
                                        <th className="p-4 text-right">Valor</th>
                                        <th className="p-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {payments.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                            <td className="p-4">{new Date(p.date).toLocaleDateString()}</td>
                                            <td className="p-4 font-bold">{clients.find(c => c.id === p.clientId)?.name || 'Cliente Removido'}</td>
                                            <td className="p-4 text-xs text-gray-500">{p.notes}</td>
                                            <td className="p-4 text-right">R$ {p.amount.toFixed(2)}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {payments.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhuma transação registrada.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- MODALS --- */}

                {/* 1. PLANS SELECTION MODAL (NEW) */}
                {showPlansModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="w-full max-w-4xl bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gold/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-black/20 shrink-0">
                                <div>
                                    <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white">Gerenciar Assinatura</h3>
                                    <p className="text-sm text-gray-500">Escolha o plano ideal para suas necessidades.</p>
                                </div>
                                <button onClick={() => setShowPlansModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {Object.entries(availablePlans).filter(([key]) => key !== 'admin_master').map(([key, plan]) => {
                                        const isCurrent = user.plan === key;
                                        const isHighlighted = key === 'start' || key === 'pro';
                                        return (
                                            <div
                                                key={key}
                                                className={`p-6 rounded-xl border flex flex-col relative transition-all ${isHighlighted ? 'border-rs-gold bg-black/5 dark:bg-black/20 scale-102 shadow-xl z-10' : 'border-gray-200 dark:border-rs-gray bg-white dark:bg-rs-black'
                                                    } ${isCurrent ? 'ring-2 ring-green-500 border-transparent' : ''}`}
                                            >
                                                {key === 'start' && (
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rs-gold text-black text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-md">
                                                        Mais Popular
                                                    </div>
                                                )}

                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-tighter">{plan.name}</h3>
                                                <p className="text-2xl font-bold text-rs-goldDark dark:text-rs-gold mb-6">{plan.price}</p>

                                                <ul className="space-y-3 mb-8 flex-1">
                                                    {plan.features.map((feat, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-[11px] font-medium text-gray-600 dark:text-gray-400">
                                                            <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
                                                            {feat}
                                                        </li>
                                                    ))}
                                                </ul>

                                                <button
                                                    onClick={() => handlePlanSelect(key as UserPlan)}
                                                    disabled={isCurrent}
                                                    className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider text-xs transition-all ${isCurrent
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 cursor-default'
                                                        : isHighlighted
                                                            ? 'bg-rs-gold hover:bg-rs-goldDark text-black shadow-lg hover:shadow-rs-gold/30'
                                                            : 'bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white'
                                                        }`}
                                                >
                                                    {isCurrent ? 'Plano Atual' : key === 'free' ? 'Selecionar' : 'Ativar Agora'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. PAYMENT CONFIRMATION MODAL (NEW) */}
                {upgradeTarget && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
                        <div className="w-full max-w-md bg-white dark:bg-rs-dark border border-rs-gold rounded-xl shadow-2xl overflow-hidden relative">
                            <button onClick={() => setUpgradeTarget(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>

                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-rs-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 text-rs-gold">
                                    <CreditCard size={32} />
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">Confirmar Upgrade</h3>
                                <p className="text-gray-500 mb-6">Você está assinando o plano <span className="font-bold text-white">{(availablePlans[upgradeTarget] || PLANS[upgradeTarget]).name}</span>.</p>

                                <div className="bg-gray-50 dark:bg-black/30 rounded-lg p-4 mb-6 border border-gray-200 dark:border-rs-gray">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-500">Valor Mensal</span>
                                        <span className="font-bold text-lg text-white">{(availablePlans[upgradeTarget] || PLANS[upgradeTarget]).price}</span>
                                    </div>
                                    <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-2" />
                                    <div className="flex items-center gap-2 text-xs text-green-500 justify-center">
                                        <Shield size={12} /> Pagamento 100% Seguro
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleMiniSitePlanPayment()}
                                    disabled={isProcessing}
                                    className="w-full py-3 bg-rs-gold hover:bg-rs-goldDark text-black font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                    {isProcessing ? 'Processando...' : 'Confirmar e Assinar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. CLIENT MODAL (Existing) */}
                {isClientModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="w-full max-w-2xl bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gold/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-black/20 shrink-0">
                                <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white">
                                    {editingClientId ? 'Editar Cliente' : 'Novo Cliente'}
                                </h3>
                                <button onClick={() => setIsClientModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 custom-scrollbar">
                                <form onSubmit={handleSaveClient} className="space-y-6">

                                    {/* NEW FINANCIAL SECTION IN MODAL */}
                                    <div className="bg-rs-gold/10 border border-rs-gold/30 rounded-lg p-4 mb-4">
                                        <h4 className="text-xs font-bold text-rs-goldDark dark:text-rs-gold uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <DollarSign size={14} /> Configuração Financeira
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor da Mensalidade (R$)</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="5"
                                                    step="0.01"
                                                    className="w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold text-lg font-bold"
                                                    value={clientForm.monthlyFee}
                                                    onChange={e => setClientForm({ ...clientForm, monthlyFee: parseFloat(e.target.value) || 0 })}
                                                    placeholder="0.00"
                                                />
                                                <p className="text-[10px] text-gray-400 mt-1">Mínimo R$ 5,00 por cliente.</p>
                                            </div>
                                            <div className="col-span-2 md:col-span-1 flex flex-col justify-center gap-1 text-xs border-l border-gray-300 dark:border-gray-700 pl-4">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Sua Receita (90%):</span>
                                                    <span className="font-bold text-green-500">R$ {(clientForm.monthlyFee * 0.90).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Taxa Plataforma (10%):</span>
                                                    <span className="font-bold text-red-400">R$ {(clientForm.monthlyFee * 0.10).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 1: Basic Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-rs-goldDark dark:text-rs-gold uppercase tracking-widest border-b border-gray-200 dark:border-rs-gray pb-2">Dados Pessoais</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                    value={clientForm.name}
                                                    onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label>
                                                <input
                                                    type="email"
                                                    required
                                                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                    value={clientForm.email}
                                                    onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone / WhatsApp</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                    value={clientForm.phone}
                                                    onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                                                    placeholder="(00) 00000-0000"
                                                />
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CPF</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                    value={clientForm.cpf}
                                                    onChange={e => setClientForm({ ...clientForm, cpf: e.target.value })}
                                                    placeholder="000.000.000-00"
                                                />
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data de Nascimento</label>
                                                <input
                                                    type="date"
                                                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                    value={clientForm.birthDate}
                                                    onChange={e => setClientForm({ ...clientForm, birthDate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Address */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-rs-goldDark dark:text-rs-gold uppercase tracking-widest border-b border-gray-200 dark:border-rs-gray pb-2">Endereço</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="col-span-1">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CEP</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                    value={clientForm.address.zip}
                                                    onChange={e => setClientForm({ ...clientForm, address: { ...clientForm.address, zip: e.target.value } })}
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Logradouro</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                    value={clientForm.address.line}
                                                    onChange={e => setClientForm({ ...clientForm, address: { ...clientForm.address, line: e.target.value } })}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Número</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                    value={clientForm.address.number}
                                                    onChange={e => setClientForm({ ...clientForm, address: { ...clientForm.address, number: e.target.value } })}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cidade</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                    value={clientForm.address.city}
                                                    onChange={e => setClientForm({ ...clientForm, address: { ...clientForm.address, city: e.target.value } })}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estado</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                    value={clientForm.address.state}
                                                    onChange={e => setClientForm({ ...clientForm, address: { ...clientForm.address, state: e.target.value } })}
                                                    placeholder="UF"
                                                    maxLength={2}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Management */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-rs-goldDark dark:text-rs-gold uppercase tracking-widest border-b border-gray-200 dark:border-rs-gray pb-2">Gestão</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                                                <select
                                                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                    value={clientForm.status}
                                                    onChange={e => setClientForm({ ...clientForm, status: e.target.value as 'active' | 'inactive' })}
                                                >
                                                    <option value="active">Ativo</option>
                                                    <option value="inactive">Inativo</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notas Internas</label>
                                                <textarea
                                                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                    rows={3}
                                                    value={clientForm.notes}
                                                    onChange={e => setClientForm({ ...clientForm, notes: e.target.value })}
                                                    placeholder="Informações adicionais sobre este cliente..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setIsClientModalOpen(false)}
                                            className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold text-sm"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-rs-goldDark dark:bg-rs-gold text-black rounded-lg font-bold text-sm hover:opacity-90 flex items-center gap-2"
                                        >
                                            <Save size={16} />
                                            Salvar Cliente
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* ... (Existing Payment Modal) ... */}
                {isPaymentModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="w-full max-w-lg bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gold/30 rounded-xl shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-black/20">
                                <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white">
                                    Nova Transação
                                </h3>
                                <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSavePayment} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cliente</label>
                                    <select
                                        required
                                        className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                        value={paymentForm.clientId}
                                        onChange={e => setPaymentForm({ ...paymentForm, clientId: e.target.value })}
                                    >
                                        <option value="">Selecione um cliente...</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} - {c.email}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor (R$)</label>
                                        <input
                                            type="number"
                                            required
                                            step="0.01"
                                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                            value={paymentForm.amount}
                                            onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                            value={paymentForm.date}
                                            onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Método</label>
                                        <select
                                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                            value={paymentForm.method}
                                            onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value as any })}
                                        >
                                            <option value="pix">Pix</option>
                                            <option value="card">Cartão de Crédito</option>
                                            <option value="boleto">Boleto</option>
                                            <option value="cash">Dinheiro</option>
                                            <option value="transfer">Transferência</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                                        <select
                                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                            value={paymentForm.status}
                                            onChange={e => setPaymentForm({ ...paymentForm, status: e.target.value as any })}
                                        >
                                            <option value="paid">Pago</option>
                                            <option value="pending">Pendente</option>
                                            <option value="overdue">Atrasado</option>
                                            <option value="cancelled">Cancelado</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Observações</label>
                                    <textarea
                                        rows={2}
                                        className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                        value={paymentForm.notes}
                                        onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                        placeholder="Detalhes da transação..."
                                    />
                                </div>

                                <div className="pt-4 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsPaymentModalOpen(false)}
                                        className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg"
                                    >
                                        <Save size={16} />
                                        Registrar Transação
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isTemplateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="w-full max-w-6xl bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gold/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 md:p-8 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 flex flex-col gap-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-rs-gold/80">
                                            <LayoutDashboard size={12} />
                                            Biblioteca de templates
                                        </span>
                                        <h3 className="mt-3 text-2xl md:text-3xl font-serif font-bold text-gray-900 dark:text-white">
                                            Escolha um MiniSite pronto para editar
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                                            Sao modelos prontos da RS e da comunidade. Voce escolhe um nicho, cria o MiniSite com um clique e depois ajusta os detalhes.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsTemplateModalOpen(false)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X size={22} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={templateSearch}
                                            onChange={(e) => setTemplateSearch(e.target.value)}
                                            placeholder="Buscar por nicho, categoria ou nome do template..."
                                            className="w-full bg-white dark:bg-rs-black border border-gray-200 dark:border-rs-gray rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-rs-gold"
                                        />
                                    </div>
                                    <select
                                        value={templateCategory}
                                        onChange={(e) => setTemplateCategory(e.target.value)}
                                        className="bg-white dark:bg-rs-black border border-gray-200 dark:border-rs-gray rounded-xl px-4 py-3 text-sm outline-none focus:border-rs-gold"
                                    >
                                        {templateCategories.map(category => (
                                            <option key={category} value={category}>
                                                {category === 'all' ? 'Todas as categorias' : category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                                {filteredTemplates.length === 0 ? (
                                    <div className="min-h-[280px] rounded-2xl border-2 border-dashed border-gray-200 dark:border-rs-gray flex flex-col items-center justify-center text-center px-6">
                                        <FileText size={40} className="text-gray-300 dark:text-rs-gray mb-4" />
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Nenhum template encontrado</h4>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                                            Ajuste a busca ou a categoria. A biblioteca continua disponivel para voce salvar novos modelos personalizados.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                        {filteredTemplates.map(template => (
                                            <div
                                                key={template.id}
                                                className="rounded-2xl border border-gray-200 dark:border-rs-gray bg-white dark:bg-rs-black/40 overflow-hidden shadow-sm hover:shadow-xl hover:border-rs-gold/40 transition-all"
                                            >
                                                <div
                                                    className="h-2"
                                                    style={{ backgroundColor: template.previewAccent || template.theme.primaryColor || '#D4AF37' }}
                                                />
                                                <div className="p-5 space-y-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-rs-gold/80">
                                                                {template.source === 'built_in' ? 'Biblioteca RS' : template.isCompanyLibrary ? 'Empresa' : 'Comunidade'}
                                                            </span>
                                                            <h4 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{template.name}</h4>
                                                        </div>
                                                        <span className="shrink-0 rounded-full border border-rs-gold/20 bg-rs-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rs-gold">
                                                            {template.category}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-gray-500 dark:text-gray-400 min-h-[42px]">{template.description}</p>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="rounded-xl border border-gray-200 dark:border-rs-gray bg-gray-50 dark:bg-black/30 p-3">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nicho</p>
                                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{template.niche}</p>
                                                        </div>
                                                        <div className="rounded-xl border border-gray-200 dark:border-rs-gray bg-gray-50 dark:bg-black/30 p-3">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Estrutura</p>
                                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{template.previewText || `${template.sections.length} blocos`}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-3 pt-1">
                                                        <div className="text-xs text-gray-400">
                                                            {template.isPublic || template.source === 'built_in'
                                                                ? 'Disponivel para usar agora'
                                                                : 'Template privado do autor'}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handlePreviewTemplate(template)}
                                                                className="inline-flex items-center gap-2 rounded-xl border border-rs-gold/30 hover:border-rs-gold text-rs-gold px-4 py-2 font-bold text-sm transition-all hover:bg-rs-gold/10"
                                                            >
                                                                <Eye size={16} />
                                                                Pre-visualizar
                                                            </button>
                                                            <button
                                                                onClick={() => void handleUseTemplate(template)}
                                                                className="inline-flex items-center gap-2 rounded-xl bg-rs-gold hover:bg-rs-goldDark text-black px-4 py-2 font-bold text-sm transition-all shadow-lg active:scale-95"
                                                            >
                                                                <CheckCircle2 size={16} />
                                                                Usar template
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {previewTemplate && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
                        <div className="w-full max-w-7xl bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gold/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                            <div className="p-6 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 flex items-start justify-between gap-4">
                                <div>
                                    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-rs-gold/80">
                                        <Eye size={12} />
                                        Modo de visualizacao
                                    </span>
                                    <h3 className="mt-3 text-2xl font-serif font-bold text-gray-900 dark:text-white">
                                        {previewTemplate.name}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                                        {previewTemplate.description || 'Veja como o template fica pronto antes de aplicar no seu MiniSite.'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePreviewPrevious}
                                        disabled={previewTemplateIndex <= 0}
                                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-rs-gray px-4 py-2 font-bold text-sm text-gray-700 dark:text-white transition-all hover:border-rs-gold hover:text-rs-gold disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <ArrowLeft size={16} />
                                        Anterior
                                    </button>
                                    <button
                                        onClick={handlePreviewNext}
                                        disabled={previewTemplateIndex < 0 || previewTemplateIndex >= previewTemplateCollection.length - 1}
                                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-rs-gray px-4 py-2 font-bold text-sm text-gray-700 dark:text-white transition-all hover:border-rs-gold hover:text-rs-gold disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Proximo
                                        <ArrowRight size={16} />
                                    </button>
                                    <button
                                        onClick={() => void handleUseTemplate(previewTemplate)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-rs-gold hover:bg-rs-goldDark text-black px-4 py-2 font-bold text-sm transition-all shadow-lg active:scale-95"
                                    >
                                        <CheckCircle2 size={16} />
                                        Usar template
                                    </button>
                                    <button
                                        onClick={() => setPreviewTemplate(null)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                    >
                                        <X size={22} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-0 flex-1 min-h-0">
                                <div className="border-r border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-6 overflow-y-auto custom-scrollbar">
                                    <div className="space-y-4">
                                        <div className="rounded-2xl border border-gray-200 dark:border-rs-gray bg-white dark:bg-rs-black/40 p-4">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Navegacao</p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                                {previewTemplateIndex >= 0 ? `${previewTemplateIndex + 1} de ${previewTemplateCollection.length}` : `1 de ${previewTemplateCollection.length || 1}`}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200 dark:border-rs-gray bg-white dark:bg-rs-black/40 p-4">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Categoria</p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{previewTemplate.category}</p>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200 dark:border-rs-gray bg-white dark:bg-rs-black/40 p-4">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nicho</p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{previewTemplate.niche}</p>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200 dark:border-rs-gray bg-white dark:bg-rs-black/40 p-4">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Estrutura</p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{previewTemplate.previewText || `${previewTemplate.sections.length} blocos`}</p>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200 dark:border-rs-gray bg-white dark:bg-rs-black/40 p-4">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Origem</p>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                                {previewTemplate.source === 'built_in' ? 'Biblioteca RS' : previewTemplate.isCompanyLibrary ? 'Empresa' : 'Comunidade'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 bg-[#050505] overflow-auto custom-scrollbar">
                                    <div className="mx-auto w-full max-w-[430px] rounded-[32px] border border-rs-gold/20 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.5)] overflow-hidden">
                                        <div className="flex items-center justify-center gap-2 py-3 border-b border-rs-gold/10 bg-black/80">
                                            <div className="h-2 w-2 rounded-full bg-rs-gold/50" />
                                            <div className="h-2 w-2 rounded-full bg-rs-gold/30" />
                                            <div className="h-2 w-2 rounded-full bg-rs-gold/20" />
                                        </div>
                                        <div className="h-[72vh] min-h-[540px]">
                                            <Renderer
                                                sections={previewTemplate.sections}
                                                theme={previewTemplate.theme}
                                                plan={(previewTemplate.plan as UserPlan) || 'free'}
                                                isPreview
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isSaveTemplateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="w-full max-w-2xl bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gold/30 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 flex items-start justify-between gap-4">
                                <div>
                                    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-rs-gold/80">
                                        <Save size={12} />
                                        Novo template
                                    </span>
                                    <h3 className="mt-3 text-2xl font-serif font-bold text-gray-900 dark:text-white">
                                        Salvar este MiniSite na biblioteca
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Voce pode guardar um modelo privado ou liberar para uso da empresa em todo o ecossistema.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsSaveTemplateModalOpen(false)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveCurrentSiteAsTemplate} className="p-6 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nome do template</label>
                                        <input
                                            type="text"
                                            required
                                            value={templateForm.name}
                                            onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full bg-white dark:bg-rs-black border border-gray-200 dark:border-rs-gray rounded-xl p-3 text-sm outline-none focus:border-rs-gold"
                                            placeholder="Ex.: Template premium para clinicas"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nicho</label>
                                        <input
                                            type="text"
                                            required
                                            value={templateForm.niche}
                                            onChange={(e) => setTemplateForm(prev => ({ ...prev, niche: e.target.value }))}
                                            className="w-full bg-white dark:bg-rs-black border border-gray-200 dark:border-rs-gray rounded-xl p-3 text-sm outline-none focus:border-rs-gold"
                                            placeholder="Ex.: Barbearia, dentista, pet shop"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Categoria</label>
                                        <input
                                            type="text"
                                            required
                                            value={templateForm.category}
                                            onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full bg-white dark:bg-rs-black border border-gray-200 dark:border-rs-gray rounded-xl p-3 text-sm outline-none focus:border-rs-gold"
                                            placeholder="Ex.: Biblioteca RS"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Descricao</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={templateForm.description}
                                            onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full bg-white dark:bg-rs-black border border-gray-200 dark:border-rs-gray rounded-xl p-3 text-sm outline-none focus:border-rs-gold"
                                            placeholder="Explique em poucas linhas para que esse template serve e qual resultado ele entrega."
                                        />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-rs-gold/20 bg-rs-gold/5 p-4 flex items-start gap-4">
                                    <input
                                        id="make-template-public"
                                        type="checkbox"
                                        checked={templateForm.makePublic}
                                        onChange={(e) => setTemplateForm(prev => ({ ...prev, makePublic: e.target.checked }))}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-rs-gold focus:ring-rs-gold"
                                    />
                                    <div>
                                        <label htmlFor="make-template-public" className="text-sm font-bold text-gray-900 dark:text-white cursor-pointer">
                                            Disponibilizar na biblioteca da empresa
                                        </label>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Se ativado, esse modelo pode ser usado por outros usuarios do MiniSite. Se desativado, ele fica salvo apenas na sua biblioteca.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsSaveTemplateModalOpen(false)}
                                        className="px-5 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSavingTemplate}
                                        className="px-6 py-3 rounded-xl bg-rs-gold hover:bg-rs-goldDark text-black font-bold text-sm shadow-lg transition-all flex items-center gap-2 disabled:opacity-60"
                                    >
                                        <Save size={16} />
                                        {isSavingTemplate ? 'Salvando template...' : 'Salvar template'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* --- PROFILE MODAL (FULL RS PROLIPSI INTEGRATION) --- */}
                {isProfileModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="w-full max-w-4xl bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gold/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-black via-gray-900 to-black text-white p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                    <Shield size={180} />
                                </div>
                                <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="relative group">
                                            <div className="w-20 h-20 rounded-full border-4 border-rs-gold bg-gray-800 flex items-center justify-center overflow-hidden shadow-2xl">
                                                {(profileForm.avatarUrl || dashboardLogo) ? (
                                                    <img
                                                        src={profileForm.avatarUrl || dashboardLogo}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                        onError={event => {
                                                            event.currentTarget.src = dashboardLogo;
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-rs-gold font-bold text-3xl">{profileForm.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => avatarFileInputRef.current?.click()}
                                                className="absolute bottom-0 right-0 bg-rs-gold text-black p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                                            >
                                                <Camera size={14} />
                                            </button>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-2xl font-bold uppercase tracking-wider">{profileForm.name}</h2>
                                                <div className="bg-green-500/20 text-green-500 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                                    <ShieldCheck size={10} /> VERIFICADO
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400 font-mono tracking-tighter uppercase font-bold">ID RS PRÓLIPSI: <span className="text-rs-gold">{profileForm.consultantId || user.consultantId || 'rsprolipsi'}</span></p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSyncProlipsi}
                                        disabled={isSyncing}
                                        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                                    >
                                        <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                                        {isSyncing ? 'Sincronizando...' : 'Sincronizar Dados'}
                                    </button>
                                </div>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="flex bg-gray-50 dark:bg-black/40 border-b border-gray-200 dark:border-white/10 overflow-x-auto">
                                {[
                                    { id: 'identity', label: 'Identidade', icon: <UserCircle size={16} /> },
                                    { id: 'avatar', label: 'Avatar', icon: <Camera size={16} /> },
                                    { id: 'integration', label: 'Integração', icon: <Wallet size={16} /> },
                                    { id: 'security', label: 'Segurança', icon: <Lock size={16} /> }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setProfileTab(tab.id as any)}
                                        className={`flex-1 min-w-[120px] py-4 px-2 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-b-2 ${profileTab === tab.id
                                            ? 'border-rs-gold text-rs-goldDark dark:text-rs-gold bg-white dark:bg-rs-dark'
                                            : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 flex-1 overflow-y-auto bg-gray-50 dark:bg-rs-black/50 custom-scrollbar">

                                {/* 1. IDENTITY TAB */}
                                {profileTab === 'identity' && (
                                    <div className="animate-fade-in space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h3 className="text-[10px] font-bold text-rs-goldDark uppercase tracking-widest mb-4">Dados Pessoais</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-tighter">Nome Completo</label>
                                                        <input
                                                            type="text"
                                                            value={profileForm.name}
                                                            onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                                            className="w-full bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gray rounded-lg p-3 text-sm text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-tighter">E-mail (Login)</label>
                                                        <input
                                                            type="email"
                                                            readOnly
                                                            value={user.email}
                                                            className="w-full bg-gray-50 dark:bg-rs-black border border-gray-200 dark:border-rs-gray opacity-60 rounded-lg p-3 text-sm text-gray-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-tighter">Telefone / WhatsApp</label>
                                                        <input
                                                            type="text"
                                                            value={profileForm.phone}
                                                            onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                            className="w-full bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gray rounded-lg p-3 text-sm text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-tighter">CPF / CNPJ</label>
                                                    <input
                                                        type="text"
                                                        value={profileForm.cpf}
                                                        onChange={e => setProfileForm({ ...profileForm, cpf: e.target.value })}
                                                        placeholder="000.000.000-00"
                                                        className="w-full bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gray rounded-lg p-3 text-sm text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-[10px] font-bold text-rs-goldDark uppercase tracking-widest mb-4">Localização</h3>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-tighter">CEP</label>
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={profileForm.address.zip}
                                                                onBlur={handleZipCodeBlur}
                                                                onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, zip: e.target.value } })}
                                                                className="w-full bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gray rounded-lg p-3 text-sm text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                            />
                                                            {isZipLoading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-rs-gold" />}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-tighter">Rua / Logradouro</label>
                                                        <input
                                                            type="text"
                                                            value={profileForm.address.street}
                                                            onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, street: e.target.value } })}
                                                            className="w-full bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gray rounded-lg p-3 text-sm text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-5 gap-3">
                                                    <div className="col-span-1">
                                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-tighter">Nº</label>
                                                        <input
                                                            type="text"
                                                            value={profileForm.address.number}
                                                            onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, number: e.target.value } })}
                                                            className="w-full bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gray rounded-lg p-3 text-sm text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-tighter">Bairro</label>
                                                        <input
                                                            type="text"
                                                            value={profileForm.address.neighborhood}
                                                            onChange={e => setProfileForm({ ...profileForm, address: { ...profileForm.address, neighborhood: e.target.value } })}
                                                            className="w-full bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gray rounded-lg p-3 text-sm text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-tighter">Cidade / UF</label>
                                                        <input
                                                            type="text"
                                                            value={`${profileForm.address.city}${profileForm.address.state ? ` / ${profileForm.address.state}` : ''}`}
                                                            readOnly
                                                            className="w-full bg-gray-50 dark:bg-rs-black border border-gray-200 dark:border-rs-gray rounded-lg p-3 text-sm text-gray-500 outline-none opacity-80"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-rs-gold/5 border border-rs-gold/20 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                                    <Share2 size={16} className="text-rs-gold" />
                                                    Link de Indicação Global
                                                </h4>
                                                <p className="text-[10px] text-gray-500 font-medium">Use este link para convidar novos consultores para a sua rede RS Prólipsi.</p>
                                            </div>
                                            <div className="flex w-full md:w-auto">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={sharedReferralLink || 'Clique em Sincronizar'}
                                                    className="flex-1 md:w-64 bg-white dark:bg-rs-black border border-gray-200 dark:border-white/10 rounded-l-lg p-3 text-xs font-mono text-gray-500 outline-none"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (sharedReferralLink) {
                                                            navigator.clipboard.writeText(sharedReferralLink);
                                                            alert("Link copiado!");
                                                        }
                                                    }}
                                                    className="bg-rs-gold text-black px-4 rounded-r-lg hover:bg-rs-goldDark transition-colors shadow-lg active:scale-95"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. AVATAR TAB */}
                                {profileTab === 'avatar' && (
                                    <div className="animate-fade-in flex flex-col items-center justify-center space-y-8 py-12">
                                        <div className="relative group">
                                            <div className="w-48 h-48 rounded-full border-8 border-white dark:border-rs-dark shadow-2xl overflow-hidden bg-gray-100 dark:bg-black">
                                                {profileForm.avatarUrl ? (
                                                    <img src={profileForm.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300 dark:text-rs-gray font-bold">
                                                        {profileForm.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <label className="absolute bottom-4 right-4 bg-rs-gold text-black p-3 rounded-full shadow-xl cursor-pointer hover:scale-110 transition-transform">
                                                <Camera size={24} />
                                                <input
                                                    ref={avatarFileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleAvatarFileChange}
                                                />
                                            </label>
                                        </div>
                                        <div className="text-center max-w-sm">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Foto do Perfil</h3>
                                            <p className="text-sm text-gray-500 mt-2">Personalize sua imagem exibida no MiniSite e no Dashboard global.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setProfileForm(prev => ({ ...prev, avatarUrl: '' }))}
                                                className="px-6 py-2 border border-gray-300 dark:border-rs-gray rounded-lg text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                            >
                                                Remover Foto
                                            </button>
                                            <button
                                                onClick={handleSyncProlipsi}
                                                className="px-6 py-2 bg-rs-gold text-black rounded-lg text-sm font-bold shadow-lg hover:shadow-rs-gold/20 transition-all"
                                            >
                                                Usar Foto da RS Prolipsi
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* 3. INTEGRATION TAB */}
                                {profileTab === 'integration' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="border border-rs-gold/20 bg-rs-gold/5 rounded-lg p-6">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        <Wallet size={20} className="text-rs-gold" />
                                                        Mercado Pago
                                                    </h3>
                                                    <p className="text-sm text-gray-500">Configure suas chaves para receber via Checkout.</p>
                                                </div>
                                                <div className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                                                    Ativo
                                                </div>
                                            </div>

                                            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded p-4 mb-8 flex gap-3 text-xs text-yellow-800 dark:text-yellow-200">
                                                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                                <p><b>Atenção:</b> Suas chaves de produção garantem que as vendas do seu MiniSite sejam creditadas diretamente na sua carteira Mercado Pago.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Public Key (Produção)</label>
                                                    <input
                                                        type="text"
                                                        value={profileForm.mercadoPagoPublicKey}
                                                        onChange={e => setProfileForm({ ...profileForm, mercadoPagoPublicKey: e.target.value })}
                                                        placeholder="APP_USR-..."
                                                        className="w-full bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gray rounded-lg p-3 text-sm font-mono text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">Access Token (Produção)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="password"
                                                            value={profileForm.mercadoPagoAccessToken}
                                                            onChange={e => setProfileForm({ ...profileForm, mercadoPagoAccessToken: e.target.value })}
                                                            placeholder="APP_USR-..."
                                                            className="w-full bg-white dark:bg-rs-dark border border-gray-200 dark:border-rs-gray rounded-lg p-3 text-sm font-mono text-gray-900 dark:text-white outline-none focus:border-rs-gold"
                                                        />
                                                        <Key size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border border-gray-200 dark:border-rs-gray bg-white dark:bg-rs-black/20 rounded-lg p-6 opacity-50 grayscale pointer-events-none">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                <CreditCard size={20} />
                                                Stripe Integration
                                            </h3>
                                            <p className="text-xs text-gray-500">Disponível em breve para pagamentos internacionais.</p>
                                        </div>
                                    </div>
                                )}

                                {/* 4. SECURITY TAB */}
                                {profileTab === 'security' && (
                                    <div className="animate-fade-in space-y-8 py-4">
                                        <div className="flex flex-col md:flex-row items-start gap-6 bg-white dark:bg-rs-dark p-6 rounded-xl border border-gray-200 dark:border-rs-gray">
                                            <div className="bg-rs-gold/10 p-4 rounded-full">
                                                <Shield size={32} className="text-rs-gold" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Senha do Ecossistema</h3>
                                                <p className="text-sm text-gray-500 mt-1 mb-4">
                                                    Sua senha é única para todos os sistemas RS Prólipsi (Rota Fácil, Wallet, MiniSite).
                                                </p>
                                                <button className="px-6 py-2 bg-rs-goldDark dark:bg-rs-gold text-white dark:text-black rounded-lg font-bold text-sm shadow-lg">
                                                    Alterar Senha de Acesso
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row items-start gap-6 bg-white dark:bg-rs-dark p-6 rounded-xl border border-gray-200 dark:border-rs-gray">
                                            <div className="bg-red-500/10 p-4 rounded-full">
                                                <Lock size={32} className="text-red-500" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Token de Segundo Fator (2FA)</h3>
                                                <p className="text-sm text-gray-500 mt-1 mb-4">
                                                    Adicione uma camada extra de segurança para suas transações financeiras.
                                                </p>
                                                <button className="px-6 py-2 border border-red-500/30 text-red-500 rounded-lg font-bold text-sm">
                                                    Ativar Autenticação 2FA
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* Footer / Save Actions */}
                            <div className="p-6 bg-gray-100 dark:bg-black/20 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3 shrink-0">
                                <button
                                    onClick={() => setIsProfileModalOpen(false)}
                                    className="px-6 py-3 rounded-lg font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile}
                                    className="px-10 py-3 bg-rs-gold hover:bg-rs-goldDark text-black font-bold rounded-lg shadow-xl hover:shadow-rs-gold/20 transition-all flex items-center gap-2 disabled:opacity-60"
                                >
                                    <Save size={18} />
                                    {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
            {/* CHECKOUT VIP MODAL */}
            {isCheckoutOpen && upgradeTarget && (
                <CheckoutForm
                    user={user}
                    plan={availablePlans[upgradeTarget] || PLANS[upgradeTarget]}
                    platformSettings={platformSettings}
                    onClose={() => {
                        setIsCheckoutOpen(false);
                        setUpgradeTarget(null);
                    }}
                    onSuccess={async (checkoutData) => {
                        setIsCheckoutOpen(false);

                        if (onUpdateUser) {
                            await Promise.resolve(onUpdateUser({
                                cpf: checkoutData.cpf,
                                phone: checkoutData.phone,
                                address: {
                                    street: checkoutData.street,
                                    number: checkoutData.number,
                                    neighborhood: checkoutData.neighborhood,
                                    city: checkoutData.city,
                                    state: checkoutData.state,
                                    zip: checkoutData.zip
                                }
                            })).catch(error => {
                                console.warn('[Dashboard] Failed to persist checkout profile before payment:', error);
                            });
                        }

                        await handleMiniSitePlanPayment(checkoutData);
                    }}
                />
            )}
        </div>
    );
};
