
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Report } from "@/integrations/supabase/reports";
import { getReports } from "@/integrations/supabase/reports";

// Since we don't have an alerts table, we'll use reports as alerts
export interface Alert extends Report {
  severity: "critical" | "high" | "medium" | "low";
}

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
          severity: report.severity || "medium"
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
      
      return alert as Alert;
    },
    enabled: !!id,
  });
};

export const useSubscribeToAlerts = (callback: (alert: Alert) => void) => {
  // Since reports are our alerts, we'll subscribe to report creation events
  const handleReportCreated = (event: any) => {
    if (event.detail && event.detail.type === 'new-report') {
      // Convert report to alert format
      const alert: Alert = {
        ...event.detail.report,
        severity: event.detail.report.severity || "medium"
      };
      callback(alert);
    }
  };

  useEffect(() => {
    window.addEventListener('report-created', handleReportCreated);

    return () => {
      window.removeEventListener('report-created', handleReportCreated);
    };
  }, [callback]);
};

// Missing import
import { useEffect } from 'react';
