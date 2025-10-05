import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./hooks/useTheme";
import { LanguageProvider } from "./hooks/useLanguage";
import { AuthProvider, useAuthState, useUserPlan, useAdminAuth } from "./hooks/auth";
import { useAuth } from "./hooks/useAuth";
import { useUserStatus } from "./hooks/useUserStatus";
import { PlanProvider } from "./contexts/PlanContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPreview from "./pages/AdminPreview";
import InactiveAccount from "./pages/InactiveAccount";
import AppViewer from "./pages/AppViewer";
import PricingPage from "./pages/PricingPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import Support from "./pages/Support";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthState();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <AuthenticatedRoute>{children}</AuthenticatedRoute>;
};

const AuthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isActive, isLoading: statusLoading } = useUserStatus();
  const { hasActivePlan, planName, isLoading: planLoading } = useUserPlan();
  
  // Wait for both status and plan loading to finish
  if (statusLoading || planLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isActive) {
    return <InactiveAccount />;
  }
  
  console.log('AuthenticatedRoute - Final decision:', { 
    hasActivePlan, 
    planName,
    shouldGoToApp: hasActivePlan && planName !== 'Gratuito',
    shouldGoToPricing: !hasActivePlan || planName === 'Gratuito'
  });
  
  // Redirecionar usuários com plano "Gratuito" ou sem plano para /pricing
  // Usuários com planos pagos (Essencial, Profissional, Empresarial) vão para /app
  if (!hasActivePlan || planName === 'Gratuito') {
    console.log('Redirecting to /pricing');
    return <Navigate to="/pricing" replace />;
  }
  
  console.log('Allowing access to /app');
  return <>{children}</>;
};

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isLoading } = useAdminAuth();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  
  // Hold route until both auth and admin checks are done
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-app-muted">Verificando permissões...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated || !isAdmin) {
    console.error('❌ Acesso negado ao admin - user:', user?.email, 'isAdmin:', isAdmin);
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PlanProvider>
          <ThemeProvider>
            <LanguageProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/app" element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } />
                    <Route path="/app/:slug" element={<AppViewer />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={
                      <AdminProtectedRoute>
                        <AdminDashboard />
                      </AdminProtectedRoute>
                    } />
                    <Route path="/admin/preview" element={
                      <AdminProtectedRoute>
                        <AdminPreview />
                      </AdminProtectedRoute>
                    } />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/inactive" element={<InactiveAccount />} />
            <Route path="/suporte" element={<Support />} />
                    <Route path="/" element={<Auth />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </LanguageProvider>
          </ThemeProvider>
        </PlanProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
