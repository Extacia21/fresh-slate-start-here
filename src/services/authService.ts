
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
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: name,
          }
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
          "Account created successfully. Please check your email for confirmation."
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
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
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
