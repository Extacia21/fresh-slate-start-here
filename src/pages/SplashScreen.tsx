
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if user has seen onboarding
      const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding") === "true";
      if (hasSeenOnboarding) {
        // Check if user is authenticated
        const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
        navigate(isAuthenticated ? "/app" : "/signin");
      } else {
        navigate("/onboarding");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-background px-6 py-12 animate-fade-in">
      <div className="flex flex-col items-center">
        <div className="bg-primary/10 p-4 rounded-full mb-6">
          <ShieldAlert className="text-primary h-16 w-16" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">CrisisReady</h1>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Your essential companion for crisis management and emergency preparedness
        </p>
      </div>
      
      <div className="mt-12 flex items-center space-x-2">
        <div className="h-2 w-2 rounded-full bg-primary/30 animate-pulse"></div>
        <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse delay-100"></div>
        <div className="h-2 w-2 rounded-full bg-primary/70 animate-pulse delay-200"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
