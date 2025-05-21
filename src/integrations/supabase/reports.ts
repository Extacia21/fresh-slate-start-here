
import { supabase } from "./client";
import type { Database } from "./types";

// Define a new Report interface that aligns with our database schema
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
  updates?: Array<{ time: string; content: string }>;
}

// Create a type for the Supabase Tables that includes our custom reports table
type TablesWithReports = Database['public']['Tables'] & {
  reports: {
    Row: Omit<Report, 'updates'> & { id: string; created_at: string; updated_at: string };
    Insert: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'updates'>;
    Update: Partial<Omit<Report, 'id' | 'created_at' | 'updated_at' | 'updates'>>;
  }
};

export const getReports = async () => {
  const { data, error } = await supabase
    .from('reports' as keyof TablesWithReports)
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const getPublicReports = async () => {
  const { data, error } = await supabase
    .from('reports' as keyof TablesWithReports)
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const getReportById = async (id: string) => {
  const { data, error } = await supabase
    .from('reports' as keyof TablesWithReports)
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

export const createReport = async (report: Omit<Report, 'id' | 'created_at' | 'updated_at'>) => {
  // Create the report
  const { data, error } = await supabase
    .from('reports' as keyof TablesWithReports)
    .insert(report as any)
    .select()
    .single();
  
  // Also create an alert from this report
  if (data && !error) {
    const alertData = {
      alert_type: report.type as Database['public']['Enums']['alert_type'],
      title: report.title,
      description: report.description,
      location: report.location,
      latitude: report.latitude,
      longitude: report.longitude,
      severity: report.severity as Database['public']['Enums']['alert_severity'],
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
