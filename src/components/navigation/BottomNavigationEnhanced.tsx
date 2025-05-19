
import { useNavigate, useLocation } from "react-router-dom";
import { Home, AlertTriangle, FileText, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScroll } from "@/contexts/ScrollContext";
import { useEffect, useState } from "react";

const BottomNavigationEnhanced = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isScrollingDown } = useScroll();
  const [isVisible, setIsVisible] = useState(true);
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  // Enhanced hiding logic with smoother transitions
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isScrollingDown) {
      timeout = setTimeout(() => {
        setIsVisible(false);
      }, 100);
    } else {
      setIsVisible(true);
    }
    
    return () => clearTimeout(timeout);
  }, [isScrollingDown]);

  const navItems = [
    { 
      icon: Home, 
      label: "Home", 
      path: "/app",
      isExact: location.pathname === "/app" || location.pathname === "/app/",
    },
    { 
      icon: AlertTriangle, 
      label: "Alerts", 
      path: "/app/alerts",
      isExact: false,
    },
    { 
      icon: FileText, 
      label: "Resources", 
      path: "/app/resources",
      isExact: false,
    },
    { 
      icon: Phone, 
      label: "Contacts", 
      path: "/app/contacts",
      isExact: false,
    },
    { 
      icon: User, 
      label: "Profile", 
      path: "/app/profile",
      isExact: false,
    },
  ];

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 transition-transform duration-300 ease-in-out",
        !isVisible ? "translate-y-full" : "translate-y-0"
      )}
    >
      <div className="flex justify-between items-center px-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={cn(
              "flex flex-col items-center py-3 px-2 w-1/5 transition-colors",
              (item.isExact || (!item.isExact && isActive(item.path))) 
                ? "text-primary" 
                : "text-muted-foreground"
            )}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigationEnhanced;
