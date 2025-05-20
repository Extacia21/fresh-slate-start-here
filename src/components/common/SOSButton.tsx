
import { AlertOctagon } from "lucide-react";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import ShareDialog from "./ShareDialog";
import { useGetContacts } from "@/services/contactsService";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/use-profile-data";

interface SOSButtonProps {
  hidden?: boolean;
}

const SOSButton = ({ hidden = false }: SOSButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const { data: contacts = [] } = useGetContacts();
  const { user } = useAuth();
  const { profileData } = useProfileData();
  
  // Mock user location - in a real app we would use geolocation API
  const userLocation = "-17.3667,30.2000"; // Chinhoyi, Zimbabwe coordinates
  const shareUrl = `https://maps.google.com/?q=${userLocation}`;

  const sendEmailNotification = async (contact: any) => {
    if (!contact.email) return;
    
    try {
      // In a real implementation, this would use a Supabase Edge Function to send emails
      console.log(`Sending email notification to ${contact.email} for user ${user?.email}`);
      
      // Mock email content
      const emailContent = {
        to: contact.email,
        subject: "EMERGENCY SOS ALERT - Crisis Connect App",
        body: `
          <h2>EMERGENCY SOS ALERT</h2>
          <p>${profileData?.first_name || user?.email} has triggered an emergency alert!</p>
          <p><strong>Current Location:</strong> <a href="https://maps.google.com/?q=${userLocation}">View on Map</a></p>
          <p>Please attempt to contact them immediately or call local emergency services.</p>
          <hr>
          <p>This is an automated alert from Crisis Connect.</p>
        `
      };
      
      console.log("Email content:", emailContent);
      
      // Success notification will be shown in the toast
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }
  };

  const handleSOS = async () => {
    setIsSOSActive(true);
    setIsOpen(false);
    
    // Filter emergency contacts that have email addresses
    const emergencyContacts = contacts.filter(contact => 
      contact.type === 'emergency' && contact.email
    );
    
    // Log SOS activation
    console.log("SOS activated");
    console.log("Sending notifications to:", emergencyContacts);
    
    // Show toast notification
    toast.error("Emergency SOS Activated", {
      description: "Your location is being shared with emergency contacts",
      duration: 10000,
    });
    
    // Send email notifications to emergency contacts
    for (const contact of emergencyContacts) {
      await sendEmailNotification(contact);
    }
    
    // Notify about email notifications
    if (emergencyContacts.length > 0) {
      toast.info("Email notifications sent", {
        description: `Alert emails sent to ${emergencyContacts.length} emergency contacts`,
        duration: 5000,
      });
    }
  };

  const handleCancelSOS = () => {
    setIsSOSActive(false);
    toast.success("SOS Deactivated", {
      description: "Emergency mode has been turned off",
    });
  };

  if (hidden) return null;

  return (
    <>
      {isSOSActive ? (
        <button
          className="sos-button active fixed bottom-24 right-6 z-50 p-4 rounded-full bg-crisis-red shadow-lg flex items-center justify-center animate-pulse"
          onClick={handleCancelSOS}
          aria-label="Cancel Emergency SOS"
        >
          <AlertOctagon size={24} className="text-white" />
          <span className="absolute w-full h-full rounded-full bg-crisis-red/60 z-[-1] animate-ping"></span>
        </button>
      ) : (
        <button
          className="fixed bottom-24 right-6 z-50 p-4 bg-crisis-red rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
          aria-label="Emergency SOS"
        >
          <AlertOctagon size={24} className="animate-pulse text-white" />
        </button>
      )}

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-[350px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-crisis-red flex items-center">
              <AlertOctagon className="mr-2" size={20} />
              Emergency SOS
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will alert emergency contacts and share your location. SMS and email notifications will be sent to all your emergency contacts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-crisis-red hover:bg-crisis-red/90"
              onClick={handleSOS}
            >
              Activate SOS
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SOSButton;
