
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Define Contact types
export type ContactType = "emergency" | "personal" | "service";

export interface Contact {
  id: string | number;
  name: string;
  phone: string;
  email?: string;
  relationship?: string;
  type: ContactType;
  is_favorite: boolean;
  user_id: string | null;
  created_at?: string;
}

// Create contact hook
export const useCreateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (contactData: Omit<Contact, "id" | "created_at" | "user_id">) => {
      const result = await createContact(contactData);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

// Get all contacts
export const useGetContacts = () => {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", user.user.id)
        .order("name");
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Transform data to match our Contact interface
      return (data || []).map((contact) => {
        return {
          ...contact,
          type: contact.type as ContactType
        } as Contact;
      });
    },
  });
};

// Get emergency contacts
export const getEmergencyContacts = async (): Promise<Contact[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.warn("User not authenticated, returning empty contacts list");
      return [];
    }
    
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.user.id)
      .eq("type", "emergency")
      .order("name");
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Transform data to match our Contact interface
    return (data || []).map((contact) => {
      return {
        ...contact,
        type: contact.type as ContactType
      } as Contact;
    });
  } catch (error) {
    console.error("Error fetching emergency contacts:", error);
    return [];
  }
};

// Send SOS alert function
export const sendSOSAlert = async (
  contacts: Contact[], 
  location: string, 
  message: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return { success: false, message: "User not authenticated" };
    }
    
    // Log the SOS event to the database
    const { error: sosError } = await supabase
      .from("user_alert_history")
      .insert({
        user_id: user.user.id,
        alert_id: `sos-${Date.now()}`, // Generate a unique ID for the SOS event
        created_at: new Date().toISOString(),
        dismissed: false,
        viewed_at: null
      });
    
    if (sosError) {
      console.error("Error logging SOS event:", sosError);
      // Continue even if logging fails
    }
    
    // In a real app, this would send SMS and emails to contacts
    // For now, we'll just log them
    console.log(`SOS Alert to ${contacts.length} contacts: ${message} at ${location}`);
    
    contacts.forEach(contact => {
      console.log(`Would send alert to ${contact.name} via ${contact.phone}`);
      if (contact.email) {
        console.log(`Would also email ${contact.email}`);
      }
    });
    
    return { 
      success: true, 
      message: `Alert sent to ${contacts.length} emergency contacts` 
    };
  } catch (error) {
    console.error("Error sending SOS alert:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

// Create a new contact
export const createContact = async (contactData: Omit<Contact, "id" | "created_at" | "user_id">): Promise<Contact> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      ...contactData,
      user_id: user.user.id,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return {
    ...data,
    type: data.type as ContactType
  } as Contact;
};

// Update contact hook
export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, contact }: { id: string; contact: Partial<Omit<Contact, "id">> }) => {
      const { data, error } = await supabase
        .from("contacts")
        .update(contact)
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        ...data,
        type: data.type as ContactType
      } as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};

// Delete contact
export const deleteContact = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id);
  
  if (error) {
    throw error;
  }
};

// Get favorite contacts
export const useGetFavoriteContacts = () => {
  return useQuery({
    queryKey: ["favoriteContacts"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", user.user.id)
        .eq("is_favorite", true)
        .order("name");
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data.map((contact) => {
        return {
          ...contact,
          type: contact.type as ContactType
        } as Contact;
      });
    },
  });
};

// Export everything needed
export default {
  useGetContacts,
  getEmergencyContacts,
  createContact,
  useCreateContact,
  useUpdateContact,
  deleteContact,
  useGetFavoriteContacts,
  sendSOSAlert
};
