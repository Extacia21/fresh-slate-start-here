
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Plus, User, Phone, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

const EmergencyContacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<EmergencyContact>({
    name: "",
    relationship: "",
    phone: ""
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    // Load contacts from localStorage
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        if (profile.emergencyContacts) {
          setContacts(profile.emergencyContacts);
        }
      } catch (e) {
        console.error("Failed to load emergency contacts:", e);
      }
    }
  }, []);

  const handleOpenDialog = (contact?: EmergencyContact, index?: number) => {
    if (contact) {
      setCurrentContact(contact);
      setEditIndex(index || null);
    } else {
      setCurrentContact({ name: "", relationship: "", phone: "" });
      setEditIndex(null);
    }
    setIsDialogOpen(true);
  };

  const handleSaveContact = () => {
    if (!currentContact.name || !currentContact.phone) {
      toast({
        title: "Missing information",
        description: "Please provide at least a name and phone number",
        variant: "destructive"
      });
      return;
    }

    let newContacts = [...contacts];
    
    if (editIndex !== null) {
      // Edit existing contact
      newContacts[editIndex] = currentContact;
    } else {
      // Add new contact
      newContacts.push(currentContact);
    }
    
    // Save to localStorage
    try {
      const savedProfile = localStorage.getItem("userProfile") || "{}";
      const profile = JSON.parse(savedProfile);
      const updatedProfile = {
        ...profile,
        emergencyContacts: newContacts
      };
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      
      setContacts(newContacts);
      setIsDialogOpen(false);
      
      toast({
        title: editIndex !== null ? "Contact updated" : "Contact added",
        description: editIndex !== null 
          ? "Your emergency contact has been updated successfully" 
          : "Your emergency contact has been added successfully"
      });
    } catch (e) {
      console.error("Failed to save contact:", e);
      toast({
        title: "Save failed",
        description: "There was an error saving your contact",
        variant: "destructive"
      });
    }
  };

  const handleDeleteContact = (index: number) => {
    const newContacts = [...contacts];
    newContacts.splice(index, 1);
    
    // Save to localStorage
    try {
      const savedProfile = localStorage.getItem("userProfile") || "{}";
      const profile = JSON.parse(savedProfile);
      const updatedProfile = {
        ...profile,
        emergencyContacts: newContacts
      };
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      
      setContacts(newContacts);
      
      toast({
        title: "Contact deleted",
        description: "Your emergency contact has been removed"
      });
    } catch (e) {
      console.error("Failed to delete contact:", e);
      toast({
        title: "Delete failed",
        description: "There was an error removing your contact",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Emergency Contacts</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Add Contact
        </Button>
      </div>

      {contacts.length > 0 ? (
        <div className="space-y-3">
          {contacts.map((contact, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between p-4 bg-card rounded-lg shadow-subtle hover:bg-accent/50 transition-colors"
              onClick={() => handleOpenDialog(contact, index)}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">{contact.name}</h3>
                  <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">{contact.phone}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted rounded-lg">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
          <h3 className="text-xl font-medium mb-2">No Emergency Contacts</h3>
          <p className="text-muted-foreground mb-6">Add contacts to notify during emergencies</p>
          <Button onClick={() => handleOpenDialog()}>
            Add Your First Contact
          </Button>
        </div>
      )}

      <div className="mt-8">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate("/app/profile")}
        >
          Back to Profile
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? "Edit" : "Add"} Emergency Contact</DialogTitle>
            <DialogDescription>
              These contacts will be notified during emergencies
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Contact name"
                value={currentContact.name}
                onChange={(e) => setCurrentContact({...currentContact, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Relationship</label>
              <Input
                placeholder="E.g. Spouse, Parent, Friend"
                value={currentContact.relationship}
                onChange={(e) => setCurrentContact({...currentContact, relationship: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                type="tel"
                placeholder="Phone number"
                value={currentContact.phone}
                onChange={(e) => setCurrentContact({...currentContact, phone: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter className="flex items-center justify-between">
            {editIndex !== null && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  handleDeleteContact(editIndex);
                  setIsDialogOpen(false);
                }}
              >
                Delete
              </Button>
            )}
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveContact}>
                {editIndex !== null ? "Update" : "Add"} Contact
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencyContacts;
