
import { useState, useEffect, useCallback } from "react";
import { Bell, Filter } from "lucide-react";
import AlertCard from "@/components/common/AlertCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useGetAllAlerts, useSubscribeToAlerts, Alert, formatRelativeTime } from "@/services/alertsService";
import { toast } from "sonner";

const Alerts = () => {
  const { data: alertsData, isLoading, error } = useGetAllAlerts();
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

  // Handle new alert callback
  const handleNewAlert = useCallback((newAlerts: Alert[] | Alert) => {
    setAlerts(prevAlerts => {
      // Handle both single alert or array of alerts
      const alertsArray = Array.isArray(newAlerts) ? newAlerts : [newAlerts];
      
      if (alertsArray.length > 0) {
        // Check for new alerts that we don't already have
        const newUniqueAlerts = alertsArray.filter(
          newAlert => !prevAlerts.some(existingAlert => existingAlert.id === newAlert.id)
        );
        
        // Show toast for new unique alerts
        newUniqueAlerts.forEach(newAlert => {
          toast.info(`New Alert: ${newAlert.title}`, {
            description: newAlert.description.substring(0, 50) + (newAlert.description.length > 50 ? '...' : ''),
            action: {
              label: 'View',
              onClick: () => navigate(`/app/alerts/${newAlert.id}`),
            },
          });
        });
        
        // If we have new alerts, add them and sort
        if (newUniqueAlerts.length > 0) {
          return [...prevAlerts, ...newUniqueAlerts]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
      }
      
      return prevAlerts;
    });
  }, [navigate]);
  
  // Subscribe to new alerts
  useSubscribeToAlerts(handleNewAlert);

  // Apply filters
  useEffect(() => {
    let result = [...alerts];
    
    // Apply category filter
    if (activeTab !== "all") {
      result = result.filter(alert => alert.type === activeTab || alert.alert_type === activeTab);
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
                id={alert.id.toString()}
                title={alert.title}
                message={alert.description}
                severity={alert.severity}
                time={formatRelativeTime(alert.created_at)}
                category={alert.type || alert.alert_type}
                location={alert.location}
                onClick={() => handleViewAlert(alert.id.toString())}
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

export default Alerts;
