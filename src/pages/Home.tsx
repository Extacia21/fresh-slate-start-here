
import React from "react";
import { useGetAllAlerts } from "@/services/alertsService";

const Home = () => {
  // Use the alerts service directly without wrapper
  const { data: alerts } = useGetAllAlerts();
  
  return (
    <div>
      {/* Component content */}
      <h1 className="text-xl font-bold p-4">Home Dashboard</h1>
      {alerts && alerts.length > 0 ? (
        <div className="p-4">
          <p>You have {alerts.length} active alerts in your area</p>
        </div>
      ) : (
        <div className="p-4">
          <p>No active alerts in your area</p>
        </div>
      )}
    </div>
  );
};

export default Home;
