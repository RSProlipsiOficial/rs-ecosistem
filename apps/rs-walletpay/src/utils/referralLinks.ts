import { supabase } from '../lib/supabaseClient';
import { readWalletSession } from './walletSession';

export interface ReferralLinks {
  cadastro: string;
  loja: string;
  produtos: string;
  sponsorCode: string;
  affiliateRef: string;
}

interface MarketingBrief {
  objective: string;
  product?: string;
  tone?: string;
  audience?: string;
}

const getEnvValue = (key: string) => {
  try {
    return String((import.meta as any)?.env?.[key] || '').trim();
  } catch {
    return '';
  }
};

const isLocalHost = () =>
  typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

const resolveBaseUrl = (port: string, envKey: string, productionUrl: string) => {
  const envUrl = getEnvValue(envKey);
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  if (typeof window === 'undefined') {
    return productionUrl;
  }

  if (isLocalHost()) {
    return `${window.location.protocol}//${window.location.hostname}:${port}`;
  }

  return productionUrl;
};

export const getFallbackReferralLinks = (): ReferralLinks => {
  const session = readWalletSession();
  const sponsorCode = session.userId || 'rsprolipsi';
  const affiliateRef = session.userId || sponsorCode;
  const walletBaseUrl = resolveBaseUrl('3004', 'VITE_WALLETPAY_URL', 'https://walletpay.rsprolipsi.com.br');
  const marketplaceBaseUrl = resolveBaseUrl('3003', 'VITE_MARKETPLACE_URL', 'https://marketplace.rsprolipsi.com.br');

  return {
    cadastro: `${walletBaseUrl}/#/register?sponsor=${encodeURIComponent(sponsorCode)}`,
    loja: `${marketplaceBaseUrl}/?ref=${encodeURIComponent(affiliateRef)}`,
    produtos: `${marketplaceBaseUrl}/?ref=${encodeURIComponent(affiliateRef)}`,
    sponsorCode,
    affiliateRef,
  };
};

export const personalizeMarketingText = (text: string, links: ReferralLinks) =>
  text
    .replace(/{{link_cadastro}}/g, links.cadastro)
    .replace(/{{link_loja}}/g, links.loja)
    .replace(/{{link_produtos}}/g, links.produtos);

export const buildFallbackMarketingContent = (brief: MarketingBrief, links: ReferralLinks) => {
  const product = brief.product?.trim() || 'linha completa RS Prolipsi';
  const audience = brief.audience?.trim() || 'pessoas que buscam saude, bem-estar e renda';
  const tone = brief.tone?.trim() || 'confiante';

  const templates: Record<string, string> = {
    recrutar: [
      `Estou expandindo minha equipe na RS Prolipsi e procurando pessoas com perfil ${tone} para crescer comigo.`,
      `Se voce faz parte do publico ${audience}, essa pode ser a oportunidade certa para comecar com suporte, produtos fortes e plano de crescimento.`,
      `Cadastre-se no meu link: ${links.cadastro}`,
      '',
      '#rsprolipsi #negocioonline #rendaextra #empreendedorismo'
    ].join('\n\n'),
    promover: [
      `Quero te apresentar o produto ${product}.`,
      `Ele foi pensado para o publico ${audience} e pode ser um excelente apoio para sua rotina, com comunicacao ${tone} e foco em resultado.`,
      `Veja mais na minha vitrine: ${links.loja}`,
      '',
      '#rsprolipsi #bemestar #saude #qualidadedevida'
    ].join('\n\n'),
    afiliado: [
      `Hoje a indicacao vai para ${product}.`,
      `Se voce faz parte do publico ${audience}, vale olhar com calma porque esse item tem grande potencial de conversao e recompra.`,
      `Acesse meu link da loja: ${links.loja}`,
      '',
      '#afiliado #rsprolipsi #vendasonline #marketingdigital'
    ].join('\n\n'),
  };

  return templates[brief.objective] || templates.promover;
};

export const resolveReferralLinks = async (): Promise<ReferralLinks> => {
  const fallback = getFallbackReferralLinks();
  const session = readWalletSession();

  if (!session.userId) {
    return fallback;
  }

  try {
    const { data } = await supabase
      .from('consultores')
      .select('id, username')
      .or(`user_id.eq."${session.userId}",id.eq."${session.userId}"`)
      .maybeSingle();

    const sponsorCode = data?.username || data?.id || fallback.sponsorCode;

    return {
      ...fallback,
      sponsorCode,
      cadastro: fallback.cadastro.replace(encodeURIComponent(fallback.sponsorCode), encodeURIComponent(sponsorCode)),
    };
  } catch (error) {
    console.warn('[WalletPay] Falha ao resolver links de divulgacao:', error);
    return fallback;
  }
};
