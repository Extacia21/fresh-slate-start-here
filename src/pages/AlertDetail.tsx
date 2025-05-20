
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, CloudRain, CloudLightning, AlertTriangle, Info, 
  MapPin, Clock, Share2, Phone, Shield, 
  AlertOctagon, FileText, Compass, Users, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LocationMap from "@/components/common/LocationMap";
import ShareDialog from "@/components/common/ShareDialog";
import { useGetAlertById, formatRelativeTime, alertTypeColors } from "@/services/alertsService";

interface Update {
  time: string;
  content: string;
}

const AlertDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: alert, isLoading, error } = useGetAlertById(id);
  const navigate = useNavigate();
  const [liveUpdates, setLiveUpdates] = useState<Update[]>([]);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Initialize any existing updates when the alert loads
  useEffect(() => {
    if (alert) {
      // Start with empty array of updates
      setLiveUpdates([]);
    }
  }, [alert]);

  // Simulate real-time updates
  useEffect(() => {
    if (!alert) return;
    
    // Simulate getting real-time updates
    const updateInterval = setInterval(() => {
      const randomUpdateMessages = [
        "Emergency crews responding to affected areas",
        "Road closures expanded to include additional streets",
        "Shelter capacity increased to accommodate more residents",
        "Weather conditions show signs of improvement",
        "Additional resources deployed to critical zones"
      ];
      
      const shouldAddUpdate = Math.random() > 0.7; // 30% chance of new update
      
      if (shouldAddUpdate) {
        const newUpdate = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: randomUpdateMessages[Math.floor(Math.random() * randomUpdateMessages.length)]
        };
        
        setLiveUpdates(prev => [newUpdate, ...prev]);
      }
    }, 15000); // Check for potential updates every 15 seconds
    
    return () => clearInterval(updateInterval);
  }, [alert]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-600";
      case "high": return "bg-red-500";
      case "medium": return "bg-orange-500";
      case "low": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getAlertTypeColor = (type: string = 'other') => {
    const typeKey = type.toLowerCase() as keyof typeof alertTypeColors;
    return alertTypeColors[typeKey] || alertTypeColors.other;
  };

  const getIconComponent = (type: string = 'other') => {
    switch (type?.toLowerCase()) {
      case 'weather':
        return CloudRain;
      case 'fire':
        return AlertTriangle;
      case 'police':
        return Shield;
      case 'health':
        return Info;
      default:
        return AlertTriangle;
    }
  };

  const handleShareAlert = () => {
    setShowShareDialog(true);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-40 w-full mb-4" />
        <Skeleton className="h-6 w-2/3 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-6" />
        <Skeleton className="h-6 w-1/3 mb-3" />
        <div className="space-y-2 mb-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="page-container">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">Alert Not Found</h3>
          <p className="text-muted-foreground">
            The alert you're looking for could not be found.
          </p>
          <Button 
            className="mt-6"
            onClick={() => navigate("/app/alerts")}
          >
            View All Alerts
          </Button>
        </div>
      </div>
    );
  }

  const Icon = getIconComponent(alert.type);
  const typeColor = getAlertTypeColor(alert.type);
  const shareUrl = window.location.href;
  const formattedTime = formatRelativeTime(alert.created_at);

  // Mock data for sections we don't have in the actual alert model
  const mockInstructions = [
    "Stay indoors and close all windows",
    "Follow official guidance on evacuation routes",
    "Keep emergency supplies ready",
    "Monitor local news and updates"
  ];

  const mockContacts = [
    { name: "Emergency Services", role: "Coordination", phone: "911" },
    { name: "Local Police", role: "Safety", phone: "555-123-4567" }
  ];

  return (
    <div className="page-container pb-24 overflow-y-auto">
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-background z-10 py-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(-1)}
          className="p-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleShareAlert}
          className="p-2"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      <div className={`p-4 rounded-lg mb-6 ${getSeverityColor(alert.severity)} bg-opacity-10 border border-opacity-30 ${getSeverityColor(alert.severity).replace('bg-', 'border-')}`}>
        <div className="flex items-center mb-2">
          <div className={`p-2 rounded-full ${typeColor.bg} mr-3`}>
            <Icon className={`h-6 w-6 ${typeColor.text}`} />
          </div>
          <div>
            <h1 className="text-xl font-bold">{alert.title}</h1>
            <div className="flex items-center mt-1">
              <span className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)} mr-2`}></span>
              <span className="text-xs capitalize">{alert.severity} Priority</span>
            </div>
          </div>
        </div>
        <p className="text-base mb-3">{alert.description}</p>
        <div className="flex flex-wrap items-center justify-between text-xs opacity-70">
          <div className="flex items-center mr-4 mb-1">
            <Clock className="h-3 w-3 mr-1" /> 
            <span>Reported: {formattedTime}</span>
          </div>
          {alert.location && (
            <div className="flex items-center mb-1">
              <MapPin className="h-3 w-3 mr-1" /> 
              <span>{alert.location}</span>
            </div>
          )}
          {alert.is_resolved !== undefined && (
            <div className="w-full mt-2 pt-2 border-t border-current border-opacity-20">
              <span className="font-medium capitalize">Status: {alert.is_resolved ? "Resolved" : "Active"}</span>
            </div>
          )}
        </div>
      </div>

      {alert.location && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LocationMap location={alert.location} className="h-48" />
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <AlertOctagon className="h-5 w-5 mr-2" />
              Affected Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{alert.location || "Unknown location"}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Area residents</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Safety Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {mockInstructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block bg-primary rounded-full w-1.5 h-1.5 mt-2 mr-2"></span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Live Updates
              <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full animate-pulse">Live</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {liveUpdates.map((update, index) => (
                <div key={`${update.time}-${index}`} className="border-l-2 border-primary pl-3 py-1">
                  <p className="text-sm">{update.content}</p>
                  <span className="text-xs text-muted-foreground">{update.time}</span>
                </div>
              ))}
              {liveUpdates.length === 0 && (
                <p className="text-sm text-muted-foreground">No updates available yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockContacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.role}</p>
                  </div>
                  {contact.phone && (
                    <Button variant="outline" size="sm">
                      <Phone className="h-3 w-3 mr-2" />
                      {contact.phone}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {alert.category && (
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Category: {alert.category}</span>
              </div>
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            </div>
          </div>
        )}
      </div>

      <ShareDialog 
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        title={alert.title}
        description={alert.description}
        url={shareUrl}
      />
    </div>
  );
};

export default AlertDetail;
