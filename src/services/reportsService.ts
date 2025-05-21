
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from 'react';

// Import actual functions instead of types
import { getReports, getPublicReports, createReport, Report } from "@/integrations/supabase/reports";

export type { Report };

export const useGetReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data, error } = await getReports();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Report[];
    },
  });
};

export const useGetUserReports = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-reports', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await getReports();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Filter to user's reports only
      const userReports = data?.filter(report => report.user_id === user.id) || [];
      return userReports as Report[];
    },
    enabled: !!user,
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (report: Omit<Report, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status'>) => {
      if (!user) throw new Error("User not authenticated");
      
      const newReport = {
        ...report,
        user_id: user.id,
        status: 'active' as const
      };
      
      const { data, error } = await createReport(newReport);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Dispatch a custom event to notify subscribers
      const reportEvent = new CustomEvent('report-created', {
        detail: {
          type: 'new-report',
          report: data,
        },
      });
      window.dispatchEvent(reportEvent);
      
      return data as Report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['reports'],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-reports'],
      });
    },
  });
};

export const useSubscribeToReports = (callback: (report: Report) => void) => {
  useEffect(() => {
    const handleReportCreated = (event: any) => {
      if (event.detail && event.detail.type === 'new-report') {
        callback(event.detail.report as Report);
      }
    };

    window.addEventListener('report-created', handleReportCreated);

    return () => {
      window.removeEventListener('report-created', handleReportCreated);
    };
  }, [callback]);
};
