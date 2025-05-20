
import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Compass, Hospital, Shield, Building, School, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EmergencyLocation {
  id: number;
  name: string;
  category: string;
  coordinates: [number, number];
  address: string;
  phone?: string;
  icon: React.ElementType;
}

// Mock emergency locations in Chinhoyi, Zimbabwe
const emergencyLocations: EmergencyLocation[] = [
  {
    id: 1,
    name: "Chinhoyi Provincial Hospital",
    category: "hospital",
    coordinates: [-17.3564, 30.1971],
    address: "Magamba Way, Chinhoyi, Zimbabwe",
    phone: "+263 67 2122275",
    icon: Hospital
  },
  {
    id: 2,
    name: "Chinhoyi Central Police Station",
    category: "police",
    coordinates: [-17.3667, 30.1975],
    address: "Main Street, Chinhoyi, Zimbabwe",
    phone: "+263 67 2122555",
    icon: Shield
  },
  {
    id: 3,
    name: "Chinhoyi Fire Station",
    category: "fire",
    coordinates: [-17.3627, 30.1953],
    address: "Fire Brigade Road, Chinhoyi, Zimbabwe",
    phone: "+263 67 2122911",
    icon: Building
  },
  {
    id: 4,
    name: "Chinhoyi Community Center",
    category: "community",
    coordinates: [-17.3698, 30.2003],
    address: "Community Drive, Chinhoyi, Zimbabwe",
    phone: "+263 67 2123456",
    icon: Building
  },
  {
    id: 5,
    name: "Chinhoyi Emergency Assembly Point",
    category: "assembly",
    coordinates: [-17.3612, 30.1932],
    address: "Main Park, Chinhoyi, Zimbabwe",
    icon: School
  },
  {
    id: 6,
    name: "Chinhoyi Emergency Shelter",
    category: "shelter",
    coordinates: [-17.3584, 30.1986],
    address: "School Road, Chinhoyi, Zimbabwe",
    phone: "+263 67 2124567",
    icon: Home
  },
  {
    id: 7,
    name: "Chinhoyi Clinic",
    category: "hospital",
    coordinates: [-17.3545, 30.1990],
    address: "Health Street, Chinhoyi, Zimbabwe",
    phone: "+263 67 2125678",
    icon: Hospital
  }
];

interface EmergencyMapProps {
  className?: string;
  onLocationSelect?: (location: EmergencyLocation) => void;
}

const EmergencyMap = ({ className = "", onLocationSelect }: EmergencyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<EmergencyLocation | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  
  // Chinhoyi, Zimbabwe coordinates
  const chinhoyiCoordinates: [number, number] = [-17.3667, 30.2000];

  useEffect(() => {
    // In a real app, this would be using a mapping library like Google Maps,
    // Mapbox, or Leaflet to display an actual map
    console.log("Displaying map centered at Chinhoyi, Zimbabwe");
    console.log(`Map center: ${chinhoyiCoordinates}`);
    
    if (selectedLocation) {
      console.log(`Selected location: ${selectedLocation.name}`);
      console.log(`Location coordinates: ${selectedLocation.coordinates}`);
    }
  }, [selectedLocation]);

  const handleSelectLocation = (location: EmergencyLocation) => {
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const filteredLocations = filter 
    ? emergencyLocations.filter(loc => loc.category === filter)
    : emergencyLocations;

  return (
    <div className={`relative ${className}`}>
      <div className="bg-muted rounded-lg overflow-hidden h-full flex flex-col">
        {/* Map filters */}
        <div className="p-2 bg-background border-b flex gap-1 overflow-x-auto no-scrollbar">
          <Badge 
            variant={filter === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter(null)}
          >
            All
          </Badge>
          <Badge 
            variant={filter === "hospital" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("hospital")}
          >
            Hospitals
          </Badge>
          <Badge 
            variant={filter === "police" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("police")}
          >
            Police
          </Badge>
          <Badge 
            variant={filter === "fire" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("fire")}
          >
            Fire
          </Badge>
          <Badge 
            variant={filter === "community" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("community")}
          >
            Community
          </Badge>
          <Badge 
            variant={filter === "shelter" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("shelter")}
          >
            Shelters
          </Badge>
        </div>
        
        {/* Map simulation area */}
        <div ref={mapRef} className="relative flex-1 flex items-center justify-center bg-blue-50 dark:bg-blue-950">
          {/* Simulated map grid */}
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-6">
            {Array(48).fill(0).map((_, i) => (
              <div key={i} className="border border-muted-foreground/10" />
            ))}
          </div>
          
          <div className="absolute top-2 left-2 bg-background/80 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
            Chinhoyi, Zimbabwe
          </div>
          
          {/* Map location markers */}
          <div className="absolute inset-0">
            {filteredLocations.map((location) => (
              <div 
                key={location.id} 
                className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                  selectedLocation?.id === location.id ? 'z-30' : 'z-20'
                }`}
                style={{ 
                  left: `${(location.coordinates[1] - 30.19) * 1000 + 50}%`,
                  top: `${(location.coordinates[0] + 17.36) * -1000 + 50}%`
                }}
                onClick={() => handleSelectLocation(location)}
              >
                <div className={`p-1 rounded-full ${
                  selectedLocation?.id === location.id 
                    ? 'bg-primary text-primary-foreground scale-125' 
                    : 'bg-background shadow-md hover:bg-primary/20'
                } transition-all duration-200`}>
                  <location.icon size={16} />
                </div>
                {selectedLocation?.id === location.id && (
                  <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-background shadow-lg rounded-lg p-2 w-40 z-40 text-xs">
                    <p className="font-semibold">{location.name}</p>
                    <p className="text-muted-foreground text-[10px]">{location.address}</p>
                    {location.phone && (
                      <p className="text-primary text-[10px]">{location.phone}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Central marker for Chinhoyi */}
          <div className="z-10 animate-pulse">
            <MapPin className="h-8 w-8 text-primary drop-shadow-md" strokeWidth={2.5} />
            <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary rounded-full shadow-md"></span>
          </div>
        </div>
        
        {/* Map controls */}
        <div className="p-2 bg-background border-t flex justify-between items-center">
          <div className="text-xs">
            {filteredLocations.length} emergency locations
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Compass className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <span className="text-lg">+</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <span className="text-lg">−</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyMap;
