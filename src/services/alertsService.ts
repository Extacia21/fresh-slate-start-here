import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { Database } from "@/integrations/supabase/types";

export interface Alert {
  id: string;
  title: string;
  description?: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  is_active: boolean;
  report_id?: string;
  user_id?: string;
  expires_at?: string;
  photos?: string[];
  // Keep these properties
  source?: string;
  status?: string;
  updates?: { time: string; content: string }[];
  alert_type?: Database["public"]["Enums"]["alert_type"];
}

// Define alert type colors for UI consistency
export const alertTypeColors = {
  weather: {
    bg: 'bg-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-600'
  },
  fire: {
    bg: 'bg-red-100',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: 'text-red-600'
  },
  health: {
    bg: 'bg-green-100',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: 'text-green-600'
  },
  police: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: 'text-yellow-600'
  },
  other: {
    bg: 'bg-gray-100',
    border: 'border-gray-200',
    text: 'text-gray-800',
    icon: 'text-gray-600'
  }
};

// Format a timestamp as relative time
export const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Helper function to convert DB data to Alert object
const mapDbAlertToAlert = (item: any): Alert => {
  if (!item) throw new Error("Invalid alert data");
  
  // Create an alert object with safe property access
  const alert: Alert = {
    id: item.id || '',
    title: item.title || '',
    description: item.description || '',
    type: item.alert_type || 'other',
    alert_type: item.alert_type,
    severity: (item.severity as 'critical' | 'high' | 'medium' | 'low') || 'medium',
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
    latitude: typeof item.latitude === 'number' ? item.latitude : undefined,
    longitude: typeof item.longitude === 'number' ? item.longitude : undefined,
    radius: typeof item.radius === 'number' ? item.radius : undefined,
    location: (typeof item.latitude === 'number' && typeof item.longitude === 'number') ? 
      `${item.latitude.toFixed(6)}, ${item.longitude.toFixed(6)}` : undefined,
    // Determine is_active from end_time or explicitly set to true if not available
    is_active: item.end_time ? new Date(item.end_time) > new Date() : true,
    source: item.source || "Official",
    status: "Active"
  };
  
  return alert;
};

// Get all alerts or a filtered subset
export const useGetAlerts = (limit: number = 10) => {
  return useQuery({
    queryKey: ['alerts', limit],
    queryFn: async (): Promise<Alert[]> => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw new Error(error.message);
      
      // Create an empty array with explicit type
      const alerts: Alert[] = [];
      
      // Only process data if it exists
      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          try {
            const alert = mapDbAlertToAlert(data[i]);
            alerts.push(alert);
          } catch (e) {
            console.error("Error processing alert data:", e);
            // Skip invalid alert data
          }
        }
      }
      
      return alerts;
    },
  });
};

// Get recent alerts
export const useGetRecentAlerts = (limit: number = 10) => {
  return useQuery({
    queryKey: ['recent-alerts', limit],
    queryFn: async (): Promise<Alert[]> => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw new Error(error.message);
      
      // Create an empty array with explicit type
      const alerts: Alert[] = [];
      
      // Only process data if it exists
      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          try {
            const alert = mapDbAlertToAlert(data[i]);
            // Only include active alerts
            if (alert.is_active) {
              alerts.push(alert);
            }
          } catch (e) {
            console.error("Error processing alert data:", e);
            // Skip invalid alert data
          }
        }
      }
      
      return alerts;
    },
  });
};

// Get alert by ID - fixing the type instantiation issue
export const useGetAlertById = (alertId: string | undefined) => {
  return useQuery({
    queryKey: ['alert', alertId],
    queryFn: async (): Promise<Alert> => {
      if (!alertId) throw new Error('Alert ID is required');
      
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('id', alertId)
        .single();
        
      if (error) throw new Error(error.message);
      if (!data) throw new Error('Alert not found');
      
      // Use the helper function to map database data to Alert type
      const alert = mapDbAlertToAlert(data);
      
      // Add empty updates array if not provided
      if (!alert.updates) {
        alert.updates = [];
      }
      
      return alert;
    },
    enabled: !!alertId,
  });
};

// A non-hook function to subscribe to alerts that can be called from a hook
export const subscribeToAlerts = (onNewAlert: (alert: Alert) => void) => {
  const handleAlertEvent = (event: any) => {
    if (event.detail && event.detail.type === 'new-alert') {
      onNewAlert(event.detail.alert as Alert);
    }
  };
  
  window.addEventListener('alert-created', handleAlertEvent);
  
  // Return unsubscribe function
  return () => {
    window.removeEventListener('alert-created', handleAlertEvent);
  };
};

// A proper hook that uses the subscribe function
export const useSubscribeToAlerts = (callback: (alert: Alert) => void) => {
  useEffect(() => {
    const unsubscribe = subscribeToAlerts(callback);
    return unsubscribe;
  }, [callback]);
};

// Mock data for testing
export const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'Flash Flood Warning',
    description: 'Heavy rainfall is causing flash flooding in downtown areas. Avoid low-lying areas and stay indoors.',
    type: 'weather',
    severity: 'high',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    location: 'Downtown Chinhoyi',
    latitude: -17.361,
    longitude: 30.191,
    radius: 5000,
    is_active: true
  },
  {
    id: '2',
    title: 'Power Outage',
    description: 'Power outage affecting the eastern suburbs. Crews are working to restore service.',
    type: 'other',
    severity: 'medium',
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    location: 'Eastern Chinhoyi',
    is_active: true
  },
  {
    id: '3',
    title: 'Medical Emergency Response',
    description: 'Emergency medical teams deployed to highway accident. Expect delays on main highway.',
    type: 'health',
    severity: 'high',
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    location: 'Main Highway',
    is_active: true
  }
];

// This function can be used to simulate new alerts for testing
export const simulateNewAlert = () => {
  const alertTypes = ['weather', 'fire', 'health', 'other'];
  const severityLevels: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
  
  const newAlert: Alert = {
    id: `mock-${Date.now()}`,
    title: `Test Alert ${new Date().toLocaleTimeString()}`,
    description: 'This is a test alert created for demonstration purposes.',
    type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
    severity: severityLevels[Math.floor(Math.random() * severityLevels.length)],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    location: 'Test Location',
    is_active: true
  };
  
  // Dispatch a custom event to notify subscribers
  const alertEvent = new CustomEvent('alert-created', {
    detail: {
      type: 'new-alert',
      alert: newAlert,
    },
  });
  window.dispatchEvent(alertEvent);
  
  return newAlert;
};
