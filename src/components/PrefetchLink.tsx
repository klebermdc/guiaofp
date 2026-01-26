import { NavLink as RouterNavLink, NavLinkProps } from 'react-router-dom';
import { forwardRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { usePrefetch } from '@/hooks/usePrefetch';

interface PrefetchLinkProps extends Omit<NavLinkProps, 'className'> {
  className?: string | ((props: { isActive: boolean; isPending: boolean }) => string);
  activeClassName?: string;
  prefetchOnHover?: boolean;
}

export const PrefetchLink = forwardRef<HTMLAnchorElement, PrefetchLinkProps>(
  ({ className, activeClassName, prefetchOnHover = true, to, ...props }, ref) => {
    const { prefetch } = usePrefetch();
    
    const handleMouseEnter = useCallback(() => {
      if (prefetchOnHover && typeof to === 'string') {
        prefetch(to);
      }
    }, [prefetch, prefetchOnHover, to]);

    const handleTouchStart = useCallback(() => {
      if (prefetchOnHover && typeof to === 'string') {
        prefetch(to);
      }
    }, [prefetch, prefetchOnHover, to]);

    const getClassName = (props: { isActive: boolean; isPending: boolean }) => {
      if (typeof className === 'function') {
        return className(props);
      }
      return cn(className, props.isActive && activeClassName);
    };

    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={getClassName}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleTouchStart}
        {...props}
      />
    );
  }
);

PrefetchLink.displayName = 'PrefetchLink';
