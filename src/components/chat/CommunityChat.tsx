
import { useState, useEffect, useRef } from "react";
import { Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useGetMessages, useSendMessage, useSubscribeToMessages } from "@/services/messageService";
import { toast } from "sonner";

interface CommunityChatProps {
  chatRoomId: string;
  chatName: string;
}

const CommunityChat = ({ chatRoomId, chatName }: CommunityChatProps) => {
  const [messageText, setMessageText] = useState("");
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: messages = [], isLoading, error } = useGetMessages(chatRoomId);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const sendMessageMutation = useSendMessage();
  
  // Update all messages when query data changes
  useEffect(() => {
    if (messages && messages.length > 0) {
      setAllMessages(messages);
    }
  }, [messages]);
  
  // Subscribe to new messages
  useSubscribeToMessages(chatRoomId, (newMessage) => {
    setAllMessages(prev => {
      // Check if message is already in the array to prevent duplicates
      if (!prev.some(msg => msg.id === newMessage.id)) {
        return [...prev, newMessage];
      }
      return prev;
    });
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !user) {
      return;
    }
    
    try {
      await sendMessageMutation.mutateAsync({
        message_text: messageText,
        chat_room_id: chatRoomId,
        is_group_message: true
      });
      
      // Clear input
      setMessageText("");
      
      // Focus input for next message
      inputRef.current?.focus();
    } catch (error) {
      toast.error("Failed to send message", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    }
  };
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <AlertTriangle className="h-12 w-12 text-crisis-red mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error loading messages</h3>
        <p className="text-sm text-center text-muted-foreground">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
      </div>
    );
  }
  
  // Function to format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Group messages by sender for better UI
  const renderMessages = () => {
    let lastSender = null;
    
    return allMessages.map((message, index) => {
      const isCurrentUser = message.sender_id === user?.id;
      const showSender = message.sender_id !== lastSender;
      lastSender = message.sender_id;
      
      return (
        <div 
          key={message.id || index}
          className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} mb-2`}
        >
          {showSender && !isCurrentUser && (
            <div className="flex items-center mb-1">
              <Avatar className="h-5 w-5 mr-1">
                <div className="bg-primary/80 text-white h-full w-full flex items-center justify-center text-xs">
                  {message.sender_name?.charAt(0) || 'U'}
                </div>
              </Avatar>
              <span className="text-xs font-medium">{message.sender_name || 'Unknown'}</span>
            </div>
          )}
          
          <div 
            className={`py-2 px-3 rounded-lg max-w-[80%] break-words ${
              isCurrentUser 
              ? 'bg-primary text-white' 
              : message.sender_id === 'system'
                ? 'bg-crisis-red/10 text-crisis-red border border-crisis-red/20'
                : 'bg-secondary'
            }`}
          >
            <p className="text-sm">{message.message_text}</p>
            <span className={`text-[10px] block mt-1 ${isCurrentUser ? 'text-white/70' : 'text-muted-foreground'}`}>
              {formatTime(message.created_at)}
            </span>
          </div>
        </div>
      );
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b">
        <h2 className="font-semibold">{chatName}</h2>
        <p className="text-xs text-muted-foreground">Community emergency chat</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-sm">Loading messages...</span>
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-sm text-muted-foreground mb-2">No messages yet</p>
            <p className="text-xs text-muted-foreground">Be the first to send a message in this channel</p>
          </div>
        ) : (
          <>
            {renderMessages()}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <form 
        onSubmit={handleSendMessage}
        className="px-4 py-3 border-t flex items-center"
      >
        <Input
          ref={inputRef}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type message here..."
          className="flex-1 mr-2"
          disabled={!user}
        />
        <Button 
          type="submit" 
          size="sm" 
          disabled={!messageText.trim() || !user || sendMessageMutation.isPending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default CommunityChat;
