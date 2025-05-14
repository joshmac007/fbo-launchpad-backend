import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button'; 

export interface PaginationData {
  page: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
  total_items: number;
}

interface PaginationControlsProps {
  paginationData?: PaginationData | null;
  onPageChange: (newPage: number) => void;
  className?: string; 
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  paginationData,
  onPageChange,
  className = '',
}) => {
  if (!paginationData || paginationData.total_pages <= 1) {
    return null;
  }

  const { page, total_pages, has_prev, has_next, total_items } = paginationData;

  const commonButtonProps = {
    variant: 'outline' as const, 
    size: 'sm' as const,         
  };

  return (
    <div className={`px-4 py-3 flex items-center justify-between border-t border-neutral-border dark:border-neutral-border-dark sm:px-6 ${className}`}>
      <div className="flex-1 flex justify-between sm:hidden">
        <Button
          onClick={() => onPageChange(page - 1)}
          disabled={!has_prev}
          {...commonButtonProps}
        >
          Previous
        </Button>
        <Button
          onClick={() => onPageChange(page + 1)}
          disabled={!has_next}
          className="ml-3"
          {...commonButtonProps}
        >
          Next
        </Button>
      </div>

      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-neutral-text-secondary dark:text-neutral-text-secondary-dark">
            Showing page <span className="font-medium text-neutral-text-primary dark:text-neutral-text-primary-dark">{page}</span> of{' '}
            <span className="font-medium text-neutral-text-primary dark:text-neutral-text-primary-dark">{total_pages}</span> ({' '}
            <span className="font-medium text-neutral-text-primary dark:text-neutral-text-primary-dark">{total_items}</span> total items)
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <Button
              onClick={() => onPageChange(page - 1)}
              disabled={!has_prev}
              className="rounded-l-md"
              aria-label="Previous page"
              {...commonButtonProps}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            
            <span 
              aria-current="page"
              className="relative inline-flex items-center px-4 py-2 border border-neutral-border dark:border-neutral-border-dark bg-neutral-surface-subtle dark:bg-neutral-surface-subtle-dark text-sm font-medium text-neutral-text-primary dark:text-neutral-text-primary-dark"
            >
              Page {page}
            </span>

            <Button
              onClick={() => onPageChange(page + 1)}
              disabled={!has_next}
              className="rounded-r-md"
              aria-label="Next page"
              {...commonButtonProps}
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default PaginationControls; 