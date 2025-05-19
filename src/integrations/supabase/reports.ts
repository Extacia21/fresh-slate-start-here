
// This file provides type definitions for the reports table that doesn't exist in the auto-generated types

export interface Report {
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
  severity: "critical" | "high" | "medium" | "low";
  is_public: boolean;
  type?: string;
}

// Mock functions to handle reports since the reports table is missing from the Supabase types
export const getReports = async () => {
  try {
    // In a real implementation, this would fetch from the actual reports table
    const mockReports: Report[] = [
      {
        id: '1',
        user_id: 'user-1',
        title: 'Flash Flood Warning',
        description: 'Flash flood warning issued for downtown area. Avoid low-lying roads.',
        category: 'weather',
        location: 'Downtown',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
        severity: 'high',
        is_public: true,
        type: 'weather'
      },
      {
        id: '2',
        user_id: 'user-2',
        title: 'Road Closure',
        description: 'Main Street closed due to accident. Expect delays.',
        category: 'traffic',
        location: 'Main Street',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        status: 'active',
        severity: 'medium',
        is_public: true,
        type: 'other'
      },
      {
        id: '3',
        user_id: 'user-3',
        title: 'Power Outage',
        description: 'Power outage reported in the north sector. Crews are working to restore service.',
        category: 'infrastructure',
        location: 'North Sector',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date(Date.now() - 7200000).toISOString(),
        status: 'active',
        severity: 'medium',
        is_public: true,
        type: 'other'
      }
    ];
    
    return { data: mockReports, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getPublicReports = async () => {
  const { data, error } = await getReports();
  if (data) {
    const publicReports = data.filter(report => report.is_public);
    return { data: publicReports, error: null };
  }
  return { data, error };
};

export const createReport = async (report: Omit<Report, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    // In a real implementation, this would insert into the actual reports table
    const newReport: Report = {
      ...report,
      id: `report-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return { data: newReport, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getReportById = async (id: string) => {
  try {
    const { data, error } = await getReports();
    if (error) throw error;
    
    const report = data?.find(r => r.id === id) || null;
    return { data: report, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
