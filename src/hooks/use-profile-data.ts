
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileData {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  created_at?: string;
  address?: string | null;
  allergies?: string | null;
  // Additional user metadata from auth
  email?: string | null;
  display_name?: string | null;
}

export function useProfileData() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<ProfileData | null> => {
      if (!user) return null;
      
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error(profileError.message);
      }
      
      // Get user metadata
      const { data: { user: userData } } = await supabase.auth.getUser();
      
      // Merge profile data with user metadata
      return {
        ...(profileData || { id: user.id }),
        email: user.email,
        display_name: userData?.user_metadata?.full_name || userData?.user_metadata?.name || null
      } as ProfileData;
    },
    enabled: !!user,
  });

  return {
    profileData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
