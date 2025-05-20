
import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SOSButton from "@/components/common/SOSButton";

const AppLayout = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      
      {/* SOS Button - only shown if user is authenticated */}
      {user && <SOSButton />}
    </div>
  );
};

export default AppLayout;
