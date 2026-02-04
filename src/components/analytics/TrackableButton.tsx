/**
 * TrackableButton - Botão com tracking automático de cliques
 * 
 * Uso:
 * <TrackableButton 
 *   trackingName="cta_hero_ver_planos" 
 *   trackingLocation="hero"
 *   onClick={() => scrollToSection('planos')}
 * >
 *   Ver Planos
 * </TrackableButton>
 */

import { forwardRef, useCallback } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';

interface TrackableButtonProps extends ButtonProps {
  /** Nome do CTA para tracking (ex: "cta_hero_ver_planos") */
  trackingName: string;
  /** Localização do CTA na página (ex: "hero", "pricing", "footer") */
  trackingLocation?: string;
  /** Se deve disparar evento de Lead além do clique */
  trackAsLead?: boolean;
}

export const TrackableButton = forwardRef<HTMLButtonElement, TrackableButtonProps>(
  ({ trackingName, trackingLocation, trackAsLead, onClick, children, ...props }, ref) => {
    const { trackCTAClick, trackLead } = useAnalytics();

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        // Dispara o tracking
        trackCTAClick(trackingName, trackingLocation);
        
        // Opcionalmente dispara como Lead
        if (trackAsLead) {
          trackLead(trackingName);
        }

        // Chama o onClick original se existir
        onClick?.(e);
      },
      [trackingName, trackingLocation, trackAsLead, trackCTAClick, trackLead, onClick]
    );

    return (
      <Button ref={ref} onClick={handleClick} {...props}>
        {children}
      </Button>
    );
  }
);

TrackableButton.displayName = 'TrackableButton';

export default TrackableButton;
