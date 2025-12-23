
import { WalletSettings } from '../types';

export const initialWalletSettings: WalletSettings = {
  automaticTransfers: {
    enabled: false,
    frequency: 'Semanal',
    dayOfWeek: 5, // Friday
    minimumAmount: 100,
  },
  notifications: {
    onNewCommission: true,
    onTransferSuccess: true,
    onTransferFail: true,
  },
  security: {
    twoFactorAuth: false,
  },
};
