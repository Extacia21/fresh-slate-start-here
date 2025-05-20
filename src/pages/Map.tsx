
import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { useProfileData } from "@/hooks/use-profile-data";
import { useAuth } from "@/contexts/AuthContext";
import LocationMap from "@/components/common/LocationMap";

const Map = () => {
  const { profileData } = useProfileData();
  const { user } = useAuth();
  const [location, setLocation] = useState("Chinhoyi, Zimbabwe");
  
  useEffect(() => {
    if (profileData) {
      // If user has location data, use it
      if (profileData.city) {
        const userLocation = profileData.state 
          ? `${profileData.city}, ${profileData.state}`
          : profileData.city;
        setLocation(userLocation);
        console.log(`Displaying map centered at ${userLocation}`);
      }
    }
  }, [profileData]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="page-header border-b border-border">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            <h1 className="text-xl font-bold">{location} Map</h1>
          </div>
        </div>
        <p className="text-muted-foreground mb-4">
          View emergency services and important locations in {location}
        </p>
      </div>
      
      <div className="flex-1 p-4 pb-24">
        <LocationMap location={location} className="h-full rounded-lg shadow-sm" />
      </div>
    </div>
  );
};

export default Map;
