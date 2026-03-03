import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import HospitalDetail from "./pages/HospitalDetail";
import NotFound from "./pages/NotFound";
import TutorialModal from "@/components/TutorialModal";

import tutorial1 from "@/assets/tutorial1.png";
import tutorial2 from "@/assets/tutorial2.webp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          {/* 🔥 PINDAHKAN KE DALAM ROUTER */}
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
