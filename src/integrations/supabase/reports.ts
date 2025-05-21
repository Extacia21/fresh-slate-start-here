
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

// Declare explicit types for supabase operations
type ReportResponse = Awaited<ReturnType<typeof supabase.from>['select']>;

// Use type assertion to allow accessing the reports table
export const getReports = async () => {
  const { data, error } = await supabase
    .from('reports' as any)
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data: data as unknown as Report[] | null, error };
};

export const getPublicReports = async () => {
  const { data, error } = await supabase
    .from('reports' as any)
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });
  
  return { data: data as unknown as Report[] | null, error };
};

export const getReportById = async (id: string) => {
  const { data, error } = await supabase
    .from('reports' as any)
    .select('*')
    .eq('id', id)
    .single();
  
  return { data: data as unknown as Report | null, error };
};

export const createReport = async (report: Omit<Report, 'id' | 'created_at' | 'updated_at'>) => {
  // Create the report
  const { data, error } = await supabase
    .from('reports' as any)
    .insert({
      ...report,
      // Map report type to alert_type for alerts table
      alert_type: report.type as Database['public']['Enums']['alert_type'],
      // Add defaults for required alert fields
      radius: 0,
    } as any)
    .select()
    .single();
  
  // Also create an alert from this report
  if (data && !error) {
    try {
      const alertData = {
        alert_type: report.type as Database['public']['Enums']['alert_type'],
        title: report.title,
        description: report.description,
        location: report.location,
        latitude: report.latitude,
        longitude: report.longitude,
        severity: report.severity as Database['public']['Enums']['alert_severity'],
        report_id: (data as unknown as Report).id, // Fix: Add type assertion here
        photos: report.photos,
        radius: 0, // Default radius
        is_active: true
      };
      
      // Create the alert (don't wait for this to complete)
      await supabase
        .from('alerts')
        .insert(alertData);
    } catch (alertError) {
      console.error("Error creating alert from report:", alertError);
    }
  }
  
  return { data: data as unknown as Report | null, error };
};
