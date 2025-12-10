/**
 * Controle de Versão do Sistema de Configuração
 * RS Prólipsi - Config System
 */

export interface VersionInfo {
  major: number;
  minor: number;
  patch: number;
  full: string;
  releaseDate: string;
  releaseName: string;
  status: 'development' | 'staging' | 'production';
}

/**
 * Versão atual do sistema
 */
export const currentVersion: VersionInfo = {
  major: 1,
  minor: 0,
  patch: 0,
  full: '1.0.0',
  releaseDate: new Date().toISOString(),
  releaseName: 'Genesis',
  status: 'development',
};

/**
 * Retorna versão formatada
 */
export function getVersion(): string {
  return currentVersion.full;
}

/**
 * Retorna informações completas
 */
export function getVersionInfo(): VersionInfo {
  return { ...currentVersion };
}

/**
 * Verifica compatibilidade entre versões
 */
export function isCompatible(requiredVersion: string): boolean {
  const [reqMajor, reqMinor] = requiredVersion.split('.').map(Number);
  const { major, minor } = currentVersion;
  
  // Mesma major version = compatível
  if (major === reqMajor) {
    return minor >= reqMinor;
  }
  
  return major > reqMajor;
}

/**
 * Histórico de versões
 */
export const versionHistory = [
  {
    version: '1.0.0',
    date: new Date().toISOString(),
    name: 'Genesis',
    description: 'Versão inicial do sistema de configuração',
  },
];
