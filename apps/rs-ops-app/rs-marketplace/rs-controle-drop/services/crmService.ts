import { CustomerSegment } from '../types';

export const crmService = {
    getCustomerSegment: (recency: number, frequency: number, monetary: number): CustomerSegment => {
        if (frequency >= 5 && monetary >= 1000) return 'VIPs';
        if (recency <= 30 && frequency >= 3) return 'Campeões';
        if (recency > 90 && frequency >= 3) return 'Em Risco';
        if (recency > 180) return 'Hibernando';
        if (frequency >= 2) return 'Leais';
        if (frequency === 1 && recency <= 60) return 'Novos';
        if (frequency === 1 && recency > 60) return 'Potencial';
        return 'Potencial';
    },

    calculateRecency: (lastOrderDate: string | Date): number => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(lastOrderDate);
        targetDate.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today.getTime() - targetDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
};