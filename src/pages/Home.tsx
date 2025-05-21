import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MapPin, FileText, Phone, MessageCircle, Shield, AlertTriangle, Cloud, CloudRain, CloudLightning, Info } from "lucide-react";
import QuickAction from "@/components/common/QuickAction";
import AlertCard from "@/components/common/AlertCard";
import { toast } from "@/components/ui/use-toast";
import LiveWeatherWidget from "@/components/weather/LiveWeatherWidget";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/use-profile-data";
import { useGetRecentAlerts, useSubscribeToAlerts } from "@/services/alertsService";

const Home = () => {
  const { user } = useAuth();
  const { profileData, isLoading: profileLoading } = useProfileData();
  const { data: alertsData, isLoading: alertsLoading } = useGetRecentAlerts(5);
  const [userName, setUserName] = useState("User");
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [markSafeOpen, setMarkSafeOpen] = useState(false);
  const [markedSafe, setMarkedSafe] = useState(false);
  const navigate = useNavigate();

  // Set user name from profile data
  useEffect(() => {
    if (profileData) {
      // Use display_name from auth if available, otherwise fallback to first_name or email
      const name = profileData.display_name || 
                  profileData.first_name || 
                  user?.user_metadata?.full_name || 
                  user?.user_metadata?.name || 
                  user?.email?.split('@')[0] || 
                  'User';
      setUserName(name);
    }
  }, [profileData, user]);

  // Set alerts from data
  useEffect(() => {
    if (alertsData) {
      setRecentAlerts(alertsData);
    }
  }, [alertsData]);

  // Subscribe to new alerts
  useEffect(() => {
    const unsubscribe = useSubscribeToAlerts((newAlert) => {
      setRecentAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
      
      toast({
        title: `New ${newAlert.type} Alert`,
        description: newAlert.title,
        duration: 5000,
      });
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Mock user location for sharing
  const userLocation = "37.7749,-122.4194"; // San Francisco coordinates

  const handleSafetyCheck = () => {
    setMarkSafeOpen(true);
  };

  const handleMarkSafe = () => {
    setMarkedSafe(true);
    setMarkSafeOpen(false);
    
    // Notify user's emergency contacts
    toast({
      title: "Marked Safe",
      description: "Your emergency contacts have been notified that you are safe",
      duration: 3000,
    });
    
    // In a real app, this would make an API call to notify emergency contacts
    console.log("User marked as safe, notifying emergency contacts");
  }

  const quickActions = [
    { 
      icon: Shield, 
      label: markedSafe ? "Marked Safe" : "Mark Safe", 
      color: markedSafe ? "text-crisis-green" : "text-crisis-green", 
      onClick: markedSafe ? undefined : handleSafetyCheck 
    },
    { icon: MapPin, label: "Nearby", color: "text-crisis-blue", onClick: () => navigate("/app/nearby") },
    { icon: AlertTriangle, label: "Report", color: "text-crisis-red", onClick: () => navigate("/app/report") },
    { icon: FileText, label: "Guides", color: "text-primary", onClick: () => navigate("/app/resources") },
    { icon: Phone, label: "Contacts", color: "text-crisis-purple", onClick: () => navigate("/app/contacts") },
    { icon: MessageCircle, label: "Chat", color: "text-crisis-darkBlue", onClick: () => navigate("/app/chat") },
  ];

  return (
    <div className="page-container pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Hello, {userName}</h1>
          <p className="text-sm text-muted-foreground">How can we help you today?</p>
        </div>
        <button 
          className="p-2 bg-secondary rounded-full" 
          onClick={() => navigate("/app/alerts")}
          aria-label="View all alerts"
        >
          <Bell size={20} />
        </button>
      </div>

      <div className="mb-8">
        <LiveWeatherWidget />
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <QuickAction
              key={index}
              icon={action.icon}
              label={action.label}
              color={action.color}
              onClick={action.onClick}
              disabled={action.onClick === undefined}
            />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Recent Alerts</h2>
          <div className="flex items-center">
            <span className="mr-2 text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
              Live
            </span>
            <button 
              className="text-xs text-primary font-medium"
              onClick={() => navigate("/app/alerts")}
            >
              View All
            </button>
          </div>
        </div>
        
        {alertsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((item) => (
              <div 
                key={item} 
                className="bg-muted animate-pulse h-24 rounded-lg"
              ></div>
            ))}
          </div>
        ) : recentAlerts.length > 0 ? (
          <div>
            {recentAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                title={alert.title}
                message={alert.description}
                severity={alert.severity}
                time={new Date(alert.created_at).toLocaleString()}
                icon={getAlertIcon(alert.type)}
                location={alert.location}
                category={alert.type}
                onClick={() => navigate(`/app/alerts/${alert.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent alerts</p>
          </div>
        )}
      </div>
      
      <Dialog open={markSafeOpen} onOpenChange={setMarkSafeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Yourself as Safe</DialogTitle>
            <DialogDescription>
              Let your emergency contacts know that you're safe during this emergency situation.
            </DialogDescription>
          </DialogHeader>
          
          <p className="mb-4">
            This will send a notification to all your emergency contacts letting them know you're safe.
          </p>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkSafeOpen(false)}>Cancel</Button>
            <Button onClick={handleMarkSafe}>Mark As Safe</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper function to map alert type to icon
function getAlertIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'weather':
      return CloudRain;
    case 'police':
      return Shield;
    case 'fire':
      return CloudLightning;
    case 'health':
      return Info;
    default:
      return AlertTriangle;
  }
}

export default Home;
