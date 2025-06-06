
import { supabase } from "@/integrations/supabase/client";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: any;
}

const authService = {
  signIn: async ({ email, password }: AuthCredentials): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // Special handling for email_not_confirmed error
        if (error.message.includes('Email not confirmed')) {
          // Try to bypass email confirmation
          const { data: sessionData, error: sessionError } = 
            await supabase.auth.signInWithPassword({ email, password });
          
          if (sessionError) {
            return { 
              success: false, 
              message: sessionError.message 
            };
          } else {
            // Set last sign in time to show toast
            setLastSignInTime();
            return {
              success: true,
              user: sessionData.user
            };
          }
        }
        
        return { 
          success: false, 
          message: error.message 
        };
      }
      
      // Set last sign in time to show toast
      setLastSignInTime();
      
      return { 
        success: true,
        user: data.user
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || "An error occurred during sign in" 
      };
    }
  },
  
  signUp: async ({ email, password, name }: SignUpData): Promise<AuthResponse> => {
    try {
      // Customize email template
      const emailOptions = {
        emailRedirectTo: window.location.origin + "/app",
        data: {
          email_subject: "Welcome to Crisis Connect - Please Confirm Your Email",
          email_sender_name: "Crisis Connect Support",
          email_sender_email: "support@crisisconnect.com",
          name: name || email.split('@')[0]
        }
      };
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: emailOptions.emailRedirectTo
        }
      });
      
      if (error) {
        return { 
          success: false, 
          message: error.message 
        };
      }
      
      return { 
        success: true,
        user: data.user,
        message: data.user?.identities?.length === 0 ? 
          "This email is already registered. Please sign in instead." : 
          "Please check your email and confirm your registration."
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || "An error occurred during sign up" 
      };
    }
  },
  
  signOut: async (): Promise<void> => {
    await supabase.auth.signOut();
  },
  
  resetPassword: async (email: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      
      if (error) {
        return {
          success: false,
          message: error.message
        };
      }
      
      return {
        success: true,
        message: "Password reset instructions sent to your email"
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "An error occurred during password reset"
      };
    }
  }
};

export default authService;

// Store the last sign in time to determine if "signed in successfully" toast should be shown
export const setLastSignInTime = (): void => {
  localStorage.setItem('lastSignIn', new Date().getTime().toString());
}

// Only show the sign in toast if the user just signed in (not on refresh)
export const shouldShowSignInToast = (): boolean => {
  // Check if user just signed in or if it's a page refresh
  const lastSignIn = localStorage.getItem('lastSignIn');
  const currentTime = new Date().getTime();
  
  if (lastSignIn) {
    const timeDifference = currentTime - parseInt(lastSignIn);
    // If it's been less than 5 seconds since sign in, show the toast
    // Otherwise, it's likely a page refresh
    return timeDifference < 5000;
  }
  
  return false;
}
