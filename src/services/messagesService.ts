
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Message {
  id: string;
  sender_id: string;
  recipient_id?: string | null;
  is_group_message: boolean;
  chat_room_id?: string;
  message_text: string;
  created_at: string;
}

export const useGetMessages = (chatRoomId?: string, recipientId?: string) => {
  return useQuery({
    queryKey: ['messages', chatRoomId, recipientId],
    queryFn: async () => {
      let query = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (chatRoomId) {
        query = query.eq('chat_room_id', chatRoomId);
      } else if (recipientId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("User not authenticated");
        
        // Find messages between the current user and the recipient
        query = query.or(`sender_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)
          .or(`sender_id.eq.${recipientId},recipient_id.eq.${recipientId}`);
      }
      
      const { data, error } = await query;
      
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
      
      const { data, error } = await supabase
        .from('messages')
        .insert(validatedMessage)
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return (data[0] || {}) as Message;
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
  const channel = supabase
    .channel('public:messages')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: chatRoomId ? `chat_room_id=eq.${chatRoomId}` : undefined
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
