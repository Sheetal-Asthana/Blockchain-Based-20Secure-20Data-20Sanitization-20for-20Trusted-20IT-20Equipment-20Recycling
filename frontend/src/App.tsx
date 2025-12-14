import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Technician from "./pages/Technician";
import Devices from "./pages/dashboard/Devices";
import SanitizationLogs from "./pages/dashboard/SanitizationLogs";
import Certificates from "./pages/dashboard/Certificates";
import Verification from "./pages/dashboard/Verification";
import VerifyPublic from "./pages/Verify";
import AssetVerification from "./pages/AssetVerification";
import AuditTrail from "./pages/dashboard/AuditTrail";
import Settings from "./pages/admin/Settings";
import Blockchain from "./pages/Blockchain";
import AdvancedAnalytics from "./components/AdvancedAnalytics";
import BulkOperations from "./components/BulkOperations";
import MobileQRScanner from "./components/MobileQRScanner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/technician" element={<Technician />} />
          <Route path="/dashboard/devices" element={<Devices />} />
          <Route path="/dashboard/logs" element={<SanitizationLogs />} />
          <Route path="/dashboard/certificates" element={<Certificates />} />
          <Route path="/verify" element={<AssetVerification />} />
          <Route path="/verify/:id" element={<AssetVerification />} />
          <Route path="/dashboard/verification" element={<Verification />} />
          <Route path="/dashboard/audit" element={<AuditTrail />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/blockchain" element={<Blockchain />} />
          <Route path="/analytics" element={<AdvancedAnalytics />} />
          <Route path="/bulk-operations" element={<BulkOperations />} />
          <Route path="/qr-scanner" element={<MobileQRScanner />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
