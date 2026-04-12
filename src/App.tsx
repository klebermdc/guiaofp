import React, { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TravelModeProvider } from "@/contexts/TravelModeContext";
import { LoadingProvider } from "@/components/ui/loading-overlay";
import { TravelModeQuickActions } from "@/components/travel-mode/TravelModeQuickActions";
import { SplashScreen } from "@/components/SplashScreen";
import { GlobalErrorListener } from "@/components/GlobalErrorListener";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnalyticsProvider } from "@/components/analytics";

// Eager load critical pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Lazy load heavy pages
const GuideDashboard = lazyWithRetry(() => import("./pages/GuideDashboard"));
const TravelProfile = lazyWithRetry(() => import("./pages/TravelProfile"));
const Agenda = lazyWithRetry(() => import("./pages/Agenda"));
const Contact = lazyWithRetry(() => import("./pages/Contact"));
const Content = lazyWithRetry(() => import("./pages/Content"));
const Plan = lazyWithRetry(() => import("./pages/Plan"));
const PostTrip = lazyWithRetry(() => import("./pages/PostTrip"));
const Admin = lazyWithRetry(() => import("./pages/Admin"));
const ParkMap = lazyWithRetry(() => import("./pages/ParkMap"));
const TravelGuide = lazyWithRetry(() => import("./pages/TravelGuide"));
const Attractions = lazyWithRetry(() => import("./pages/Attractions"));
const ClientDetails = lazyWithRetry(() => import("./pages/ClientDetails"));
const AccessBlocked = lazyWithRetry(() => import("./pages/AccessBlocked"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const MultiPass = lazyWithRetry(() => import("./pages/MultiPass"));
const RemoteGuidance = lazyWithRetry(() => import("./pages/RemoteGuidance"));
const Checklists = lazyWithRetry(() => import("./pages/Checklists"));
const Checkout = lazyWithRetry(() => import("./pages/Checkout"));
const Register = lazyWithRetry(() => import("./pages/Register"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"));
const NewPassword = lazyWithRetry(() => import("./pages/NewPassword"));
const Restaurants = lazyWithRetry(() => import("./pages/Restaurants"));
const RestaurantsGuide = lazyWithRetry(() => import("./pages/RestaurantsGuide"));
const RestaurantDetails = lazyWithRetry(() => import("./pages/RestaurantDetails"));
const Favorites = lazyWithRetry(() => import("./pages/Favorites"));
const RoteiroPersonalizado = lazyWithRetry(() => import("./pages/RoteiroPersonalizado"));
const RoteiroQuestionario = lazyWithRetry(() => import("./pages/RoteiroQuestionario"));
const RoteiroView = lazyWithRetry(() => import("./pages/RoteiroView"));
const PlannerManual = lazyWithRetry(() => import("./pages/PlannerManual"));
const DocumentWalletPage = lazyWithRetry(() => import("./pages/DocumentWalletPage"));
const TermsAndPrivacy = lazyWithRetry(() => import("./pages/TermsAndPrivacy"));
const PartnerCoupons = lazyWithRetry(() => import("./pages/PartnerCoupons"));
const OrlandoSummary = lazyWithRetry(() => import("./pages/OrlandoSummary"));
const GuiaMiniViajante = lazyWithRetry(() => import("./pages/GuiaMiniViajante"));
const Top3 = lazyWithRetry(() => import("./pages/Top3"));
const HotelComparator = lazyWithRetry(() => import("./pages/HotelComparator"));
const TransportGuide = lazyWithRetry(() => import("./pages/TransportGuide"));
const OrlandoConcierge = lazyWithRetry(() => import("./components/OrlandoConcierge"));

// Simple loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex gap-1.5">
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
    </div>
  </div>
);

// Wrap lazy imports to reload the page on chunk load failures (stale deploy)
function lazyWithRetry(factory: () => Promise<{ default: React.ComponentType<any> }>) {
  return lazy(() =>
    factory().catch((err) => {
      // ChunkLoadError happens when a new deploy invalidates old chunk hashes
      const isChunkError =
        err?.name === 'ChunkLoadError' ||
        /Loading chunk \d+ failed/.test(err?.message ?? '') ||
        /Failed to fetch dynamically imported module/.test(err?.message ?? '');
      if (isChunkError) {
        window.location.reload();
        // Return a never-resolving promise so React doesn't render anything before reload
        return new Promise(() => {});
      }
      throw err;
    })
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes - avoid duplicate fetches
      retry: 1,
    },
  },
});

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Check immediately on mount - avoid showing splash if already seen
    return !sessionStorage.getItem('hasSeenSplash');
  });

  const handleSplashFinish = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasSeenSplash', 'true');
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <BrowserRouter>
            <AuthProvider>
              <TravelModeProvider>
                <LoadingProvider>
                  <AnalyticsProvider>
                    <TooltipProvider>
                    {showSplash && (
                    <SplashScreen onFinish={handleSplashFinish} minDuration={1800} />
                  )}
                  <Toaster />
                  <Sonner />
                  <GlobalErrorListener />
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/recuperar-senha" element={<ResetPassword />} />
                      <Route path="/nova-senha" element={<NewPassword />} />
                      <Route path="/acesso-bloqueado" element={<AccessBlocked />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/guia-dashboard" element={<GuideDashboard />} />
                      <Route path="/perfil" element={<TravelProfile />} />
                      <Route path="/agenda" element={<Agenda />} />
                      <Route path="/contato" element={<Contact />} />
                      <Route path="/conteudos" element={<Content />} />
                      <Route path="/mapa" element={<ParkMap />} />
                      <Route path="/guia" element={<TravelGuide />} />
                      <Route path="/plano" element={<Plan />} />
                      <Route path="/pos-viagem" element={<PostTrip />} />
                      <Route path="/atracoes" element={<Attractions />} />
                      <Route path="/multipass" element={<MultiPass />} />
                      <Route path="/guiamento-remoto" element={<RemoteGuidance />} />
                      <Route path="/checklists" element={<Checklists />} />
                      <Route path="/restaurantes" element={<Restaurants />} />
                      <Route path="/guia-restaurantes" element={<RestaurantsGuide />} />
                      <Route path="/restaurante/:slug" element={<RestaurantDetails />} />
                      <Route path="/favoritos" element={<Favorites />} />
                      <Route path="/roteiro-personalizado" element={<RoteiroPersonalizado />} />
                      <Route path="/roteiro-personalizado/questionario" element={<RoteiroQuestionario />} />
                      <Route path="/roteiro-personalizado/:id" element={<RoteiroView />} />
                      <Route path="/planner-manual" element={<PlannerManual />} />
                      <Route path="/planejador-manual" element={<Navigate to="/planner-manual" replace />} />
                      <Route path="/carteira" element={<DocumentWalletPage />} />
                      <Route path="/termos-e-privacidade" element={<TermsAndPrivacy />} />
                      <Route path="/cupons" element={<PartnerCoupons />} />
                      <Route path="/resumo-orlando" element={<OrlandoSummary />} />
                      <Route path="/guia-mini-viajante" element={<GuiaMiniViajante />} />
                      <Route path="/guia_mini_viajante" element={<Navigate to="/guia-mini-viajante" replace />} />
                      <Route path="/top3" element={<Top3 />} />
                      <Route path="/hoteis" element={<HotelComparator />} />
                      <Route path="/transporte" element={<TransportGuide />} />
                      <Route path="/concierge" element={<OrlandoConcierge />} />
                      <Route path="/registro/:planId" element={<Register />} />
                      <Route path="/checkout/:planId" element={<Checkout />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/admin/cliente/:id" element={<ClientDetails />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                    {/* Travel Mode Quick Actions - Global FAB */}
                    <TravelModeQuickActions />
                    </TooltipProvider>
                  </AnalyticsProvider>
                </LoadingProvider>
              </TravelModeProvider>
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
