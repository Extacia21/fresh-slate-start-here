
import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, MoreVertical, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSendMessage, useGetMessages, useSubscribeToMessages, Message } from "@/services/messagesService";
import { toast } from "sonner";

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const contactName = searchParams.get('contact') || 'Community Emergency Chat';
  const contactPhone = searchParams.get('phone');
  const chatRoomId = searchParams.get('chatRoomId') || 'community-emergency';
  const isGroupChat = !contactPhone;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showParticipants, setShowParticipants] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Get messages from Supabase
  const { data: messagesData, isLoading } = useGetMessages(chatRoomId);
  const sendMessageMutation = useSendMessage();

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = useSubscribeToMessages(chatRoomId, (newMessage) => {
      // Only add if it's not from the current user to avoid duplicates
      // (since we're optimistically adding sent messages)
      if (newMessage.sender_id !== user?.id) {
        setMessages(prevMessages => [...prevMessages, newMessage]);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [chatRoomId, user]);

  // Set messages when loaded from Supabase
  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData);
    }
  }, [messagesData]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      // Optimistically add the message to the UI
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        sender_id: user.id,
        recipient_id: contactPhone ? undefined : null,
        chat_room_id: chatRoomId,
        is_group_message: isGroupChat,
        message_text: newMessage,
        created_at: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, optimisticMessage]);
      setNewMessage("");

      // Send the actual message
      const messageToSend = {
        sender_id: user.id,
        recipient_id: contactPhone ? undefined : null,
        chat_room_id: chatRoomId,
        is_group_message: isGroupChat,
        message_text: newMessage
      };

      await sendMessageMutation.mutateAsync(messageToSend);
    } catch (error) {
      toast.error("Failed to send message", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Mock participants data (in a real app, this would come from the database)
  const participants = [
    { name: "Sarah", status: "online" },
    { name: "Michael", status: "online" },
    { name: "Emergency Services", status: "online" },
    { name: "John", status: "offline" },
    { name: "Lisa", status: "offline" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 px-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-bold">{contactName}</h1>
            {isGroupChat ? (
              <p className="text-xs text-muted-foreground">
                {participants.filter(p => p.status === "online").length} participants online
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">{contactPhone}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {isGroupChat && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <Users className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="p-1">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className={`flex-1 overflow-y-auto p-4 hide-scrollbar ${showParticipants ? 'w-2/3' : 'w-full'} transition-all duration-300`} ref={chatContainerRef}>
            {isLoading ? (
              <div className="space-y-4 pb-20">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex flex-col gap-2">
                    <div className="h-10 bg-muted rounded-lg w-3/4"></div>
                    <div className="h-10 bg-muted rounded-lg w-1/2 self-end"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 pb-20">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender_id === user?.id
                          ? "bg-primary text-white"
                          : "bg-secondary"
                      }`}
                    >
                      <p className="text-sm">{message.message_text}</p>
                      <p className="text-xs mt-1 opacity-70 text-right">
                        {new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {messages.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {showParticipants && (
            <div className="w-1/3 border-l border-border bg-background overflow-y-auto animate-slide-in-right">
              <div className="p-4 flex items-center justify-between border-b border-border">
                <h3 className="font-medium">Participants</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1" 
                  onClick={() => setShowParticipants(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-2">
                {participants.map((participant, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                    <span>{participant.name}</span>
                    <span className={`w-2 h-2 rounded-full ${participant.status === 'online' ? 'bg-crisis-green' : 'bg-crisis-gray'}`}></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-background border-t border-border">
        <div className="flex">
          <textarea
            className="flex-1 p-3 rounded-l-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition duration-200 resize-none"
            placeholder="Type a message..."
            rows={1}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <Button 
            className="rounded-l-none" 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
