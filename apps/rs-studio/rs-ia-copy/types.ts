import React from 'react';

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type Platform = 'facebook' | 'instagram' | 'linkedin';

export type CopyFramework = 'livre' | 'aida' | 'pas' | 'bab' | 'storytelling';

export type EmojiLevel = 'none' | 'minimal' | 'standard' | 'max';

export type PostObjective = 'engagement' | 'sales' | 'traffic' | 'authority';

export interface GeneratedContent {
  id: string;
  text: string;
  imageIdea?: string;
  targetUrl?: string;
  timestamp: number;
  topic: string;
  tone: string;
  platform: Platform;
  framework?: string;
  uploadedImage?: string; // Base64 string of the uploaded image
  viralScore?: number; // 0 to 100
}

export interface ShareOption {
  name: string;
  icon: React.ReactNode;
  action: (text: string) => void;
  primary?: boolean;
}