
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
