
import { supabase } from "./client";

export interface Report {
  id?: string;
  title: string;
  description: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  type: string;
  category: string;
  is_public: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status?: 'active' | 'resolved' | 'archived';
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  photos?: string[];
}

export const getReports = async () => {
  // Use explicit typing with StorageError to avoid TypeScript errors
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const getPublicReports = async () => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Add the missing getReportById function
export const getReportById = async (id: string) => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

export const createReport = async (report: Omit<Report, 'id' | 'created_at' | 'updated_at'>) => {
  // Create the report
  const { data, error } = await supabase
    .from('reports')
    .insert(report)
    .select()
    .single();
  
  // Also create an alert from this report
  if (data && !error) {
    const alertData = {
      alert_type: report.type as "police" | "fire" | "health" | "weather" | "other",
      title: report.title,
      description: report.description,
      location: report.location,
      latitude: report.latitude,
      longitude: report.longitude,
      severity: report.severity,
      report_id: data.id,
      photos: report.photos,
      radius: 0, // Default radius
      is_active: true
    };
    
    // Create the alert (don't wait for this to complete)
    supabase
      .from('alerts')
      .insert(alertData)
      .then(response => {
        if (response.error) {
          console.error("Error creating alert from report:", response.error);
        }
      });
  }
  
  return { data, error };
};
