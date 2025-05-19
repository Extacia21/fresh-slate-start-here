
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Map, Droplet, Phone } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const FillProfile = () => {
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    bloodType: "",
    emergencyContact: "",
    emergencyRelation: "",
    emergencyPhone: "",
  });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.phone || !formData.address) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!formData.emergencyContact || !formData.emergencyPhone) {
      toast({
        title: "Error",
        description: "Please provide emergency contact information",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Profile completed",
        description: "Your profile has been updated successfully",
      });
      navigate("/app");
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => step === 1 ? navigate(-1) : setStep(1)} 
          className="pl-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === 1 ? "Back" : "Previous"}
        </Button>
        <div className="flex space-x-1">
          <div className={`h-1 w-6 rounded-full ${step === 1 ? "bg-primary" : "bg-primary/30"}`}></div>
          <div className={`h-1 w-6 rounded-full ${step === 2 ? "bg-primary" : "bg-primary/30"}`}></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-3 rounded-full mb-4">
            <User className="text-primary h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">
            {step === 1 ? "Complete Your Profile" : "Emergency Information"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            {step === 1 
              ? "Add your details to help us personalize your experience" 
              : "This information will be used in case of emergency"
            }
          </p>
        </div>

        <div className="space-y-4 max-w-sm mx-auto w-full">
          {step === 1 ? (
            <>
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
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-crisis pl-10"
                  />
                </div>
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
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                  id="emergencyContact"
                  type="text"
                  placeholder="Name of emergency contact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="input-crisis"
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
                  />
                </div>
              </div>
            </>
          )}
          
          <Button 
            onClick={handleNext} 
            className="w-full py-6 mt-6" 
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : step === 1 ? "Next" : "Complete Profile"}
          </Button>
          
          {step === 2 && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              This information will only be shared with emergency responders when you activate the SOS feature.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FillProfile;
