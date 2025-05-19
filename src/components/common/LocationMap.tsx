
import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationMapProps {
  location?: string;
  className?: string;
  zoom?: number;
  showDirections?: boolean;
}

const LocationMap = ({ 
  location, 
  className = "", 
  zoom = 1,
  showDirections = false 
}: LocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(zoom);

  useEffect(() => {
    if (!location) return;
    
    // In a real application, you would use an actual mapping API
    // like Google Maps, Mapbox, or Leaflet to render the map
    // and handle directions
    
    console.log(`Displaying map for location: ${location}`);
  }, [location]);

  // Update zoom level when the zoom prop changes
  useEffect(() => {
    setZoomLevel(zoom);
  }, [zoom]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.6));
  };

  const handlePan = (direction: string) => {
    setIsInteracting(true);
    // Simulate panning effect
    setTimeout(() => setIsInteracting(false), 300);
  };

  if (!location) return null;

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <div 
        ref={mapRef} 
        className={`bg-muted h-48 w-full flex items-center justify-center transition-all duration-300 ${
          isInteracting ? 'bg-opacity-90' : ''
        }`}
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* Simulated map grid */}
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-6">
          {Array(48).fill(0).map((_, i) => (
            <div 
              key={i} 
              className="border border-muted-foreground/10" 
            />
          ))}
        </div>
        
        {/* Map pin at center */}
        <div className="relative z-10 animate-pulse">
          <MapPin className="h-8 w-8 text-primary drop-shadow-md" strokeWidth={2.5} />
          <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary rounded-full shadow-md"></span>
        </div>
        
        {/* Location name */}
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <div className="inline-block bg-background/80 text-foreground px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            {location}
          </div>
        </div>
        
        {/* Directions indicator - only show if showDirections is true */}
        {showDirections && (
          <div className="absolute top-2 left-2 bg-background/80 rounded-md shadow-md backdrop-blur-sm px-2 py-1">
            <div className="flex items-center gap-1">
              <Navigation className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Directions</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Map controls */}
      <div className="absolute top-2 right-2 bg-background/80 rounded-md shadow-md backdrop-blur-sm">
        <div className="flex flex-col gap-1 p-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn}>
            <span className="text-xl font-bold">+</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut}>
            <span className="text-xl font-bold">−</span>
          </Button>
        </div>
      </div>
      
      {/* Compass */}
      <div className="absolute bottom-2 right-2">
        <div className="bg-background/80 p-1 rounded-full backdrop-blur-sm shadow-md">
          <Compass className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
      
      {/* Direction buttons */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 hover:opacity-100 transition-opacity">
        <div className="grid grid-cols-3 gap-1">
          <div className="col-start-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 bg-background/80 backdrop-blur-sm shadow-md"
              onClick={() => handlePan('up')}
            >
              <Navigation className="h-4 w-4 -rotate-90" />
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-background/80 backdrop-blur-sm shadow-md"
            onClick={() => handlePan('left')}
          >
            <Navigation className="h-4 w-4 rotate-180" />
          </Button>
          <div></div>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-background/80 backdrop-blur-sm shadow-md"
            onClick={() => handlePan('right')}
          >
            <Navigation className="h-4 w-4" />
          </Button>
          <div className="col-start-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 bg-background/80 backdrop-blur-sm shadow-md"
              onClick={() => handlePan('down')}
            >
              <Navigation className="h-4 w-4 rotate-90" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
