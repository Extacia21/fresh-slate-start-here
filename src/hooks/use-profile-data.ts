
import React, { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGetProfile } from '@/services/profileService';

// Define ProfileData interface
export interface ProfileData {
  id?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  blood_type?: string;
  medical_conditions?: string[];
  medications?: string[];
  emergency_notes?: string;
  allergies?: string[];
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Create context
interface ProfileDataContextType {
  profileData: ProfileData | null;
  isLoading: boolean;
  error: Error | null;
  refetchProfile: () => void;
}

const ProfileDataContext = createContext<ProfileDataContextType>({
  profileData: null,
  isLoading: false,
  error: null,
  refetchProfile: () => {},
});

// Provider component
export const ProfileDataProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useGetProfile();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (data) {
      setProfileData(data);
    }
  }, [data]);

  const refetchProfile = () => {
    refetch();
  };

  // Create the provider value
  const providerValue: ProfileDataContextType = {
    profileData,
    isLoading,
    error,
    refetchProfile,
  };

  // Return the JSX for the provider - avoiding direct JSX in .ts file
  return React.createElement(
    ProfileDataContext.Provider,
    { value: providerValue },
    children
  );
};

// Hook to use the profile data
export const useProfileData = () => useContext(ProfileDataContext);
