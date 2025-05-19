
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import BottomNavigation from "../navigation/BottomNavigation";
import SOSButton from "../common/SOSButton";
import { useEffect } from "react";
import { ScrollProvider } from "@/contexts/ScrollContext";
import { useAuth } from "@/contexts/AuthContext";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const isChatRoute = location.pathname.includes('/app/chat');

  // Authentication check using Auth context
  useEffect(() => {
    // Only redirect if auth check is complete and user is not authenticated
    if (!isLoading && !user && 
        !location.pathname.includes('/signin') && 
        !location.pathname.includes('/signup') && 
        !location.pathname.includes('/onboarding') && 
        !location.pathname.includes('/')) {
      navigate("/signin");
    }
  }, [navigate, location, user, isLoading]);

  return (
    <ScrollProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 overflow-auto pb-20">
          {children}
        </main>
        <SOSButton hidden={isChatRoute} />
        <BottomNavigation />
      </div>
    </ScrollProvider>
  );
};

export default MainLayout;
