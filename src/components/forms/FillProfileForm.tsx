
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Map, Phone, Droplet, Calendar as CalendarLucide } from "lucide-react";

interface FillProfileFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  step: number;
  setStep: (step: number) => void;
}

const FillProfileForm = ({ onSubmit, isSubmitting, step, setStep }: FillProfileFormProps) => {
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    city: "Chinhoyi", // Default to Chinhoyi
    state: "Mashonaland West", // Default to Mashonaland West province
    country: "Zimbabwe", // Default to Zimbabwe
    bloodType: "",
    allergies: "",
    emergencyContact: "",
    emergencyRelation: "",
    emergencyPhone: "",
    emergencyEmail: "",
    dateOfBirth: undefined as Date | undefined,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, dateOfBirth: date }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.phone || !formData.address || !formData.dateOfBirth) {
        return;
      }
      setStep(2);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!formData.emergencyContact || !formData.emergencyPhone) {
      return;
    }
    
    const fullAddress = `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country}`;
    
    onSubmit({
      ...formData,
      address: fullAddress,
    });
  };

  return (
    <>
      {step === 1 ? (
        <div className="space-y-4 max-w-sm mx-auto w-full">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                className="input-crisis pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <div className="relative">
              <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="address"
                type="text"
                placeholder="Enter your street address"
                value={formData.address}
                onChange={handleChange}
                className="input-crisis pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <div className="relative">
                  <CalendarLucide className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Button
                    variant="outline"
                    className={`w-full pl-10 py-6 text-left font-normal ${
                      !formData.dateOfBirth ? "text-muted-foreground" : ""
                    }`}
                  >
                    {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : "Select your date of birth"}
                  </Button>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dateOfBirth}
                  onSelect={handleDateChange}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bloodType">Blood Type (Optional)</Label>
            <div className="relative">
              <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Select onValueChange={(value) => handleSelectChange(value, "bloodType")}>
                <SelectTrigger className="input-crisis pl-10">
                  <SelectValue placeholder="Select your blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="unknown">Don't know</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies (Optional)</Label>
            <Input
              id="allergies"
              type="text"
              placeholder="Enter any allergies you have"
              value={formData.allergies}
              onChange={handleChange}
              className="input-crisis"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-sm mx-auto w-full">
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
            <Input
              id="emergencyContact"
              type="text"
              placeholder="Name of emergency contact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className="input-crisis"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emergencyRelation">Relationship</Label>
            <Select onValueChange={(value) => handleSelectChange(value, "emergencyRelation")}>
              <SelectTrigger className="input-crisis">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spouse">Spouse</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="child">Child</SelectItem>
                <SelectItem value="sibling">Sibling</SelectItem>
                <SelectItem value="friend">Friend</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="emergencyPhone"
                type="tel"
                placeholder="Emergency contact phone number"
                value={formData.emergencyPhone}
                onChange={handleChange}
                className="input-crisis pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emergencyEmail">Emergency Contact Email</Label>
            <Input
              id="emergencyEmail"
              type="email"
              placeholder="Emergency contact email address"
              value={formData.emergencyEmail}
              onChange={handleChange}
              className="input-crisis"
            />
          </div>
        </div>
      )}
      
      <Button 
        onClick={handleNext} 
        className="w-full py-6 mt-6" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : step === 1 ? "Next" : "Complete Profile"}
      </Button>
      
      {step === 2 && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          This information will only be shared with emergency responders when you activate the SOS feature.
        </p>
      )}
    </>
  );
};

export default FillProfileForm;
