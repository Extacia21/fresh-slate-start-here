import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";

// Alert type definitions
export type AlertType = "police" | "fire" | "health" | "weather" | "other";

export interface Alert {
  id: string;
  title: string;
  description: string;
  alert_type: AlertType;
  type?: string; // Adding this property to fix type errors
  severity: "low" | "medium" | "high" | "critical";
  latitude: number;
  longitude: number;
  radius: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  // These fields may not be in the database but we add them to our interface
  status?: string;
  is_resolved?: boolean;
  category?: string;
  location?: string;
  user_id?: string;
  updates?: any[];
}

// Colors for each alert type
export const alertTypeColors = {
  police: {
    bg: "bg-blue-500",
    text: "text-blue-500",
    border: "border-blue-500",
    light: "bg-blue-50",
    icon: "text-blue-500"
  },
  fire: {
    bg: "bg-red-500",
    text: "text-red-500",
    border: "border-red-500",
    light: "bg-red-50",
    icon: "text-red-500"
  },
  health: {
    bg: "bg-green-500",
    text: "text-green-500",
    border: "border-green-500",
    light: "bg-green-50",
    icon: "text-green-500"
  },
  weather: {
    bg: "bg-yellow-500",
    text: "text-yellow-500",
    border: "border-yellow-500",
    light: "bg-yellow-50",
    icon: "text-yellow-500"
  },
  other: {
    bg: "bg-purple-500",
    text: "text-purple-500",
    border: "border-purple-500",
    light: "bg-purple-50",
    icon: "text-purple-500"
  }
};

// Format time relative to now (e.g., "2 hours ago")
export const formatRelativeTime = (dateString: string): string => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown time";
  }
};

// Get all alerts
export const useGetAllAlerts = () => {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return (data || []).map(alert => ({
        ...alert,
        type: alert.alert_type, // Add type property that matches alert_type for compatibility
        location: `${alert.latitude.toFixed(6)}, ${alert.longitude.toFixed(6)}`,
        status: "active",
        is_resolved: false,
        category: alert.alert_type,
        user_id: alert.created_by,
        updates: []
      })) as Alert[];
    },
  });
};

// Keep the original useGetAlerts for backward compatibility
export const useGetAlerts = useGetAllAlerts;

// Get an alert by ID
export const useGetAlertById = (id: string) => {
  return useQuery({
    queryKey: ["alert", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return {
        ...data,
        type: data.alert_type, // Add type property that matches alert_type for compatibility
        location: `${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`,
        status: "active",
        is_resolved: false,
        category: data.alert_type,
        user_id: data.created_by,
        updates: []
      } as Alert;
    },
    enabled: !!id,
  });
};

// Get recent alerts (last 24 hours)
export const useGetRecentAlerts = () => {
  return useQuery({
    queryKey: ["recentAlerts"],
    queryFn: async () => {
      // Calculate date 24 hours ago
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .gte("created_at", oneDayAgo.toISOString())
        .order("created_at", { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return (data || []).map(alert => ({
        ...alert,
        type: alert.alert_type, // Add type property that matches alert_type for compatibility
        location: `${alert.latitude.toFixed(6)}, ${alert.longitude.toFixed(6)}`,
        status: "active",
        is_resolved: false,
        category: alert.alert_type,
        user_id: alert.created_by,
        updates: []
      })) as Alert[];
    },
  });
};

// Create an alert
export const useCreateAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alertData: Omit<Alert, "id" | "created_at" | "updated_at">) => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from("alerts")
        .insert({
          ...alertData,
          created_by: user.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        ...data,
        type: data.alert_type, // Add type property that matches alert_type for compatibility
        location: `${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`,
        status: "active",
        is_resolved: false,
        category: data.alert_type,
        user_id: data.created_by,
        updates: []
      } as Alert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["recentAlerts"] });
    },
  });
};

// Subscribe to alerts (real-time) - modified to handle both single alert and array of alerts
export const useSubscribeToAlerts = (callback: (alerts: Alert[] | Alert) => void) => {
  useQuery({
    queryKey: ["alertsSubscription"],
    queryFn: async () => {
      const subscription = supabase
        .channel("alerts-channel")
        .on("postgres_changes", 
            { event: "*", schema: "public", table: "alerts" }, 
            async () => {
          // Fetch the latest alerts when any change happens
          const { data, error } = await supabase
            .from("alerts")
            .select("*")
            .order("created_at", { ascending: false });
          
          if (!error && data) {
            // Map the data to ensure all properties are present
            const alerts = data.map(alert => ({
              ...alert,
              type: alert.alert_type, // Add type property that matches alert_type for compatibility
              location: `${alert.latitude.toFixed(6)}, ${alert.longitude.toFixed(6)}`,
              status: "active",
              is_resolved: false,
              category: alert.alert_type,
              user_id: alert.created_by,
              updates: []
            })) as Alert[];
            
            // Call the callback with the latest alerts
            callback(alerts);
          }
        })
        .subscribe();
      
      // Return a cleanup function
      return () => {
        subscription.unsubscribe();
      };
    },
    refetchOnWindowFocus: false,
  });
};

// Get alerts by type
export const useGetAlertsByType = (type: AlertType) => {
  return useQuery({
    queryKey: ["alerts", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("alert_type", type)
        .order("created_at", { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data.map(alert => ({
        ...alert,
        type: alert.alert_type, // Add type property that matches alert_type for compatibility
        location: `${alert.latitude.toFixed(6)}, ${alert.longitude.toFixed(6)}`,
        status: "active",
        is_resolved: false,
        category: alert.alert_type,
        user_id: alert.created_by,
        updates: []
      })) as Alert[];
    },
  });
};

// Export default as an object
export default {
  useGetAllAlerts,
  useGetAlerts,
  useGetAlertById,
  useGetRecentAlerts,
  useCreateAlert,
  useSubscribeToAlerts,
  useGetAlertsByType,
  formatRelativeTime,
  alertTypeColors
};
