
import { useState, useEffect } from "react";
import { Phone, Plus, Search, Star, Users, Mail, Shield, Building, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import AddContactForm from "@/components/contacts/AddContactForm";
import { useNavigate } from "react-router-dom";
import { useGetContacts, Contact } from "@/services/contactsService";
import { useAuth } from "@/contexts/AuthContext";

const Contacts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: contactsData, isLoading, error } = useGetContacts();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  // Set contacts when data is loaded
  useEffect(() => {
    if (contactsData) {
      setContacts(contactsData);
      setFilteredContacts(contactsData);
    }
  }, [contactsData]);

  // Filter contacts based on search query and active tab
  useEffect(() => {
    if (!contacts.length) return;
    
    let result = [...contacts];
    
    // Apply category filter
    if (activeTab !== "all") {
      result = result.filter(contact => contact.type === activeTab);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        contact => 
          contact.name.toLowerCase().includes(query) || 
          contact.phone.includes(query)
      );
    }
    
    setFilteredContacts(result);
  }, [contacts, activeTab, searchQuery]);

  const handleCall = (contact: Contact) => {
    toast.success(`Calling ${contact.name}`, {
      description: `Dialing ${contact.phone}...`,
      duration: 3000,
    });
    
    // In a real mobile app, this would use a native API to initiate a call
    // For web, we'll use tel: protocol
    window.location.href = `tel:${contact.phone.replace(/\D/g, '')}`;
  };

  const handleMessage = (contact: Contact) => {
    if (contact.user_id === null) {
      // For emergency contacts, show information
      toast.info(`Emergency Contact`, {
        description: `For emergencies, call ${contact.phone} directly.`,
        duration: 3000,
      });
    } else {
      // For personal contacts, navigate to chat
      navigate(`/app/chat?contact=${contact.name}&phone=${contact.phone}`);
    }
  };

  const handleAddContact = () => {
    setIsAddContactOpen(true);
  };

  const addNewContact = (newContact: Contact) => {
    // Contact is added to database by the AddContactForm component
    setIsAddContactOpen(false);
    // Update local state only if needed - handled by useGetContacts invalidation
  };

  // Map contact.type to icon component
  const getIconForContactType = (type: string) => {
    switch (type) {
      case "emergency":
        return <Shield className="h-5 w-5 text-crisis-red" />;
      case "service":
        return <Building className="h-5 w-5 text-primary" />;
      case "personal":
      default:
        return <Users className="h-5 w-5 text-primary" />;
    }
  };

  // Determine if a contact is a system default (cannot be edited)
  const isDefaultContact = (contact: Contact) => {
    return contact.user_id === null;
  };

  if (error) {
    return (
      <div className="page-container flex flex-col items-center justify-center py-12">
        <Shield className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Contacts</h2>
        <p className="text-muted-foreground text-center mb-4">
          {error instanceof Error ? error.message : "Failed to load contacts"}
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="page-header border-b border-border">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            <h1 className="text-xl font-bold">Contacts</h1>
          </div>
          <Button size="sm" onClick={handleAddContact}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-9 pr-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          defaultValue="all"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="service">Services</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="page-container pb-24">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div 
                key={item} 
                className="bg-muted animate-pulse h-28 rounded-lg"
              ></div>
            ))}
          </div>
        ) : filteredContacts.length > 0 ? (
          <div>
            {/* Emergency contacts section - always show first */}
            {activeTab === "all" || activeTab === "emergency" ? (
              <div className="mb-4">
                {filteredContacts.some(contact => isDefaultContact(contact) && (activeTab === "all" || contact.type === activeTab)) && (
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Emergency Services</h3>
                )}
                {filteredContacts
                  .filter(contact => isDefaultContact(contact) && (activeTab === "all" || contact.type === activeTab))
                  .map((contact) => (
                    <div
                      key={contact.id}
                      className="mb-3 p-4 bg-gradient-to-r from-red-50 to-transparent rounded-lg shadow-subtle"
                    >
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-red-100 mr-3">
                          <Shield className="h-5 w-5 text-crisis-red" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="font-medium">{contact.name}</h3>
                            <span className="ml-2 text-xs py-0.5 px-1.5 bg-red-100 text-crisis-red rounded-full">Official</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className="p-2 rounded-full bg-green-100 text-green-600"
                            onClick={() => handleCall(contact)}
                            aria-label={`Call ${contact.name}`}
                          >
                            <Phone className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : null}

            {/* User's personal contacts */}
            {filteredContacts
              .filter(contact => !isDefaultContact(contact) && (activeTab === "all" || contact.type === activeTab))
              .length > 0 && (
              <div>
                {activeTab === "all" && (
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Your Contacts</h3>
                )}
                {filteredContacts
                  .filter(contact => !isDefaultContact(contact) && (activeTab === "all" || contact.type === activeTab))
                  .map((contact) => (
                    <div
                      key={contact.id}
                      className="mb-3 p-4 bg-white rounded-lg shadow-subtle hover:shadow-card transition-shadow"
                    >
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-primary/10 mr-3">
                          {getIconForContactType(contact.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="font-medium">{contact.name}</h3>
                            {contact.is_favorite && (
                              <Star className="h-3.5 w-3.5 text-yellow-500 ml-2 fill-current" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{contact.phone}</p>
                          {contact.relationship && (
                            <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className="p-2 rounded-full bg-green-100 text-green-600"
                            onClick={() => handleCall(contact)}
                            aria-label={`Call ${contact.name}`}
                          >
                            <Phone className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 rounded-full bg-blue-100 text-blue-600"
                            onClick={() => handleMessage(contact)}
                            aria-label={`Message ${contact.name}`}
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">No Contacts Found</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? `No results for "${searchQuery}"`
                : "No contacts available for this category"}
            </p>
          </div>
        )}
      </div>

      <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
        <AddContactForm 
          onClose={() => setIsAddContactOpen(false)} 
          onAddContact={addNewContact} 
        />
      </Dialog>
    </div>
  );
};

export default Contacts;
