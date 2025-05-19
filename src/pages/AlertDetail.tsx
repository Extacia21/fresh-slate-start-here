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

interface Alert {
  id: number;
  title: string;
  message: string;
  severity: "critical" | "high" | "medium" | "low";
  time: string;
  icon: any;
  category: string;
  location?: string;
  source?: string;
  affected?: {
    area: string;
    population: string;
    facilities?: string[]
  };
  instructions?: string[];
  updates?: { time: string; content: string }[];
  contacts?: { name: string; role: string; phone?: string }[];
  resourceLinks?: { title: string; description: string; url: string }[];
  endTime?: string;
}

// Mock data - in a real app this would come from an API
const mockAlertDetails: Record<string, Alert> = {
  "1": {
    id: 1,
    title: "Flash Flood Warning",
    message: "Flash flood warning issued for your area. Avoid low-lying areas and stay indoors.",
    severity: "high",
    time: "10 minutes ago",
    icon: CloudRain,
    category: "weather",
    location: "Downtown area, Riverside, and East Valley",
    source: "National Weather Service",
    affected: {
      area: "Approximately 15 square miles",
      population: "Estimated 25,000 residents",
      facilities: [
        "Downtown Medical Center",
        "Riverside Elementary School",
        "East Valley Shopping Mall"
      ]
    },
    instructions: [
      "Move to higher ground immediately if near streams or rivers",
      "Do not drive through flooded roads - turn around, don't drown",
      "Keep emergency supplies ready",
      "Monitor local news and weather updates"
    ],
    updates: [
      { time: "9:45 AM", content: "Flash flood warning issued for the county" },
      { time: "10:15 AM", content: "First responders deployed to downtown area" },
      { time: "10:30 AM", content: "Evacuation orders issued for Riverside district" },
      { time: "11:05 AM", content: "Water levels rising at East Valley creek, additional roads closed" },
      { time: "11:30 AM", content: "Emergency shelter opened at North High School gymnasium" }
    ],
    contacts: [
      { name: "Emergency Management Office", role: "Coordination", phone: "555-123-4567" },
      { name: "Police Department", role: "Evacuation assistance", phone: "555-911" },
      { name: "Public Works", role: "Road closures and drainage", phone: "555-789-0123" }
    ],
    resourceLinks: [
      { title: "Flood Safety Guide", description: "Comprehensive guide for flood preparedness", url: "#" },
      { title: "Live Evacuation Map", description: "Real-time updates on evacuation zones", url: "#" },
      { title: "Emergency Shelter Locations", description: "List of all available shelters", url: "#" }
    ],
    endTime: "Warning in effect until 4:00 PM today"
  },
  "2": {
    id: 2,
    title: "Weather Advisory",
    message: "Strong thunderstorms expected this afternoon with possible hail.",
    severity: "medium",
    time: "1 hour ago",
    icon: CloudLightning,
    category: "weather",
    location: "Entire county",
    source: "National Weather Service",
    affected: {
      area: "County-wide",
      population: "All residents",
      facilities: [
        "All outdoor facilities",
        "Public parks",
        "Sporting events"
      ]
    },
    instructions: [
      "Secure outdoor items",
      "Avoid unnecessary travel",
      "Stay indoors during the storm",
      "Keep phones charged and emergency contacts accessible"
    ],
    updates: [
      { time: "8:00 AM", content: "Weather advisory issued for afternoon storms" },
      { time: "9:30 AM", content: "Advisory updated to include potential for hail" },
      { time: "11:00 AM", content: "Storm front expected to reach western county by 2 PM" }
    ],
    contacts: [
      { name: "Weather Service Hotline", role: "Updates", phone: "555-432-1098" },
      { name: "Power Company", role: "Outage reporting", phone: "555-765-4321" }
    ],
    resourceLinks: [
      { title: "Thunderstorm Safety", description: "How to stay safe during severe storms", url: "#" },
      { title: "Power Outage Map", description: "Real-time tracking of power outages", url: "#" }
    ],
    endTime: "Advisory in effect until 8:00 PM today"
  },
  "3": {
    id: 3,
    title: "Traffic Alert",
    message: "Major accident on Highway 101. Expect delays of 30+ minutes.",
    severity: "medium",
    time: "2 hours ago",
    icon: AlertTriangle,
    category: "traffic",
    location: "Highway 101 between exits 25-30",
    source: "Department of Transportation",
    affected: {
      area: "5-mile stretch of Highway 101",
      population: "Commuters and travelers",
      facilities: [
        "North County Business Park",
        "Airport access routes"
      ]
    },
    instructions: [
      "Seek alternative routes",
      "Expect significant delays",
      "Follow police instructions in the area",
      "Drive with caution near the accident site"
    ],
    updates: [
      { time: "7:15 AM", content: "Multi-vehicle accident reported on Highway 101" },
      { time: "7:45 AM", content: "Two lanes blocked, emergency services on scene" },
      { time: "8:30 AM", content: "Tow trucks arrived, expect 30+ minute delays" },
      { time: "9:15 AM", content: "One lane reopened, still heavy congestion in area" }
    ],
    contacts: [
      { name: "Traffic Management Center", role: "Updates", phone: "555-101-5555" },
      { name: "Highway Patrol", role: "Assistance", phone: "555-111-2222" }
    ],
    resourceLinks: [
      { title: "Live Traffic Map", description: "Real-time traffic conditions", url: "#" },
      { title: "Alternative Routes", description: "Suggested detours for affected areas", url: "#" }
    ],
    endTime: "Expected to clear by 11:00 AM"
  },
  "4": {
    id: 4,
    title: "Power Outage",
    message: "Scheduled maintenance outage in your area from 10pm-2am tonight.",
    severity: "low",
    time: "3 hours ago",
    icon: Info,
    category: "utility",
    location: "North County districts",
    source: "Power & Electric Company",
    affected: {
      area: "North County residential areas",
      population: "Approximately 2,500 households",
      facilities: [
        "Residential neighborhoods only",
        "No critical infrastructure affected"
      ]
    },
    instructions: [
      "Charge essential devices before 10pm",
      "Have emergency lighting ready",
      "Unplug sensitive electronics",
      "Keep refrigerator doors closed to maintain temperature"
    ],
    updates: [
      { time: "9:00 AM", content: "Scheduled maintenance confirmed for tonight" },
      { time: "11:00 AM", content: "Reminder notification sent to affected households" },
      { time: "2:00 PM", content: "Maintenance crews preparing for scheduled work" }
    ],
    contacts: [
      { name: "Power & Electric Customer Service", role: "Information", phone: "555-444-3333" },
      { name: "Emergency Services", role: "For medical device users", phone: "555-111-2222" }
    ],
    resourceLinks: [
      { title: "Power Outage Preparation Guide", description: "How to prepare for scheduled outages", url: "#" },
      { title: "Maintenance Schedule", description: "Calendar of planned maintenance activities", url: "#" }
    ],
    endTime: "Expected to restore service by 2:00 AM"
  },
};

const AlertDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [liveUpdates, setLiveUpdates] = useState<{ time: string; content: string }[]>([]);
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      if (id && mockAlertDetails[id]) {
        setAlert(mockAlertDetails[id]);
        
        // Initialize live updates with any existing updates from the alert
        if (mockAlertDetails[id].updates) {
          setLiveUpdates(mockAlertDetails[id].updates || []);
        }
      }
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [id]);

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

  if (!alert) {
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

  const Icon = alert.icon || Info;
  const shareUrl = window.location.href;

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
          <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)} bg-opacity-20 mr-3`}>
            <Icon className={`h-6 w-6 ${alert.severity === "low" ? "text-yellow-600" : "text-white"}`} />
          </div>
          <div>
            <h1 className="text-xl font-bold">{alert.title}</h1>
            <div className="flex items-center mt-1">
              <span className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)} mr-2`}></span>
              <span className="text-xs capitalize">{alert.severity} Priority</span>
            </div>
          </div>
        </div>
        <p className="text-base mb-3">{alert.message}</p>
        <div className="flex flex-wrap items-center justify-between text-xs opacity-70">
          <div className="flex items-center mr-4 mb-1">
            <Clock className="h-3 w-3 mr-1" /> 
            <span>Issued: {alert.time}</span>
          </div>
          {alert.location && (
            <div className="flex items-center mb-1">
              <MapPin className="h-3 w-3 mr-1" /> 
              <span>{alert.location}</span>
            </div>
          )}
          {alert.endTime && (
            <div className="w-full mt-2 pt-2 border-t border-current border-opacity-20">
              <span className="font-medium">{alert.endTime}</span>
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
            <LocationMap location={alert.location} />
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {alert.affected && (
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
                  <span>{alert.affected.area}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{alert.affected.population}</span>
                </div>
                {alert.affected.facilities && alert.affected.facilities.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-1">Key Facilities Affected:</h4>
                    <ul className="pl-5 list-disc text-sm">
                      {alert.affected.facilities.map((facility, index) => (
                        <li key={index}>{facility}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Safety Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {alert.instructions?.map((instruction, index) => (
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

        {alert.contacts && alert.contacts.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alert.contacts.map((contact, index) => (
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
        )}

        {alert.resourceLinks && alert.resourceLinks.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Helpful Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alert.resourceLinks.map((link, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{link.title}</p>
                    <p className="text-sm text-muted-foreground mb-2">{link.description}</p>
                    <Button variant="secondary" size="sm" className="w-full">
                      <Compass className="h-3 w-3 mr-2" />
                      Open Resource
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Source: {alert.source}</span>
            </div>
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </div>
        </div>
      </div>

      <ShareDialog 
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        title={alert.title}
        description={alert.message}
        url={shareUrl}
      />
    </div>
  );
};

export default AlertDetail;
