
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Message, getMessages, sendMessage } from "@/integrations/supabase/messages";
import { useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";

export type { Message };

// Get all messages for a specific chat room
export const useGetMessages = (chatRoomId?: string, recipientId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['messages', chatRoomId, recipientId],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await getMessages(chatRoomId, recipientId, user.id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Message[];
    },
    enabled: !!chatRoomId || !!recipientId, // Only run query when either parameter is provided
  });
};

// Send a message
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (messageData: { 
      message_text: string; 
      chat_room_id?: string; 
      recipient_id?: string; 
      is_group_message: boolean;
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      // Add sender information
      const message: Omit<Message, 'id' | 'created_at'> = {
        ...messageData,
        sender_id: user.id,
        sender_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        chat_type: messageData.is_group_message ? "community" : "direct"
      };
      
      const { data, error } = await sendMessage(message);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return (data?.[0] || {}) as Message;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to refresh the messages
      queryClient.invalidateQueries({
        queryKey: ['messages', variables.chat_room_id, variables.recipient_id],
      });
    },
  });
};

// Hook for subscribing to new messages
export const useSubscribeToMessages = (
  chatRoomId: string | undefined,
  onNewMessage: (message: Message) => void
) => {
  useEffect(() => {
    const handleMessageEvent = (event: any) => {
      if (
        event.detail && 
        event.detail.type === 'new-message' && 
        (!chatRoomId || event.detail.chat_room_id === chatRoomId)
      ) {
        onNewMessage(event.detail as Message);
      }
    };
    
    window.addEventListener('message-event', handleMessageEvent);
    
    return () => {
      window.removeEventListener('message-event', handleMessageEvent);
    };
  }, [chatRoomId, onNewMessage]);
};

// Format message timestamp
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
