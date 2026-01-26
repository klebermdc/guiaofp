import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { vi } from 'vitest';

// Mock useAuth hook
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@test.com' },
    session: { access_token: 'test-token' },
    isAuthenticated: true,
    isLoading: false,
    isProfileLoading: false,
    isAccessEnabled: true,
    planTier: 'premium',
    login: async () => ({ success: true }),
    signup: async () => ({ success: true }),
    logout: async () => {},
    travelProfile: {
      responsibleName: 'Test User',
      email: 'test@test.com',
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
      completionPercentage: 50,
      isLocked: false,
      isAccessEnabled: true,
      planTier: 'premium',
    },
    updateTravelProfile: async () => {},
    loadProfile: async () => {},
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock useUserRole hook
vi.mock('@/hooks/useUserRole', () => ({
  useUserRole: () => ({
    roles: ['guide'],
    isGuide: true,
    isAdmin: false,
    isLoading: false,
  }),
}));

// Mock TravelModeContext
vi.mock('@/contexts/TravelModeContext', () => ({
  useTravelMode: () => ({
    isTravelMode: false,
    enableTravelMode: () => {},
    disableTravelMode: () => {},
    toggleTravelMode: () => {},
  }),
  TravelModeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock LanguageContext
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'pt',
    setLanguage: () => {},
    t: (key: string) => key,
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
          single: async () => ({ data: null, error: null }),
          order: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
        order: () => ({
          limit: async () => ({ data: [], error: null }),
        }),
      }),
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
    }),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    functions: {
      invoke: async () => ({ data: null, error: null }),
    },
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

interface AllProvidersProps {
  children: React.ReactNode;
}

const AllProviders = ({ children }: AllProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render, screen };
