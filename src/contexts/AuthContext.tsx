import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  hotelAddress: string;
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
  
  // Checklist
  checklistItems: Record<string, boolean>;
  
  // Meta
  completionPercentage: number;
  isLocked: boolean;
  
  // Access Control
  isAccessEnabled: boolean;
  planTier: 'basic' | 'premium';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileLoading: boolean;
  isAccessEnabled: boolean;
  planTier: 'basic' | 'premium';
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
  hotelAddress: '',
  hotelType: '',
  hasTransport: false,
  preferredLanguage: 'pt-BR',
  visitedBefore: false,
  lastVisit: '',
  groupStyle: 'moderado',
  priority: [],
  hasMyDisneyExperience: false,
  authorizeGuideAccess: false,
  physicalRestrictions: '',
  foodAllergies: '',
  usesStrollerOrWheelchair: '',
  hasCelebration: false,
  celebrationType: '',
  specialRequests: '',
  expectations: '',
  concerns: '',
  checklistItems: {},
  completionPercentage: 0,
  isLocked: false,
  isAccessEnabled: false,
  planTier: 'basic',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to convert DB profile to frontend format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  hotelAddress: dbProfile.hotel_address || '',
  hotelType: dbProfile.hotel_type || '',
  hasTransport: dbProfile.has_transport || false,
  preferredLanguage: dbProfile.preferred_language || 'pt-BR',
  visitedBefore: dbProfile.visited_before || false,
  lastVisit: dbProfile.last_visit || '',
  groupStyle: dbProfile.group_style || 'moderado',
  priority: dbProfile.priority || [],
  hasMyDisneyExperience: dbProfile.has_my_disney_experience || false,
  authorizeGuideAccess: dbProfile.authorize_guide_access || false,
  physicalRestrictions: dbProfile.physical_restrictions || '',
  foodAllergies: dbProfile.food_allergies || '',
  usesStrollerOrWheelchair: dbProfile.uses_stroller_or_wheelchair || '',
  hasCelebration: dbProfile.has_celebration || false,
  celebrationType: dbProfile.celebration_type || '',
  specialRequests: dbProfile.special_requests || '',
  expectations: dbProfile.expectations || '',
  concerns: dbProfile.concerns || '',
  checklistItems: dbProfile.checklist_items || {},
  completionPercentage: dbProfile.completion_percentage || 0,
  isLocked: dbProfile.is_locked || false,
  isAccessEnabled: dbProfile.is_access_enabled || false,
  planTier: dbProfile.plan_tier || 'basic',
});

