
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Default emergency contacts for Chinhoyi, Zimbabwe
const chinhoyiEmergencyContacts = [
  {
    id: "default-emergency-1",
    name: "Chinhoyi Police",
    phone: "+263 67 22281",
    type: "emergency" as const,
    is_favorite: true,
    user_id: null,
  },
  {
    id: "default-emergency-2",
    name: "Chinhoyi Fire Department",
    phone: "+263 67 22789",
    type: "emergency" as const,
    is_favorite: true,
    user_id: null,
  },
  {
    id: "default-emergency-3",
    name: "Chinhoyi Provincial Hospital",
    phone: "+263 67 22260",
    type: "emergency" as const,
    is_favorite: true,
    user_id: null,
  },
  {
    id: "default-emergency-4",
    name: "Chinhoyi Ambulance Services",
    phone: "+263 67 22123",
    type: "emergency" as const,
    is_favorite: true,
    user_id: null,
  },
  {
    id: "default-emergency-5",
    name: "Zimbabwe Road Emergency Services",
    phone: "+263 71 9222 236",
    type: "emergency" as const,
    is_favorite: true,
    user_id: null,
  }
];

export interface Contact {
  id?: string | number;
  name: string;
  phone: string;
  email?: string;
  type: "personal" | "emergency" | "service";
  is_favorite: boolean;
  user_id?: string | null;
  relationship?: string;
  created_at?: string;
}

// Get all contacts
export const useGetContacts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['contacts', user?.id],
    queryFn: async (): Promise<Contact[]> => {
      if (!user) {
        return chinhoyiEmergencyContacts;
      }
      
      // Get user's contacts from the database
      const { data: userContacts, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;

      // Convert any string type to proper enum type
      const typedUserContacts = userContacts.map(contact => ({
        ...contact,
        type: contact.type as "personal" | "emergency" | "service"
      }));
      
      // Merge user contacts with default emergency contacts
      return [...chinhoyiEmergencyContacts, ...typedUserContacts];
    },
    enabled: true,
  });
};

// Create a new contact
export const useCreateContact = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (contact: Omit<Contact, "id" | "user_id" | "created_at">): Promise<Contact> => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...contact,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return {
        ...data,
        type: data.type as "personal" | "emergency" | "service"
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', user?.id] });
    },
  });
};

// Update a contact
export const useUpdateContact = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (contact: Contact): Promise<Contact> => {
      if (!user) throw new Error("User not authenticated");
      if (!contact.id) throw new Error("Contact ID is required");
      
      // Skip updating if it's a default contact
      if (typeof contact.id === 'string' && contact.id.startsWith('default')) {
        throw new Error("Cannot update default emergency contacts");
      }
      
      const { data, error } = await supabase
        .from('contacts')
        .update({
          ...contact,
          id: typeof contact.id === 'number' ? contact.id : contact.id
        })
        .eq('id', typeof contact.id === 'number' ? contact.id.toString() : contact.id)
        .eq('user_id', user.id) // ensure user can only update their own contacts
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return {
        ...data,
        type: data.type as "personal" | "emergency" | "service"
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', user?.id] });
    },
  });
};

// Delete a contact
export const useDeleteContact = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string | number): Promise<void> => {
      if (!user) throw new Error("User not authenticated");
      
      // Skip deleting if it's a default contact
      if (typeof id === 'string' && id.startsWith('default')) {
        throw new Error("Cannot delete default emergency contacts");
      }
      
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', typeof id === 'number' ? id.toString() : id)
        .eq('user_id', user.id); // ensure user can only delete their own contacts
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', user?.id] });
    },
  });
};

// Get emergency contacts for SOS functionality
export const useGetSOSContacts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['sos-contacts', user?.id],
    queryFn: async (): Promise<Contact[]> => {
      if (!user) return [];
      
      // Get user's emergency contacts
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'emergency');
      
      if (error) throw error;
      
      return data.map(contact => ({
        ...contact,
        type: contact.type as "personal" | "emergency" | "service"
      }));
    },
    enabled: !!user,
  });
};

// Send SOS alert to emergency contacts
export const sendSOSAlert = async (
  contacts: Contact[], 
  location: string, 
  message: string
): Promise<{success: boolean, message: string}> => {
  try {
    // In a real app, this would make API calls to send SMS and emails
    console.log("Sending SOS alerts to:", contacts);
    console.log("User location:", location);
    console.log("SOS message:", message);
    
    // Simulate sending emails to contacts
    for (const contact of contacts) {
      if (contact.email) {
        console.log(`Sending email to ${contact.email}`);
        // This would be an API call to send email
      }
    }
    
    return { 
      success: true, 
      message: "SOS alerts sent successfully"
    };
  } catch (error) {
    console.error("Error sending SOS alerts:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send SOS alerts"
    };
  }
};
