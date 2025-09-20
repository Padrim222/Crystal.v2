import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AnimatePresence } from "framer-motion";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CrushPipeline from "./pages/CrushPipeline";
import Chat from "./pages/Chat";
import Subscription from "./pages/Subscription";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";
import { InstallPWA } from "./components/InstallPWA";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <InstallPWA />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AppLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="crushes" element={<CrushPipeline />} />
              <Route path="chat" element={<Chat />} />
              <Route path="personalization" element={<div>Personalization Page - Coming Soon</div>} />
              <Route path="insights" element={<div>Insights Page - Coming Soon</div>} />
              <Route path="settings" element={<div>Settings Page - Coming Soon</div>} />
              <Route path="profile" element={<div>Profile Page - Coming Soon</div>} />
              <Route path="subscription" element={<Subscription />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
