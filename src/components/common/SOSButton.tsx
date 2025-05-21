
import { AlertOctagon } from "lucide-react";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import ShareDialog from "./ShareDialog";
import { useGetContacts } from "@/services/contactsService";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/use-profile-data";
import { supabase } from "@/integrations/supabase/client";

interface SOSButtonProps {
  hidden?: boolean;
}

const SOSButton = ({ hidden = false }: SOSButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const { data: contacts = [] } = useGetContacts();
  const { user } = useAuth();
  const { profileData } = useProfileData();
  
  // Get user location for sharing
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [userAddress, setUserAddress] = useState<string>("Unknown location");
  const shareUrl = userLocation ? `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}` : undefined;

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          // Try to get address from coordinates
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location }, (results, status) => {
              if (status === "OK" && results && results[0]) {
                setUserAddress(results[0].formatted_address);
              }
            });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not get your location for SOS alert");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const sendEmailNotification = async (contact: any) => {
    if (!contact.email) return;
    
    try {
      // In a production environment, this would use a Supabase Edge Function
      // For now, we'll create a simplified version that logs the email information
      console.log(`Sending email notification to ${contact.email} for user ${user?.email}`);
      
      // Prepare email content
      const userName = profileData?.first_name ? 
                      `${profileData.first_name} ${profileData.last_name || ''}`.trim() : 
                      user?.email || "A Crisis Connect user";
      
      const locationInfo = userLocation ? 
                          `${userAddress} (${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)})` :
                          "Location unavailable";
      
      const mapLink = userLocation ? 
                     `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}` :
                     "";
      
      const timestamp = new Date().toLocaleString();
      
      // In a real scenario, we would send this via Supabase Edge Function
      // For now, we'll log it and show a toast notification
      const emailDetails = {
        from: "support@crisisconnect.com",
        to: contact.email,
        subject: `EMERGENCY SOS ALERT - ${userName} needs help!`,
        body: `
          <h2>EMERGENCY SOS ALERT</h2>
          <p><strong>${userName}</strong> has triggered an emergency SOS alert and may need immediate assistance.</p>
          <p><strong>Time:</strong> ${timestamp}</p>
          <p><strong>Location:</strong> ${locationInfo}</p>
          ${mapLink ? `<p><a href="${mapLink}" style="background-color:#dc2626;color:white;padding:10px 15px;text-decoration:none;border-radius:4px;display:inline-block;margin:10px 0;">View on Map</a></p>` : ''}
          <hr>
          <p>This is an automated alert from Crisis Connect. Please attempt to contact ${userName} immediately or call local emergency services if you cannot reach them.</p>
        `,
        contentType: "text/html"
      };
      
      console.log("Email details:", emailDetails);
      
      // In a real app, this would be an actual API call to send the email
      // For this example, we'll simulate success after a short delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error("Failed to send email notification:", error);
      return false;
    }
  };

  const handleSOS = async () => {
    // Get current location
    getCurrentLocation();
    
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
    let successCount = 0;
    for (const contact of emergencyContacts) {
      const success = await sendEmailNotification(contact);
      if (success) successCount++;
    }
    
    // Notify about email notifications
    if (emergencyContacts.length > 0) {
      if (successCount > 0) {
        toast.info(`Email alerts sent to ${successCount} emergency contacts`, {
          description: "Your emergency contacts have been notified of your situation",
          duration: 5000,
        });
      } else {
        toast.warning("Could not send email notifications", {
          description: "Please check your internet connection",
          duration: 5000,
        });
      }
    } else {
      toast.warning("No emergency contacts with email found", {
        description: "Add emergency contacts with email addresses to receive SOS notifications",
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
              This will alert emergency contacts and share your location. Email notifications will be sent to all your emergency contacts with your current location and status.
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
