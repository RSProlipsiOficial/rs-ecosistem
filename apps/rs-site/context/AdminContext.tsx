

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { AdminTab } from '../types';

export interface PanelState {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AdminContextType {
  isAdmin: boolean;
  isEditMode: boolean;
  setEditMode: (mode: boolean) => void;
  isLoginPanelOpen: boolean;
  openLoginPanel: () => void;
  closeLoginPanel: () => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  editingButtonKey: string | null;
  openButtonStyleEditor: (key: string) => void;
  closeButtonStyleEditor: () => void;
  editingCardKey: string | null;
  openCardStyleEditor: (key: string) => void;
  closeCardStyleEditor: () => void;
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  openItemId: string | null;
  editingContainerId: string | null;
  focusFieldPath: string | null; // NEW
  setOpenAdminSection: (tab: AdminTab, pageId?: string, containerId?: string, fieldPath?: string) => void;
  clearOpenItem: () => void;
  panelState: PanelState;
  updatePanelState: (newState: Partial<PanelState>) => void;
  isPanelMinimized: boolean;
  setIsPanelMinimized: (minimized: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// THIS IS A DEMONSTRATION AND NOT SECURE.
// In a real application, credentials would never be stored in the frontend code.
const ADMIN_EMAIL = 'rsprolipsioficial@gmail.com';
const ADMIN_PASSWORD = 'Yannis784512@';

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('rsprolipsi_isAdmin') === 'true');
  const [isEditMode, setEditMode] = useState(false);
  const [isLoginPanelOpen, setIsLoginPanelOpen] = useState(false);
  const [editingButtonKey, setEditingButtonKey] = useState<string | null>(null);
  const [editingCardKey, setEditingCardKey] = useState<string | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('home');
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [editingContainerId, setEditingContainerId] = useState<string | null>(null);
  const [focusFieldPath, setFocusFieldPath] = useState<string | null>(null); // NEW
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);

  const [panelState, setPanelState] = useState<PanelState>(() => {
    try {
      const savedState = localStorage.getItem('rsprolipsi_adminPanelState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.x && parsed.y && parsed.width && parsed.height) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load panel state from local storage", e);
    }
    return { x: 20, y: 20, width: 450, height: Math.min(800, window.innerHeight - 40) };
  });

  useEffect(() => {
    try {
      localStorage.setItem('rsprolipsi_adminPanelState', JSON.stringify(panelState));
    } catch (e) {
      console.error("Failed to save panel state to local storage", e);
    }
  }, [panelState]);

  const updatePanelState = (newState: Partial<PanelState>) => {
    setPanelState(prev => ({ ...prev, ...newState }));
  };

  const openLoginPanel = () => setIsLoginPanelOpen(true);
  const closeLoginPanel = () => setIsLoginPanelOpen(false);
  
  const openButtonStyleEditor = (key: string) => setEditingButtonKey(key);
  const closeButtonStyleEditor = () => setEditingButtonKey(null);
  
  const openCardStyleEditor = (key: string) => setEditingCardKey(key);
  const closeCardStyleEditor = () => setEditingCardKey(null);

  const setOpenAdminSection = (tab: AdminTab, pageId?: string, containerId?: string, fieldPath?: string) => {
    setActiveAdminTab(tab);
    setOpenItemId(pageId || null);
    setEditingContainerId(containerId || null);
    setFocusFieldPath(fieldPath || null);
    setEditMode(true);
    setIsPanelMinimized(false);
  };
  
  const clearOpenItem = () => {
    setOpenItemId(null);
    setEditingContainerId(null);
    setFocusFieldPath(null);
  };

  const login = (email: string, password: string) => {
    if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem('rsprolipsi_isAdmin', 'true');
      setIsLoginPanelOpen(false);
      setEditMode(true);
      setActiveAdminTab('home');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    setEditMode(false);
    sessionStorage.removeItem('rsprolipsi_isAdmin');
    // Clear saved credentials on logout
    localStorage.removeItem('rsprolipsi_admin_email');
    localStorage.removeItem('rsprolipsi_admin_password');
  };

  return (
    <AdminContext.Provider value={{ 
      isAdmin, 
      isEditMode,
      setEditMode,
      isLoginPanelOpen, 
      openLoginPanel, 
      closeLoginPanel, 
      login, 
      logout, 
      editingButtonKey,
      openButtonStyleEditor,
      closeButtonStyleEditor,
      editingCardKey,
      openCardStyleEditor,
      closeCardStyleEditor,
      activeAdminTab,
      setActiveAdminTab,
      openItemId,
      editingContainerId,
      focusFieldPath,
      setOpenAdminSection,
      clearOpenItem,
      panelState,
      updatePanelState,
      isPanelMinimized,
      setIsPanelMinimized,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
