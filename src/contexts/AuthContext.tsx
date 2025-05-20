
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

// Updated AuthContextType to match Supabase's actual return types
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    data: { user: User | null; session: Session | null } | null;
    error: Error | null;
  }>;
  signUp: (email: string, password: string, name?: string) => Promise<{
    data: { user: User | null; session: Session | null } | null;
    error: Error | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for pending profile data and save it when user authenticates
  const checkAndSavePendingProfile = async (userId: string) => {
    const pendingProfileData = localStorage.getItem("pendingProfileData");
    if (pendingProfileData && userId) {
      try {
        const profileData = JSON.parse(pendingProfileData);
        
        // Save to profiles table
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            ...profileData
          });
          
        if (!error) {
          // Clean up stored data
          localStorage.removeItem("pendingProfileData");
          
          toast.success("Profile data saved successfully");
        }
      } catch (e) {
        console.error("Failed to save pending profile data:", e);
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
        
        // Handle authentication events
        if (event === "SIGNED_OUT") {
          navigate("/signin");
          localStorage.removeItem("isAuthenticated");
          toast.success("Signed out successfully", {
            description: "Come back soon!",
            duration: 3000,
          });
        } else if (event === "SIGNED_IN") {
          localStorage.setItem("isAuthenticated", "true");
          
          // Save any pending profile data
          if (newSession?.user) {
            checkAndSavePendingProfile(newSession.user.id);
          }
          
          // Note: toast for sign in is handled in MainLayoutAuthWrapper
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
      
      // If user is authenticated, set localStorage flag
      if (currentSession?.user) {
        localStorage.setItem("isAuthenticated", "true");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location]);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, name?: string) => {
    // Updated to include auto-confirmation workaround
    const signUpData = {
      email,
      password,
      options: {
        data: { full_name: name },
      }
    };
    
    return await supabase.auth.signUp(signUpData);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
