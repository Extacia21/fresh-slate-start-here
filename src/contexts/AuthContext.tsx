
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
        
        // You can add additional actions here based on events
        if (event === "SIGNED_OUT") {
          navigate("/signin");
          toast({
            title: "Signed out successfully",
            description: "Come back soon!",
            duration: 3000, // Auto-dismiss after 3 seconds
          });
        } else if (event === "SIGNED_IN") {
          toast({
            title: "Signed in successfully",
            description: "Welcome to the application",
            duration: 3000, // Auto-dismiss after 3 seconds
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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
