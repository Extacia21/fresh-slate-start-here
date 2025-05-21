import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Camera, MapPin, AlertCircle, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import LocationMap from "@/components/common/LocationMap";
import { useState, useEffect, useRef } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoURLs, setPhotoURLs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You need to be logged in to submit a report");
      return;
    }
    
    if (!title || !location || !description) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload images if any
      let uploadedPhotoPaths: string[] = [];
      
      if (photos.length > 0) {
        // Create progress toast
        toast("Uploading images...", {
          duration: 10000,
          id: "upload-progress"
        });
        
        for (const photo of photos) {
          const fileName = `${user.id}/${Date.now()}-${photo.name}`;
          const { data, error } = await supabase.storage
            .from('report-photos')
            .upload(fileName, photo);
            
          if (error) {
            console.error("Error uploading image:", error);
            throw new Error(`Failed to upload image: ${error.message}`);
          }
          
          if (data) {
            uploadedPhotoPaths.push(data.path);
          }
        }
        
        // Dismiss progress toast
        toast.dismiss("upload-progress");
        toast.success("Images uploaded successfully");
      }
      
      // Create report only (removed alert creation)
      await createReportMutation.mutateAsync({
        title,
        description,
        category: incidentType,
        location,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        is_public: true,
        photos: uploadedPhotoPaths.length > 0 ? uploadedPhotoPaths : undefined
      });
      
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
          
          // Try to get address from coordinates
          fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=AIzaSyDp9ZnLPvebOjH8MYt8f0zpqYK4mRSlAts`)
            .then(response => response.json())
            .then(data => {
              if (data.results && data.results[0]) {
                setLocation(data.results[0].formatted_address);
              }
            })
            .catch(error => {
              console.error("Error getting address:", error);
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
  
  // Get current location on component mount if using current location
  useEffect(() => {
    if (useCurrentLocation) {
      getCurrentLocation();
    }
  }, [useCurrentLocation]);
  
  const handleLocationSelect = (pos: { lat: number; lng: number }) => {
    setLatitude(pos.lat);
    setLongitude(pos.lng);
    
    // Try to get address from coordinates
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${pos.lat},${pos.lng}&key=AIzaSyDp9ZnLPvebOjH8MYt8f0zpqYK4mRSlAts`)
      .then(response => response.json())
      .then(data => {
        if (data.results && data.results[0]) {
          setLocation(data.results[0].formatted_address);
        }
      })
      .catch(error => {
        console.error("Error getting address:", error);
      });
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Check if adding these files would exceed the limit
      if (photos.length + selectedFiles.length > 3) {
        toast.error("You can only upload up to 3 photos");
        return;
      }
      
      setPhotos(prev => [...prev, ...selectedFiles]);
      
      // Generate URLs for preview
      const newURLs = selectedFiles.map(file => URL.createObjectURL(file));
      setPhotoURLs(prev => [...prev, ...newURLs]);
    }
  };
  
  const handleRemovePhoto = (index: number) => {
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(photoURLs[index]);
    
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoURLs(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleCapturePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
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
                <AlertCircle className="mb-3 h-6 w-6" />
                <span className="text-sm">Weather Emergency</span>
              </Label>
              <Label htmlFor="fire" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="fire" id="fire" className="sr-only" />
                <span className="text-2xl mb-2">🔥</span>
                <span className="text-sm">Fire</span>
              </Label>
              <Label htmlFor="health" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="health" id="health" className="sr-only" />
                <span className="text-2xl mb-2">🏥</span>
                <span className="text-sm">Medical</span>
              </Label>
              <Label htmlFor="other" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="other" id="other" className="sr-only" />
                <AlertTriangle className="mb-3 h-6 w-6" />
                <span className="text-sm">Other</span>
              </Label>
            </RadioGroup>
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
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Location</Label>
              <div className="flex items-center space-x-2">
                <span className="text-xs">Use my location</span>
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
            
            <div className="rounded-md border overflow-hidden">
              <LocationMap 
                location={location || "Current Location"} 
                latitude={latitude || undefined}
                longitude={longitude || undefined}
                onLocationSelect={!useCurrentLocation ? handleLocationSelect : undefined}
              />
            </div>
            
            {!useCurrentLocation && (
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
          
          <div className="space-y-2">
            <Label>Add Photos (max 3)</Label>
            <div className="grid grid-cols-3 gap-2">
              {photoURLs.map((url, index) => (
                <div key={index} className="relative aspect-square border rounded-md overflow-hidden">
                  <img 
                    src={url} 
                    alt={`Upload ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {photos.length < 3 && (
                <div 
                  className="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={handleCapturePhoto}
                >
                  <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Add Photo</span>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handlePhotoChange}
                    multiple={photos.length < 2}
                  />
                </div>
              )}
            </div>
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
