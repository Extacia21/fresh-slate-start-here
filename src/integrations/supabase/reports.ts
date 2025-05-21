
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
      title: report.title,
      description: report.description,
      type: report.type,
      location: report.location,
      latitude: report.latitude,
      longitude: report.longitude,
      is_active: true,
      severity: report.severity,
      report_id: data.id,
      photos: report.photos,
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
