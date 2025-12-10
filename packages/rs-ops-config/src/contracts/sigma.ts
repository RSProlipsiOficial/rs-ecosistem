/**
 * RS Prólipsi - Sigma Contracts
 * Contratos para o núcleo do sistema (Ciclos, Bônus, Carreira)
 */

export interface SigmaCloseCyclePayload {
    consultorId: string;
    orderId: string;
    cycleValue: number;
    timestamp?: string;
}

export interface SigmaBonusDistribution {
    userId: string;
    amount: number;
    type: 'career' | 'cycle' | 'indication' | 'pool';
    referenceId: string;
    description: string;
}

export interface SigmaCareerProgress {
    userId: string;
    currentLevel: string;
    points: number;
    nextLevel: string;
    pointsNeeded: number;
}
