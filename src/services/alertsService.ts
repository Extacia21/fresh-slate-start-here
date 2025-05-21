import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Report } from "@/integrations/supabase/reports";
import { getReports, getReportById } from "@/integrations/supabase/reports";
import { useEffect, useState } from 'react';
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

// Since we don't have an alerts table, we'll use reports as alerts
export interface Alert {
  id?: string;
  title: string;
  description: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  type: string;
  is_public: boolean;
  severity: "critical" | "high" | "medium" | "low";
  status?: 'active' | 'resolved' | 'archived';
  created_at?: string;
  updated_at?: string;
  source?: "official" | "user-reported" | string;
  photos?: string[];
  updates?: Array<{ time: string; content: string }>;
  user_id?: string;
}

// Store alerts in memory to prevent losing them
let alertsCache: Alert[] = [];

// Color mapping for alert types
export const alertTypeColors = {
  fire: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: 'text-red-600',
    border: 'border-red-200'
  },
  police: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: 'text-yellow-600',
    border: 'border-yellow-200'
  },
  health: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: 'text-green-600',
    border: 'border-green-200'
  },
  weather: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: 'text-blue-600',
    border: 'border-blue-200'
  },
  other: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    icon: 'text-gray-600',
    border: 'border-gray-200'
  }
};

// Convert a report to an alert format
const reportToAlert = (report: Report): Alert => {
  return {
    ...report,
    severity: report.severity || "medium",
    source: report.user_id ? "user-reported" : "official",
    updates: report.updates || []
  };
};

export const useGetAlerts = () => {
  const [localAlerts, setLocalAlerts] = useState<Alert[]>(alertsCache);

  const { data, isLoading, error } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      // Get alerts (using reports as mock)
      const { data, error } = await getReports();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Convert reports to alerts
      const alerts = data ? data.map(reportToAlert) : [];

      // Update our cache
      alertsCache = alerts;
      
      return alerts;
    },
    refetchInterval: 15000, // Refetch every 15 seconds to keep data fresh
  });

  // Update local state when data changes
  useEffect(() => {
    if (data) {
      setLocalAlerts(data);
    }
  }, [data]);

  // Handle new alert subscription
  useEffect(() => {
    const handleNewAlert = (event: CustomEvent) => {
      if (event.detail && event.detail.type === 'new-report') {
        const newAlert = reportToAlert(event.detail.report);
        
        // Update local state with new alert at the top
        setLocalAlerts(prev => {
          // Check if already exists to prevent duplicates
          if (prev.some(a => a.id === newAlert.id)) {
            return prev;
          }
          const newAlerts = [newAlert, ...prev];
          alertsCache = newAlerts; // Update cache
          return newAlerts;
        });
      }
    };

    window.addEventListener('report-created', handleNewAlert as EventListener);
    
    return () => {
      window.removeEventListener('report-created', handleNewAlert as EventListener);
    };
  }, []);

  return {
    data: localAlerts,
    isLoading,
    error,
  };
};

export const useGetRecentAlerts = (limit = 10) => {
  const [localAlerts, setLocalAlerts] = useState<Alert[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['recent-alerts', limit],
    queryFn: async () => {
      // Get alerts (using reports as mock)
      const { data, error } = await getReports();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Sort by created_at (newest first) and limit
      const alerts = data
        ? data
            .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
            .slice(0, limit)
            .map(reportToAlert)
        : [];
        
      return alerts;
    },
    refetchInterval: 15000, // Refetch every 15 seconds for simulation
  });

  // Update local state when data changes
  useEffect(() => {
    if (data) {
      setLocalAlerts(data);
    }
  }, [data]);

  // Handle new alert subscription
  useEffect(() => {
    const handleNewAlert = (event: CustomEvent) => {
      if (event.detail && event.detail.type === 'new-report') {
        const newAlert = reportToAlert(event.detail.report);
        
        // Add new alert to local state at the top
        setLocalAlerts(prev => {
          // Check if already exists to prevent duplicates
          if (prev.some(a => a.id === newAlert.id)) {
            return prev;
          }
          
          // Keep the array limited to the specified limit
          const newAlerts = [newAlert, ...prev];
          if (newAlerts.length > limit) {
            return newAlerts.slice(0, limit);
          }
          return newAlerts;
        });

        // Show toast notification for new alert
        toast.info(`New Alert: ${newAlert.title}`, {
          description: newAlert.description.substring(0, 50) + (newAlert.description.length > 50 ? '...' : ''),
        });
      }
    };

    window.addEventListener('report-created', handleNewAlert as EventListener);
    
    return () => {
      window.removeEventListener('report-created', handleNewAlert as EventListener);
    };
  }, [limit]);

  return {
    data: localAlerts,
    isLoading,
    error,
  };
};

export const useGetAlertById = (id: string | undefined) => {
  const [localAlert, setLocalAlert] = useState<Alert | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['alert', id],
    queryFn: async () => {
      if (!id) return null;
      
      // Get the report by ID
      const { data, error } = await getReportById(id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data) {
        throw new Error("Alert not found");
      }
      
      return reportToAlert(data);
    },
    enabled: !!id,
  });

  // Update local state when data changes
  useEffect(() => {
    if (data) {
      setLocalAlert(data);
    }
  }, [data]);

  // Handle alert updates
  useEffect(() => {
    const handleAlertUpdate = (event: CustomEvent) => {
      if (event.detail && 
          event.detail.type === 'update-report' && 
          event.detail.report.id === id) {
        setLocalAlert(prevAlert => {
          if (!prevAlert) return null;
          return {
            ...prevAlert,
            ...event.detail.report,
            // Preserve alert-specific fields
            severity: event.detail.report.severity || prevAlert.severity,
            source: event.detail.report.source || prevAlert.source,
            updates: prevAlert.updates || []
          };
        });
      }
    };

    window.addEventListener('report-updated', handleAlertUpdate as EventListener);
    
    return () => {
      window.removeEventListener('report-updated', handleAlertUpdate as EventListener);
    };
  }, [id]);

  return {
    data: localAlert || data,
    isLoading,
    error,
  };
};

// Separate subscription function from hook
export const subscribeToAlerts = (callback: (alert: Alert) => void) => {
  const handleReportCreated = (event: any) => {
    if (event.detail && event.detail.type === 'new-report') {
      // Convert report to alert format
      const alert = reportToAlert(event.detail.report);
      callback(alert);
    }
  };

  window.addEventListener('report-created', handleReportCreated);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('report-created', handleReportCreated);
  };
};

// Hook that uses the subscribe function
export const useSubscribeToAlerts = (callback: (alert: Alert) => void) => {
  useEffect(() => {
    const unsubscribe = subscribeToAlerts(callback);
    return unsubscribe;
  }, [callback]);
};

// Format timestamp relative to current time
export const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleDateString();
  }
};
