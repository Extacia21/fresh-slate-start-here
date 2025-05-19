
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Droplet, AlertCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MedicalInfo = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [medicalInfo, setMedicalInfo] = useState({
    bloodType: "O+",
    allergies: "Penicillin, Peanuts",
    medications: "",
    conditions: ""
  });

  useEffect(() => {
    // Load medical info from localStorage
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setMedicalInfo({
          ...medicalInfo,
          bloodType: profile.bloodType || medicalInfo.bloodType,
          allergies: Array.isArray(profile.allergies) 
            ? profile.allergies.join(", ") 
            : (profile.allergies || medicalInfo.allergies),
          medications: profile.medications || medicalInfo.medications,
          conditions: profile.conditions || medicalInfo.conditions
        });
      } catch (e) {
        console.error("Failed to load medical info:", e);
      }
    }
  }, []);

  const handleSave = () => {
    // Format allergies back to array if needed
    const allergiesArray = medicalInfo.allergies
      .split(",")
      .map(item => item.trim())
      .filter(item => item !== "");
    
    // Update localStorage with new medical info
    try {
      const savedProfile = localStorage.getItem("userProfile") || "{}";
      const profile = JSON.parse(savedProfile);
      const updatedProfile = {
        ...profile,
        bloodType: medicalInfo.bloodType,
        allergies: allergiesArray.length > 0 ? allergiesArray : medicalInfo.allergies,
        medications: medicalInfo.medications,
        conditions: medicalInfo.conditions
      };
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      
      toast({
        title: "Medical information updated",
        description: "Your medical information has been updated successfully"
      });
      
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to update medical info:", e);
      toast({
        title: "Update failed",
        description: "There was an error updating your medical information",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Medical Information</h1>
        <Button 
          variant={isEditing ? "outline" : "default"} 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-subtle space-y-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Droplet className="h-5 w-5 text-primary mr-2" />
            <label className="text-sm font-medium">Blood Type</label>
          </div>
          {isEditing ? (
            <Select 
              value={medicalInfo.bloodType}
              onValueChange={(value) => setMedicalInfo({...medicalInfo, bloodType: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blood type" />
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
              </SelectContent>
            </Select>
          ) : (
            <p className="text-foreground pl-7">{medicalInfo.bloodType}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-primary mr-2" />
            <label className="text-sm font-medium">Allergies</label>
          </div>
          {isEditing ? (
            <Textarea 
              placeholder="List allergies separated by commas"
              value={medicalInfo.allergies}
              onChange={(e) => setMedicalInfo({...medicalInfo, allergies: e.target.value})}
            />
          ) : (
            <p className="text-foreground pl-7">{medicalInfo.allergies}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-primary mr-2" />
            <label className="text-sm font-medium">Current Medications</label>
          </div>
          {isEditing ? (
            <Textarea 
              placeholder="List current medications"
              value={medicalInfo.medications}
              onChange={(e) => setMedicalInfo({...medicalInfo, medications: e.target.value})}
            />
          ) : (
            <p className="text-foreground pl-7">
              {medicalInfo.medications ? medicalInfo.medications : "None"}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-primary mr-2" />
            <label className="text-sm font-medium">Medical Conditions</label>
          </div>
          {isEditing ? (
            <Textarea 
              placeholder="List any medical conditions"
              value={medicalInfo.conditions}
              onChange={(e) => setMedicalInfo({...medicalInfo, conditions: e.target.value})}
            />
          ) : (
            <p className="text-foreground pl-7">
              {medicalInfo.conditions ? medicalInfo.conditions : "None"}
            </p>
          )}
        </div>

        {isEditing && (
          <div className="pt-4">
            <Button className="w-full" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate("/app/profile")}
        >
          Back to Profile
        </Button>
      </div>
    </div>
  );
};

export default MedicalInfo;
