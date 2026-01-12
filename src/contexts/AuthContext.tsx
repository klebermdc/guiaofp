import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface TravelProfile {
  id?: string;
  user_id?: string;
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
  parkDates: Array<{ park: string; date: string; time_start?: string; time_end?: string; notes?: string }>;
  guideName: string;
  
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
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  travelProfile: TravelProfile;
  updateTravelProfile: (data: Partial<TravelProfile>) => Promise<void>;
  loadProfile: () => Promise<void>;
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
  guideName: '',
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

// Helper to convert DB profile to frontend format
const dbToFrontend = (dbProfile: any): TravelProfile => ({
  id: dbProfile.id,
  user_id: dbProfile.user_id,
  responsibleName: dbProfile.responsible_name || '',
  email: dbProfile.email || '',
  whatsapp: dbProfile.whatsapp || '',
  groupSize: dbProfile.group_size || 1,
  travelers: dbProfile.travelers || [],
  arrivalDate: dbProfile.arrival_date || '',
  departureDate: dbProfile.departure_date || '',
  parks: dbProfile.parks || [],
  parkDates: dbProfile.park_dates || [],
  guideName: dbProfile.guide_name || '',
  hotel: dbProfile.hotel || '',
  hotelType: dbProfile.hotel_type || '',
  hasTransport: dbProfile.has_transport || false,
  preferredLanguage: dbProfile.preferred_language || 'pt-BR',
  visitedBefore: dbProfile.visited_before || false,
  lastVisit: dbProfile.last_visit || '',
  groupStyle: dbProfile.group_style || 'moderado',
  priority: dbProfile.priority || [],
  hasMyDisneyExperience: dbProfile.has_my_disney_experience || false,
  myDisneyEmail: dbProfile.my_disney_email || '',
  myDisneyPassword: dbProfile.my_disney_password || '',
  authorizeGuideAccess: dbProfile.authorize_guide_access || false,
  physicalRestrictions: dbProfile.physical_restrictions || '',
  foodAllergies: dbProfile.food_allergies || '',
  usesStrollerOrWheelchair: dbProfile.uses_stroller_or_wheelchair || '',
  hasCelebration: dbProfile.has_celebration || false,
  celebrationType: dbProfile.celebration_type || '',
  specialRequests: dbProfile.special_requests || '',
  expectations: dbProfile.expectations || '',
  concerns: dbProfile.concerns || '',
  completionPercentage: dbProfile.completion_percentage || 0,
  isLocked: dbProfile.is_locked || false,
});

// Helper to convert frontend profile to DB format
const frontendToDb = (profile: Partial<TravelProfile>) => {
  const dbProfile: any = {};
  
  if (profile.responsibleName !== undefined) dbProfile.responsible_name = profile.responsibleName;
  if (profile.email !== undefined) dbProfile.email = profile.email;
  if (profile.whatsapp !== undefined) dbProfile.whatsapp = profile.whatsapp;
  if (profile.groupSize !== undefined) dbProfile.group_size = profile.groupSize;
  if (profile.travelers !== undefined) dbProfile.travelers = profile.travelers;
  if (profile.arrivalDate !== undefined) dbProfile.arrival_date = profile.arrivalDate || null;
  if (profile.departureDate !== undefined) dbProfile.departure_date = profile.departureDate || null;
  if (profile.parks !== undefined) dbProfile.parks = profile.parks;
  if (profile.parkDates !== undefined) dbProfile.park_dates = profile.parkDates;
  if (profile.guideName !== undefined) dbProfile.guide_name = profile.guideName;
  if (profile.hotel !== undefined) dbProfile.hotel = profile.hotel;
  if (profile.hotelType !== undefined) dbProfile.hotel_type = profile.hotelType;
  if (profile.hasTransport !== undefined) dbProfile.has_transport = profile.hasTransport;
  if (profile.preferredLanguage !== undefined) dbProfile.preferred_language = profile.preferredLanguage;
  if (profile.visitedBefore !== undefined) dbProfile.visited_before = profile.visitedBefore;
  if (profile.lastVisit !== undefined) dbProfile.last_visit = profile.lastVisit;
  if (profile.groupStyle !== undefined) dbProfile.group_style = profile.groupStyle;
  if (profile.priority !== undefined) dbProfile.priority = profile.priority;
  if (profile.hasMyDisneyExperience !== undefined) dbProfile.has_my_disney_experience = profile.hasMyDisneyExperience;
  if (profile.myDisneyEmail !== undefined) dbProfile.my_disney_email = profile.myDisneyEmail;
  if (profile.myDisneyPassword !== undefined) dbProfile.my_disney_password = profile.myDisneyPassword;
  if (profile.authorizeGuideAccess !== undefined) dbProfile.authorize_guide_access = profile.authorizeGuideAccess;
  if (profile.physicalRestrictions !== undefined) dbProfile.physical_restrictions = profile.physicalRestrictions;
  if (profile.foodAllergies !== undefined) dbProfile.food_allergies = profile.foodAllergies;
  if (profile.usesStrollerOrWheelchair !== undefined) dbProfile.uses_stroller_or_wheelchair = profile.usesStrollerOrWheelchair;
  if (profile.hasCelebration !== undefined) dbProfile.has_celebration = profile.hasCelebration;
  if (profile.celebrationType !== undefined) dbProfile.celebration_type = profile.celebrationType;
  if (profile.specialRequests !== undefined) dbProfile.special_requests = profile.specialRequests;
  if (profile.expectations !== undefined) dbProfile.expectations = profile.expectations;
  if (profile.concerns !== undefined) dbProfile.concerns = profile.concerns;
  if (profile.completionPercentage !== undefined) dbProfile.completion_percentage = profile.completionPercentage;
  if (profile.isLocked !== undefined) dbProfile.is_locked = profile.isLocked;
  
  return dbProfile;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [travelProfile, setTravelProfile] = useState<TravelProfile>(defaultTravelProfile);

  const calculateCompletionPercentage = (profile: TravelProfile): number => {
    const requiredFields = [
      profile.responsibleName,
      profile.email,
      profile.whatsapp,
      profile.groupSize > 0,
      profile.arrivalDate,
      profile.departureDate,
      profile.parks.length > 0,
      profile.hotel,
      profile.hotelType,
    ];
    
    const completedFields = requiredFields.filter(Boolean).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  const loadProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data && !error) {
      setTravelProfile(dbToFrontend(data));
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Load profile after auth state changes
        if (session?.user) {
          setTimeout(() => {
            loadProfile();
          }, 0);
        } else {
          setTravelProfile(defaultTravelProfile);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      if (session?.user) {
        loadProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: 'Email ou senha incorretos.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { success: false, error: 'Este email já está cadastrado.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setTravelProfile(defaultTravelProfile);
  };

  const updateTravelProfile = async (data: Partial<TravelProfile>) => {
    if (!user) return;

    const updated = { ...travelProfile, ...data };
    updated.completionPercentage = calculateCompletionPercentage(updated);
    
    // Update local state immediately
    setTravelProfile(updated);
    
    // Save to database
    const dbData = frontendToDb({ ...data, completionPercentage: updated.completionPercentage });
    
    await supabase
      .from('profiles')
      .update(dbData)
      .eq('user_id', user.id);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
      travelProfile,
      updateTravelProfile,
      loadProfile,
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
