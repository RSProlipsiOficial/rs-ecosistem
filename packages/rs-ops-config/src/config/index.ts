/**
 * RS Prólipsi - Config Wrapper
 * Re-exporta configurações do rs-config com tipagem e helpers adicionais
 */

import {
    globalConfig,
    isProduction,
    isMaintenanceMode
} from 'rs-config';

export { globalConfig, isProduction, isMaintenanceMode };

export const AppConfig = {
    env: globalConfig.app.environment,
    isProd: isProduction(),
    isMaintenance: isMaintenanceMode(),
};
