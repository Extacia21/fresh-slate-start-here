
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, MapPin, AlertCircle, Camera, X, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import LocationMap from "@/components/common/LocationMap";
import { useState, useEffect, useRef } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateReport } from "@/services/reportsService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ReportIncident = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createReportMutation = useCreateReport();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [incidentType, setIncidentType] = useState("weather");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [severity, setSeverity] = useState<"critical" | "high" | "medium" | "low">("medium");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoURLs, setPhotoURLs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []); // Empty dependency array means this runs once on mount
  
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setLocation(address);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You need to be logged in to submit a report");
      return;
    }
    
    if (!title || !description) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (!location) {
      setLocation("Unknown location");
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload photos if any
      const uploadedPhotoURLs: string[] = [];
      
      if (photos.length > 0) {
        toast.info("Uploading photos...");
        
        for (const photo of photos) {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `reports/${user.id}/${fileName}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('reports')
            .upload(filePath, photo);
          
          if (uploadError) {
            console.error("Error uploading photo:", uploadError);
            continue;
          }
          
          // Get public URL
          const { data: publicURLData } = supabase.storage
            .from('reports')
            .getPublicUrl(filePath);
            
          if (publicURLData && publicURLData.publicUrl) {
            uploadedPhotoURLs.push(publicURLData.publicUrl);
          }
        }
      }
      
      const reportData = {
        title,
        description,
        category: incidentType,
        type: incidentType,
        location: location || "Unknown location",
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        is_public: true,
        severity: severity,
        photos: uploadedPhotoURLs.length > 0 ? uploadedPhotoURLs : undefined,
      };
      
      await createReportMutation.mutateAsync(reportData);
      
      toast.success("Report submitted successfully", {
        description: "Thank you for your report. Authorities have been notified."
      });
      navigate("/app");
    } catch (error) {
      toast.error("Failed to submit report", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
      setIsSubmitting(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocation("Current Location");
          setUseCurrentLocation(true);
          toast.info("Using your current location", {
            description: "Your location has been automatically detected",
          });
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
  
  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Limit to 3 photos
      if (photos.length + e.target.files.length > 3) {
        toast.error("You can only upload up to 3 photos");
        return;
      }
      
      // Convert FileList to array and add to photos state
      const newPhotos = Array.from(e.target.files);
      setPhotos([...photos, ...newPhotos]);
      
      // Create object URLs for preview
      const newPhotoURLs = newPhotos.map(photo => URL.createObjectURL(photo));
      setPhotoURLs([...photoURLs, ...newPhotoURLs]);
    }
  };
  
  // Remove photo
  const removePhoto = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(photoURLs[index]);
    
    // Remove photo from arrays
    const newPhotos = [...photos];
    const newPhotoURLs = [...photoURLs];
    newPhotos.splice(index, 1);
    newPhotoURLs.splice(index, 1);
    
    setPhotos(newPhotos);
    setPhotoURLs(newPhotoURLs);
  };
  
  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      photoURLs.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);
  
  // Get current location on component mount if using current location
  useEffect(() => {
    if (useCurrentLocation) {
      getCurrentLocation();
    }
  }, [useCurrentLocation]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="page-header border-b border-border">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-crisis-red" />
              Report Incident
            </h1>
            <p className="text-xs text-muted-foreground">
              Report an emergency situation or incident in your area
            </p>
          </div>
        </div>
      </div>
      
      <div className="page-container">
        <form onSubmit={handleSubmit} className="space-y-6 pb-24">
          <div className="space-y-4">
            <Label className="text-base font-medium">Incident Type</Label>
            <RadioGroup 
              defaultValue="weather" 
              value={incidentType}
              onValueChange={setIncidentType}
              className="grid grid-cols-2 gap-2"
            >
              <Label htmlFor="weather" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="weather" id="weather" className="sr-only" />
                <AlertCircle className="mb-3 h-6 w-6 text-blue-600" />
                <span className="text-sm">Weather Emergency</span>
              </Label>
              <Label htmlFor="fire" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="fire" id="fire" className="sr-only" />
                <span className="text-2xl mb-2">🔥</span>
                <span className="text-sm text-red-600">Fire</span>
              </Label>
              <Label htmlFor="health" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="health" id="health" className="sr-only" />
                <span className="text-2xl mb-2">🏥</span>
                <span className="text-sm text-green-600">Medical</span>
              </Label>
              <Label htmlFor="police" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="police" id="police" className="sr-only" />
                <span className="text-2xl mb-2">🚓</span>
                <span className="text-sm text-yellow-600">Police</span>
              </Label>
            </RadioGroup>
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
              placeholder="Brief description of the incident" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Provide details about the incident" 
              className="min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          {/* Photo upload section */}
          <div className="space-y-3">
            <Label className="flex justify-between items-center">
              <span>Photos <span className="text-xs text-muted-foreground">(Up to 3)</span></span>
              <span className="text-xs text-muted-foreground">{photos.length}/3</span>
            </Label>
            
            <div className="grid grid-cols-3 gap-2">
              {/* Photo previews */}
              {photoURLs.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                  <img 
                    src={url} 
                    alt={`Photo ${index + 1}`} 
                    className="object-cover w-full h-full"
                  />
                  <button 
                    type="button"
                    className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              
              {/* Upload button (only show if less than 3 photos) */}
              {photos.length < 3 && (
                <button
                  type="button"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md aspect-square hover:bg-accent/5 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Add photo</span>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                    onChange={handlePhotoUpload}
                  />
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Location</Label>
              <div className="flex items-center space-x-2">
                <span className="text-xs">{useCurrentLocation ? 'Using current location' : 'Enter manually'}</span>
                <button 
                  type="button"
                  className={`relative h-5 w-10 rounded-full transition-colors
                    ${useCurrentLocation ? 'bg-primary' : 'bg-muted'}`}
                  onClick={() => {
                    setUseCurrentLocation(!useCurrentLocation);
                    if (!useCurrentLocation) {
                      getCurrentLocation();
                    }
                  }}
                >
                  <span 
                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform
                      ${useCurrentLocation ? 'translate-x-5' : ''}`} 
                  />
                </button>
              </div>
            </div>
            
            {useCurrentLocation ? (
              <div className="rounded-md border overflow-hidden">
                <LocationMap 
                  location="Current Location" 
                  interactive={true}
                  onLocationSelect={handleLocationSelect}
                />
                <div className="p-2 bg-muted/30 text-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  Using your current location
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Input 
                  placeholder="Enter address or description of location" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
          
          <div className="pt-6">
            <Button 
              type="submit" 
              className="w-full bg-crisis-red hover:bg-crisis-red/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIncident;
