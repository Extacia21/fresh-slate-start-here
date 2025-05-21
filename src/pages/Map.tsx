
import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Info, Hospital, Shield, Building, AlertTriangle, Compass, Filter, Layers } from "lucide-react";
import { useProfileData } from "@/hooks/use-profile-data";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  details?: {
    services?: string[];
    operatingHours?: string;
    capacity?: string;
  };
}

// Define alert zone interface
interface AlertZone {
  id: number;
  title: string;
  severity: 'high' | 'medium' | 'low';
  type: string;
  position: { lat: number; lng: number };
  radius: number; // in meters
  description?: string;
  timestamp?: string;
}

const Map = () => {
  const { profileData } = useProfileData();
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<EmergencyLocation | null>(null);
  const [selectedAlertZone, setSelectedAlertZone] = useState<AlertZone | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [activeView, setActiveView] = useState<'map' | 'list'>('map');
  const [activeLayers, setActiveLayers] = useState<string[]>(['emergency', 'alerts']);
  
  // Chinhoyi, Zimbabwe coordinates (default)
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
      icon: Hospital,
      details: {
        services: ["Emergency Room", "Surgery", "Maternity", "Pediatrics"],
        operatingHours: "24/7",
        capacity: "250 beds"
      }
    },
    {
      id: 2,
      name: "Chinhoyi Central Police Station",
      category: 'police',
      position: { lat: -17.3667, lng: 30.1975 },
      address: "Main Street, Chinhoyi, Zimbabwe",
      phone: "+263 67 2122555",
      icon: Shield,
      details: {
        services: ["Emergency Response", "Crime Reporting", "Community Policing"],
        operatingHours: "24/7"
      }
    },
    {
      id: 3,
      name: "Chinhoyi Fire Station",
      category: 'fire',
      position: { lat: -17.3627, lng: 30.1953 },
      address: "Fire Brigade Road, Chinhoyi, Zimbabwe",
      phone: "+263 67 2122911",
      icon: Building,
      details: {
        services: ["Fire Response", "Rescue Services", "Fire Prevention"],
        operatingHours: "24/7"
      }
    },
    {
      id: 4,
      name: "Chinhoyi Emergency Shelter",
      category: 'shelter',
      position: { lat: -17.3584, lng: 30.1986 },
      address: "School Road, Chinhoyi, Zimbabwe",
      phone: "+263 67 2124567",
      icon: Building,
      details: {
        services: ["Temporary Housing", "Food Distribution", "Medical Aid"],
        capacity: "150 people"
      }
    },
    {
      id: 5,
      name: "Chinhoyi Emergency Assembly Point",
      category: 'assembly',
      position: { lat: -17.3612, lng: 30.1932 },
      address: "Main Park, Chinhoyi, Zimbabwe",
      icon: MapPin,
      details: {
        services: ["Meeting Point", "Emergency Coordination"],
        capacity: "500 people"
      }
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
      radius: 800,
      description: "Heavy rainfall has caused flooding in low-lying areas. Avoid this zone and seek higher ground.",
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      title: "Road Closure",
      severity: 'medium',
      type: "traffic",
      position: { lat: -17.372, lng: 30.204 },
      radius: 300,
      description: "Major road closed due to construction. Use alternate routes.",
      timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    }
  ];

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast.info("Using your current location");
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.warning("Using default location (Chinhoyi)", {
            description: "Enable location access for a personalized map view"
          });
        }
      );
    }
  }, []);
  
  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Load Google Maps script
    const loadGoogleMaps = () => {
      setIsLoading(true);
      
      try {
        // Initialize the map with either user location or default coordinates
        const mapCenter = userLocation || chinhoyiCoordinates;
        
        // Initialize the map
        const googleMap = new window.google.maps.Map(mapRef.current as HTMLElement, {
          center: mapCenter,
          zoom: 14,
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: false,
          zoomControl: true,
        });
        
        setMap(googleMap);
        setIsLoading(false);
        
        // If we have user location, add a special marker for it
        if (userLocation) {
          const userMarker = new window.google.maps.Marker({
            position: userLocation,
            map: googleMap,
            title: "Your Location",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "#4285F4",
              fillOpacity: 0.8,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 10,
            },
            zIndex: 1000, // Ensure it's on top of other markers
          });
          
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div class="p-2">
                        <strong>Your Current Location</strong>
                      </div>`
          });
          
          userMarker.addListener("click", () => {
            infoWindow.open(googleMap, userMarker);
          });
        }
        
        // Add emergency locations markers if layer is active
        if (activeLayers.includes('emergency')) {
          addEmergencyMarkers(googleMap);
        }
        
        // Add alert zones if layer is active
        if (activeLayers.includes('alerts')) {
          addAlertZones(googleMap);
        }
        
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDp9ZnLPvebOjH8MYt8f0zpqYK4mRSlAts&libraries=places`;
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
  }, [userLocation, activeLayers]);
  
  // Add emergency location markers to map
  const addEmergencyMarkers = (googleMap: any) => {
    const filteredLocations = locationFilter 
      ? emergencyLocations.filter(loc => loc.category === locationFilter) 
      : emergencyLocations;
    
    const markers: any[] = [];
    const infoWindows: any[] = [];
    
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
      
      markers.push(marker);
      
      // Create info window with more details
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3">
            <h3 class="font-semibold text-lg">${location.name}</h3>
            <p class="text-sm">${location.address}</p>
            ${location.phone ? `<p class="text-sm mt-1"><strong>Phone:</strong> ${location.phone}</p>` : ''}
            <div class="mt-2">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${location.position.lat},${location.position.lng}" 
                 target="_blank" 
                 class="text-blue-600 text-sm font-medium">
                Get Directions
              </a>
            </div>
          </div>
        `
      });
      
      infoWindows.push(infoWindow);
      
      marker.addListener('click', () => {
        // Close any open info windows
        infoWindows.forEach(iw => iw.close());
        
        // Open this info window
        infoWindow.open(googleMap, marker);
        
        // Set selected location
        setSelectedLocation(location);
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
      
      // Create info window for the alert zone
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3">
            <h3 class="font-semibold text-lg">${zone.title}</h3>
            <p class="text-sm">Type: ${zone.type}</p>
            <p class="text-sm">Severity: ${zone.severity}</p>
            <p class="text-sm">Radius: ${zone.radius}m</p>
            ${zone.description ? `<p class="text-sm mt-1">${zone.description}</p>` : ''}
          </div>
        `,
        position: zone.position
      });
      
      alertCircle.addListener('click', () => {
        infoWindow.open(googleMap);
        setSelectedAlertZone(zone);
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
  
  // Format timestamp for alerts
  const formatTimestamp = (timestamp: string | undefined): string => {
    if (!timestamp) return 'Unknown time';
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Calculate distance between two points in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  // Get distance from user to location
  const getDistanceFromUser = (lat: number, lng: number): string => {
    if (!userLocation) return "Unknown";
    
    const distance = calculateDistance(
      userLocation.lat, 
      userLocation.lng, 
      lat, 
      lng
    );
    
    return distance < 1 
      ? `${(distance * 1000).toFixed(0)}m` 
      : `${distance.toFixed(1)}km`;
  };
  
  // Filter emergency locations by category
  const handleFilterChange = (filter: string | null) => {
    setLocationFilter(filter);
    
    if (map) {
      // Clear existing markers
      map.setOptions({ center: userLocation || chinhoyiCoordinates });
      
      // Re-add filtered markers
      addEmergencyMarkers(map);
    }
  };
  
  // Handle layer toggle
  const handleLayerToggle = (values: string[]) => {
    setActiveLayers(values);
    
    if (map) {
      // Refresh map with selected layers
      map.setOptions({ center: map.getCenter() });
      
      if (values.includes('emergency')) {
        addEmergencyMarkers(map);
      }
      
      if (values.includes('alerts')) {
        addAlertZones(map);
      }
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
          
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="flex items-center">
                  <Layers className="h-4 w-4 mr-1" />
                  Layers
                </Button>
              </SheetTrigger>
              <SheetContent side="top">
                <SheetHeader>
                  <SheetTitle>Map Layers</SheetTitle>
                  <SheetDescription>
                    Choose which information to display on the map
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                  <h3 className="text-sm font-medium mb-2">Available Layers</h3>
                  <ToggleGroup 
                    type="multiple" 
                    value={activeLayers}
                    onValueChange={handleLayerToggle}
                    className="flex flex-wrap gap-2"
                  >
                    <ToggleGroupItem value="emergency" aria-label="Toggle emergency locations">
                      <MapPin className="h-4 w-4 mr-1" />
                      Emergency Locations
                    </ToggleGroupItem>
                    <ToggleGroupItem value="alerts" aria-label="Toggle alert zones">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Alert Zones
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </SheetContent>
            </Sheet>
            
            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'map' | 'list')}>
              <TabsList className="grid grid-cols-2 h-9">
                <TabsTrigger value="map">Map</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </Tabs>
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
        <Tabs value={activeView} className="h-full">
          {/* Map View */}
          <TabsContent value="map" className="h-full m-0">
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
              
              {/* Your current location button */}
              {userLocation && (
                <Button
                  className="absolute top-4 right-4 bg-primary/90 hover:bg-primary"
                  size="sm"
                  onClick={() => {
                    if (map) {
                      map.panTo(userLocation);
                      map.setZoom(15);
                    }
                  }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Your Location
                </Button>
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
                  {userLocation && (
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                      <span>Your Location</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Compass */}
              <div className="absolute top-4 left-4 p-2 bg-background/80 backdrop-blur-sm rounded-md shadow-md">
                <Compass className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </TabsContent>
          
          {/* List View */}
          <TabsContent value="list" className="m-0 space-y-4 h-full overflow-y-auto pb-8">
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-crisis-red" /> 
                Active Alerts
              </h2>
              {alertZones.length > 0 ? (
                <div className="space-y-3">
                  {alertZones.map(alert => (
                    <Card key={alert.id} className="overflow-hidden">
                      <div className={`h-1 ${
                        alert.severity === 'high' ? 'bg-red-500' : 
                        alert.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}></div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{alert.title}</CardTitle>
                          <Badge variant={
                            alert.severity === 'high' ? 'destructive' : 
                            alert.severity === 'medium' ? 'default' : 'outline'
                          }>
                            {alert.severity}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">
                          {formatTimestamp(alert.timestamp)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm mb-2">{alert.description || "No description available"}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {userLocation ? getDistanceFromUser(alert.position.lat, alert.position.lng) : "Unknown distance"}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg bg-muted/20">
                  <p className="text-muted-foreground">No active alerts</p>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-2" /> 
                Emergency Locations
              </h2>
              <div className="space-y-3">
                {emergencyLocations
                  .filter(loc => !locationFilter || loc.category === locationFilter)
                  .sort((a, b) => {
                    if (!userLocation) return 0;
                    
                    const distA = calculateDistance(
                      userLocation.lat, userLocation.lng, 
                      a.position.lat, a.position.lng
                    );
                    const distB = calculateDistance(
                      userLocation.lat, userLocation.lng, 
                      b.position.lat, b.position.lng
                    );
                    
                    return distA - distB;
                  })
                  .map(location => {
                    const Icon = location.icon;
                    return (
                      <Card key={location.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <div className="flex items-center">
                              <div className="mr-3 p-2 rounded-full bg-muted">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <CardTitle className="text-base">{location.name}</CardTitle>
                                <CardDescription className="text-xs">
                                  {userLocation && (
                                    <span className="flex items-center">
                                      <Navigation className="h-3 w-3 mr-1" />
                                      {getDistanceFromUser(location.position.lat, location.position.lng)}
                                    </span>
                                  )}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {location.category.charAt(0).toUpperCase() + location.category.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm mb-1">{location.address}</p>
                          {location.phone && (
                            <p className="text-sm font-medium">{location.phone}</p>
                          )}
                          {userLocation && (
                            <Button size="sm" variant="outline" className="mt-2 text-xs" asChild>
                              <a href={`https://www.google.com/maps/dir/?api=1&destination=${location.position.lat},${location.position.lng}`} 
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Navigation className="h-3 w-3 mr-1" />
                                Directions
                              </a>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                }
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Map;
