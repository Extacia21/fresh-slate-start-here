import React, { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingCheckProps {
  children: ReactNode;
}

const OnboardingCheck = ({ children }: OnboardingCheckProps) => {
  const { user } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if user has completed onboarding
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("has_completed_onboarding")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        // Set onboarding status
        setHasCompletedOnboarding(profile?.has_completed_onboarding || false);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // Default to false if there's an error
        setHasCompletedOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect to onboarding if not completed
  if (hasCompletedOnboarding === false) {
    return <Navigate to="/onboarding" replace />;
  }

  // Otherwise, render children
  return <>{children}</>;
};

export default OnboardingCheck;
