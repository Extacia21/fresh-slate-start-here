
import { useState } from "react";
import { MessageSquare, Users, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommunityChat from "@/components/chat/CommunityChat";

const Chat = () => {
  const [activeTab, setActiveTab] = useState("community");
  
  // Community chat rooms - can be expanded in the future
  const communityChannels = [
    {
      id: "community-emergency",
      name: "Emergency Updates",
      description: "Official emergency notifications and updates"
    }
  ];
  
  return (
    <div className="flex flex-col h-full">
      <div className="page-header border-b border-border">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          <div>
            <h1 className="text-xl font-bold">Chat</h1>
            <p className="text-xs text-muted-foreground">
              Community emergency updates and direct messaging
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Tabs
          defaultValue="community"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col flex-1"
        >
          <div className="px-4 py-2 border-b">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="community" className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Community
              </TabsTrigger>
              <TabsTrigger value="direct" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                Direct
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="community" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
            <CommunityChat 
              chatRoomId="community-emergency"
              chatName="Emergency Updates"
            />
          </TabsContent>
          
          <TabsContent value="direct" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
            <div className="flex flex-col items-center justify-center h-full p-4">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">Direct Messages</h3>
              <p className="text-xs text-center text-muted-foreground">
                Direct messaging coming soon.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Chat;
