
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Layouts
import AppLayout from "@/layouts/AppLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Pages
import Home from "@/pages/Home";
import Alerts from "@/pages/Alerts";
import AlertDetail from "@/pages/AlertDetail";
import Report from "@/pages/Report";
import Contacts from "@/pages/Contacts";
import Resources from "@/pages/Resources";
import ResourceDetail from "@/pages/ResourceDetail";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import FillProfile from "@/pages/FillProfile";
import Onboarding from "@/pages/Onboarding";
import Nearby from "@/pages/Nearby";
import Map from "@/pages/Map";

// Protecting routes
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OnboardingCheck from "@/components/auth/OnboardingCheck";
import MainLayoutAuthWrapper from "@/components/layouts/MainLayoutAuthWrapper";

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <NavigationProvider>
              <Routes>
                {/* Root route redirects to onboarding or signin based on localStorage flag */}
                <Route path="/" element={<Navigate to="/onboarding" replace />} />
                
                {/* Onboarding */}
                <Route path="/onboarding" element={<Onboarding />} />
                
                {/* Auth Routes */}
                <Route path="/" element={<AuthLayout />}>
                  <Route path="signin" element={<SignIn />} />
                  <Route path="signup" element={<SignUp />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />
                  <Route path="fill-profile" element={<FillProfile />} />
                </Route>

                {/* App Routes - Protected */}
                <Route
                  path="/app"
                  element={<MainLayoutAuthWrapper />}
                >
                  <Route index element={<Home />} />
                  <Route path="alerts" element={<Alerts />} />
                  <Route path="alerts/:id" element={<AlertDetail />} />
                  <Route path="report" element={<Report />} />
                  <Route path="contacts" element={<Contacts />} />
                  <Route path="resources" element={<Resources />} />
                  <Route path="resources/:id" element={<ResourceDetail />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="chat/:id" element={<Chat />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="nearby" element={<Nearby />} />
                  <Route path="map" element={<Map />} />
                </Route>

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/onboarding" replace />} />
              </Routes>
            </NavigationProvider>

            {/* Toasts */}
            <Toaster />
            <SonnerToaster position="top-center" />
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
