

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
// FIX: Changed import for `CustomPage` to `EditablePage` as `CustomPage` is now an alias.
import { EditablePage, ContentContainer } from '../types';
import { initialPages } from '../config/initialPages';

interface PageBuilderContextType {
  pages: EditablePage[];
  addPage: (title: string) => void;
  updatePage: (updatedPage: EditablePage) => void;
  deletePage: (pageId: string) => void;
  addContainer: (pageId: string, container: ContentContainer) => void;
  updateContainer: (pageId: string, updatedContainer: ContentContainer) => void;
  deleteContainer: (pageId: string, containerId: string) => void;
  reorderContainers: (pageId: string, fromIndex: number, toIndex: number) => void;
  globalContent: {
    header: ContentContainer;
    footer: ContentContainer;
  };
  updateGlobalContainer: (type: 'header' | 'footer', container: ContentContainer) => void;
}

const PageBuilderContext = createContext<PageBuilderContextType | undefined>(undefined);

const PAGE_BUILDER_STORAGE_KEY = 'rsprolipsi_pages';
const GLOBAL_CONTENT_STORAGE_KEY = 'rsprolipsi_global_content';

const getInitialPages = (): EditablePage[] => {
  try {
    const saved = localStorage.getItem(PAGE_BUILDER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialPages;
  } catch (error) {
    console.error("Failed to parse pages from localStorage", error);
    return initialPages;
  }
};

const initialGlobalContent = {
    header: { id: 'global_header', type: 'text', title: 'RS Prólipsi', ctaText: 'Login' } as ContentContainer,
    footer: { id: 'global_footer', type: 'text', title: 'RS Prólipsi', subtitle: 'Junte-se à revolução do marketing digital e de rede.', content: '<p>&copy; {YEAR} RS Prólipsi. Todos os direitos reservados.</p><p><a href="#" class="hover:text-text-primary">Política de Privacidade</a> | <a href="#" class="hover:text-text-primary">Termos de Serviço</a></p>' } as ContentContainer,
};

const getInitialGlobalContent = () => {
    try {
        const saved = localStorage.getItem(GLOBAL_CONTENT_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                header: { ...initialGlobalContent.header, ...parsed.header },
                footer: { ...initialGlobalContent.footer, ...parsed.footer },
            }
        }
        return initialGlobalContent;
    } catch (error) {
        console.error("Failed to parse global content from localStorage", error);
        return initialGlobalContent;
    }
}


export const PageBuilderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<EditablePage[]>(getInitialPages);
  const [globalContent, setGlobalContent] = useState(getInitialGlobalContent);

  useEffect(() => {
    try {
      localStorage.setItem(PAGE_BUILDER_STORAGE_KEY, JSON.stringify(pages));
    } catch (error) {
      console.error("Failed to save pages to localStorage", error);
    }
  }, [pages]);

  useEffect(() => {
    try {
        localStorage.setItem(GLOBAL_CONTENT_STORAGE_KEY, JSON.stringify(globalContent));
    } catch (error) {
        console.error("Failed to save global content to localStorage", error);
    }
  }, [globalContent]);

  const addPage = (title: string) => {
    const newPage: EditablePage = {
      id: `page_${new Date().getTime()}`,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      showInNav: false,
      containers: [],
    };
    setPages(prev => [...prev, newPage]);
  };
  
  const updatePage = (updatedPage: EditablePage) => {
    setPages(prev => prev.map(p => p.id === updatedPage.id ? updatedPage : p));
  };
  
  const deletePage = (pageId: string) => {
    setPages(prev => prev.filter(p => p.id !== pageId));
  };

  const addContainer = (pageId: string, container: ContentContainer) => {
    setPages(prev => prev.map(p => {
      if (p.id === pageId) {
        return { ...p, containers: [...p.containers, container] };
      }
      return p;
    }));
  };
  
  const updateContainer = (pageId: string, updatedContainer: ContentContainer) => {
    setPages(prev => prev.map(p => {
      if (p.id === pageId) {
        return { 
            ...p, 
            containers: p.containers.map(c => c.id === updatedContainer.id ? updatedContainer : c) 
        };
      }
      return p;
    }));
  };
  
  const deleteContainer = (pageId: string, containerId: string) => {
    setPages(prev => prev.map(p => {
      if (p.id === pageId) {
        return { ...p, containers: p.containers.filter(c => c.id !== containerId) };
      }
      return p;
    }));
  };

  const reorderContainers = (pageId: string, fromIndex: number, toIndex: number) => {
     setPages(prev => prev.map(p => {
        if (p.id === pageId) {
            const newContainers = [...p.containers];
            const [movedItem] = newContainers.splice(fromIndex, 1);
            if (toIndex >= 0 && toIndex < newContainers.length + 1) {
                newContainers.splice(toIndex, 0, movedItem);
            }
            return { ...p, containers: newContainers };
        }
        return p;
    }));
  };

  const updateGlobalContainer = (type: 'header' | 'footer', container: ContentContainer) => {
    setGlobalContent(prev => ({ ...prev, [type]: container }));
  };

  return (
    <PageBuilderContext.Provider value={{ pages, addPage, updatePage, deletePage, addContainer, updateContainer, deleteContainer, reorderContainers, globalContent, updateGlobalContainer }}>
      {children}
    </PageBuilderContext.Provider>
  );
};

export const usePageBuilder = (): PageBuilderContextType => {
  const context = useContext(PageBuilderContext);
  if (context === undefined) {
    throw new Error('usePageBuilder must be used within a PageBuilderProvider');
  }
  return context;
};