import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CrushPipeline from "./pages/CrushPipeline";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/*" element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="crushes" element={<CrushPipeline />} />
            <Route path="chat" element={<div>Chat Page - Coming Soon</div>} />
            <Route path="personalization" element={<div>Personalization Page - Coming Soon</div>} />
            <Route path="insights" element={<div>Insights Page - Coming Soon</div>} />
            <Route path="settings" element={<div>Settings Page - Coming Soon</div>} />
            <Route path="profile" element={<div>Profile Page - Coming Soon</div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
