
import React, { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCreateContact } from "@/services/contactsService";
import { Mail } from "lucide-react";

interface AddContactFormEnhancedProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

const AddContactFormEnhanced = ({ children, onSuccess }: AddContactFormEnhancedProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [type, setType] = useState("emergency");
  const [isOpen, setIsOpen] = useState(false);
  
  const createContactMutation = useCreateContact();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone) {
      toast.error("Please fill in required fields");
      return;
    }
    
    // Email validation if provided
    if (email && !validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    try {
      await createContactMutation.mutateAsync({
        name,
        phone,
        email: email || undefined,
        relationship,
        type,
        is_favorite: type === "emergency"
      });
      
      toast.success("Contact added successfully");
      
      // Reset form
      setName("");
      setPhone("");
      setEmail("");
      setRelationship("");
      setType("emergency");
      
      // Close sheet
      setIsOpen(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error("Failed to add contact", { 
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
  
  // Simple email validation
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader className="mb-6">
          <SheetTitle>Add New Contact</SheetTitle>
          <SheetDescription>
            Add a new contact to your emergency contacts list.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              placeholder="Enter contact name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="Enter phone number" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center">
              <Mail className="h-4 w-4 mr-1 inline" />
              Email Address
            </Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Email is required for SOS alerts and emergency notifications
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger id="relationship">
                <SelectValue placeholder="Select relationship" />
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
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select contact type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emergency">Emergency Contact</SelectItem>
                <SelectItem value="personal">Personal Contact</SelectItem>
                <SelectItem value="service">Service Provider</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <SheetFooter className="pt-4">
            <div className="flex gap-3 w-full">
              <SheetClose asChild>
                <Button variant="outline" className="flex-1">Cancel</Button>
              </SheetClose>
              <Button type="submit" className="flex-1">Add Contact</Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddContactFormEnhanced;