// Helper to convert frontend profile to DB format
const frontendToDb = (profile: Partial<TravelProfile>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  if (profile.hotelAddress !== undefined) dbProfile.hotel_address = profile.hotelAddress;
  if (profile.hotelType !== undefined) dbProfile.hotel_type = profile.hotelType;
  if (profile.hasTransport !== undefined) dbProfile.has_transport = profile.hasTransport;
  if (profile.preferredLanguage !== undefined) dbProfile.preferred_language = profile.preferredLanguage;
  if (profile.visitedBefore !== undefined) dbProfile.visited_before = profile.visitedBefore;
  if (profile.lastVisit !== undefined) dbProfile.last_visit = profile.lastVisit;
  if (profile.groupStyle !== undefined) dbProfile.group_style = profile.groupStyle;
  if (profile.priority !== undefined) dbProfile.priority = profile.priority;
  if (profile.hasMyDisneyExperience !== undefined) dbProfile.has_my_disney_experience = profile.hasMyDisneyExperience;
  if (profile.authorizeGuideAccess !== undefined) dbProfile.authorize_guide_access = profile.authorizeGuideAccess;
  if (profile.physicalRestrictions !== undefined) dbProfile.physical_restrictions = profile.physicalRestrictions;
  if (profile.foodAllergies !== undefined) dbProfile.food_allergies = profile.foodAllergies;
  if (profile.usesStrollerOrWheelchair !== undefined) dbProfile.uses_stroller_or_wheelchair = profile.usesStrollerOrWheelchair;
  if (profile.hasCelebration !== undefined) dbProfile.has_celebration = profile.hasCelebration;
  if (profile.celebrationType !== undefined) dbProfile.celebration_type = profile.celebrationType;
  if (profile.specialRequests !== undefined) dbProfile.special_requests = profile.specialRequests;
  if (profile.expectations !== undefined) dbProfile.expectations = profile.expectations;
  if (profile.concerns !== undefined) dbProfile.concerns = profile.concerns;
  if (profile.checklistItems !== undefined) dbProfile.checklist_items = profile.checklistItems;
  if (profile.completionPercentage !== undefined) dbProfile.completion_percentage = profile.completionPercentage;
  if (profile.isLocked !== undefined) dbProfile.is_locked = profile.isLocked;
  
  return dbProfile;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
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

  const loadProfileForUser = useCallback(async (userId: string): Promise<TravelProfile> => {
    try {
      // Retry logic for profile fetch with exponential backoff
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fetchProfileWithRetry = async (attempt = 1): Promise<{ data: any; error: any }> => {
        const timeout = attempt === 1 ? 10000 : 15000; // 10s first, 15s retry
        
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), timeout)
        );
        
        try {
          return await Promise.race([profilePromise, timeoutPromise]) as Awaited<typeof profilePromise>;
        } catch (err) {
          if (attempt < 2) {
            console.log(`[Auth] Profile fetch attempt ${attempt} failed, retrying...`);
            await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
            return fetchProfileWithRetry(attempt + 1);
          }
          throw err;
        }
      };
      
      const { data: profileData, error: profileError } = await fetchProfileWithRetry();
      
      // Contract fetch with timeout - run in parallel but don't block
      let contractData = null;
      try {
        const contractPromise = supabase
          .from('contracts')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        const result = await Promise.race([
          contractPromise,
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Contract fetch timeout')), 6000)
          )
        ]) as Awaited<typeof contractPromise>;
        contractData = result.data;
      } catch {
        // Contract is optional, continue without it
      }
      
      let profile = defaultTravelProfile;
      
      if (profileData && !profileError) {
        profile = dbToFrontend(profileData);
      }
      
      // Merge contract data if available
      if (contractData) {
        if (!profile.guideName && contractData.guide_name) {
          profile.guideName = contractData.guide_name;
        }
        if ((!profile.parkDates || profile.parkDates.length === 0) && contractData.parks && Array.isArray(contractData.parks)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          profile.parkDates = contractData.parks as any[];
        }
        if (!profile.arrivalDate && contractData.start_date) {
          profile.arrivalDate = contractData.start_date;
        }
        if (!profile.departureDate && contractData.end_date) {
          profile.departureDate = contractData.end_date;
        }
      }
      
      // Recalculate completion percentage based on actual data
      profile.completionPercentage = calculateCompletionPercentage(profile);
      
      return profile;
    } catch (error) {
      console.error('[Auth] Error loading profile:', error);
      return defaultTravelProfile;
    }
  }, []);

  const loadProfile = async () => {
    if (!user) return;
    
    setIsProfileLoading(true);
    
    try {
      const profile = await loadProfileForUser(user.id);
      setTravelProfile(profile);
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Use refs to track initialization state across re-renders
  const initCompletedRef = React.useRef(false);
  const isInitializingRef = React.useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    // CRITICAL: Skip re-initialization if already completed
    // This prevents re-auth when switching tabs
    if (initCompletedRef.current) {
      return;
    }
    
    // Prevent concurrent initialization
    if (isInitializingRef.current) {
      return;
    }
    
    isInitializingRef.current = true;
    
    // CRITICAL: Absolute safety timeout - ALWAYS fires after 12 seconds
    // Increased to allow more time for slow database connections
    const absoluteTimeout = setTimeout(() => {
      if (isMounted && !initCompletedRef.current) {
        console.warn('[Auth] Absolute safety timeout triggered');
        setIsLoading(false);
        setIsProfileLoading(false);
        initCompletedRef.current = true;
      }
    }, 12000);

    const initializeAuth = async () => {
      try {
        // Session check with 8s timeout (increased for slow connections)
        const sessionPromise = supabase.auth.getSession();
        const sessionTimeout = new Promise<{ data: { session: null }, error: Error }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null }, error: new Error('Session timeout') }), 8000)
        );
        
        const { data: { session: currentSession }, error } = await Promise.race([
          sessionPromise,
          sessionTimeout
        ]);
        
        if (!isMounted) return;
        
        if (error) {
          // Silently ignore refresh token errors when no valid session exists
          const isRefreshTokenError = error.message?.includes('Refresh Token') || error.message?.includes('refresh_token');
          if (isRefreshTokenError) {
            console.log('[Auth] No valid session found, continuing as unauthenticated');
          } else {
            console.warn('[Auth] Session check failed:', error.message);
          }
          setIsLoading(false);
          initCompletedRef.current = true;
          return;
        }
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          setIsProfileLoading(true);
          
          try {
            const profile = await loadProfileForUser(currentSession.user.id);
            if (isMounted) {
              setTravelProfile(profile);
            }
          } catch (profileError) {
            console.error('[Auth] Profile error:', profileError);
          } finally {
            if (isMounted) {
              setIsProfileLoading(false);
            }
          }
        }
      } catch (error) {
        console.error('[Auth] Init error:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          initCompletedRef.current = true;
        }
      }
    };

    // Set up auth state listener for ONGOING changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        
        // Skip during initial load
        if (!initCompletedRef.current && event === 'INITIAL_SESSION') {
          return;
        }
        
        // Skip TOKEN_REFRESHED events to prevent unnecessary reloads
        if (event === 'TOKEN_REFRESHED') {
          // Just update session silently without reloading profile
          setSession(newSession);
          return;
        }
        
        // Skip SIGNED_IN if it's just a session refresh for the same user
        // This prevents unmounting the current page when switching tabs
        if (event === 'SIGNED_IN' && newSession?.user?.id === user?.id && initCompletedRef.current) {
          setSession(newSession);
          return;
        }
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Only update profile for genuine auth changes (new user or sign out)
        if (initCompletedRef.current && (event === 'SIGNED_IN' || event === 'SIGNED_OUT')) {
          if (newSession?.user) {
            setIsProfileLoading(true);
            try {
              const profile = await loadProfileForUser(newSession.user.id);
              if (isMounted) {
                setTravelProfile(profile);
              }
            } catch (error) {
              console.error('[Auth] Profile load error:', error);
            } finally {
              if (isMounted) {
                setIsProfileLoading(false);
              }
            }
          } else {
            setTravelProfile(defaultTravelProfile);
            setIsProfileLoading(false);
          }
        }
      }
    );

    initializeAuth();

    return () => {
      isMounted = false;
      clearTimeout(absoluteTimeout);
      subscription.unsubscribe();
    };
  }, [loadProfileForUser]);

  // IMPROVED LOGIN: Waits for profile to load before returning success
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Email ou senha incorretos.' };
        }
        return { success: false, error: error.message };
      }

      // CRITICAL: Wait for profile to load BEFORE returning success
      // This ensures the dashboard has data ready when it mounts
      if (data.user) {
        setSession(data.session);
        setUser(data.user);
        setIsProfileLoading(true);
        
        try {
          const profile = await loadProfileForUser(data.user.id);
          setTravelProfile(profile);
        } catch (profileError) {
          console.error('[Auth] Login profile error:', profileError);
          // Still succeed login even if profile fails
        } finally {
          setIsProfileLoading(false);
        }
      }

      return { success: true };
    } catch (err) {
      console.error('[Auth] Login error:', err);
      return { success: false, error: 'Erro ao fazer login. Tente novamente.' };
    }
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
    // Reset refs so re-login triggers fresh init
    initCompletedRef.current = false;
    isInitializingRef.current = false;
    
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setTravelProfile(defaultTravelProfile);
  };

  const updateTravelProfile = async (data: Partial<TravelProfile>) => {
    if (!user) return;
    
    // Optimistic update
    const updatedProfile = { ...travelProfile, ...data };
    updatedProfile.completionPercentage = calculateCompletionPercentage(updatedProfile);
    setTravelProfile(updatedProfile);
    
    try {
      const dbData = frontendToDb({ ...data, completionPercentage: updatedProfile.completionPercentage });
      
      const { error } = await supabase
        .from('profiles')
        .update(dbData)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('[Auth] Profile update error:', error);
        // Revert on error
        setTravelProfile(travelProfile);
      }
    } catch (error) {
      console.error('[Auth] Profile update error:', error);
      setTravelProfile(travelProfile);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    isProfileLoading,
    isAccessEnabled: travelProfile.isAccessEnabled,
    planTier: travelProfile.planTier,
    login,
    signup,
    logout,
    travelProfile,
    updateTravelProfile,
    loadProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
