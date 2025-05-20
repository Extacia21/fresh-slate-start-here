
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingCheckProps {
  children: React.ReactNode;
}

// Define a profile interface that includes the properties we need
interface Profile {
  id: string;
  first_name?: string | null;
}

const OnboardingCheck = ({ children }: OnboardingCheckProps) => {
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          navigate("/signin");
          return;
        }

        // Check if user has completed onboarding by checking if first_name exists
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userData.user.id)
          .single();

        // If profile doesn't exist or doesn't have a first_name, redirect to onboarding
        if (error || !data || !data.first_name) {
          setNeedsOnboarding(true);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setLoading(false);
      }
    }

    checkOnboardingStatus();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default OnboardingCheck;
