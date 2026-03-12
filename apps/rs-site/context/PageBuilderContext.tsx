import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { EditablePage, ContentContainer } from '../types';
import { initialPages } from '../config/initialPages';
import { siteBuilderApi } from '../services/siteBuilderApi';

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
let hasShownStorageAlert = false;

const initialGlobalContent = {
  header: { id: 'global_header', type: 'text', title: 'RS Prolipsi', ctaText: 'Login' } as ContentContainer,
  footer: {
    id: 'global_footer',
    type: 'text',
    title: 'RS Prolipsi',
    subtitle: 'Junte-se a revolucao do marketing digital e de rede.',
    content:
      '<p>&copy; {YEAR} RS Prolipsi. Todos os direitos reservados.</p><p><a href="#" class="hover:text-text-primary">Politica de Privacidade</a> | <a href="#" class="hover:text-text-primary">Termos de Servico</a></p>',
  } as ContentContainer,
};

const isPreviewEditorRuntime = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return new URLSearchParams(window.location.search).get('previewEditor') === '1';
};

const shouldNotifyEmbeddedPreviewUpdate = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get('embedAdmin') === '1';
};

const notifyEmbeddedPreviewUpdate = () => {
  if (!shouldNotifyEmbeddedPreviewUpdate()) {
    return;
  }

  try {
    window.parent?.postMessage({ type: 'rs-site:content-updated', scope: 'pages' }, '*');
  } catch (error) {
    console.error('Failed to notify parent preview about page changes', error);
  }
};

