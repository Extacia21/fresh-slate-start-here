
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Message, getMessages, sendMessage } from "@/integrations/supabase/messages";

export type { Message };

export const useGetMessages = (chatRoomId?: string, recipientId?: string) => {
  return useQuery({
    queryKey: ['messages', chatRoomId, recipientId],
    queryFn: async () => {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("User not authenticated");
      
      const { data, error } = await getMessages(chatRoomId, recipientId, session.user.id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Message[];
    },
    enabled: !!chatRoomId || !!recipientId, // Only run query when either parameter is provided
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (message: Omit<Message, 'id' | 'created_at'>) => {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("User not authenticated");
      
      // Make sure the sender_id matches the current user
      const validatedMessage = {
        ...message,
        sender_id: session.user.id
      };
      
      const { data, error } = await sendMessage(validatedMessage);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return (data?.[0] || {}) as Message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['messages', variables.chat_room_id, variables.recipient_id],
      });
    },
  });
};

export const useSubscribeToMessages = (
  chatRoomId: string | undefined,
  callback: (message: Message) => void
) => {
  const handleMessageEvent = (event: CustomEvent) => {
    if (event.detail && event.detail.type === 'new-message' && 
        (!chatRoomId || event.detail.chat_room_id === chatRoomId)) {
      callback(event.detail as Message);
    }
  };
  
  // Set up subscription
  useEffect(() => {
    // Cast to any since we're using a custom event type
    window.addEventListener('message-event', handleMessageEvent as any);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('message-event', handleMessageEvent as any);
    };
  }, [chatRoomId, callback]);
};

// Missing import
import { useEffect } from 'react';
