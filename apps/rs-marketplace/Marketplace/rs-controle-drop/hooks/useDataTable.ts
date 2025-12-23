// FIX: Imported useEffect
import { useState, useMemo, useEffect } from 'react';

type SortDirection = 'asc' | 'desc';

interface SortConfig<T> {
  key: keyof T | string;
  direction: SortDirection;
}

interface UseDataTableProps<T> {
  initialData: T[];
  itemsPerPage?: number;
  searchKeys: (keyof T)[];
}

export const useDataTable = <T extends { [key: string]: any }>({
  initialData,
  itemsPerPage = 10,
  searchKeys,
}: UseDataTableProps<T>) => {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPageState, setItemsPerPageState] = useState(itemsPerPage);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowercasedFilter = searchTerm.toLowerCase();
    return data.filter(item => {
      return searchKeys.some(key => {
        const value = item[key];
        return value ? String(value).toLowerCase().includes(lowercasedFilter) : false;
      });
    });
  }, [data, searchTerm, searchKeys]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPageState;
    return sortedData.slice(startIndex, startIndex + itemsPerPageState);
  }, [sortedData, currentPage, itemsPerPageState]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPageState);

  const requestSort = (key: keyof T | string) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPageState(value);
    setCurrentPage(1); 
  };
  
  // Reset page to 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPageState]);

  return {
    paginatedData,
    // FIX: Returned the sortedData for external calculations before pagination.
    filteredAndSortedData: sortedData,
    requestSort,
    sortConfig,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    itemsPerPage: itemsPerPageState,
    handleItemsPerPageChange,
    totalItems: sortedData.length,
    startIndex: (currentPage - 1) * itemsPerPageState + 1,
    endIndex: Math.min((currentPage - 1) * itemsPerPageState + itemsPerPageState, sortedData.length),
  };
};