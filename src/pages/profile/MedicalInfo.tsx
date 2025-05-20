
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2, Plus, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useProfileData } from "@/hooks/use-profile-data";
import { useUpdateProfile } from "@/services/profileService";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const formSchema = z.object({
  bloodType: z.string().optional(),
  newAllergy: z.string().optional(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  emergencyNotes: z.string().optional(),
});

const MedicalInfo = () => {
  const { profileData, isLoading } = useProfileData();
  const { user } = useAuth();
  const [allergies, setAllergies] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const updateProfile = useUpdateProfile();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bloodType: "",
      newAllergy: "",
      medicalConditions: "",
      medications: "",
      emergencyNotes: "",
    },
  });

  useEffect(() => {
    if (profileData) {
      // Parse allergies from comma-separated string to array
      const allergiesArray = profileData.allergies
        ? profileData.allergies.split(",").filter(Boolean)
        : [];
      setAllergies(allergiesArray);
      
      form.reset({
        bloodType: profileData.blood_type || "",
        medicalConditions: profileData.medical_conditions || "",
        medications: profileData.medications || "",
        emergencyNotes: profileData.emergency_notes || "",
        newAllergy: "",
      });
    }
  }, [profileData, form]);

  const addAllergy = () => {
    const newAllergy = form.getValues("newAllergy");
    if (newAllergy && !allergies.includes(newAllergy)) {
      setAllergies([...allergies, newAllergy]);
      form.setValue("newAllergy", "");
    }
  };

  const removeAllergy = (allergyToRemove: string) => {
    setAllergies(allergies.filter(allergy => allergy !== allergyToRemove));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const allergiesString = allergies.join(",");
      
      await updateProfile.mutateAsync({
        blood_type: values.bloodType,
        allergies: allergiesString,
        medical_conditions: values.medicalConditions,
        medications: values.medications,
        emergency_notes: values.emergencyNotes,
      });
      
      toast.success("Medical information saved");
    } catch (error) {
      toast.error("Failed to save medical information");
      console.error("Error saving medical info:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading medical information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pb-20">
      <div className="flex items-center mb-6">
        <Link to="/app/profile" className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Medical Information</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="bloodType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood Type</FormLabel>
                <FormControl>
                  <Input placeholder="A+, B-, O+, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel htmlFor="allergies">Allergies</FormLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {allergies.map((allergy, index) => (
                <Badge key={index} variant="outline" className="pl-3">
                  {allergy}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 ml-1"
                    onClick={() => removeAllergy(allergy)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {allergies.length === 0 && (
                <p className="text-sm text-muted-foreground">No allergies added</p>
              )}
            </div>
            
            <div className="flex mt-2">
              <FormField
                control={form.control}
                name="newAllergy"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Add allergy..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="ml-2"
                onClick={addAllergy}
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>

          <FormField
            control={form.control}
            name="medicalConditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medical Conditions</FormLabel>
                <FormControl>
                  <Input placeholder="Any existing medical conditions..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="medications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Medications</FormLabel>
                <FormControl>
                  <Input placeholder="List of medications you're taking..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emergencyNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Notes</FormLabel>
                <FormControl>
                  <Input placeholder="Any additional information for emergency responders..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Medical Information"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default MedicalInfo;
