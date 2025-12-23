import React from 'react';
import { ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
  searchTerm: string;
  onSearch: (term: string) => void;
  onSort: (key: keyof T | string) => void;
  sortConfig: { key: keyof T | string; direction: 'asc' | 'desc' } | null;
  onPageChange: {
    next: () => void;
    prev: () => void;
    goTo: (page: number) => void;
  };
  onItemsPerPageChange: (value: number) => void;
  startIndex: number;
  endIndex: number;
  searchPlaceholder?: string;
}

export const DataTable = <T extends { id: string }>({
  columns,
  data,
  totalItems,
  itemsPerPage,
  currentPage,
  totalPages,
  searchTerm,
  onSearch,
  onSort,
  sortConfig,
  onPageChange,
  onItemsPerPageChange,
  startIndex,
  endIndex,
  searchPlaceholder = "Buscar na tabela..."
}: DataTableProps<T>) => {
  return (
    <div className="bg-rs-card rounded-xl border border-rs-goldDim/20 overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b border-white/5">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 focus:border-rs-gold outline-none"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-slate-400 text-xs uppercase">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.accessor)}
                  className={`p-4 ${col.headerClassName || ''} ${col.sortable ? 'cursor-pointer hover:bg-white/10' : ''}`}
                  onClick={() => col.sortable && onSort(col.accessor)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortConfig && sortConfig.key === col.accessor && (
                      sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-white/5">
                  {columns.map((col) => (
                    <td key={String(col.accessor)} className={`p-4 ${col.cellClassName || ''}`}>
                      {col.render ? col.render(item) : String(item[col.accessor as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-slate-500">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="p-4 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 border-t border-white/5">
         <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <span>Itens por página:</span>
            <select
               value={itemsPerPage}
               onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
               className="bg-black/40 border border-white/10 rounded p-1"
            >
               <option value={10}>10</option>
               <option value={25}>25</option>
               <option value={50}>50</option>
            </select>
            <span className="ml-4">
                Mostrando {data.length > 0 ? startIndex : 0} - {endIndex} de {totalItems}
            </span>
         </div>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button onClick={() => onPageChange.goTo(1)} disabled={currentPage === 1} className="p-1.5 disabled:opacity-50"><ChevronsLeft size={16}/></button>
            <button onClick={onPageChange.prev} disabled={currentPage === 1} className="p-1.5 disabled:opacity-50"><ChevronLeft size={16}/></button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={onPageChange.next} disabled={currentPage === totalPages} className="p-1.5 disabled:opacity-50"><ChevronRight size={16}/></button>
            <button onClick={() => onPageChange.goTo(totalPages)} disabled={currentPage === totalPages} className="p-1.5 disabled:opacity-50"><ChevronsRight size={16}/></button>
          </div>
        )}
      </div>
    </div>
  );
};
