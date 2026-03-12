import React from 'react';
import { Announcement, MarketingAsset, Training, View } from '../types';
import CommunicationCenter from './CommunicationCenter';

interface CommunicationProps {
  announcements: Announcement[];
  trainings: Training[];
  marketingAssets: MarketingAsset[];
  onNavigate: (view: View, data?: any) => void;
}

const Communication: React.FC<CommunicationProps> = ({ onNavigate }) => {
  return <CommunicationCenter onNavigate={onNavigate} />;
};

export default Communication;
