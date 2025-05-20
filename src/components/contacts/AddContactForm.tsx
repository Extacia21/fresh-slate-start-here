
import { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { useCreateContact } from "@/services/contactsService";

interface AddContactFormProps {
  onClose: () => void;
  onAddContact: (contact: any) => void;
}

const AddContactForm = ({ onClose, onAddContact }: AddContactFormProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [type, setType] = useState("personal");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createContactMutation = useCreateContact();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone) {
      toast({
        title: "Required fields missing",
        description: "Please fill in name and phone number",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newContact = {
        name,
        phone,
        relationship,
        type,
        is_favorite: isFavorite
      };

      const createdContact = await createContactMutation.mutateAsync(newContact);

      toast({
        title: "Contact added",
        description: `${name} has been added to your contacts`,
        duration: 3000,
      });

      onAddContact(createdContact);
      onClose();
    } catch (error: any) {
      toast({
        title: "Failed to add contact",
        description: error.message || "An error occurred",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Contact</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name"
            placeholder="Enter name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone"
            placeholder="Enter phone number" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship (optional)</Label>
          <Input 
            id="relationship"
            placeholder="Family, Friend, Coworker, etc." 
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Contact Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="service">Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="isFavorite" className="cursor-pointer">Mark as favorite</Label>
          <Switch 
            id="isFavorite" 
            checked={isFavorite}
            onCheckedChange={setIsFavorite}
          />
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Contact"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddContactForm;
