
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import FillProfileForm from "@/components/forms/FillProfileForm";

const FillProfile = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  // Get email from session storage (passed from signup)
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("newUserEmail");
    const storedName = sessionStorage.getItem("newUserName");
    if (!storedEmail) {
      // If no email is found, redirect to signup
      navigate("/signup");
    } else {
      setEmail(storedEmail);
      setName(storedName);
    }
  }, [navigate]);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    
    try {
      // Get the user ID if they signed up and got an email confirmation automatically
      const { data: authData } = await supabase.auth.getSession();
      const userId = authData.session?.user?.id;
      
      // Format date of birth to ISO string if it exists
      const dateOfBirth = formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : null;
      
      if (userId) {
        // User is already authenticated, update their profile
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            first_name: name?.split(' ')[0] || '',
            last_name: name?.split(' ').slice(1).join(' ') || '',
            phone: formData.phone,
            address: formData.address,
            blood_type: formData.bloodType,
            allergies: formData.allergies,
            date_of_birth: dateOfBirth,
            emergency_contact_name: formData.emergencyContact,
            emergency_contact_phone: formData.emergencyPhone,
            emergency_contact_relation: formData.emergencyRelation,
            emergency_contact_email: formData.emergencyEmail,
          });
          
        if (error) {
          throw error;
        }
        
        // Add emergency contact to contacts table
        if (formData.emergencyContact && formData.emergencyPhone) {
          const { error: contactError } = await supabase
            .from('contacts')
            .upsert({
              user_id: userId,
              name: formData.emergencyContact,
              phone: formData.emergencyPhone,
              email: formData.emergencyEmail || null,
              type: 'emergency',
              relationship: formData.emergencyRelation || null,
              is_favorite: true,
            });
            
          if (contactError) {
            console.error("Error saving emergency contact:", contactError);
          }
        }
        
        toast({
          title: "Profile completed",
          description: "Please check your email and confirm your registration.",
        });
        
        navigate("/app"); // Direct to app if already authenticated
      } else {
        // Store profile data in localStorage to be used after login
        const profileData = {
          first_name: name?.split(' ')[0] || '',
          last_name: name?.split(' ').slice(1).join(' ') || '',
          phone: formData.phone,
          address: formData.address,
          blood_type: formData.bloodType,
          allergies: formData.allergies,
          date_of_birth: dateOfBirth,
          emergency_contact_name: formData.emergencyContact,
          emergency_contact_phone: formData.emergencyPhone,
          emergency_contact_relation: formData.emergencyRelation,
          emergency_contact_email: formData.emergencyEmail,
        };
        
        localStorage.setItem("pendingProfileData", JSON.stringify(profileData));
        
        toast({
          title: "Profile information saved",
          description: "Please check your email and confirm your registration.",
        });
        
        // Clean up session storage
        sessionStorage.removeItem("newUserEmail");
        sessionStorage.removeItem("newUserName");
        
        navigate("/signin");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

        <FillProfileForm 
          onSubmit={handleSubmit}
          isSubmitting={isLoading}
          step={step}
          setStep={setStep}
        />
      </div>
    </div>
  );
};

export default FillProfile;
