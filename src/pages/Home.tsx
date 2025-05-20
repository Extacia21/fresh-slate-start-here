import React from "react";
import { useGetAllAlerts } from "@/services/alertsService";

// This function will match the expected signature without arguments
const useCorrectAlerts = () => useGetAllAlerts();

const Home = () => {
  // Use the wrapper function that doesn't pass parameters
  const { data: alerts } = useCorrectAlerts();
  
  return (
    <div>
      {/* Component content */}
    </div>
  );
};

export default Home;
