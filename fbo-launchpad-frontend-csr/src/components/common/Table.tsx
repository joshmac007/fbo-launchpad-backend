import React from 'react';
import { flexRender, getCoreRowModel, useReactTable, ColumnDef, Row, getSortedRowModel } from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ArrowUpDown, Loader2, AlertTriangle, Info } from 'lucide-react'; // For sorting icons & status

// Props for the Table component
export interface TableProps<TData extends object> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  isError?: boolean;
  error?: React.ReactNode;
  emptyStateMessage?: string;
  emptyStateIcon?: React.ReactNode;
  onRowClick?: (row: Row<TData>) => void;
  className?: string; // Class for the main table container
  // TODO: Add pagination props if PaginationControls is to be integrated directly
  // TODO: Add sorting state and handlers if server-side sorting or more control is needed
}

const Table = <TData extends object>({
  columns,
  data,
  isLoading = false,
  isError = false,
  error = 'Error loading data.',
  emptyStateMessage = 'No data available.',
  emptyStateIcon,
  onRowClick,
  className = ''
}: TableProps<TData>) => {

  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Add other table options like filtering, pagination as needed
  });

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center p-lg">
        <Loader2 className="animate-spin h-lg w-lg text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center p-lg text-center text-status-error-text">
        <AlertTriangle className="h-xl w-xl mb-sm" />
        <p className="text-md-semibold">Data Loading Error</p>
        {typeof error === 'string' ? <p className="text-sm-regular">{error}</p> : error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center p-lg text-center text-neutral-text-secondary">
        {emptyStateIcon || <Info className="h-xl w-xl mb-sm" />}
        <p className="text-md-semibold">No Data</p>
        <p className="text-sm-regular">{emptyStateMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto shadow-sm rounded-lg border border-neutral-border ${className}`.trim()}>
      <table className="min-w-full divide-y divide-neutral-border">
        <thead className="bg-neutral-surface-subtle">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th 
                  key={header.id}
                  scope="col"
                  className="px-md py-sm text-left text-xs-medium text-neutral-text-secondary uppercase tracking-wider cursor-pointer select-none"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {{
                      asc: <ChevronUp className="ml-xs h-4 w-4" />,
                      desc: <ChevronDown className="ml-xs h-4 w-4" />,
                    }[header.column.getIsSorted() as string] ?? (header.column.getCanSort() ? <ArrowUpDown className="ml-xs h-4 w-4 opacity-30 hover:opacity-100" /> : null)}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-neutral-surface-default divide-y divide-neutral-border-subtle">
          {table.getRowModel().rows.map(row => (
            <tr 
              key={row.id} 
              className={`transition-colors duration-150 ${onRowClick ? 'cursor-pointer hover:bg-neutral-surface-hover' : ''}`.trim()}
              onClick={() => onRowClick?.(row)}
            >
              {row.getVisibleCells().map(cell => (
                <td 
                  key={cell.id}
                  className="px-md py-sm whitespace-nowrap text-sm-regular text-neutral-text-secondary"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Re-export ColumnDef for convenience when using the Table component
export type { ColumnDef }; 
export default Table;

// Helper icons (if not already globally available or if you want them co-located for this component usage)
// These are imported from lucide-react above, but shown here for clarity on potential usage in columns defs
// const Loader2 = ({ className }: { className?: string }) => <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
// const AlertTriangle = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
// const Info = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; 