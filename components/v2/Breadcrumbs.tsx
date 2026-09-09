import React from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <div className="flex flex-wrap gap-2 px-5 py-3 bg-surface dark:bg-surface rounded-xl shadow-sm border border-outline dark:border-outline transition-colors">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.href ? (
            <Link 
              href={item.href}
              className="text-muted text-sm font-medium hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-primary text-sm font-bold">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <span className="text-muted text-sm font-medium">/</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;
