
import { useState, useEffect } from "react";
import { Bell, Filter } from "lucide-react";
import AlertCard from "@/components/common/AlertCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useGetAlerts, useSubscribeToAlerts, Alert } from "@/services/alertsService";
import { toast } from "sonner";

const Alerts = () => {
  const { data: alertsData, isLoading, error } = useGetAlerts();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  
  // Set alerts when data is loaded
  useEffect(() => {
    if (alertsData) {
      setAlerts(alertsData);
    }
  }, [alertsData]);

  // Subscribe to new alerts
  useEffect(() => {
    const unsubscribe = useSubscribeToAlerts((newAlert) => {
      setAlerts(prevAlerts => {
        // Check if alert already exists to prevent duplicates
        if (prevAlerts.some(alert => alert.id === newAlert.id)) {
          return prevAlerts;
        }
        
        // Add new alert and sort by creation date
        const updatedAlerts = [newAlert, ...prevAlerts]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        // Show toast notification for new alert
        toast.info(`New ${newAlert.source === 'user-reported' ? 'User Report' : 'Alert'}: ${newAlert.title}`, {
          description: newAlert.description.substring(0, 50) + (newAlert.description.length > 50 ? '...' : ''),
          action: {
            label: 'View',
            onClick: () => navigate(`/app/alerts/${newAlert.id}`),
          },
        });
        
        return updatedAlerts;
      });
    });
    
    return () => {
      unsubscribe();
    };
  }, [navigate]);

  // Apply filters
  useEffect(() => {
    let result = [...alerts];
    
    // Apply category filter
    if (activeTab !== "all") {
      result = result.filter(alert => alert.type === activeTab);
    }
    
    // Apply severity filter
    if (severityFilter !== "all") {
      result = result.filter(alert => alert.severity === severityFilter);
    }
    
    setFilteredAlerts(result);
  }, [alerts, activeTab, severityFilter]);

  const handleViewAlert = (alertId: string) => {
    navigate(`/app/alerts/${alertId}`);
  };

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="page-header border-b border-border">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              <h1 className="text-xl font-bold">Alerts</h1>
            </div>
          </div>
        </div>
        <div className="page-container">
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">Error Loading Alerts</h3>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : "Failed to load alerts"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="page-header border-b border-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            <h1 className="text-xl font-bold">Alerts</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
              Live
            </span>
            <Select 
              value={severityFilter}
              onValueChange={setSeverityFilter}
            >
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <Filter className="h-3 w-3 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mt-4"
          defaultValue="all"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
            <TabsTrigger value="fire">Fire</TabsTrigger>
            <TabsTrigger value="police">Police</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="page-container">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div 
                key={item} 
                className="bg-muted animate-pulse h-24 rounded-lg"
              ></div>
            ))}
          </div>
        ) : filteredAlerts.length > 0 ? (
          <div>
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                id={parseInt(alert.id)} // This should be changed to accept string IDs
                title={alert.title}
                message={alert.description}
                severity={alert.severity as any}
                time={formatTimestamp(alert.created_at)}
                category={alert.type}
                location={alert.location}
                onClick={() => handleViewAlert(alert.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">No Alerts Found</h3>
            <p className="text-muted-foreground">
              {activeTab !== "all" || severityFilter !== "all"
                ? "Try changing your filters to see more alerts"
                : "There are no active alerts at this time"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export default Alerts;
