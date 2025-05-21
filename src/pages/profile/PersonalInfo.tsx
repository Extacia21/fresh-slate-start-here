
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/use-profile-data";
import { useUpdateProfile } from "@/services/profileService";
import { DatePicker } from "@/components/ui/date-picker";

const PersonalInfo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profileData, isLoading, refetchProfile } = useProfileData();
  const updateProfileMutation = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dob: undefined as Date | undefined
  });

  useEffect(() => {
    if (profileData) {
      // Extract user metadata from auth or profile data
      const firstName = profileData.first_name || '';
      const lastName = profileData.last_name || '';
      const displayName = profileData.display_name || '';
      
      // Build user name with preference for display_name, then first_name + last_name
      const name = displayName || 
                  (firstName || lastName ? `${firstName} ${lastName}`.trim() : 
                  user?.user_metadata?.full_name || 
                  user?.user_metadata?.name ||
                  user?.email?.split('@')[0] || 
                  '');
      
      // Parse date of birth if available
      const dob = profileData.date_of_birth ? new Date(profileData.date_of_birth) : undefined;
      
      setUserInfo({
        name: name,
        firstName: firstName,
        lastName: lastName,
        email: user?.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        dob: dob
      });
    }
  }, [profileData, user]);

  const handleSave = async () => {
    try {
      const [firstName, ...lastNameParts] = userInfo.name.split(' ');
      const lastName = lastNameParts.join(' ');
      
      await updateProfileMutation.mutateAsync({
        first_name: firstName || null,
        last_name: lastName || null,
        display_name: userInfo.name, // Add display name
        phone: userInfo.phone || null,
        address: userInfo.address || null,
        date_of_birth: userInfo.dob ? userInfo.dob.toISOString().split('T')[0] : null // Save DOB
      });
      
      // Refetch profile data to update UI
      refetchProfile();
      
      toast.success("Profile updated", {
        description: "Your personal information has been updated successfully"
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error("Update failed", {
        description: error.message || "There was an error updating your profile"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Personal Information</h1>
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
            <User className="h-5 w-5 text-primary mr-2" />
            <label className="text-sm font-medium">Full Name</label>
          </div>
          {isEditing ? (
            <Input 
              value={userInfo.name}
              onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
            />
          ) : (
            <p className="text-foreground pl-7">{userInfo.name || 'Not set'}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-primary mr-2" />
            <label className="text-sm font-medium">Email</label>
          </div>
          <p className="text-foreground pl-7">{userInfo.email}</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <Phone className="h-5 w-5 text-primary mr-2" />
            <label className="text-sm font-medium">Phone</label>
          </div>
          {isEditing ? (
            <Input 
              type="tel"
              value={userInfo.phone}
              onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
            />
          ) : (
            <p className="text-foreground pl-7">{userInfo.phone || 'Not set'}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-primary mr-2" />
            <label className="text-sm font-medium">Address</label>
          </div>
          {isEditing ? (
            <Textarea 
              value={userInfo.address}
              onChange={(e) => setUserInfo({...userInfo, address: e.target.value})}
            />
          ) : (
            <p className="text-foreground pl-7">{userInfo.address || 'No location set'}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-primary mr-2" />
            <label className="text-sm font-medium">Date of Birth</label>
          </div>
          {isEditing ? (
            <DatePicker 
              value={userInfo.dob}
              onChange={(date) => setUserInfo({...userInfo, dob: date})}
              placeholder="Select your date of birth"
              className="w-full"
              disableFuture={true}
              minDate={new Date(1900, 0, 1)}
            />
          ) : (
            <p className="text-foreground pl-7">
              {userInfo.dob ? new Date(userInfo.dob).toLocaleDateString() : 'Not set'}
            </p>
          )}
        </div>

        {isEditing && (
          <div className="pt-4">
            <Button 
              className="w-full" 
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
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

export default PersonalInfo;
