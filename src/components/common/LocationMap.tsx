
import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LocationMapProps {
  location?: string;
  className?: string;
  zoom?: number;
  showDirections?: boolean;
}

const LocationMap = ({ 
  location, 
  className = "", 
  zoom = 15, 
  showDirections = false 
}: LocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!location || !mapRef.current) return;
    
    // Load the Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC2EbJF5Ny34XOJjGuy2ASI8Z9tASdj-Ns&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!location || !mapLoaded || !mapRef.current) return;
    
    setIsLoading(true);
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const position = results[0].geometry.location;
        
        const mapOptions = {
          center: position,
          zoom: zoom,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_TOP
          },
        };
        
        const map = new window.google.maps.Map(mapRef.current, mapOptions);
        
        new window.google.maps.Marker({
          position: position,
          map: map,
          animation: window.google.maps.Animation.DROP,
          title: location
        });
        
        setIsLoading(false);
      } else {
        toast.error("Could not find location on map");
        console.error("Geocoding error:", status);
        setIsLoading(false);
      }
    });
  }, [location, mapLoaded, zoom]);

  if (!location) return null;

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-48"
        style={{ minHeight: "200px" }}
      ></div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-2">Loading map...</span>
        </div>
      )}
      
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
  );
};

declare global {
  interface Window {
    google: any;
  }
}

export default LocationMap;
