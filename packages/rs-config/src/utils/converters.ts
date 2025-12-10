/**
 * Conversores de dados
 */

/**
 * Converte percentual para decimal
 */
export function percentToDecimal(percent: number): number {
  return percent / 100;
}

/**
 * Converte decimal para percentual
 */
export function decimalToPercent(decimal: number): number {
  return decimal * 100;
}

/**
 * Calcula valor a partir de percentual e base
 */
export function calculatePercentageValue(base: number, percentage: number): number {
  return (base * percentage) / 100;
}

/**
 * Calcula percentual a partir de valor e base
 */
export function calculatePercentage(value: number, base: number): number {
  if (base === 0) return 0;
  return (value / base) * 100;
}

/**
 * Arredonda para N casas decimais
 */
export function roundTo(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Converte string para número seguro
 */
export function safeParseNumber(value: any, defaultValue: number = 0): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Converte string para inteiro seguro
 */
export function safeParseInt(value: any, defaultValue: number = 0): number {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Normaliza CPF removendo formatação
 */
export function normalizeCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Normaliza CNPJ removendo formatação
 */
export function normalizeCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Normaliza telefone removendo formatação
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Converte objeto para query string
 */
export function objectToQueryString(obj: Record<string, any>): string {
  return Object.entries(obj)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

/**
 * Converte query string para objeto
 */
export function queryStringToObject(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}

/**
 * Deep clone de objeto
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge profundo de objetos
 */
export function deepMerge(target: any, ...sources: any[]): any {
  if (!sources.length) return target;
  
  const source = sources.shift();
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  
  return deepMerge(target, ...sources);
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}
