
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CloudRain, Shield, Info } from "lucide-react";

export interface Alert {
  id: number;
  title: string;
  description: string;
  location: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  created_at: string;
  user_id?: string;
  is_resolved?: boolean;
  latitude?: number;
  longitude?: number;
  category?: string;
}

// Color mapping for different alert types
export const alertTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  fire: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
  },
  police: {
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    border: "border-yellow-200",
  },
  health: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
  },
  weather: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  other: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
  },
};

// Generate random Chinhoyi alerts
const generateChinhoyiAlerts = (count: number): Alert[] => {
  const locations = [
    "Central Chinhoyi",
    "Chinhoyi University",
    "Hunyani River Area",
    "Chinhoyi Caves",
    "Orange Grove",
    "Cold Stream"
  ];
  
  const alertTypes = ["fire", "police", "health", "weather"];
  const severities: ("critical" | "high" | "medium" | "low")[] = ["critical", "high", "medium", "low"];
  
  const alerts: Alert[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    let title = "";
    let description = "";
    
    switch (type) {
      case "fire":
        title = `Fire Alert in ${location}`;
        description = `Fire reported in ${location} area. Emergency services responding.`;
        break;
      case "police":
        title = `Security Incident in ${location}`;
        description = `Police activity reported in ${location}. Avoid the area if possible.`;
        break;
      case "health":
        title = `Medical Emergency in ${location}`;
        description = `Medical incident in ${location}. Emergency services dispatched.`;
        break;
      case "weather":
        title = `Weather Warning for ${location}`;
        description = `Heavy rainfall expected in ${location}. Take necessary precautions.`;
        break;
    }
    
    // Generate a random date within the last 24 hours
    const date = new Date();
    date.setHours(date.getHours() - Math.floor(Math.random() * 24));
    
    alerts.push({
      id: i + 1,
      title,
      description,
      location: `${location}, Chinhoyi, Zimbabwe`,
      type,
      severity,
      created_at: date.toISOString(),
      category: type,
    });
  }
  
  return alerts;
};

// Format the timestamp to relative time like "just now", "5 mins ago", etc.
export function formatRelativeTime(timestamp: string): string {
  try {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return "just now";
    } else if (diffMins < 60) {
      return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return time.toLocaleDateString();
    }
  } catch (error) {
    console.error("Error formatting time:", error);
    return timestamp;
  }
}

// Add a new alert to the system
export const addAlert = async (alert: Omit<Alert, "id" | "created_at">): Promise<Alert> => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        ...alert,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding alert:", error);
    throw error;
  }
};

// Get recent alerts (defaults to 5)
export const useGetRecentAlerts = (limit = 5) => {
  return useQuery({
    queryKey: ['recent-alerts', limit],
    queryFn: async () => {
      try {
        // In a real app, fetch from the database
        // For now, generate mock alerts specific to Chinhoyi
        const alerts = generateChinhoyiAlerts(limit);
        return alerts;
      } catch (error) {
        console.error("Error fetching recent alerts:", error);
        throw error;
      }
    },
  });
};

// Get all alerts
export const useGetAllAlerts = () => {
  return useQuery({
    queryKey: ['all-alerts'],
    queryFn: async () => {
      try {
        // In a real app, fetch from the database
        // For now, generate more mock alerts for Chinhoyi
        const alerts = generateChinhoyiAlerts(15);
        return alerts;
      } catch (error) {
        console.error("Error fetching all alerts:", error);
        throw error;
      }
    },
  });
};

// Get a single alert by ID
export const useGetAlertById = (id: number | string | undefined) => {
  return useQuery({
    queryKey: ['alert', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        // In a real app, fetch from the database
        // For now, generate a specific mock alert for Chinhoyi
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        const alerts = generateChinhoyiAlerts(20);
        const alert = alerts.find(a => a.id === numericId);
        return alert || null;
      } catch (error) {
        console.error(`Error fetching alert with ID ${id}:`, error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

// Subscribe to new alerts
export const useSubscribeToAlerts = (callback: (alert: Alert) => void) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (!isSubscribed) {
      // Subscribe to alerts
      setIsSubscribed(true);
      
      // Simulate real-time updates by periodically generating new alerts
      interval = setInterval(() => {
        // 20% chance of generating a new alert every 30 seconds
        if (Math.random() < 0.2) {
          const newAlerts = generateChinhoyiAlerts(1);
          if (newAlerts.length > 0) {
            callback(newAlerts[0]);
          }
        }
      }, 30000); // Every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
      setIsSubscribed(false);
    };
  }, [callback, isSubscribed]);
};
