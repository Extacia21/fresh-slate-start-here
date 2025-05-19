
import { Outlet } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from './MainLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const MainLayoutAuthWrapper = () => {
  const [hasShownWelcomeToast, setHasShownWelcomeToast] = useState(false);
  
  // Check for auth session once and show welcome toast only on new login
  useEffect(() => {
    const handleAuthChange = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionKey = 'auth-session-welcomed';
      
      // Get session ID and last welcomed session from localStorage
      const sessionId = data.session?.id;
      const lastWelcomedSession = localStorage.getItem(sessionKey);
      
      if (sessionId && sessionId !== lastWelcomedSession && !hasShownWelcomeToast) {
        // Store that we've welcomed this session
        localStorage.setItem(sessionKey, sessionId);
        setHasShownWelcomeToast(true);
        
        // Show welcome toast
        toast.success('Successfully signed in', {
          description: 'Welcome to the Crisis Management App',
        });
      }
    };
    
    handleAuthChange();
  }, [hasShownWelcomeToast]);
  
  return (
    <AuthProvider>
      <ProtectedRoute redirectTo="/signin">
        <MainLayout>
          <Outlet />
        </MainLayout>
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default MainLayoutAuthWrapper;
