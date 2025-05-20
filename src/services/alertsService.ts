
// Update alertsService.ts to fix the type issues

import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Define proper types for the alerts
export type AlertSeverity = "critical" | "high" | "medium" | "low";
export type AlertType = "fire" | "police" | "health" | "weather" | "other";

export interface Alert {
  id: string;
  title: string;
  description: string;
  location: string;
  type: AlertType;
  severity: AlertSeverity;
  created_at: string;
  updated_at: string;
  latitude: number;
  longitude: number;
  user_id?: string;
  is_resolved?: boolean;
  category?: string;
  source?: string; // Added source property
  status?: string; // Added status property
  updates?: Array<{
    id: string;
    text: string;
    timestamp: string;
  }>;
  // Map over to the Supabase fields
  alert_type?: AlertType;
  start_time?: string;
  end_time?: string;
  created_by?: string;
  radius?: number;
}

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

      // Transform data to match our Alert interface
      return (data || []).map((alert) => {
        return {
          id: alert.id,
          title: alert.title || `${alert.alert_type} Alert`,
          description: alert.description,
          location: alert.location || "Chinhoyi, Zimbabwe",
          type: alert.alert_type || "other",
          severity: alert.severity || "medium",
          created_at: alert.created_at,
          updated_at: alert.updated_at || alert.created_at,
          latitude: alert.latitude,
          longitude: alert.longitude,
          is_resolved: alert.is_resolved || false,
          category: alert.category || alert.alert_type,
          source: alert.source || "System",
          status: alert.status || "Active",
          user_id: alert.created_by || alert.user_id,
          updates: alert.updates || []
        } as Alert;
      });
    },
  });
};

// Alias for backward compatibility
export const useGetAlerts = useGetAllAlerts;

// Get a single alert by ID
export const useGetAlert = (id: string | undefined) => {
  return useQuery({
    queryKey: ["alert", id],
    queryFn: async () => {
      if (!id) throw new Error("Alert ID is required");

      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error("Alert not found");
      }

      // Transform to our Alert interface
      return {
        id: data.id,
        title: data.title || `${data.alert_type} Alert`,
        description: data.description,
        location: data.location || "Chinhoyi, Zimbabwe", 
        type: data.alert_type || "other",
        severity: data.severity || "medium",
        created_at: data.created_at,
        updated_at: data.updated_at || data.created_at,
        latitude: data.latitude,
        longitude: data.longitude,
        is_resolved: data.is_resolved || false,
        category: data.category || data.alert_type,
        source: data.source || "System",
        status: data.status || "Active",
        user_id: data.created_by || data.user_id,
        updates: data.updates || []
      } as Alert;
    },
    enabled: !!id,
  });
};

// Create a new alert
export const createAlert = async (alertData: Partial<Alert>): Promise<Alert> => {
  try {
    // Map our Alert type to match Supabase schema
    const supabaseAlertData = {
      alert_type: alertData.type || "other",
      title: alertData.title,
      description: alertData.description,
      location: alertData.location || "Chinhoyi, Zimbabwe",
      severity: alertData.severity || "medium",
      latitude: alertData.latitude || 0,
      longitude: alertData.longitude || 0,
      created_by: alertData.user_id,
      start_time: alertData.created_at || new Date().toISOString(),
      end_time: alertData.end_time || new Date(Date.now() + 86400000).toISOString(), // 24 hours later
      radius: alertData.radius || 5000, // Default 5km radius
      status: alertData.status || "Active",
      source: alertData.source || "User",
      is_resolved: alertData.is_resolved || false,
      category: alertData.category
    };

    const { data, error } = await supabase
      .from("alerts")
      .insert(supabaseAlertData)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    // Transform back to our Alert interface
    return {
      id: data.id,
      title: data.title || `${data.alert_type} Alert`,
      description: data.description,
      location: data.location,
      type: data.alert_type,
      severity: data.severity,
      created_at: data.created_at,
      updated_at: data.updated_at,
      latitude: data.latitude,
      longitude: data.longitude,
      is_resolved: data.is_resolved,
      category: data.category,
      source: data.source,
      status: data.status,
      user_id: data.created_by,
    } as Alert;
  } catch (error) {
    console.error("Error creating alert:", error);
    throw error;
  }
};

// Update an existing alert
export const updateAlert = async (id: string, alertData: Partial<Alert>): Promise<Alert> => {
  try {
    // Map our Alert type to match Supabase schema
    const supabaseAlertData = {
      ...(alertData.type && { alert_type: alertData.type }),
      ...(alertData.title && { title: alertData.title }),
      ...(alertData.description && { description: alertData.description }),
      ...(alertData.location && { location: alertData.location }),
      ...(alertData.severity && { severity: alertData.severity }),
      ...(alertData.latitude && { latitude: alertData.latitude }),
      ...(alertData.longitude && { longitude: alertData.longitude }),
      ...(alertData.is_resolved !== undefined && { is_resolved: alertData.is_resolved }),
      ...(alertData.status && { status: alertData.status }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("alerts")
      .update(supabaseAlertData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    // Transform back to our Alert interface
    return {
      id: data.id,
      title: data.title || `${data.alert_type} Alert`,
      description: data.description,
      location: data.location,
      type: data.alert_type,
      severity: data.severity,
      created_at: data.created_at,
      updated_at: data.updated_at,
      latitude: data.latitude,
      longitude: data.longitude,
      is_resolved: data.is_resolved,
      category: data.category,
      source: data.source,
      status: data.status,
      user_id: data.created_by,
    } as Alert;
  } catch (error) {
    console.error("Error updating alert:", error);
    throw error;
  }
};

export default {
  useGetAllAlerts,
  useGetAlert,
  createAlert,
  updateAlert,
};
