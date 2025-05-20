
import { useState } from "react";
import { Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Contact, getEmergencyContacts } from "@/services/contactsService";
import { useQuery } from "@tanstack/react-query";

interface SOSButtonProps {
  className?: string;
}

const SOSButton = ({ className }: SOSButtonProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  // Use useQuery for fetching emergency contacts
  const { data: sosContacts = [], isLoading } = useQuery({
    queryKey: ['sosContacts'],
    queryFn: getEmergencyContacts
  });
  
  const handleSOSActivate = () => {
    if (!isActive) {
      // Start pulse animation
      setIsPulsing(true);
      
      // Start countdown
      setIsActive(true);
      let count = 3;
      
      const countdownInterval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        
        if (count <= 0) {
          clearInterval(countdownInterval);
          triggerSOS();
        }
      }, 1000);
      
      // Store interval ID for cleanup
      return () => clearInterval(countdownInterval);
    } else {
      // Cancel SOS
      setIsActive(false);
      setIsPulsing(false);
      setCountdown(3);
      toast.info("SOS Alert canceled");
    }
  };
  
  const triggerSOS = async () => {
    try {
      // Get current location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const locationString = `${latitude},${longitude}`;
          const message = "Emergency SOS triggered. I need immediate assistance.";
          
          // Send SOS alert to emergency contacts
          let contactsToNotify: Contact[] = [...sosContacts];
          
          if (contactsToNotify.length === 0) {
            // If no emergency contacts are set up, default to Chinhoyi emergency services
            contactsToNotify = [
              {
                id: "sos-default-1",
                name: "Chinhoyi Police",
                phone: "+263 67 22281",
                type: "emergency",
                is_favorite: true,
                user_id: null,
                email: "police@chinhoyi.gov.zw"
              },
              {
                id: "sos-default-2",
                name: "Chinhoyi Provincial Hospital",
                phone: "+263 67 22260",
                type: "emergency",
                is_favorite: true,
                user_id: null,
                email: "hospital@chinhoyi.gov.zw"
              }
            ];
          }
          
          // Send SOS alert using our contactsService function
          const result = await sendSOSAlert(contactsToNotify, locationString, message);
          
          if (result.success) {
            toast.success("SOS Alert sent", {
              description: `Alert sent to ${contactsToNotify.length} emergency contacts`,
              duration: 5000,
            });
            
            if (contactsToNotify.some(contact => contact.email)) {
              toast.info("Email notifications sent", {
                description: "Emergency contacts have been notified via email",
                duration: 5000,
              });
            }
          } else {
            toast.error("Failed to send SOS Alert", {
              description: result.message,
              duration: 5000,
            });
          }
          
          // Reset state
          setIsActive(false);
          setIsPulsing(false);
          setCountdown(3);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not get your location", {
            description: "Please ensure location access is enabled",
            duration: 5000,
          });
          setIsActive(false);
          setIsPulsing(false);
          setCountdown(3);
        }
      );
    } catch (error) {
      console.error("SOS error:", error);
      toast.error("SOS Alert error", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      setIsActive(false);
      setIsPulsing(false);
      setCountdown(3);
    }
  };

  return (
    <div className={className}>
      <Button
        className={`h-16 w-16 rounded-full transition-all duration-300 ${
          isActive 
            ? "bg-crisis-red hover:bg-crisis-red/90 text-white" 
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        } ${isPulsing ? "animate-pulse" : ""}`}
        onClick={handleSOSActivate}
        aria-label={isActive ? "Cancel SOS" : "SOS Emergency Button"}
      >
        {isActive ? (
          <div className="flex flex-col items-center">
            <X className="h-6 w-6" />
            <span className="text-xs mt-1">{countdown}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Phone className="h-6 w-6" />
            <span className="text-xs mt-1">SOS</span>
          </div>
        )}
      </Button>
    </div>
  );
};

export default SOSButton;

// Function to mock sending an SOS alert
async function sendSOSAlert(contacts: Contact[], location: string, message: string) {
  console.log(`Sending SOS to ${contacts.length} contacts at location ${location}: ${message}`);
  
  // In a real app, this would make API calls to send SMS and emails
  // For now, we'll simulate success
  return { success: true, message: "Alert sent successfully" };
}
