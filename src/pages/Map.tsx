
import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Info, Hospital, Shield, Building, AlertTriangle } from "lucide-react";
import { useProfileData } from "@/hooks/use-profile-data";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Define Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

// Define emergency location interface
interface EmergencyLocation {
  id: number;
  name: string;
  category: 'hospital' | 'police' | 'fire' | 'shelter' | 'assembly';
  position: { lat: number; lng: number };
  address: string;
  phone?: string;
  icon: React.ElementType;
}

// Define alert zone interface
interface AlertZone {
  id: number;
  title: string;
  severity: 'high' | 'medium' | 'low';
  type: string;
  position: { lat: number; lng: number };
  radius: number; // in meters
}

const Map = () => {
  const { profileData } = useProfileData();
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<EmergencyLocation | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Chinhoyi, Zimbabwe coordinates
  const chinhoyiCoordinates = { lat: -17.3667, lng: 30.2000 };
  
  // Mock emergency locations for Chinhoyi
  const emergencyLocations: EmergencyLocation[] = [
    {
      id: 1,
      name: "Chinhoyi Provincial Hospital",
      category: 'hospital',
      position: { lat: -17.3564, lng: 30.1971 },
      address: "Magamba Way, Chinhoyi, Zimbabwe",
      phone: "+263 67 2122275",
      icon: Hospital
    },
    {
      id: 2,
      name: "Chinhoyi Central Police Station",
      category: 'police',
      position: { lat: -17.3667, lng: 30.1975 },
      address: "Main Street, Chinhoyi, Zimbabwe",
      phone: "+263 67 2122555",
      icon: Shield
    },
    {
      id: 3,
      name: "Chinhoyi Fire Station",
      category: 'fire',
      position: { lat: -17.3627, lng: 30.1953 },
      address: "Fire Brigade Road, Chinhoyi, Zimbabwe",
      phone: "+263 67 2122911",
      icon: Building
    },
    {
      id: 4,
      name: "Chinhoyi Emergency Shelter",
      category: 'shelter',
      position: { lat: -17.3584, lng: 30.1986 },
      address: "School Road, Chinhoyi, Zimbabwe",
      phone: "+263 67 2124567",
      icon: Building
    },
    {
      id: 5,
      name: "Chinhoyi Emergency Assembly Point",
      category: 'assembly',
      position: { lat: -17.3612, lng: 30.1932 },
      address: "Main Park, Chinhoyi, Zimbabwe",
      icon: MapPin
    }
  ];
  
  // Mock alert zones
  const alertZones: AlertZone[] = [
    {
      id: 1,
      title: "Flash Flood Warning",
      severity: 'high',
      type: "weather",
      position: { lat: -17.361, lng: 30.191 },
      radius: 800
    },
    {
      id: 2,
      title: "Road Closure",
      severity: 'medium',
      type: "traffic",
      position: { lat: -17.372, lng: 30.204 },
      radius: 300
    }
  ];
  
  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Load Google Maps script
    const loadGoogleMaps = () => {
      setIsLoading(true);
      
      try {
        // Initialize the map
        const googleMap = new window.google.maps.Map(mapRef.current as HTMLElement, {
          center: chinhoyiCoordinates,
          zoom: 14,
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: false,
          zoomControl: true,
        });
        
        setMap(googleMap);
        setIsLoading(false);
        
        // Add emergency locations markers
        addEmergencyMarkers(googleMap);
        
        // Add alert zones
        addAlertZones(googleMap);
        
      } catch (err) {
        console.error("Error initializing Google Maps:", err);
        setError("Failed to load map. Please try again later.");
        setIsLoading(false);
      }
    };
    
    // Check if Google Maps is already loaded
    if (!window.google || !window.google.maps) {
      // Load Google Maps script if not already loaded
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC2EbJF5Ny34XOJjGuy2ASI8Z9tASdj-Ns&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = loadGoogleMaps;
      script.onerror = () => {
        setError("Failed to load Google Maps API");
        setIsLoading(false);
      };
      document.body.appendChild(script);
    } else {
      loadGoogleMaps();
    }
  }, []);
  
  // Add emergency location markers to map
  const addEmergencyMarkers = (googleMap: any) => {
    const filteredLocations = locationFilter 
      ? emergencyLocations.filter(loc => loc.category === locationFilter) 
      : emergencyLocations;
    
    filteredLocations.forEach(location => {
      const marker = new window.google.maps.Marker({
        position: location.position,
        map: googleMap,
        title: location.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: getCategoryColor(location.category),
          fillOpacity: 0.7,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 10,
        }
      });
      
      marker.addListener('click', () => {
        setSelectedLocation(location);
        
        // Create and open info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold">${location.name}</h3>
              <p>${location.address}</p>
              ${location.phone ? `<p><strong>Phone:</strong> ${location.phone}</p>` : ''}
            </div>
          `
        });
        
        infoWindow.open(googleMap, marker);
      });
    });
  };
  
  // Add alert zones to map
  const addAlertZones = (googleMap: any) => {
    alertZones.forEach(zone => {
      const alertCircle = new window.google.maps.Circle({
        strokeColor: getAlertSeverityColor(zone.severity),
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: getAlertSeverityColor(zone.severity),
        fillOpacity: 0.35,
        map: googleMap,
        center: zone.position,
        radius: zone.radius,
      });
      
      alertCircle.addListener('click', () => {
        toast.info(zone.title, {
          description: `Alert active in this area. Take necessary precautions.`
        });
      });
    });
  };
  
  // Get color based on location category
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'hospital': return '#2563eb'; // blue
      case 'police': return '#16a34a'; // green
      case 'fire': return '#dc2626'; // red
      case 'shelter': return '#9333ea'; // purple
      case 'assembly': return '#eab308'; // yellow
      default: return '#6b7280'; // gray
    }
  };
  
  // Get color based on alert severity
  const getAlertSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high': return '#ef4444'; // red
      case 'medium': return '#f97316'; // orange
      case 'low': return '#eab308'; // yellow
      default: return '#6b7280'; // gray
    }
  };
  
  // Filter emergency locations by category
  const handleFilterChange = (filter: string | null) => {
    setLocationFilter(filter);
    
    if (map) {
      // Clear existing markers
      map.setOptions({ center: chinhoyiCoordinates });
      
      // Re-add filtered markers
      addEmergencyMarkers(map);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="page-header border-b border-border">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            <h1 className="text-xl font-bold">Emergency Map</h1>
          </div>
        </div>
        <p className="text-muted-foreground mb-4">
          View emergency services and active alerts in Chinhoyi, Zimbabwe
        </p>
        
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto">
          <Badge 
            variant={locationFilter === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleFilterChange(null)}
          >
            All
          </Badge>
          <Badge 
            variant={locationFilter === "hospital" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleFilterChange("hospital")}
          >
            Hospitals
          </Badge>
          <Badge 
            variant={locationFilter === "police" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleFilterChange("police")}
          >
            Police
          </Badge>
          <Badge 
            variant={locationFilter === "fire" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleFilterChange("fire")}
          >
            Fire Stations
          </Badge>
          <Badge 
            variant={locationFilter === "shelter" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleFilterChange("shelter")}
          >
            Shelters
          </Badge>
          <Badge 
            variant={locationFilter === "assembly" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleFilterChange("assembly")}
          >
            Assembly Points
          </Badge>
        </div>
      </div>
      
      <div className="flex-1 p-4 pb-24">
        {/* Google Maps container */}
        <div className="relative h-full rounded-lg overflow-hidden shadow-sm border border-border">
          <div 
            ref={mapRef} 
            className="w-full h-full"
          ></div>
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-2">Loading map...</span>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-center p-4">
                <AlertTriangle className="h-8 w-8 mx-auto text-destructive mb-2" />
                <h3 className="font-semibold mb-1">{error}</h3>
                <p className="text-sm text-muted-foreground mb-3">Please check your internet connection and try again.</p>
                <Button 
                  size="sm" 
                  onClick={() => window.location.reload()}
                >
                  Reload Map
                </Button>
              </div>
            </div>
          )}
          
          {/* Map legend */}
          <div className="absolute bottom-4 left-4 bg-background/80 rounded-md shadow-md backdrop-blur-sm p-3 text-xs">
            <h4 className="font-semibold mb-2">Map Legend</h4>
            <div className="space-y-1">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-blue-600 mr-2"></span>
                <span>Hospitals</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-600 mr-2"></span>
                <span>Police Stations</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-red-600 mr-2"></span>
                <span>Fire Stations</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full opacity-40 bg-red-500 mr-2"></span>
                <span>Alert Zones</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