const getInitialPages = (): EditablePage[] => {
  try {
    const saved = localStorage.getItem(PAGE_BUILDER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialPages;
  } catch (error) {
    console.error('Failed to parse pages from localStorage', error);
    return initialPages;
  }
};

const getInitialGlobalContent = () => {
  try {
    const saved = localStorage.getItem(GLOBAL_CONTENT_STORAGE_KEY);
    if (!saved) {
      return initialGlobalContent;
    }

    const parsed = JSON.parse(saved);
    return {
      header: { ...initialGlobalContent.header, ...(parsed.header || {}) },
      footer: { ...initialGlobalContent.footer, ...(parsed.footer || {}) },
    };
  } catch (error) {
    console.error('Failed to parse global content from localStorage', error);
    return initialGlobalContent;
  }
};

const normalizePages = (value: any): EditablePage[] => {
  if (!Array.isArray(value) || value.length === 0) {
    return initialPages;
  }

  return value.map((page: any) => ({
    ...page,
    title: page?.title || 'Nova Pagina',
    slug: page?.slug || '',
    containers: Array.isArray(page?.containers) ? page.containers : [],
    showInNav: Boolean(page?.showInNav),
    isStatic: Boolean(page?.isStatic),
    backgroundBanner: page?.backgroundBanner
      ? {
          enabled: Boolean(page.backgroundBanner.enabled),
          imageUrl: String(page.backgroundBanner.imageUrl || ''),
          opacity: Number(page.backgroundBanner.opacity ?? 0.42),
        }
      : undefined,
  }));
};

const mergeGlobalContent = (value?: { header?: ContentContainer; footer?: ContentContainer }) => ({
  header: { ...initialGlobalContent.header, ...(value?.header || {}) } as ContentContainer,
  footer: { ...initialGlobalContent.footer, ...(value?.footer || {}) } as ContentContainer,
});

export const PageBuilderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<EditablePage[]>(getInitialPages);
  const [globalContent, setGlobalContent] = useState(getInitialGlobalContent);
  const [bootstrapReady, setBootstrapReady] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const lastSyncedPayloadRef = useRef('');

  useEffect(() => {
    let isMounted = true;

    const loadRemoteBootstrap = async () => {
      const result = await siteBuilderApi.getBootstrap();

      if (!isMounted) {
        return;
      }

      if (result.success && result.data) {
        const nextPages = normalizePages(result.data.pages);
        const nextGlobalContent = mergeGlobalContent(result.data.globalContent);

        setPages(nextPages);
        setGlobalContent(nextGlobalContent);
        lastSyncedPayloadRef.current = JSON.stringify({
          pages: nextPages,
          globalContent: nextGlobalContent,
        });

        try {
          localStorage.setItem(PAGE_BUILDER_STORAGE_KEY, JSON.stringify(nextPages));
          localStorage.setItem(GLOBAL_CONTENT_STORAGE_KEY, JSON.stringify(nextGlobalContent));
        } catch (error) {
          console.error('Failed to mirror remote site builder data into localStorage', error);
        }
      } else {
        lastSyncedPayloadRef.current = JSON.stringify({
          pages,
          globalContent,
        });
      }

      setBootstrapReady(true);
    };

    loadRemoteBootstrap().catch(error => {
      console.error('Failed to load remote site builder bootstrap', error);
      if (!isMounted) {
        return;
      }

      lastSyncedPayloadRef.current = JSON.stringify({
        pages,
        globalContent,
      });
      setBootstrapReady(true);
    });

    return () => {
      isMounted = false;
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PAGE_BUILDER_STORAGE_KEY, JSON.stringify(pages));
    } catch (error) {
      console.error('Failed to save pages to localStorage', error);
      if (!hasShownStorageAlert) {
        hasShownStorageAlert = true;
        alert('Nao foi possivel salvar essa edicao no navegador. Tente usar uma imagem menor.');
      }
    }
  }, [pages]);

  useEffect(() => {
    try {
      localStorage.setItem(GLOBAL_CONTENT_STORAGE_KEY, JSON.stringify(globalContent));
    } catch (error) {
      console.error('Failed to save global content to localStorage', error);
      if (!hasShownStorageAlert) {
        hasShownStorageAlert = true;
        alert('Nao foi possivel salvar essa edicao no navegador. Tente reduzir o tamanho da imagem enviada.');
      }
    }
  }, [globalContent]);

  useEffect(() => {
    if (isPreviewEditorRuntime()) {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === PAGE_BUILDER_STORAGE_KEY && event.newValue) {
        try {
          setPages(normalizePages(JSON.parse(event.newValue)));
        } catch (error) {
          console.error('Failed to sync pages from storage', error);
        }
      }

      if (event.key === GLOBAL_CONTENT_STORAGE_KEY && event.newValue) {
        try {
          setGlobalContent(mergeGlobalContent(JSON.parse(event.newValue)));
        } catch (error) {
          console.error('Failed to sync global content from storage', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!bootstrapReady) {
      return;
    }

    const serializedPayload = JSON.stringify({ pages, globalContent });

    if (serializedPayload === lastSyncedPayloadRef.current) {
      return;
    }

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(async () => {
      const result = await siteBuilderApi.saveBootstrap({
        pages,
        globalContent,
      });

      if (result.success) {
        lastSyncedPayloadRef.current = serializedPayload;
        hasShownStorageAlert = false;
        notifyEmbeddedPreviewUpdate();
        return;
      }

      console.error('Failed to save site builder bootstrap to API', result.error);

      if (!hasShownStorageAlert) {
        hasShownStorageAlert = true;
        alert('Nao foi possivel salvar esta edicao no banco. O navegador manteve um rascunho local.');
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [pages, globalContent, bootstrapReady]);

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
    setPages(prev => prev.map(page => (page.id === updatedPage.id ? updatedPage : page)));
  };

  const deletePage = (pageId: string) => {
    setPages(prev => prev.filter(page => page.id !== pageId));
  };

  const addContainer = (pageId: string, container: ContentContainer) => {
    setPages(prev =>
      prev.map(page => {
        if (page.id !== pageId) {
          return page;
        }

        return { ...page, containers: [...page.containers, container] };
      })
    );
  };

  const updateContainer = (pageId: string, updatedContainer: ContentContainer) => {
    setPages(prev =>
      prev.map(page => {
        if (page.id !== pageId) {
          return page;
        }

        return {
          ...page,
          containers: page.containers.map(container =>
            container.id === updatedContainer.id ? updatedContainer : container
          ),
        };
      })
    );
  };

  const deleteContainer = (pageId: string, containerId: string) => {
    setPages(prev =>
      prev.map(page => {
        if (page.id !== pageId) {
          return page;
        }

        return {
          ...page,
          containers: page.containers.filter(container => container.id !== containerId),
        };
      })
    );
  };

  const reorderContainers = (pageId: string, fromIndex: number, toIndex: number) => {
    setPages(prev =>
      prev.map(page => {
        if (page.id !== pageId) {
          return page;
        }

        const nextContainers = [...page.containers];
        const [movedContainer] = nextContainers.splice(fromIndex, 1);
        if (movedContainer && toIndex >= 0 && toIndex <= nextContainers.length) {
          nextContainers.splice(toIndex, 0, movedContainer);
        }

        return { ...page, containers: nextContainers };
      })
    );
  };

  const updateGlobalContainer = (type: 'header' | 'footer', container: ContentContainer) => {
    setGlobalContent(prev => ({ ...prev, [type]: container }));
  };

  return (
    <PageBuilderContext.Provider
      value={{
        pages,
        addPage,
        updatePage,
        deletePage,
        addContainer,
        updateContainer,
        deleteContainer,
        reorderContainers,
        globalContent,
        updateGlobalContainer,
      }}
    >
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
