
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Check if user has seen onboarding
      const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding") === "true";
      
      if (!hasSeenOnboarding) {
        navigate("/onboarding");
        return;
      }
      
      // Check if user is authenticated with Supabase
      const { data } = await supabase.auth.getSession();
      const isAuthenticated = !!data.session;
      
      // Update localStorage flag
      localStorage.setItem("isAuthenticated", isAuthenticated ? "true" : "false");
      
      // Redirect based on auth state
      navigate(isAuthenticated ? "/app" : "/signin");
    };
    
    // Increased delay to 5 seconds (5000ms) for the splash screen effect
    const timer = setTimeout(() => {
      checkAuthAndRedirect();
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white px-6 py-12 animate-fade-in">
      <div className="flex flex-col items-center">
        <div className="mb-4">
          <img 
            src="/lovable-uploads/e82acee9-dbf7-403a-98e2-29bf945dc3be.png" 
            alt="Crisis Connect Logo" 
            className="h-32 w-auto animate-scale-in"
          />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-foreground mt-4">Crisis Connect</h1>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Your essential companion for crisis management and emergency preparedness
        </p>
      </div>
      
      <div className="mt-12 flex items-center space-x-2">
        <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></div>
        <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse delay-100"></div>
        <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse delay-200"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
