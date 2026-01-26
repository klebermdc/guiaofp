import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface TravelModeContextType {
  isTravelMode: boolean;
  enableTravelMode: () => void;
  disableTravelMode: () => void;
  toggleTravelMode: () => void;
  isFirstActivation: boolean;
}

const TravelModeContext = createContext<TravelModeContextType | undefined>(undefined);

const TRAVEL_MODE_KEY = 'travel-mode-enabled';
const TRAVEL_MODE_FIRST_ACTIVATION_KEY = 'travel-mode-first-activation-done';

const triggerCelebration = () => {
  // First burst - center
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'],
  });

  // Side bursts with delay
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#3B82F6', '#8B5CF6', '#EC4899'],
    });
  }, 150);

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#F59E0B', '#10B981', '#3B82F6'],
    });
  }, 300);

  // Final shower
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.4 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA'],
      scalar: 1.2,
    });
  }, 450);
};

export const TravelModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTravelMode, setIsTravelMode] = useState(() => {
    const saved = localStorage.getItem(TRAVEL_MODE_KEY);
    return saved === 'true';
  });

  const [isFirstActivation, setIsFirstActivation] = useState(() => {
    return localStorage.getItem(TRAVEL_MODE_FIRST_ACTIVATION_KEY) !== 'true';
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(TRAVEL_MODE_KEY, isTravelMode.toString());
  }, [isTravelMode]);

  const enableTravelMode = useCallback(() => {
    const wasFirstActivation = localStorage.getItem(TRAVEL_MODE_FIRST_ACTIVATION_KEY) !== 'true';
    
    setIsTravelMode(true);
    
    // Trigger celebration on first activation
    if (wasFirstActivation) {
      localStorage.setItem(TRAVEL_MODE_FIRST_ACTIVATION_KEY, 'true');
      setIsFirstActivation(false);
      // Small delay to let the UI update first
      setTimeout(() => {
        triggerCelebration();
      }, 300);
    }
    
    // Navigate to map when enabling travel mode
    if (location.pathname !== '/mapa') {
      navigate('/mapa');
    }
  }, [navigate, location.pathname]);

  const disableTravelMode = useCallback(() => {
    setIsTravelMode(false);
  }, []);

  const toggleTravelMode = useCallback(() => {
    if (isTravelMode) {
      disableTravelMode();
    } else {
      enableTravelMode();
    }
  }, [isTravelMode, enableTravelMode, disableTravelMode]);

  return (
    <TravelModeContext.Provider value={{
      isTravelMode,
      enableTravelMode,
      disableTravelMode,
      toggleTravelMode,
      isFirstActivation,
    }}>
      {children}
    </TravelModeContext.Provider>
  );
};

export const useTravelMode = () => {
  const context = useContext(TravelModeContext);
  if (!context) {
    throw new Error('useTravelMode must be used within a TravelModeProvider');
  }
  return context;
};
