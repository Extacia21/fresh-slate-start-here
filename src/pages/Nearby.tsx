import { useState, useEffect } from "react";
import { ArrowLeft, Building, Heart, MapPin, Navigation, Phone, Search, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LocationMap from "@/components/common/LocationMap";
import { toast } from "sonner";

// Mock nearby locations
const mockLocations = [
  {
    id: 1,
    name: "City Hospital",
    category: "hospital",
    distance: "0.8 miles",
    address: "123 Main Street, Downtown",
    phone: "(555) 123-4567",
    icon: Heart
  },
  {
    id: 2,
    name: "Police Station",
    category: "police",
    distance: "1.2 miles",
    address: "456 Oak Avenue, Westside",
    phone: "(555) 234-5678",
    icon: Shield
  },
  {
    id: 3,
    name: "Community Center",
    category: "shelter",
    distance: "0.5 miles",
    address: "789 Pine Street, Eastside",
    phone: "(555) 345-6789",
    icon: Building
  },
  {
    id: 4,
    name: "St. Mary's Hospital",
    category: "hospital",
    distance: "1.5 miles",
    address: "135 Care Way, Riverside",
    phone: "(555) 456-7890",
    icon: Heart
  },
  {
    id: 5,
    name: "City Fire Station",
    category: "fire",
    distance: "0.7 miles",
    address: "246 Elm Street, Downtown",
    phone: "(555) 567-8901",
    icon: Building
  }
];

const Nearby = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLocations, setFilteredLocations] = useState(mockLocations);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let result = [...mockLocations];
    
    // Apply category filter
    if (activeTab !== "all") {
      result = result.filter(location => location.category === activeTab);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        location => 
          location.name.toLowerCase().includes(query) || 
          location.address.toLowerCase().includes(query)
      );
    }
    
    setFilteredLocations(result);
  }, [activeTab, searchQuery]);

  const handleSelectLocation = (location: any) => {
    setSelectedLocation(location);
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\D/g, '')}`;
    toast.success(`Calling ${phone}`);
  };

  const handleGetDirections = (address: string) => {
    toast.info(`Opening directions to: ${address}`);
    // This would navigate to a map app with directions in a real mobile app
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="page-header border-b border-border">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            <h1 className="text-xl font-bold">Nearby Locations</h1>
          </div>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nearby locations..."
            className="pl-9 pr-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="hospital">Hospitals</TabsTrigger>
            <TabsTrigger value="police">Police</TabsTrigger>
            <TabsTrigger value="shelter">Shelters</TabsTrigger>
            <TabsTrigger value="fire">Fire</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {/* Content is rendered below based on filtered locations */}
          </TabsContent>
          
          <TabsContent value="hospital">
            {/* Hospital specific content would go here */}
          </TabsContent>
          
          <TabsContent value="police">
            {/* Police specific content would go here */}
          </TabsContent>
          
          <TabsContent value="shelter">
            {/* Shelter specific content would go here */}
          </TabsContent>
          
          <TabsContent value="fire">
            {/* Fire station specific content would go here */}
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex-1 grid md:grid-cols-2 gap-4 p-4">
        <div className="overflow-auto pb-24 md:pb-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(item => (
                <div key={item} className="bg-muted animate-pulse h-24 rounded-lg"></div>
              ))}
            </div>
          ) : filteredLocations.length > 0 ? (
            <div className="space-y-3">
              {filteredLocations.map(location => (
                <div
                  key={location.id}
                  className={`p-4 rounded-lg transition-shadow cursor-pointer ${
                    selectedLocation?.id === location.id 
                      ? 'bg-primary/10 shadow-card' 
                      : 'bg-white shadow-subtle hover:shadow-card'
                  }`}
                  onClick={() => handleSelectLocation(location)}
                >
                  <div className="flex">
                    <div className="p-2 rounded-full bg-primary/10 mr-3">
                      <location.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{location.name}</h3>
                      <p className="text-xs text-muted-foreground">{location.distance} away</p>
                      <p className="text-sm mt-1">{location.address}</p>
                    </div>
                  </div>
                  <div className="flex mt-3 space-x-2 justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCall(location.phone);
                      }}
                    >
                      <Phone className="h-3 w-3 mr-1" /> Call
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetDirections(location.address);
                      }}
                    >
                      <Navigation className="h-3 w-3 mr-1" /> Directions
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">No Locations Found</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No results for "${searchQuery}"`
                  : "No locations available for this category"}
              </p>
            </div>
          )}
        </div>

        <div className="hidden md:block h-full min-h-[400px] rounded-lg overflow-hidden border border-border">
          <LocationMap
            location={selectedLocation ? selectedLocation.address : "Current Location"}
            zoom={15}
            showDirections={true}
            className="w-full h-full"
          />
        </div>
      </div>
      
      {selectedLocation && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background md:hidden border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-8"
              onClick={() => setSelectedLocation(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h3 className="font-medium text-sm">{selectedLocation.name}</h3>
          </div>
          <div className="h-40 mb-4 rounded-lg overflow-hidden border border-border">
            <LocationMap
              location={selectedLocation.address}
              zoom={16}
              showDirections={true}
              className="w-full h-full"
            />
          </div>
          <div className="flex space-x-2">
            <Button 
              className="flex-1" 
              variant="outline"
              onClick={() => handleCall(selectedLocation.phone)}
            >
              <Phone className="h-4 w-4 mr-2" /> Call
            </Button>
            <Button 
              className="flex-1" 
              onClick={() => handleGetDirections(selectedLocation.address)}
            >
              <Navigation className="h-4 w-4 mr-2" /> Directions
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nearby;
