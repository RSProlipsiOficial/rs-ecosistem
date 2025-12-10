/**
 * Formatadores de dados
 */

/**
 * Formata valor monetário em BRL
 */
export function formatMoney(value: number, options?: {
  showSymbol?: boolean;
  decimals?: number;
}): string {
  const { showSymbol = true, decimals = 2 } = options || {};
  
  const formatted = value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  return showSymbol ? `R$ ${formatted}` : formatted;
}

/**
 * Formata percentual
 */
export function formatPercentage(value: number, options?: {
  decimals?: number;
  showSymbol?: boolean;
}): string {
  const { decimals = 2, showSymbol = true } = options || {};
  
  const formatted = value.toFixed(decimals);
  return showSymbol ? `${formatted}%` : formatted;
}

/**
 * Formata data/hora
 */
export function formatDateTime(date: Date | string, options?: {
  dateOnly?: boolean;
  timeOnly?: boolean;
}): string {
  const { dateOnly = false, timeOnly = false } = options || {};
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (dateOnly) {
    return d.toLocaleDateString('pt-BR');
  }
  
  if (timeOnly) {
    return d.toLocaleTimeString('pt-BR');
  }
  
  return d.toLocaleString('pt-BR');
}

/**
 * Formata CPF
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) {
    return cpf;
  }
  
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) {
    return cnpj;
  }
  
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata telefone
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

/**
 * Trunca texto longo
 */
export function truncate(text: string, maxLength: number = 50, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitaliza primeira letra
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Converte para slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
