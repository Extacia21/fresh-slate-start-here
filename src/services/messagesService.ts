
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Message, getMessages, sendMessage } from "@/integrations/supabase/messages";
import { useEffect } from 'react';

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
    refetchInterval: 30000, // Poll every 30 seconds for new messages
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

// Separate subscription function from hook
export const subscribeToMessages = (
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
  window.addEventListener('message-event', handleMessageEvent as any);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('message-event', handleMessageEvent as any);
  };
};

// Proper hook that uses the subscribe function
export const useSubscribeToMessages = (
  chatRoomId: string | undefined,
  callback: (message: Message) => void
) => {
  useEffect(() => {
    const unsubscribe = subscribeToMessages(chatRoomId, callback);
    return unsubscribe;
  }, [chatRoomId, callback]);
};

// Format message timestamp
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Get user conversations (for direct messages)
export const useGetConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("User not authenticated");
      
      // Import the function dynamically to avoid circular dependencies
      const { getConversations } = await import('@/integrations/supabase/messages');
      
      const { data, error } = await getConversations(session.user.id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data || [];
    },
    refetchInterval: 30000, // Poll every 30 seconds for new conversations
  });
};
