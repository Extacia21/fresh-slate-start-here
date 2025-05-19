
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export interface Report {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  status: string;
  is_public: boolean;
}

export const useGetReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
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
      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Report[];
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
      
      const { data, error } = await supabase
        .from('reports')
        .insert(newReport)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
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
  const channel = supabase
    .channel('public:reports')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'reports'
      },
      (payload) => {
        callback(payload.new as Report);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
