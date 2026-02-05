
export enum AIStatus {
  ACTIVE = 'Active',
  OBSERVATION = 'Observation',
  PAUSED = 'Paused'
}

export enum Platform {
  GOOGLE = 'Google',
  META = 'Meta'
}

export enum CampaignStatus {
  ACTIVE = 'Active',
  LIMITED = 'Limited',
  PAUSED = 'Paused',
  ENDED = 'Ended'
}

export interface KPI {
  label: string;
  value: string;
  change: number;
  icon: string;
  target: string;
  status: 'above' | 'below' | 'on_track';
  recommendation: string;
}

export type ActionStatus = 'suggested' | 'applied' | 'rolled_back' | 'failed' | 'blocked';
export type ActionType = 'budget_increase' | 'budget_decrease' | 'pause_ad' | 'bid_adjustment' | 'creative_test' | 'negative_keywords';

export interface OptimizationAction {
  id: string;
  campaignId: string;
  campaignName: string;
  platform: Platform;
  actionType: ActionType;
  status: ActionStatus;
  confidenceScore: number;
  reason: string;
  executedAt: string;
  details?: {
    ruleTriggered: string;
    beforeValue: string;
    afterValue: string;
    expectedImpact: string;
    payloadSnippet: string;
  };
}

export interface Campaign {
  id: string;
  adAccountId: string;
  name: string;
  platform: Platform;
  targetROAS: number;
  currentROAS: number;
  targetCPA: number;
  currentCPA: number;
  spend: number;
  healthScore: number;
  status: CampaignStatus;
  aiMode: AIStatus;
  objective: string;
  createdAt: string;
  lastOptimization: string;
  limits: {
    maxDailySpend: number;
    targetCPA: number;
    minROAS: number;
  };
}

export interface Client {
  id: string;
  name: string;
}

export interface AdCreative {
  headline: string;
  description: string;
  cta: string;
  performanceScore: number;
}
