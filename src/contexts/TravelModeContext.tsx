import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface TravelModeContextType {
  isTravelMode: boolean;
  enableTravelMode: () => void;
  disableTravelMode: () => void;
  toggleTravelMode: () => void;
}

const TravelModeContext = createContext<TravelModeContextType | undefined>(undefined);

const TRAVEL_MODE_KEY = 'travel-mode-enabled';

export const TravelModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTravelMode, setIsTravelMode] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem(TRAVEL_MODE_KEY);
    return saved === 'true';
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(TRAVEL_MODE_KEY, isTravelMode.toString());
  }, [isTravelMode]);

  const enableTravelMode = useCallback(() => {
    setIsTravelMode(true);
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
