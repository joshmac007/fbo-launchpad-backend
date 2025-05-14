import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode; // For buttons or other actions on the right
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  actions,
  breadcrumbs,
  className = ''
}) => {
  return (
    <div className={`mb-lg pb-md border-b border-neutral-border ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-sm">
          <ol className="flex items-center space-x-xs text-sm-regular">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {crumb.path ? (
                  <Link 
                    to={crumb.path} 
                    className="text-neutral-text-secondary hover:text-primary transition-colors duration-150"
                  >
                    {crumb.name}
                  </Link>
                ) : (
                  <span className="text-neutral-text-disabled">{crumb.name}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-text-disabled mx-xs" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-page-title font-bold text-neutral-text-primary truncate">
          {title}
        </h1>
        {actions && <div className="mt-md md:mt-0 md:ml-md flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader; 