import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { AppProvider } from "./context/AppContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import HospitalDetail from "./pages/HospitalDetail";
import NotFound from "./pages/NotFound";

import TutorialModal from "@/components/AlertModal";

import tutorial1 from "@/assets/alert1.webp";
import tutorial2 from "@/assets/alert2.webp";

const queryClient = new QueryClient();

/* ================================
   SCROLL TO TOP SAAT ROUTE BERUBAH
================================ */

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          {/* reset scroll setiap pindah halaman */}
          <ScrollToTop />

          {/* modal tutorial */}
          <TutorialModal image1={tutorial1} image2={tutorial2} />

          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/hospital/:id" element={<HospitalDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
