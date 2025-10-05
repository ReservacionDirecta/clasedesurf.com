"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Auto-generate breadcrumbs from pathname if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert segment to readable label
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Special cases for better labels
      switch (segment) {
        case 'dashboard':
          label = 'Dashboard';
          break;
        case 'admin':
          label = 'Admin';
          break;
        case 'overview':
          label = 'Overview';
          break;
        case 'users':
          label = 'Users';
          break;
        case 'schools':
          label = 'Schools';
          break;
        case 'classes':
          label = 'Classes';
          break;
        case 'reservations':
          label = 'Reservations';
          break;
        case 'payments':
          label = 'Payments';
          break;
        case 'reports':
          label = 'Reports';
          break;
      }
      
      // Don't make the last item clickable
      const isLast = index === segments.length - 1;
      
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-gray-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}