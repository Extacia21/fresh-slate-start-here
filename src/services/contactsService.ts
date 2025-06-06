
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
  type: string;
  is_favorite: boolean;
  created_at: string;
  user_id?: string;
  email?: string;
}

// Default emergency contacts for Chinhoyi, Zimbabwe
const defaultContacts = [
  {
    id: 'chinhoyi-police',
    name: 'Chinhoyi Police',
    phone: '+263 67 2122555',
    type: 'emergency',
    is_favorite: true,
    created_at: new Date().toISOString(),
    user_id: null,
    email: 'police@chinhoyi.gov.zw'
  },
  {
    id: 'chinhoyi-ambulance',
    name: 'Chinhoyi Ambulance',
    phone: '+263 67 2122911',
    type: 'emergency',
    is_favorite: true,
    created_at: new Date().toISOString(),
    user_id: null,
    email: 'ambulance@chinhoyi.gov.zw'
  },
  {
    id: 'chinhoyi-fire',
    name: 'Chinhoyi Fire Department',
    phone: '+263 67 2122999',
    type: 'emergency',
    is_favorite: true,
    created_at: new Date().toISOString(),
    user_id: null,
    email: 'fire@chinhoyi.gov.zw'
  },
  {
    id: 'chinhoyi-hospital',
    name: 'Chinhoyi Provincial Hospital',
    phone: '+263 67 2122275',
    type: 'emergency',
    is_favorite: true,
    created_at: new Date().toISOString(),
    user_id: null,
    email: 'hospital@chinhoyi.gov.zw'
  },
  {
    id: 'chinhoyi-towing',
    name: 'Chinhoyi Towing Service',
    phone: '+263 67 2123456',
    type: 'service',
    is_favorite: false,
    created_at: new Date().toISOString(),
    user_id: null,
    email: 'towing@chinhoyi.gov.zw'
  },
  {
    id: 'chinhoyi-emergency',
    name: 'Chinhoyi Emergency Hotline',
    phone: '+263 67 2122000',
    type: 'emergency',
    is_favorite: true,
    created_at: new Date().toISOString(),
    user_id: null,
    email: 'emergency@chinhoyi.gov.zw'
  },
];

export const useGetContacts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      // First, get user's personal contacts
      let personalContacts: Contact[] = [];
      
      if (user) {
        const { data: userContacts, error: userError } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', user.id)
          .order('is_favorite', { ascending: false })
          .order('created_at', { ascending: false });
        
        if (userError) {
          throw new Error(userError.message);
        }
        
        personalContacts = userContacts as Contact[];
      }
      
      // Instead of trying to fetch default contacts from the database,
      // we'll use our hardcoded Chinhoyi emergency contacts
      const allContacts = [...personalContacts, ...defaultContacts];
      
      return allContacts;
    },
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (contact: Omit<Contact, 'id' | 'created_at' | 'user_id'>) => {
      if (!user) throw new Error("User not authenticated");
      
      // Create the contact with the user_id
      const newContact = {
        ...contact,
        user_id: user.id,
      };
      
      const { data, error } = await supabase
        .from('contacts')
        .insert(newContact)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contacts'],
      });
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (contact: Partial<Contact> & { id: string }) => {
      // Check if this is a default contact (starts with chinhoyi-)
      if (contact.id.startsWith('chinhoyi-')) {
        throw new Error("Cannot update default emergency contacts");
      }
      
      const { data: existingContact, error: checkError } = await supabase
        .from('contacts')
        .select('user_id')
        .eq('id', contact.id)
        .single();
      
      if (checkError) {
        throw new Error(checkError.message);
      }
      
      // If it's a default contact, don't allow updates
      if (existingContact.user_id === null) {
        throw new Error("Cannot update default emergency contacts");
      }
      
      // Otherwise, proceed with update
      const { data, error } = await supabase
        .from('contacts')
        .update(contact)
        .eq('id', contact.id)
        .eq('user_id', user?.id)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contacts'],
      });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Check if this is a default contact (starts with chinhoyi-)
      if (id.startsWith('chinhoyi-')) {
        throw new Error("Cannot delete default emergency contacts");
      }
      
      // Check if this is a default contact (null user_id)
      const { data: existingContact, error: checkError } = await supabase
        .from('contacts')
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (checkError) {
        throw new Error(checkError.message);
      }
      
      // If it's a default contact, don't allow deletion
      if (existingContact.user_id === null) {
        throw new Error("Cannot delete default emergency contacts");
      }
      
      // Otherwise, proceed with delete
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contacts'],
      });
    },
  });
};

// Add new function to create emergency contacts
export const useAddEmergencyContact = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const createContactMutation = useCreateContact();
  
  return useMutation({
    mutationFn: async (contact: { 
      name: string;
      phone: string;
      relationship?: string;
      email?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      // Create a regular contact with emergency type
      const newContact = {
        ...contact,
        type: 'emergency',
        is_favorite: true,
      };
      
      return await createContactMutation.mutateAsync(newContact);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contacts'],
      });
    },
  });
};
