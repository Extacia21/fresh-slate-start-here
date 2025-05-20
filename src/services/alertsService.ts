
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, formatDistance } from "date-fns";

// Alert type color definitions
export const alertTypeColors = {
  police: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200"
  },
  fire: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200"
  },
  health: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200"
  },
  weather: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200"
  },
  other: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200"
  }
};

// Function to format relative time
export const formatRelativeTime = (timestamp: string): string => {
  try {
    return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown time";
  }
};

// Define the database Alert type - matching the actual database schema
type DatabaseAlert = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  alert_type: "police" | "fire" | "health" | "weather" | "other";
  start_time: string;
  end_time: string | null;
  created_by: string | null;
  latitude: number;
  longitude: number;
  radius: number;
  source: string | null;
};

// Define the Alert interface with all required properties
export interface Alert {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  alert_type: "police" | "fire" | "health" | "weather" | "other";
  type?: "police" | "fire" | "health" | "weather" | "other"; // Add type as an optional alias for alert_type
  start_time: string;
  end_time: string | null;
  created_by: string | null;
  latitude: number;
  longitude: number;
  radius: number;
  source?: string | null;
  // Additional properties we compute or add
  location?: string;
  status?: string;
  is_resolved?: boolean;
  category?: string;
  user_id?: string;
  updates?: any[];
}

// Helper function to transform database alert to our Alert interface
const transformDatabaseAlert = (dbAlert: DatabaseAlert): Alert => {
  return {
    ...dbAlert,
    location: `${dbAlert.latitude}, ${dbAlert.longitude}`,
    status: 'active',
    is_resolved: false,
    category: dbAlert.alert_type,
    user_id: dbAlert.created_by,
    updates: [],
    type: dbAlert.alert_type  // Add type as alias for alert_type
  };
};

// Hook to get all alerts
export const useGetAllAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async (): Promise<Alert[]> => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(alert => transformDatabaseAlert(alert as DatabaseAlert));
    }
  });
};

// Hook to get a single alert by ID
export const useGetAlertById = (id: string) => {
  return useQuery({
    queryKey: ['alerts', id],
    queryFn: async (): Promise<Alert> => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return transformDatabaseAlert(data as DatabaseAlert);
    },
    enabled: !!id
  });
};

// Hook to get alerts by type
export const useGetAlertsByType = (type: Alert['alert_type']) => {
  return useQuery({
    queryKey: ['alerts', 'type', type],
    queryFn: async (): Promise<Alert[]> => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('alert_type', type)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(alert => transformDatabaseAlert(alert as DatabaseAlert));
    },
    enabled: !!type
  });
};

// Hook to create an alert
export const useCreateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAlert: Partial<Alert>) => {
      // Extract only the fields that are in the database schema
      const dbAlert = {
        title: newAlert.title || 'Alert',
        description: newAlert.description || "",
        severity: newAlert.severity || "medium",
        alert_type: newAlert.alert_type || "other",
        start_time: newAlert.start_time || new Date().toISOString(),
        end_time: newAlert.end_time || null,
        created_by: newAlert.created_by || null,
        latitude: newAlert.latitude || 0,
        longitude: newAlert.longitude || 0,
        radius: newAlert.radius || 1000, // Default radius in meters
        source: newAlert.source || null
      };

      const { data, error } = await supabase
        .from('alerts')
        .insert([dbAlert])
        .select()
        .single();

      if (error) throw error;
      
      // Add the alert to the user's alert history if created_by is available
      if (data.created_by) {
        try {
          await supabase
            .from('user_alert_history')
            .insert([{ 
              user_id: data.created_by, 
              alert_id: data.id, 
              action: 'created',
              dismissed: false,
              saved: false
            }]);
        } catch (historyError) {
          console.error("Error creating history:", historyError);
        }
      }

      // Transform the result to our Alert interface
      return transformDatabaseAlert(data as DatabaseAlert);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create alert: ${error.message}`);
      console.error('Error creating alert:', error);
    }
  });
};

// Hook to update an alert
export const useUpdateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Alert> & { id: string }) => {
      // Extract only fields that are in the database schema
      const dbUpdates: Partial<DatabaseAlert> = {};
      
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.severity) dbUpdates.severity = updates.severity;
      if (updates.alert_type) dbUpdates.alert_type = updates.alert_type;
      if (updates.start_time) dbUpdates.start_time = updates.start_time;
      if (updates.end_time) dbUpdates.end_time = updates.end_time;
      if (updates.latitude) dbUpdates.latitude = updates.latitude;
      if (updates.longitude) dbUpdates.longitude = updates.longitude;
      if (updates.radius) dbUpdates.radius = updates.radius;
      if ('source' in updates) dbUpdates.source = updates.source;
      
      // Always update the updated_at timestamp
      dbUpdates.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('alerts')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Transform the result to our Alert interface
      return transformDatabaseAlert(data as DatabaseAlert);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts', data.id] });
      toast.success('Alert updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update alert: ${error.message}`);
      console.error('Error updating alert:', error);
    }
  });
};

// Hook to delete an alert
export const useDeleteAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts', id] });
      toast.success('Alert deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete alert: ${error.message}`);
      console.error('Error deleting alert:', error);
    }
  });
};

// Hook to track alert interaction in user history
export const useSubscribeToAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, alertId }: { userId: string, alertId: string }) => {
      // Use user_alert_history instead of a subscription table
      const { error } = await supabase
        .from('user_alert_history')
        .insert([{ 
          user_id: userId, 
          alert_id: alertId,
          action: 'subscribed',
          viewed_at: new Date().toISOString(),
          saved: true
        }]);

      if (error) throw error;
      
      return { userId, alertId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-subscriptions'] });
      toast.success('Alert saved successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to save alert: ${error.message}`);
      console.error('Error saving alert:', error);
    }
  });
};

// Hook to subscribe to real-time alerts
export const useSubscribeToAlerts = (callback: (alerts: Alert[] | Alert) => void) => {
  useEffect(() => {
    const channel = supabase
      .channel('alerts-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
        const newAlert = payload.new as DatabaseAlert;
        
        // Transform the alert
        const enrichedAlert = transformDatabaseAlert(newAlert);
        
        callback(enrichedAlert);
      })
      .subscribe();
      
    return () => {
      channel.unsubscribe();
    };
  }, [callback]);
};

// Need to import useEffect for the subscription hook
import { useEffect } from "react";
