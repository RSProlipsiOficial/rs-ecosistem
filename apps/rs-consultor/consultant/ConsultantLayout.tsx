import React, { useState, createContext, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ChatbotWidget from './components/ChatbotWidget'; // Import the new chatbot
import type { User, SystemMessage, Incentive } from '../types';
import { useLayout } from '../App';

// User Context
export interface UserContextType {
  user: User;
  updateUser: (newUserData: Partial<User>) => void;
  messages: SystemMessage[];
  markMessageAsRead: (messageId: string) => void;
  onSyncProfile: () => Promise<Partial<User> | null>;
  credits: number;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
  isAuthenticated: boolean;
  login: (email: string, pass: string, callback: () => void) => Promise<boolean>;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};


// Dashboard Config Context
export interface ProgressBarConfig {
  id: string;
  title: string;
  startIcon: string;
  endIcon: string;
  isEndIconFilled?: boolean;
  calculationMode: 'manual' | 'auto';
  targetPin: string | null; // targetPin is optional for auto calculation
}

export interface UserInfoField {
  id: string;
  label: string;
  source: string;
}

export interface DashboardLink {
  id: string;
  label: string;
  source: string;
}

export interface PromoBannerConfig {
  id: string;
  preTitle: string;
  title: string;
  price: number;
  imageUrl: string;
  imageDataUrl?: string;
  ctaText: string;
}

export interface DashboardBonusCard {
  id: string;
  source: string;
}

export interface DashboardConfig {
  userInfo: UserInfoField[];
  links: DashboardLink[];
  promoBanners: PromoBannerConfig[];
  bonusCards: DashboardBonusCard[];
  progressBars: Record<string, ProgressBarConfig>;
  pinLogos: { [key: string]: string };
  networkSummary: {
    source: 'top-sigme' | 'global-cycle';
  };
  incentives: Incentive[]; // New: Incentives configuration
}


export interface DashboardConfigContextType {
  config: DashboardConfig;
  setConfig: React.Dispatch<React.SetStateAction<DashboardConfig>>;
}

export const DashboardConfigContext = createContext<DashboardConfigContextType | null>(null);

export const useDashboardConfig = () => {
  const context = useContext(DashboardConfigContext);
  if (!context) {
    throw new Error('useDashboardConfig must be used within a DashboardConfigProvider');
  }
  return context;
}

const ConsultantLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();
  const location = useLocation();

  // Detect if we are in a focus-mode route (like interactive tree)
  const isFocusMode = location.pathname.includes('arvore-interativa');

  return (
    <div className={`flex h-screen bg-brand-dark font-sans overflow-hidden ${isFocusMode ? 'p-0' : ''}`}>
      {/* --- SIDEBARS --- */}
      {/* Always in the DOM, but hidden via CSS in focus mode to prevent component unmounts. */}
      <div className={`
            ${isFocusMode ? 'hidden' : 'hidden md:flex'} 
            md:flex-shrink-0 transition-all duration-300 
            ${isSidebarCollapsed ? 'w-20' : 'w-64'}
          `}>
        {!isFocusMode && <Sidebar isCollapsed={isSidebarCollapsed} />}
      </div>

      {/* Mobile Sidebar (conditionally rendered is fine for 'fixed' elements) */}
      {!isFocusMode && (
        <>
          <div
            className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          ></div>
          <div className={`fixed inset-y-0 left-0 w-64 z-40 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <Sidebar isCollapsed={false} closeSidebar={() => setIsMobileMenuOpen(false)} />
          </div>
        </>
      )}


      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar (conditionally rendered as it has no children that need state preservation) */}
        {!isFocusMode && (
          <Topbar
            user={user}
            onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isSidebarCollapsed={isSidebarCollapsed}
          />
        )}

        {/* Main content with stable structure */}
        <main className={`flex-1 overflow-y-auto ${isFocusMode ? '' : 'p-4 sm:p-6 md:p-8'}`}>
          <div className={isFocusMode ? 'h-full' : 'max-w-7xl mx-auto'}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Chatbot (conditionally rendered, also safe) */}
      {!isFocusMode && <ChatbotWidget />}
    </div>
  );
};

export default ConsultantLayout;