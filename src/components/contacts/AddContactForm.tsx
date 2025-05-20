
import { useState } from "react";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateContact } from "@/services/contactsService";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Contact } from "@/services/contactsService"; // Make sure this import is correct

interface AddContactFormProps {
  onClose: () => void;
  onAddContact: (contact: Contact) => void;
}

const AddContactForm = ({ onClose, onAddContact }: AddContactFormProps) => {
  const createContactMutation = useCreateContact();
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [type, setType] = useState<"personal" | "emergency" | "service">("personal");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone) {
      toast.error("Please provide name and phone number");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const newContact = {
        name,
        phone,
        email,
        relationship,
        type,
        is_favorite: isFavorite
      };
      
      const createdContact = await createContactMutation.mutateAsync(newContact);
      
      toast.success("Contact added successfully");
      onAddContact(createdContact);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add contact");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Emergency Contact</DialogTitle>
        <DialogDescription>
          Add a new emergency contact to your list.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            placeholder="Contact name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone" 
            placeholder="Phone number" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            type="email"
            placeholder="Email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship</Label>
          <Select value={relationship} onValueChange={setRelationship}>
            <SelectTrigger id="relationship">
              <SelectValue placeholder="Relationship to contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="friend">Friend</SelectItem>
              <SelectItem value="colleague">Colleague</SelectItem>
              <SelectItem value="neighbor">Neighbor</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Contact Type</Label>
          <Select 
            value={type} 
            onValueChange={(value: "personal" | "emergency" | "service") => setType(value)}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Contact type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="service">Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="favorite"
            checked={isFavorite}
            onCheckedChange={setIsFavorite}
          />
          <Label htmlFor="favorite">Mark as favorite</Label>
        </div>
        
        <DialogFooter className="mt-6 pt-2 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Contact"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddContactForm;
