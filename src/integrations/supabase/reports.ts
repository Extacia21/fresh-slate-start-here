
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
  is_public: boolean;
}

// Mock functions to handle reports since the reports table is missing from the Supabase types
export const getReports = async () => {
  try {
    const res = await fetch('/api/reports');
    if (!res.ok) throw new Error('Failed to fetch reports');
    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getPublicReports = async () => {
  try {
    const res = await fetch('/api/reports/public');
    if (!res.ok) throw new Error('Failed to fetch public reports');
    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
