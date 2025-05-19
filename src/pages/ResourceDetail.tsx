import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, AlertCircle, HelpCircle, Book, Compass, FileText, 
  Share2, Bookmark, MapPin, ExternalLink, Clock, Phone, 
  CheckCircle, Info, Users, Calendar, HomeIcon, AlertOctagon, List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LocationMap from "@/components/common/LocationMap";
import ShareDialog from "@/components/common/ShareDialog";

interface Resource {
  id: number;
  title: string;
  description: string;
  category: string;
  icon: any;
  isBookmarked: boolean;
  content?: {
    sections: {
      title: string;
      text: string;
    }[];
  };
  location?: {
    address: string;
    coordinates: { lat: number; lng: number };
    hours: string;
    phone: string;
    email?: string;
    website?: string;
    additionalInfo?: string;
    accessibility?: string[];
  };
  links?: { title: string; url: string; description?: string }[];
  lastUpdated?: string;
  checklist?: { item: string; description?: string }[];
  images?: { url: string; caption: string }[];
  faqs?: { question: string; answer: string }[];
  relatedResources?: { id: number; title: string; category: string }[];
}

// Mock data
const mockResourceDetails: Record<string, Resource> = {
  "1": {
    id: 1,
    title: "Earthquake Preparedness Guide",
    description: "Learn how to prepare for, survive during, and recover after an earthquake.",
    category: "guides",
    icon: AlertCircle,
    isBookmarked: true,
    content: {
      sections: [
        {
          title: "Before an Earthquake",
          text: "Secure heavy furniture to walls. Create an emergency kit with water, non-perishable food, medication, and first aid supplies. Establish a family emergency plan including communication and meeting locations. Identify safe spots in each room such as under sturdy tables or against interior walls."
        },
        {
          title: "During an Earthquake",
          text: "Drop to the ground, take Cover under a sturdy table or desk, and Hold On until the shaking stops. Stay away from windows, outside doors, and walls. If outdoors, stay in open areas away from buildings, streetlights, and utility wires. If driving, pull over to a clear location, stop, and stay in the vehicle with seatbelt fastened."
        },
        {
          title: "After an Earthquake",
          text: "Check for injuries and provide first aid if needed. Check for damage to utilities, and shut off services if unsafe conditions exist. Monitor local news for emergency information and instructions. Be prepared for aftershocks which can cause additional damage."
        }
      ]
    },
    checklist: [
      { item: "Create an emergency kit", description: "Include water, food, medications, first aid supplies, flashlight, and battery-powered radio" },
      { item: "Secure heavy furniture to walls", description: "Bookshelves, cabinets, and appliances should be anchored" },
      { item: "Locate utility shutoffs", description: "Know how to turn off gas, water, and electricity" },
      { item: "Establish a family meeting place", description: "Choose locations both in your neighborhood and outside your area" },
      { item: "Store emergency contacts", description: "Keep a written list in case your phone is unavailable" }
    ],
    faqs: [
      { question: "How much water should I store?", answer: "At least one gallon per person per day for a minimum of three days." },
      { question: "Are doorways safe during earthquakes?", answer: "Contrary to popular belief, doorways are not safer than other locations. It's better to take cover under a sturdy table." },
      { question: "How often should I update my emergency kit?", answer: "Check your kit every six months. Replace expired medications and food, update documents, and check batteries." }
    ],
    links: [
      { title: "CDC Earthquake Preparedness", url: "#", description: "Comprehensive guide from the Centers for Disease Control" },
      { title: "FEMA Emergency Supply List", url: "#", description: "Detailed checklist of recommended emergency supplies" }
    ],
    relatedResources: [
      { id: 2, title: "First Aid Basics", category: "guides" },
      { id: 5, title: "Flood Safety", category: "guides" }
    ],
    lastUpdated: "3 months ago"
  },
  "2": {
    id: 2,
    title: "First Aid Basics",
    description: "Essential first aid procedures for common emergency situations.",
    category: "guides",
    icon: HelpCircle,
    isBookmarked: false,
    content: {
      sections: [
        {
          title: "Treating Cuts and Scrapes",
          text: "Clean wound with soap and water. Apply gentle pressure to stop bleeding. Apply antibiotic ointment and cover with a sterile bandage. Change dressing daily and watch for signs of infection."
        },
        {
          title: "CPR Basics",
          text: "Ensure the scene is safe. Check for responsiveness. Call emergency services. Push hard and fast on the center of chest (100-120 compressions per minute). Continue until help arrives."
        },
        {
          title: "Treating Burns",
          text: "For minor burns, cool the area with cool running water for 10-15 minutes. Do not use ice. Cover with a clean, dry bandage. For severe burns, call emergency services immediately."
        },
        {
          title: "Choking Response",
          text: "For a conscious adult, stand behind them and perform the Heimlich maneuver by placing your hands just above their navel and giving quick upward thrusts until the object is dislodged."
        },
        {
          title: "Recognizing Stroke Symptoms",
          text: "Remember FAST: Face drooping, Arm weakness, Speech difficulty, Time to call emergency services. Immediate treatment is crucial for stroke victims."
        }
      ]
    },
    checklist: [
      { item: "Assemble a first aid kit", description: "Include bandages, gauze, adhesive tape, scissors, tweezers, antiseptic wipes" },
      { item: "Learn CPR", description: "Take a certified course from the Red Cross or American Heart Association" },
      { item: "Know emergency numbers", description: "Keep local emergency service numbers accessible" },
      { item: "Recognize allergic reactions", description: "Be aware of signs like swelling, hives, and difficulty breathing" }
    ],
    faqs: [
      { question: "How often should I replace items in my first aid kit?", answer: "Check expiration dates regularly, typically every six months, and replace any expired medications or supplies." },
      { question: "Should I move an injured person?", answer: "Generally, it's best not to move someone with a serious injury unless they're in immediate danger. Moving them could worsen injuries, especially spinal injuries." },
      { question: "When should I seek professional medical help for a burn?", answer: "Seek immediate medical attention for burns that are larger than 3 inches, on the face, hands, feet, genitals, or major joints, or if the burn appears deep (affects multiple layers of skin)." }
    ],
    links: [
      { title: "Red Cross First Aid App", url: "#", description: "Free mobile app with step-by-step instructions" },
      { title: "CPR Training Courses", url: "#", description: "Find local certification classes" }
    ],
    relatedResources: [
      { id: 1, title: "Earthquake Preparedness Guide", category: "guides" },
      { id: 4, title: "Memorial Hospital", category: "locations" }
    ],
    lastUpdated: "6 months ago"
  },
  "3": {
    id: 3,
    title: "Emergency Shelter - City Hall",
    description: "Official emergency shelter with capacity for 200 people. Facilities include food, water, and medical aid.",
    category: "locations",
    icon: MapPin,
    isBookmarked: false,
    location: {
      address: "123 Main Street, Downtown",
      coordinates: { lat: 34.0522, lng: -118.2437 },
      hours: "24/7 during emergencies",
      phone: "(555) 123-4567",
      email: "emergency@cityhall.gov",
      website: "cityhall.gov/emergency",
      additionalInfo: "Backup generator capacity for 72 hours. Pets allowed in designated areas.",
      accessibility: ["Wheelchair accessible", "ADA compliant restrooms", "Interpreter services available"]
    },
    content: {
      sections: [
        {
          title: "Available Services",
          text: "During emergencies, this shelter provides cots, blankets, meals, water, basic medical care, charging stations for devices, and information updates. Staff includes medical professionals, security personnel, and social workers."
        },
        {
          title: "What to Bring",
          text: "Personal medications, important documents, comfort items, change of clothes, personal hygiene items, and special items for children or those with special needs. Food and water are provided."
        },
        {
          title: "Registration Process",
          text: "Upon arrival, all individuals must check in at the registration desk. You'll receive a wristband and be assigned to an area. Please inform staff of any medical conditions or special needs."
        }
      ]
    },
    faqs: [
      { question: "Can I bring my pet?", answer: "Yes, pets are allowed in designated areas. Please bring pet food, carriers, and any medications they need." },
      { question: "How long can I stay?", answer: "The shelter remains open for the duration of the emergency and typically for 24-48 hours after conditions have been deemed safe." },
      { question: "Is transportation available?", answer: "During large-scale emergencies, shuttle services are available from designated pickup points. Call the emergency hotline for current pickup locations." }
    ],
    links: [
      { title: "Shelter Website", url: "#", description: "Current status and capacity updates" },
      { title: "Emergency Alert Signup", url: "#", description: "Register for shelter opening notifications" },
      { title: "Volunteer Opportunities", url: "#", description: "Help staff the shelter during emergencies" }
    ],
    relatedResources: [
      { id: 4, title: "Memorial Hospital", category: "locations" },
      { id: 6, title: "Fire Station #3", category: "locations" }
    ],
    lastUpdated: "2 weeks ago"
  },
  "4": {
    id: 4,
    title: "Memorial Hospital",
    description: "24/7 emergency room services. Located at 1200 North Main Street.",
    category: "locations",
    icon: MapPin,
    isBookmarked: true,
    location: {
      address: "1200 North Main Street, Easton",
      coordinates: { lat: 34.0522, lng: -118.2437 },
      hours: "Emergency services: 24/7, Visitor hours: 8am-8pm",
      phone: "(555) 987-6543",
      email: "info@memorialhospital.org",
      website: "memorialhospital.org",
      additionalInfo: "Level II Trauma Center with helipad. Multiple backup power systems.",
      accessibility: ["Wheelchair accessible entrances", "Translation services", "ASL interpreters available"]
    },
    content: {
      sections: [
        {
          title: "Emergency Department",
          text: "The emergency department is staffed 24/7 by board-certified emergency physicians and trauma specialists. Features include 25 treatment rooms, dedicated trauma bays, and a separate pediatric emergency area."
        },
        {
          title: "Disaster Response Capabilities",
          text: "The hospital maintains disaster response protocols and regularly conducts emergency drills. During major emergencies, the facility can expand capacity by 35% and has supplies to operate independently for up to 96 hours."
        },
        {
          title: "Special Resources",
          text: "Includes burn treatment facilities, decontamination areas for chemical emergencies, and isolation rooms for infectious disease management. The hospital also houses a blood bank and advanced imaging services."
        }
      ]
    },
    faqs: [
      { question: "What insurance plans are accepted?", answer: "The hospital accepts most major insurance plans. During declared emergencies, special billing procedures may be implemented." },
      { question: "Is there a helicopter landing pad?", answer: "Yes, the hospital has a helipad for emergency air transport with 24/7 capability." },
      { question: "Are mental health services available?", answer: "Yes, the emergency department has psychiatric specialists available and a dedicated mental health crisis team." }
    ],
    links: [
      { title: "Hospital Website", url: "#", description: "Information about services and departments" },
      { title: "Emergency Room Wait Times", url: "#", description: "Real-time updates on current wait times" },
      { title: "Patient Portal", url: "#", description: "Access medical records and test results" }
    ],
    relatedResources: [
      { id: 3, title: "Emergency Shelter - City Hall", category: "locations" },
      { id: 2, title: "First Aid Basics", category: "guides" }
    ],
    lastUpdated: "1 week ago"
  }
};

const ResourceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      if (id && mockResourceDetails[id]) {
        setResource(mockResourceDetails[id]);
        setIsBookmarked(mockResourceDetails[id].isBookmarked);
      }
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [id]);

  const handleShareResource = () => {
    setShowShareDialog(true);
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // API call would go here in a real app
  };

  const handleCallPhone = (phone: string) => {
    // In a real app, this would initiate a phone call
    console.log("Calling:", phone);
  };

  const handleOpenWebsite = (website: string) => {
    // In a real app, this would open the website
    console.log("Opening website:", website);
    window.open(`https://${website}`, "_blank");
  };

  const handleOpenMap = (address: string) => {
    // In a real app, this would open maps
    console.log("Opening directions to:", address);
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com?q=${encodedAddress}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-40 w-full mb-4" />
        <Skeleton className="h-6 w-2/3 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-6" />
        <div className="space-y-4 mb-6">
          <div>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="page-container">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">Resource Not Found</h3>
          <p className="text-muted-foreground">
            The resource you're looking for could not be found.
          </p>
          <Button 
            className="mt-6"
            onClick={() => navigate("/app/resources")}
          >
            View All Resources
          </Button>
        </div>
      </div>
    );
  }

  const Icon = resource.icon || FileText;
  const shareUrl = window.location.href;

  return (
    <div className="page-container pb-24 overflow-y-auto">
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-background z-10 py-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(-1)}
          className="p-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleToggleBookmark}
            className="p-2"
          >
            <Bookmark 
              className={`h-5 w-5 ${isBookmarked ? "fill-primary text-primary" : ""}`} 
            />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShareResource}
            className="p-2"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center mb-3">
          <div className={`p-3 rounded-full ${resource.category === 'guides' ? 'bg-primary/10' : 'bg-crisis-blue/10'} mr-3`}>
            <Icon className={`h-6 w-6 ${resource.category === 'guides' ? 'text-primary' : 'text-crisis-blue'}`} />
          </div>
          <div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted uppercase">
              {resource.category === "guides" ? "Guide" : "Location"}
            </span>
            <h1 className="text-xl font-bold">{resource.title}</h1>
          </div>
        </div>
        <p className="text-base mb-3">{resource.description}</p>
        <div className="flex items-center text-xs text-muted-foreground mb-4">
          <Clock className="h-3 w-3 mr-1" /> 
          <span>Last updated: {resource.lastUpdated}</span>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {resource.category === "guides" && <TabsTrigger value="checklist">Checklist</TabsTrigger>}
            {resource.category === "locations" && <TabsTrigger value="details">Details</TabsTrigger>}
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-2">
            {resource.category === "guides" && resource.content && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Guide Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {resource.content.sections.map((section, index) => (
                      <div key={index} className="resource-section">
                        <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
                        <p className="text-sm">{section.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {resource.category === "locations" && resource.location && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Location Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LocationMap location={resource.location.address} className="mb-4" />
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{resource.location.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{resource.location.hours}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{resource.location.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="secondary" 
                      className="w-full"
                      onClick={() => handleOpenMap(resource.location!.address)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleCallPhone(resource.location!.phone)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    {resource.location.website && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleOpenWebsite(resource.location!.website!)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {resource.location && resource.content && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Facility Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {resource.content.sections.map((section, index) => (
                      <div key={index}>
                        <h3 className="text-base font-medium mb-1">{section.title}</h3>
                        <p className="text-sm">{section.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {resource.links && resource.links.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Related Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resource.links.map((link, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <p className="font-medium">{link.title}</p>
                        {link.description && (
                          <p className="text-sm text-muted-foreground mb-2">{link.description}</p>
                        )}
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="w-full"
                          onClick={() => window.open(link.url, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          Open Resource
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {resource.relatedResources && resource.relatedResources.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Compass className="h-5 w-5 mr-2" />
                    Related Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {resource.relatedResources.map((relatedResource, index) => (
                      <div 
                        key={index}
                        className="p-3 border border-border rounded-lg flex items-center justify-between hover:bg-muted cursor-pointer"
                        onClick={() => navigate(`/app/resources/${relatedResource.id}`)}
                      >
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full ${relatedResource.category === 'guides' ? 'bg-primary/10' : 'bg-crisis-blue/10'} mr-3`}>
                            {relatedResource.category === 'guides' ? 
                              <FileText className="h-4 w-4 text-primary" /> : 
                              <MapPin className="h-4 w-4 text-crisis-blue" />
                            }
                          </div>
                          <span>{relatedResource.title}</span>
                        </div>
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {resource.category === "guides" && (
            <TabsContent value="checklist" className="mt-2">
              {resource.checklist && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Preparation Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {resource.checklist.map((item, index) => (
                        <div key={index} className="flex items-start p-3 border-b last:border-0 border-border">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border mr-3 mt-0.5">
                            <CheckCircle className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{item.item}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {resource.category === "locations" && (
            <TabsContent value="details" className="mt-2 space-y-6">
              {resource.location?.accessibility && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Accessibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {resource.location.accessibility.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resource.location?.additionalInfo && (
                    <p className="mb-4">{resource.location.additionalInfo}</p>
                  )}
                  <div className="space-y-2">
                    {resource.location?.email && (
                      <div className="flex items-center">
                        <span className="text-muted-foreground w-20">Email:</span>
                        <span className="font-medium">{resource.location.email}</span>
                      </div>
                    )}
                    {resource.location?.website && (
                      <div className="flex items-center">
                        <span className="text-muted-foreground w-20">Website:</span>
                        <span className="font-medium">{resource.location.website}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="faqs" className="mt-2">
            {resource.faqs && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {resource.faqs.map((faq, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <p className="font-medium mb-1">{faq.question}</p>
                        <p className="text-sm">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ShareDialog 
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        title={resource.title}
        description={resource.description}
        url={shareUrl}
      />
    </div>
  );
};

export default ResourceDetail;
