import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TravelModeProvider } from "@/contexts/TravelModeContext";
import { LoadingProvider } from "@/components/ui/loading-overlay";
import { TravelModeQuickActions } from "@/components/travel-mode/TravelModeQuickActions";
import { SplashScreen } from "@/components/SplashScreen";
import { GlobalErrorListener } from "@/components/GlobalErrorListener";

// Eager load critical pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Lazy load heavy pages
const GuideDashboard = lazy(() => import("./pages/GuideDashboard"));
const TravelProfile = lazy(() => import("./pages/TravelProfile"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Contact = lazy(() => import("./pages/Contact"));
const Content = lazy(() => import("./pages/Content"));
const Plan = lazy(() => import("./pages/Plan"));
const PostTrip = lazy(() => import("./pages/PostTrip"));
const Admin = lazy(() => import("./pages/Admin"));
const ParkMap = lazy(() => import("./pages/ParkMap"));
const TravelGuide = lazy(() => import("./pages/TravelGuide"));
const Attractions = lazy(() => import("./pages/Attractions"));
const ClientDetails = lazy(() => import("./pages/ClientDetails"));
const AccessBlocked = lazy(() => import("./pages/AccessBlocked"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MultiPass = lazy(() => import("./pages/MultiPass"));
const RemoteGuidance = lazy(() => import("./pages/RemoteGuidance"));
const Checklists = lazy(() => import("./pages/Checklists"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NewPassword = lazy(() => import("./pages/NewPassword"));
const Restaurants = lazy(() => import("./pages/Restaurants"));
const RestaurantsGuide = lazy(() => import("./pages/RestaurantsGuide"));
const RestaurantDetails = lazy(() => import("./pages/RestaurantDetails"));
const RoteiroPersonalizado = lazy(() => import("./pages/RoteiroPersonalizado"));
const RoteiroQuestionario = lazy(() => import("./pages/RoteiroQuestionario"));
const RoteiroView = lazy(() => import("./pages/RoteiroView"));
const PlannerManual = lazy(() => import("./pages/PlannerManual"));

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

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    // Check if user has seen splash before in this session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
      setIsFirstVisit(false);
    }
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasSeenSplash', 'true');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BrowserRouter>
          <AuthProvider>
            <TravelModeProvider>
              <LoadingProvider>
                <TooltipProvider>
                {showSplash && isFirstVisit && (
                  <SplashScreen onFinish={handleSplashFinish} minDuration={2500} />
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
                    <Route path="/roteiro-personalizado" element={<RoteiroPersonalizado />} />
                    <Route path="/roteiro-personalizado/questionario" element={<RoteiroQuestionario />} />
                    <Route path="/roteiro-personalizado/:id" element={<RoteiroView />} />
                    <Route path="/planner-manual" element={<PlannerManual />} />
                    <Route path="/checkout/:planId" element={<Checkout />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin/cliente/:id" element={<ClientDetails />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                {/* Travel Mode Quick Actions - Global FAB */}
                <TravelModeQuickActions />
                </TooltipProvider>
              </LoadingProvider>
            </TravelModeProvider>
          </AuthProvider>
        </BrowserRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
