import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export const NavLink = ({ href, className, children, ...props }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'block py-2 px-4 rounded-md text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300',
        isActive && 'bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
};