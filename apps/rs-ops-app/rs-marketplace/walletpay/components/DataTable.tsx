import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
}

const DataTable = <T extends { seq: number }>(props: DataTableProps<T>) => {
  const { columns, data, onRowClick } = props;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface text-xs text-text-body uppercase tracking-wider sticky top-0">
            <tr>
              {columns.map((col) => (
                <th key={String(col.accessor)} className="px-6 py-4 font-semibold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item, index) => (
              <tr 
                key={item.seq}
                onClick={() => onRowClick && onRowClick(item)}
                className={`transition-colors hover:bg-surface/50 ${index % 2 !== 0 ? 'bg-white/[.02]' : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={`${item.seq}-${String(col.accessor)}`} className="px-6 py-4 whitespace-nowrap">
                    {col.render ? col.render(item) : <span className="text-sm text-text-body">{String(item[col.accessor])}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="text-center py-12 text-text-body">
          <p>Nenhum registro encontrado.</p>
        </div>
      )}
    </div>
  );
};

export default DataTable;
