
import { useState, useEffect } from "react";
import { MapPin, Navigation, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationMap from "@/components/common/LocationMap";
import { useGetRecentAlerts } from "@/services/alertsService";

const MapPage = () => {
  const [currentLocation, setCurrentLocation] = useState("Chinhoyi, Zimbabwe");
  const [isLoading, setIsLoading] = useState(true);
  const { data: alerts } = useGetRecentAlerts(10);

  useEffect(() => {
    // Simulate getting location
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigateToCurrentLocation = () => {
    setCurrentLocation("Chinhoyi, Zimbabwe");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="page-header border-b border-border">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            <h1 className="text-xl font-bold">Chinhoyi Map</h1>
          </div>
          <Button 
            size="sm"
            variant="outline"
            onClick={handleNavigateToCurrentLocation}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Current Location
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <LocationMap
              location={currentLocation}
              className="w-full h-full"
              zoom={14}
            />
            
            <div className="absolute top-4 left-0 right-0 px-4">
              <div className="bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-crisis-red mr-2" />
                  <span className="text-sm font-medium">Emergency Locations in Chinhoyi</span>
                </div>
                <div className="text-xs">
                  <p>• <span className="font-medium">Red pins</span>: Active incidents</p>
                  <p>• <span className="font-medium">Blue pins</span>: Emergency services</p>
                  <p>• <span className="font-medium">Green pins</span>: Safe zones</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {!isLoading && alerts && (
        <div className="absolute bottom-20 left-0 right-0 px-4">
          <div className="bg-white shadow-lg rounded-lg p-3 max-h-32 overflow-y-auto">
            <h3 className="font-medium text-sm mb-2">Recent Alerts in Chinhoyi</h3>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="text-xs p-2 bg-muted rounded flex items-start">
                  <AlertTriangle className="h-3 w-3 text-crisis-red shrink-0 mr-1" />
                  <div>
                    <span className="font-medium">{alert.title}</span>
                    <p className="text-muted-foreground">{alert.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
