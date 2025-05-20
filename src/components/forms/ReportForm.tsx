
import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { useCreateReport } from "@/services/reportsService";
import { useAuth } from "@/contexts/AuthContext";

export interface ReportFormProps {
  children: React.ReactNode;
}

const ReportForm = ({ children }: ReportFormProps) => {
  const { user } = useAuth();
  const createReportMutation = useCreateReport();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incidentType, setIncidentType] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [severity, setSeverity] = useState<"critical" | "high" | "medium" | "low">("medium");
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);

  // Get current location on component mount
  useEffect(() => {
    handleUseCurrentLocation();
  }, []); // Empty dependency array means this runs once on mount

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user) {
      toast.error("You need to be logged in to submit a report");
      return;
    }
    
    if (!incidentType || !title || !description) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (!location) {
      setLocation("Unknown location");
    }
    
    setIsSubmitting(true);
    
    try {
      const reportData = {
        title,
        description,
        category: incidentType,
        type: incidentType,
        location: location || "Unknown location",
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        is_public: true,
        severity: severity
      };
      
      await createReportMutation.mutateAsync(reportData);
      
      toast.success("Report submitted successfully", {
        description: "Thank you for your report. Authorities have been notified."
      });
      
      // Reset form
      setIncidentType("");
      setTitle("");
      setLocation("");
      setDescription("");
      setLatitude(null);
      setLongitude(null);
      setSeverity("medium");
      
      // Get current location again for next report
      handleUseCurrentLocation();
    } catch (error) {
      toast.error("Failed to submit report", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocation("Current location");
          setUseCurrentLocation(true);
          toast.info("Using your current location");
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not get your location. Please enter it manually.");
          setUseCurrentLocation(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setUseCurrentLocation(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader className="mb-4">
          <SheetTitle>Report an Incident</SheetTitle>
          <SheetDescription>
            Fill out this form to report an emergency or incident in your area.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="incidentType">Incident Type</Label>
            <Select 
              value={incidentType} 
              onValueChange={setIncidentType}
              required
            >
              <SelectTrigger id="incidentType">
                <SelectValue placeholder="Select incident type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fire">Fire</SelectItem>
                <SelectItem value="police">Police</SelectItem>
                <SelectItem value="health">Medical Emergency</SelectItem>
                <SelectItem value="weather">Weather Emergency</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <Select 
              value={severity} 
              onValueChange={(value: "critical" | "high" | "medium" | "low") => setSeverity(value)}
              required
            >
              <SelectTrigger id="severity">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="Brief title for the incident" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="location">Location</Label>
              <div className="flex items-center">
                <span className="text-xs mr-2">{useCurrentLocation ? 'Using current location' : 'Enter manually'}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs flex items-center"
                  onClick={handleUseCurrentLocation}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {useCurrentLocation ? 'Refresh location' : 'Use my location'}
                </Button>
              </div>
            </div>
            <Input 
              id="location" 
              placeholder="Enter location" 
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (e.target.value !== "Current location") {
                  setUseCurrentLocation(false);
                }
              }}
              required
              readOnly={useCurrentLocation}
              className={useCurrentLocation ? "bg-muted" : ""}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe the incident in detail" 
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="resize-none"
            />
          </div>
          
          <SheetFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <SheetClose asChild>
              <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
            </SheetClose>
            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-crisis-red hover:bg-crisis-red/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ReportForm;
