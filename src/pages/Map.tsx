
import { useState } from "react";
import { MapPin } from "lucide-react";
import EmergencyMap from "@/components/common/EmergencyMap";

const Map = () => {
  const [location] = useState("Chinhoyi, Zimbabwe");
  
  return (
    <div className="flex flex-col h-full">
      <div className="page-header border-b border-border">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            <h1 className="text-xl font-bold">Chinhoyi Map</h1>
          </div>
        </div>
        <p className="text-muted-foreground mb-4">
          View emergency services and important locations in Chinhoyi, Zimbabwe
        </p>
      </div>
      
      <div className="flex-1 p-4 pb-24">
        <EmergencyMap className="h-full rounded-lg shadow-sm" />
      </div>
    </div>
  );
};

export default Map;
