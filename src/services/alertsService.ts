
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Report } from "@/integrations/supabase/reports";
import { getReports } from "@/integrations/supabase/reports";
import { useEffect } from 'react';

// Since we don't have an alerts table, we'll use reports as alerts
export interface Alert extends Report {
  severity: "critical" | "high" | "medium" | "low";
  source?: "official" | "user-reported" | string;
}

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

export const useGetAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      // Get alerts (using reports as mock)
      const { data, error } = await getReports();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Convert reports to alerts
      const alerts = data?.map(report => ({
        ...report,
        severity: report.severity || "medium",
        source: report.user_id ? "user-reported" : "official"
      }));
        
      return alerts as Alert[];
    },
  });
};

export const useGetRecentAlerts = (limit = 10) => {
  return useQuery({
    queryKey: ['alerts', limit],
    queryFn: async () => {
      // Get alerts (using reports as mock)
      const { data, error } = await getReports();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Sort by created_at (newest first) and limit
      const alerts = data
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit)
        .map(report => ({
          ...report,
          severity: report.severity || "medium",
          source: report.user_id ? "user-reported" : "official"
        }));
        
      return alerts as Alert[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds for simulation
  });
};

export const useGetAlertById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['alert', id],
    queryFn: async () => {
      if (!id) return null;
      
      // Get all reports and find the matching one
      const { data, error } = await getReports();
      
      if (error) {
        throw new Error(error.message);
      }
      
      const alert = data?.find(report => report.id === id);
      if (!alert) {
        throw new Error("Alert not found");
      }
      
      return {
        ...alert,
        severity: alert.severity || "medium",
        source: alert.user_id ? "user-reported" : "official"
      } as Alert;
    },
    enabled: !!id,
  });
};

// Separate subscription function from hook
export const subscribeToAlerts = (callback: (alert: Alert) => void) => {
  const handleReportCreated = (event: any) => {
    if (event.detail && event.detail.type === 'new-report') {
      // Convert report to alert format
      const alert: Alert = {
        ...event.detail.report,
        severity: event.detail.report.severity || "medium",
        source: event.detail.report.user_id ? "user-reported" : "official"
      };
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
