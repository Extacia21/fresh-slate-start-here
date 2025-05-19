
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import BottomNavigation from "../navigation/BottomNavigation";
import SOSButton from "../common/SOSButton";
import { useEffect } from "react";
import { ScrollProvider } from "@/contexts/ScrollContext";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isChatRoute = location.pathname.includes('/app/chat');

  // Simulate authentication check
  useEffect(() => {
    // For demo purposes - check if user is coming from auth pages
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated && 
        !location.pathname.includes('/signin') && 
        !location.pathname.includes('/signup') && 
        !location.pathname.includes('/onboarding') && 
        !location.pathname.includes('/')) {
      navigate("/signin");
    }
  }, [navigate, location]);

  return (
    <ScrollProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 overflow-auto pb-20">
          <Outlet />
        </main>
        <SOSButton hidden={isChatRoute} />
        <BottomNavigation />
      </div>
    </ScrollProvider>
  );
};

export default MainLayout;
