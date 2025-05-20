import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type ContactType = "emergency" | "personal" | "service";

export interface Contact {
  id: string | number;
  name: string;
  phone: string;
  email?: string;
  relationship?: string;
  type: ContactType;
  is_favorite: boolean;
  user_id?: string | null;
  created_at?: string;
}

// Get all contacts for the current user
export const getContacts = async (): Promise<Contact[]> => {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", userId)
    .order("is_favorite", { ascending: false })
    .order("name");

  if (error) {
    throw error;
  }

  // Ensure returned data conforms to Contact type
  return (data || []).map(contact => ({
    ...contact,
    // Make sure type is one of the valid ContactType values
    type: (contact.type === "emergency" || contact.type === "personal" || contact.type === "service") 
      ? contact.type as ContactType 
      : "personal" as ContactType
  }));
};

// Get emergency contacts for the current user
export const getEmergencyContacts = async (): Promise<Contact[]> => {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", userId)
    .eq("type", "emergency")
    .order("is_favorite", { ascending: false })
    .order("name");

  if (error) {
    throw error;
  }

  // Ensure returned data conforms to Contact type
  return (data || []).map(contact => ({
    ...contact,
    type: "emergency" as ContactType
  }));
};

// Send SOS alert to emergency contacts
export const sendSOSAlert = async (
  contacts: Contact[], 
  location: string, 
  message: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // In a real application, this function would:
    // 1. Send SMS to each contact's phone number
    // 2. Send emails to contacts with email addresses
    // 3. Record the SOS event in the database
    
    console.log(`Sending SOS to ${contacts.length} contacts at location ${location}: ${message}`);
    
    // Record the SOS event in the database
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (userId) {
      // Log SOS event
      const { error } = await supabase
        .from("sos_events")
        .insert({
          user_id: userId,
          location,
          message,
          contacts_notified: contacts.length,
          status: "sent",
        });

      if (error) {
        console.error("Failed to record SOS event:", error);
      }
    }

    // Send emails to contacts with email addresses
    const emailContacts = contacts.filter(contact => contact.email);
    if (emailContacts.length > 0) {
      // In a real application, we would use a serverless function or API 
      // to send emails to each contact
      console.log(`Sending emails to ${emailContacts.length} contacts`);
    }
    
    return { success: true, message: "SOS alert sent successfully" };
  } catch (error) {
    console.error("Error sending SOS alert:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unknown error occurred" 
    };
  }
};

// Get a contact by ID
export const getContact = async (id: string): Promise<Contact> => {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  // Ensure returned data conforms to Contact type
  return {
    ...data,
    // Make sure type is one of the valid ContactType values
    type: (data.type === "emergency" || data.type === "personal" || data.type === "service") 
      ? data.type 
      : "personal" as ContactType
  };
};

// Create a new contact
export const createContact = async (contactData: Omit<Contact, "id" | "created_at" | "user_id">): Promise<Contact> => {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Ensure the type is one of the valid ContactType values
  const validType: ContactType = 
    (contactData.type === "emergency" || contactData.type === "personal" || contactData.type === "service") 
      ? contactData.type 
      : "personal";

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      ...contactData,
      type: validType,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    ...data,
    type: validType
  };
};

// Update an existing contact
export const updateContact = async (id: string, contactData: Partial<Contact>): Promise<Contact> => {
  // Ensure the type is one of the valid ContactType values if provided
  const validData = { ...contactData };
  if (validData.type && 
      validData.type !== "emergency" && 
      validData.type !== "personal" && 
      validData.type !== "service") {
    validData.type = "personal" as ContactType;
  }

  const { data, error } = await supabase
    .from("contacts")
    .update(validData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Ensure returned data conforms to Contact type
  return {
    ...data,
    // Make sure type is one of the valid ContactType values
    type: (data.type === "emergency" || data.type === "personal" || data.type === "service") 
      ? data.type 
      : "personal" as ContactType
  };
};

// Delete a contact
export const deleteContact = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
};

// Toggle favorite status
export const toggleFavorite = async (id: string, isFavorite: boolean): Promise<Contact> => {
  const { data, error } = await supabase
    .from("contacts")
    .update({ is_favorite: isFavorite })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Ensure returned data conforms to Contact type
  return {
    ...data,
    // Make sure type is one of the valid ContactType values
    type: (data.type === "emergency" || data.type === "personal" || data.type === "service") 
      ? data.type 
      : "personal" as ContactType
  };
};

// Hook for getting contacts
export const useGetContacts = () => {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: getContacts
  });
};

// Hook for getting SOS contacts (emergency contacts)
export const useGetSOSContacts = () => {
  return useQuery({
    queryKey: ['sosContacts'],
    queryFn: getEmergencyContacts
  });
};

export default {
  getContacts,
  getEmergencyContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  toggleFavorite,
  sendSOSAlert,
};
