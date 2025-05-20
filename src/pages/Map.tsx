
import React from "react";
import { useGetAllAlerts } from "@/services/alertsService";

const Map = () => {
  // Use the alerts service directly without wrapper
  const { data: alerts } = useGetAllAlerts();
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Alert Map</h1>
      <p className="text-muted-foreground mb-4">
        Showing {alerts?.length || 0} alerts in your area
      </p>
      <div className="bg-muted h-64 rounded flex items-center justify-center">
        <p className="text-muted-foreground">Map visualization will appear here</p>
      </div>
    </div>
  );
};

export default Map;
