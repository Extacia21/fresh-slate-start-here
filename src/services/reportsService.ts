
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Report } from "@/integrations/supabase/reports";

export { Report };

// Simulate fetch for reports
const fetchReports = async () => {
  try {
    // Make API call
    const response = await fetch('/api/reports');
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
};

// Simulate fetch for user reports
const fetchUserReports = async (userId: string) => {
  try {
    // Make API call
    const response = await fetch(`/api/reports/user/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user reports');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user reports:', error);
    return [];
  }
};

export const useGetReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      // In a real app, this would fetch from Supabase
      const reports = await fetchReports();
      return reports as Report[];
    },
  });
};

export const useGetUserReports = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-reports', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // In a real app, this would fetch from Supabase
      const reports = await fetchUserReports(user.id);
      return reports as Report[];
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
      };
      
      // In a real app, this would insert into Supabase
      // For now, we'll just simulate a successful response
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReport),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create report');
      }
      
      const data = await response.json();
      
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
      queryClient.invalidateQueries({
        queryKey: ['alerts'],
      });
    },
  });
};

export const useSubscribeToReports = (callback: (report: Report) => void) => {
  // In a real app with Supabase, you'd use real-time subscriptions
  // For now, we'll use a custom event listener
  const handleReportCreated = (event: any) => {
    if (event.detail && event.detail.type === 'new-report') {
      callback(event.detail.report as Report);
    }
  };

  window.addEventListener('report-created', handleReportCreated);

  return () => {
    window.removeEventListener('report-created', handleReportCreated);
  };
};
