import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface TravelProfile {
  // Section 1 - Responsible Data
  responsibleName: string;
  email: string;
  whatsapp: string;
  
  // Section 2 - Group Composition
  groupSize: number;
  travelers: Array<{
    name: string;
    age: number;
    height: string;
    firstTimeDisney: boolean;
  }>;
  
  // Section 3 - Trip Data
  arrivalDate: string;
  departureDate: string;
  parks: string[];
  parkDates: Array<{ park: string; date: string }>;
  
  // Section 4 - Accommodation
  hotel: string;
  hotelType: string;
  hasTransport: boolean;
  
  // Section 5 - Group Profile
  preferredLanguage: string;
  visitedBefore: boolean;
  lastVisit: string;
  groupStyle: string;
  priority: string[];
  
  // Section 6 - Disney App Access
  hasMyDisneyExperience: boolean;
  myDisneyEmail: string;
  myDisneyPassword: string;
  authorizeGuideAccess: boolean;
  
  // Section 7 - Special Needs
  physicalRestrictions: string;
  foodAllergies: string;
  usesStrollerOrWheelchair: string;
  
  // Section 8 - Celebrations
  hasCelebration: boolean;
  celebrationType: string;
  specialRequests: string;
  
  // Section 9 - Expectations
  expectations: string;
  concerns: string;
  
  // Meta
  completionPercentage: number;
  isLocked: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  travelProfile: TravelProfile;
  updateTravelProfile: (data: Partial<TravelProfile>) => void;
}

const defaultTravelProfile: TravelProfile = {
  responsibleName: '',
  email: '',
  whatsapp: '',
  groupSize: 1,
  travelers: [],
  arrivalDate: '',
  departureDate: '',
  parks: [],
  parkDates: [],
  hotel: '',
  hotelType: '',
  hasTransport: false,
  preferredLanguage: 'pt-BR',
  visitedBefore: false,
  lastVisit: '',
  groupStyle: 'moderado',
  priority: [],
  hasMyDisneyExperience: false,
  myDisneyEmail: '',
  myDisneyPassword: '',
  authorizeGuideAccess: false,
  physicalRestrictions: '',
  foodAllergies: '',
  usesStrollerOrWheelchair: '',
  hasCelebration: false,
  celebrationType: '',
  specialRequests: '',
  expectations: '',
  concerns: '',
  completionPercentage: 0,
  isLocked: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [travelProfile, setTravelProfile] = useState<TravelProfile>(defaultTravelProfile);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('ofp_user');
    const storedProfile = localStorage.getItem('ofp_profile');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedProfile) {
      setTravelProfile(JSON.parse(storedProfile));
    }
  }, []);

  const calculateCompletionPercentage = (profile: TravelProfile): number => {
    const requiredFields = [
      profile.responsibleName,
      profile.email,
      profile.whatsapp,
      profile.groupSize > 0,
      profile.travelers.length > 0,
      profile.arrivalDate,
      profile.departureDate,
      profile.parks.length > 0,
      profile.hotel,
      profile.hotelType,
    ];
    
    const completedFields = requiredFields.filter(Boolean).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulated login - in production, this would call your API
    if (email && password) {
      const mockUser: User = {
        id: '1',
        name: 'Maria Silva',
        email: email,
      };
      setUser(mockUser);
      localStorage.setItem('ofp_user', JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ofp_user');
  };

  const updateTravelProfile = (data: Partial<TravelProfile>) => {
    setTravelProfile(prev => {
      const updated = { ...prev, ...data };
      updated.completionPercentage = calculateCompletionPercentage(updated);
      localStorage.setItem('ofp_profile', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      travelProfile,
      updateTravelProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
