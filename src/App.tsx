import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { LanguageRouteHandler } from "@/components/LanguageRouteHandler";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/AdminLogin";
import AdminForgotPassword from "./pages/AdminForgotPassword";
import AdminResetPassword from "./pages/AdminResetPassword";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import About from "./pages/About";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyIdentity from "./pages/VerifyIdentity";
import TransactionHistory from "./pages/TransactionHistory";
import LiveActivity from "./pages/LiveActivity";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Supported language codes for routing
const LANGUAGE_CODES = ['de', 'fr', 'es', 'zh', 'ar', 'ru', 'ja', 'ko', 'pt', 'hi'];

// Component that renders all routes (used for both root and language-prefixed paths)
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PageTransition><Index /></PageTransition>} />
      <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
      <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
      <Route path="/admin-login" element={<PageTransition><AdminLogin /></PageTransition>} />
      <Route path="/admin-forgot-password" element={<PageTransition><AdminForgotPassword /></PageTransition>} />
      <Route path="/admin-reset-password" element={<PageTransition><AdminResetPassword /></PageTransition>} />
      <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
      <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
      <Route path="/about" element={<PageTransition><About /></PageTransition>} />
      <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
      <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
      <Route path="/verify-email" element={<PageTransition><VerifyEmail /></PageTransition>} />
      <Route path="/verify-identity" element={<PageTransition><VerifyIdentity /></PageTransition>} />
      <Route path="/verify-identity/*" element={<PageTransition><VerifyIdentity /></PageTransition>} />
      <Route path="/transactions" element={<PageTransition><TransactionHistory /></PageTransition>} />
      <Route path="/live-activity" element={<PageTransition><LiveActivity /></PageTransition>} />
      <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
    </Routes>
  );
};

// Language-prefixed routes wrapper
const LanguageRoutesWrapper = () => {
  const { lang } = useParams<{ lang: string }>();
  
  return (
    <LanguageRouteHandler>
      <AppRoutes />
    </LanguageRouteHandler>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <>
      <SEOHead />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Language-prefixed routes (de, fr, es, etc.) */}
          {LANGUAGE_CODES.map(lang => (
            <Route key={lang} path={`/${lang}/*`} element={<LanguageRoutesWrapper />} />
          ))}
          
          {/* Default English routes (no prefix) */}
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
          <Route path="/admin-login" element={<PageTransition><AdminLogin /></PageTransition>} />
          <Route path="/admin-forgot-password" element={<PageTransition><AdminForgotPassword /></PageTransition>} />
          <Route path="/admin-reset-password" element={<PageTransition><AdminResetPassword /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
          <Route path="/verify-email" element={<PageTransition><VerifyEmail /></PageTransition>} />
          <Route path="/verify-identity" element={<PageTransition><VerifyIdentity /></PageTransition>} />
          <Route path="/verify-identity/*" element={<PageTransition><VerifyIdentity /></PageTransition>} />
          <Route path="/transactions" element={<PageTransition><TransactionHistory /></PageTransition>} />
          <Route path="/live-activity" element={<PageTransition><LiveActivity /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
