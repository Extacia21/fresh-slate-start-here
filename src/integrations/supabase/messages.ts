
// This file provides type definitions for the messages table that doesn't exist in the auto-generated types

export interface Message {
  id: string;
  sender_id: string;
  recipient_id?: string | null;
  is_group_message: boolean;
  chat_room_id?: string;
  message_text: string;
  created_at: string;
  chat_type?: "community" | "direct";
}

// Store messages in memory for this mock implementation
let storedMessages: Message[] = [
  {
    id: '1',
    sender_id: 'user-1',
    chat_room_id: 'community-emergency',
    is_group_message: true,
    message_text: 'This is a test message',
    created_at: new Date().toISOString(),
    chat_type: "community"
  },
  {
    id: '2',
    sender_id: 'system',
    chat_room_id: 'community-emergency',
    is_group_message: true,
    message_text: 'Emergency alert: Flash flood warning in downtown area',
    created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    chat_type: "community"
  },
  {
    id: '3',
    sender_id: 'user-2',
    chat_room_id: 'community-emergency',
    is_group_message: true,
    message_text: 'Is everyone safe downtown?',
    created_at: new Date(Date.now() - 1700000).toISOString(), // 28 minutes ago
    chat_type: "community"
  }
];

export const getMessages = async (chatRoomId?: string, recipientId?: string, userId?: string) => {
  try {
    // Filter based on criteria
    let filteredMessages = [...storedMessages];
    
    if (chatRoomId) {
      filteredMessages = filteredMessages.filter(m => m.chat_room_id === chatRoomId);
    } else if (recipientId && userId) {
      filteredMessages = filteredMessages.filter(m => 
        (m.sender_id === userId && m.recipient_id === recipientId) || 
        (m.sender_id === recipientId && m.recipient_id === userId)
      );
    }
    
    // Sort by timestamp (newest first)
    filteredMessages.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return { data: filteredMessages, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const sendMessage = async (message: Omit<Message, 'id' | 'created_at'>) => {
  try {
    // In a real implementation, this would insert into the actual messages table
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}`,
      created_at: new Date().toISOString(),
      chat_type: message.is_group_message ? "community" : "direct"
    };
    
    // Add to stored messages
    storedMessages.push(newMessage);
    
    // Simulate real-time message delivery by dispatching a custom event
    setTimeout(() => {
      const messageEvent = new CustomEvent('message-event', {
        detail: {
          type: 'new-message',
          ...newMessage
        }
      });
      window.dispatchEvent(messageEvent);
    }, 500); // Small delay to simulate network
    
    return { data: [newMessage], error: null };
  } catch (error) {
    return { data: null, error };
  }
};
