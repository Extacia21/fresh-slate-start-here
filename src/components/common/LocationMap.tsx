
import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Compass, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Ensure Google Maps types are defined
declare global {
  interface Window {
    google: any;
  }
}

interface LocationMapProps {
  location?: string;
  className?: string;
  zoom?: number;
  showDirections?: boolean;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  interactive?: boolean;
}

const LocationMap = ({ 
  location, 
  className = "", 
  zoom = 15, 
  showDirections = false,
  onLocationSelect,
  interactive = false
}: LocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation && interactive) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          
          // If onLocationSelect callback is provided, call it with the user's location
          if (onLocationSelect) {
            // Get address from coordinates using reverse geocoding
            if (window.google && window.google.maps) {
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ location: userPos }, (results, status) => {
                if (status === "OK" && results && results[0]) {
                  onLocationSelect(userPos.lat, userPos.lng, results[0].formatted_address);
                }
              });
            }
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
          if (interactive) {
            toast.error("Could not access your location", {
              description: "Please enable location access in your browser settings"
            });
          }
        }
      );
    }
  }, [interactive, mapLoaded, onLocationSelect]);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Load the Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDp9ZnLPvebOjH8MYt8f0zpqYK4mRSlAts&libraries=places`;
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
    if (!mapLoaded || !mapRef.current) return;
    
    setIsLoading(true);

    // If location is not provided but interactive mode is on, use user location
    if (!location && userLocation && interactive) {
      const mapOptions = {
        center: userLocation,
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
      
      // Add marker for user's location
      const marker = new window.google.maps.Marker({
        position: userLocation,
        map: map,
        animation: window.google.maps.Animation.DROP,
        title: "Your location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: "#4285F4",
          fillOpacity: 0.8,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 10,
        }
      });
      
      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: "<div><strong>Your current location</strong></div>"
      });
      
      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
      
      // If the map is interactive, allow clicking to place a marker
      if (interactive) {
        map.addListener("click", (event: any) => {
          // Clear existing markers (except user location)
          marker.setMap(map);
          
          // Get clicked location
          const clickedLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          
          // Create new marker
          const newMarker = new window.google.maps.Marker({
            position: clickedLocation,
            map: map,
            animation: window.google.maps.Animation.DROP
          });
          
          // Get address using reverse geocoding
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: clickedLocation }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const address = results[0].formatted_address;
              
              // Update info window
              const infoWindow = new window.google.maps.InfoWindow({
                content: `<div><strong>Selected Location:</strong><br>${address}</div>`
              });
              
              infoWindow.open(map, newMarker);
              
              // Call callback if provided
              if (onLocationSelect) {
                onLocationSelect(clickedLocation.lat, clickedLocation.lng, address);
              }
            }
          });
        });
      }
      
      setIsLoading(false);
      return;
    }
    
    // If location is provided, geocode it and show on map
    if (location) {
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
          
          // Add marker for the location
          const marker = new window.google.maps.Marker({
            position: position,
            map: map,
            animation: window.google.maps.Animation.DROP,
            title: location
          });
          
          // Add info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div><strong>${location}</strong></div>`
          });
          
          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });
          
          setIsLoading(false);
        } else {
          toast.error("Could not find location on map");
          console.error("Geocoding error:", status);
          setIsLoading(false);
        }
      });
    } else {
      setIsLoading(false);
    }
  }, [location, mapLoaded, zoom, userLocation, interactive, onLocationSelect]);

  if (!location && !interactive) return null;

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
      {location && (
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <div className="inline-block bg-background/80 text-foreground px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            {location}
          </div>
        </div>
      )}
      
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

export default LocationMap;
