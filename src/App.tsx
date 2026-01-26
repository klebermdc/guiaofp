import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TravelModeProvider } from "@/contexts/TravelModeContext";
import { TravelModeQuickActions } from "@/components/travel-mode/TravelModeQuickActions";
import { SplashScreen } from "@/components/SplashScreen";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GuideDashboard from "./pages/GuideDashboard";
import TravelProfile from "./pages/TravelProfile";
import Agenda from "./pages/Agenda";
import Contact from "./pages/Contact";
import Content from "./pages/Content";
import Plan from "./pages/Plan";
import PostTrip from "./pages/PostTrip";
import Admin from "./pages/Admin";
import ParkMap from "./pages/ParkMap";
import TravelGuide from "./pages/TravelGuide";
import Attractions from "./pages/Attractions";
import ClientDetails from "./pages/ClientDetails";
import AccessBlocked from "./pages/AccessBlocked";
import NotFound from "./pages/NotFound";
import MultiPass from "./pages/MultiPass";
import RemoteGuidance from "./pages/RemoteGuidance";
import Checklists from "./pages/Checklists";
import Checkout from "./pages/Checkout";
import ResetPassword from "./pages/ResetPassword";
import NewPassword from "./pages/NewPassword";
import Restaurants from "./pages/Restaurants";

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
              <TooltipProvider>
                {showSplash && isFirstVisit && (
                  <SplashScreen onFinish={handleSplashFinish} minDuration={2500} />
                )}
                <Toaster />
                <Sonner />
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
                  <Route path="/checkout/:planId" element={<Checkout />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/cliente/:id" element={<ClientDetails />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                {/* Travel Mode Quick Actions - Global FAB */}
                <TravelModeQuickActions />
              </TooltipProvider>
            </TravelModeProvider>
          </AuthProvider>
        </BrowserRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
