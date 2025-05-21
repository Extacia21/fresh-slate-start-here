
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

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
}

// Get recent alerts
export const useGetRecentAlerts = (limit: number = 10) => {
  return useQuery({
    queryKey: ['recent-alerts', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw new Error(error.message);
      return data as Alert[];
    },
  });
};

// Get alert by ID
export const useGetAlertById = (alertId: string | undefined) => {
  return useQuery({
    queryKey: ['alert', alertId],
    queryFn: async () => {
      if (!alertId) throw new Error('Alert ID is required');
      
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('id', alertId)
        .single();
        
      if (error) throw new Error(error.message);
      return data as Alert;
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
