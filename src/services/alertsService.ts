
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
  end_time: string;
  created_by: string;
  latitude: number;
  longitude: number;
  // Add all the properties that were missing
  location?: string;
  status?: string;
  is_resolved?: boolean;
  category?: string;
  user_id?: string;
  updates?: any[];
  // Include radius for database compatibility
  radius?: number;
}

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
      
      return data.map(alert => ({
        ...alert,
        location: alert.location || `${alert.latitude}, ${alert.longitude}`,
        status: alert.status || 'active',
        is_resolved: alert.is_resolved || false,
        category: alert.category || alert.alert_type,
        user_id: alert.user_id || alert.created_by,
        updates: alert.updates || [],
        // Add type as an alias for alert_type for backward compatibility
        type: alert.alert_type
      })) as Alert[];
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
      
      return {
        ...data,
        location: data.location || `${data.latitude}, ${data.longitude}`,
        status: data.status || 'active',
        is_resolved: data.is_resolved || false,
        category: data.category || data.alert_type,
        user_id: data.user_id || data.created_by,
        updates: data.updates || [],
        // Add type as an alias for alert_type
        type: data.alert_type
      } as Alert;
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
      
      return data.map(alert => ({
        ...alert,
        location: alert.location || `${alert.latitude}, ${alert.longitude}`,
        status: alert.status || 'active',
        is_resolved: alert.is_resolved || false,
        category: alert.category || alert.alert_type,
        user_id: alert.user_id || alert.created_by,
        updates: alert.updates || [],
        // Add type as an alias for alert_type
        type: alert.alert_type
      })) as Alert[];
    },
    enabled: !!type
  });
};

// Hook to create an alert
export const useCreateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAlert: Partial<Alert>) => {
      // Ensure required fields are present
      const alertWithDefaults = {
        ...newAlert,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        start_time: newAlert.start_time || new Date().toISOString(),
        description: newAlert.description || "",
        latitude: newAlert.latitude || 0,
        longitude: newAlert.longitude || 0,
        alert_type: newAlert.alert_type || "other",
        severity: newAlert.severity || "medium"
      };

      const { data, error } = await supabase
        .from('alerts')
        .insert([alertWithDefaults])
        .select()
        .single();

      if (error) throw error;
      
      // Add the alert to the user-alerts junction table if user_id is available
      if (data.created_by) {
        try {
          await supabase
            .from('user_alert_subscriptions')
            .insert([{ 
              user_id: data.created_by, 
              alert_id: data.id 
            }]);
        } catch (subscriptionError) {
          console.error("Error creating subscription:", subscriptionError);
        }

        // Add the alert to the alert history
        try {
          await supabase
            .from('user_alert_history')
            .insert([{ 
              user_id: data.created_by, 
              alert_id: data.id, 
              action: 'created' 
            }]);
        } catch (historyError) {
          console.error("Error creating history:", historyError);
        }
      }

      // Transform the result
      const transformedAlert = {
        ...data,
        location: data.location || `${data.latitude}, ${data.longitude}`,
        status: data.status || 'active',
        is_resolved: data.is_resolved || false,
        category: data.category || data.alert_type,
        user_id: data.user_id || data.created_by,
        updates: data.updates || [],
        type: data.alert_type
      } as Alert;

      return transformedAlert;
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
      const { data, error } = await supabase
        .from('alerts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Transform the result
      const transformedAlert = {
        ...data,
        location: data.location || `${data.latitude}, ${data.longitude}`,
        status: data.status || 'active',
        is_resolved: data.is_resolved || false,
        category: data.category || data.alert_type,
        user_id: data.user_id || data.created_by,
        updates: data.updates || [],
        type: data.alert_type
      } as Alert;

      return transformedAlert;
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

// Hook to subscribe to an alert
export const useSubscribeToAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, alertId }: { userId: string, alertId: string }) => {
      const { error } = await supabase
        .from('user_alert_subscriptions')
        .insert([{ user_id: userId, alert_id: alertId }]);

      if (error) throw error;
      
      return { userId, alertId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-subscriptions'] });
      toast.success('Subscribed to alert successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to subscribe to alert: ${error.message}`);
      console.error('Error subscribing to alert:', error);
    }
  });
};

// Hook to subscribe to real-time alerts (simulated for now)
export const useSubscribeToAlerts = (callback: (alerts: Alert[] | Alert) => void) => {
  useEffect(() => {
    const channel = supabase
      .channel('alerts-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
        const newAlert = payload.new as Alert;
        
        // Add derived fields
        const enrichedAlert = {
          ...newAlert,
          location: newAlert.location || `${newAlert.latitude}, ${newAlert.longitude}`,
          status: newAlert.status || 'active',
          is_resolved: newAlert.is_resolved || false,
          category: newAlert.category || newAlert.alert_type,
          user_id: newAlert.user_id || newAlert.created_by,
          updates: newAlert.updates || [],
          type: newAlert.alert_type
        };
        
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
