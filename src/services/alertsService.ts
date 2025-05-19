
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface Alert {
  id: string;
  type: string;
  title: string;
  description: string;
  location?: string;
  severity: string;
  icon?: string;
  created_at: string;
  source?: string; // To distinguish between system alerts and user reports
}

// Interface to match what's in the database
interface AlertFromDB {
  id: string;
  alert_type: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  severity: string;
  created_at: string;
  end_time?: string;
  created_by?: string;
  updated_at?: string;
}

// Interface for reports that will be treated as alerts
interface ReportFromDB {
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

export const useGetAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      // Get system alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (alertsError) {
        throw new Error(alertsError.message);
      }
      
      // Get user reports that should be shown as alerts
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (reportsError) {
        throw new Error(reportsError.message);
      }
      
      // Map the alerts from database to our Alert interface
      const systemAlerts = (alertsData || []).map(alert => ({
        id: alert.id,
        type: alert.alert_type || 'other',
        title: alert.title,
        description: alert.description,
        location: `${alert.latitude}, ${alert.longitude}`,
        severity: alert.severity,
        icon: getIconForAlertType(alert.alert_type),
        created_at: alert.created_at,
        source: 'system'
      }));
      
      // Map the reports to look like alerts
      const reportAlerts = (reportsData || []).map(report => ({
        id: report.id,
        type: report.category || 'other',
        title: report.title,
        description: report.description,
        location: report.location,
        // Map report categories to appropriate severity
        severity: reportCategoryToSeverity(report.category),
        icon: getIconForAlertType(report.category),
        created_at: report.created_at,
        source: 'user-reported'
      }));
      
      // Combine and sort by creation date
      const combinedAlerts = [...systemAlerts, ...reportAlerts].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      return combinedAlerts as Alert[];
    },
  });
};

export const useGetRecentAlerts = (limit = 5) => {
  return useQuery({
    queryKey: ['recent-alerts', limit],
    queryFn: async () => {
      // Get system alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(Math.ceil(limit / 2)); // Split limit between alerts and reports
      
      if (alertsError) {
        throw new Error(alertsError.message);
      }
      
      // Get user reports that should be shown as alerts
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(Math.ceil(limit / 2));
      
      if (reportsError) {
        throw new Error(reportsError.message);
      }
      
      // Map the alerts from database to our Alert interface
      const systemAlerts = (alertsData || []).map(alert => ({
        id: alert.id,
        type: alert.alert_type || 'other',
        title: alert.title,
        description: alert.description,
        location: `${alert.latitude}, ${alert.longitude}`,
        severity: alert.severity,
        icon: getIconForAlertType(alert.alert_type),
        created_at: alert.created_at,
        source: 'system'
      }));
      
      // Map the reports to look like alerts
      const reportAlerts = (reportsData || []).map(report => ({
        id: report.id,
        type: report.category || 'other',
        title: report.title,
        description: report.description,
        location: report.location,
        // Map report categories to appropriate severity
        severity: reportCategoryToSeverity(report.category),
        icon: getIconForAlertType(report.category),
        created_at: report.created_at,
        source: 'user-reported'
      }));
      
      // Combine and sort by creation date, limiting to the requested number
      const combinedAlerts = [...systemAlerts, ...reportAlerts]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
      
      return combinedAlerts as Alert[];
    },
  });
};

export const useSubscribeToAlerts = (callback: (alert: Alert) => void) => {
  // Subscribe to system alerts
  const alertsChannel = supabase
    .channel('public:alerts')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'alerts'
      },
      (payload) => {
        // Convert payload to match Alert interface
        const newAlert = {
          id: payload.new.id,
          type: payload.new.alert_type || 'other',
          title: payload.new.title,
          description: payload.new.description,
          location: `${payload.new.latitude}, ${payload.new.longitude}`,
          severity: payload.new.severity,
          icon: getIconForAlertType(payload.new.alert_type),
          created_at: payload.new.created_at,
          source: 'system'
        } as Alert;
        
        callback(newAlert);
      }
    )
    .subscribe();
    
  // Subscribe to user reports that should be shown as alerts
  const reportsChannel = supabase
    .channel('public:reports')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'reports',
        filter: 'is_public=eq.true'
      },
      (payload) => {
        // Convert report to alert format
        const newReport = {
          id: payload.new.id,
          type: payload.new.category || 'other',
          title: payload.new.title,
          description: payload.new.description,
          location: payload.new.location,
          severity: reportCategoryToSeverity(payload.new.category),
          icon: getIconForAlertType(payload.new.category),
          created_at: payload.new.created_at,
          source: 'user-reported'
        } as Alert;
        
        callback(newReport);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(alertsChannel);
    supabase.removeChannel(reportsChannel);
  };
};

// Helper function to get icon based on alert type
function getIconForAlertType(alertType: string): string {
  switch (alertType?.toLowerCase()) {
    case 'weather':
      return 'cloud-rain';
    case 'police':
      return 'shield';
    case 'fire':
      return 'flame';
    case 'health':
      return 'heart-pulse';
    case 'traffic':
      return 'car';
    default:
      return 'alert-triangle';
  }
}

// Helper function to map report category to alert severity
function reportCategoryToSeverity(category: string): string {
  switch (category?.toLowerCase()) {
    case 'fire':
      return 'high';
    case 'police':
      return 'high';
    case 'health':
      return 'medium';
    case 'weather':
      return 'medium';
    case 'traffic':
      return 'low';
    default:
      return 'medium';
  }
}
