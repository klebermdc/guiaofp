import * as React from 'react';
import { UtensilsCrossed } from 'lucide-react';

type MenuLinkChipProps = {
  href: string;
  /** If provided, on desktop we intercept the click and open inside the app (e.g. MenuModal). */
  onOpenInApp?: () => void;
  /** Optional cleanup (e.g. close popup) after we initiate open. */
  onAfterOpen?: () => void;
  className?: string;
  children?: React.ReactNode;
};

function isMobileViewport() {
  return window.matchMedia('(max-width: 767px)').matches;
}

export function MenuLinkChip({
  href,
  onOpenInApp,
  onAfterOpen,
  className,
  children,
}: MenuLinkChipProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        // Keep this a true link on mobile to avoid popup blockers.
        e.stopPropagation();

        const mobile = isMobileViewport();
        if (!mobile && onOpenInApp) {
          e.preventDefault();
          onOpenInApp();
          onAfterOpen?.();
          return;
        }

        // Let the browser handle navigation. Close overlays asynchronously to not interfere.
        if (onAfterOpen) setTimeout(onAfterOpen, 0);
      }}
      className={
        className ??
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-[11px] font-medium border border-primary/30'
      }
      aria-label="Ver cardápio"
    >
      {children ?? (
        <>
          <UtensilsCrossed className="w-3 h-3" />
          Ver cardápio
        </>
      )}
    </a>
  );
}
