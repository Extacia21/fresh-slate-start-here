
import { supabase } from "@/integrations/supabase/client";

export type ContactType = "emergency" | "personal" | "service";

export interface Contact {
  id: string | number;
  name: string;
  phone: string;
  email?: string;
  relationship?: string;
  type: ContactType;
  is_favorite: boolean;
  user_id?: string;
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
      ? contact.type 
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

export default {
  getContacts,
  getEmergencyContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  toggleFavorite,
};
