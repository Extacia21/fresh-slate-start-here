
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavedResource {
  id: string;
  title: string;
  category: string;
  isSaved: boolean;
}

const SavedResources = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<SavedResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading saved resources
    setTimeout(() => {
      const mockResources: SavedResource[] = [
        { 
          id: "1", 
          title: "Flood Safety Guide", 
          category: "Safety Tips", 
          isSaved: true 
        },
        { 
          id: "2", 
          title: "Emergency Kit Checklist", 
          category: "Preparation", 
          isSaved: true 
        },
        { 
          id: "3", 
          title: "Local Evacuation Centers", 
          category: "Evacuation", 
          isSaved: true 
        },
        { 
          id: "4", 
          title: "First Aid Best Practices", 
          category: "Medical", 
          isSaved: true 
        }
      ];
      
      setResources(mockResources);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleResourceClick = (id: string) => {
    navigate(`/app/resources/${id}`);
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Saved Resources</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div 
              key={item} 
              className="bg-muted animate-pulse h-20 rounded-lg"
            ></div>
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div className="space-y-3">
          {resources.map((resource) => (
            <button
              key={resource.id}
              className="w-full flex items-center justify-between p-4 bg-card rounded-lg shadow-subtle hover:bg-accent/50 transition-colors"
              onClick={() => handleResourceClick(resource.id)}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Bookmark className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">{resource.title}</h3>
                  <p className="text-xs text-muted-foreground">{resource.category}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted rounded-lg">
          <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
          <h3 className="text-xl font-medium mb-2">No Saved Resources</h3>
          <p className="text-muted-foreground mb-6">Save resources for quick access during emergencies</p>
          <Button onClick={() => navigate("/app/resources")}>
            Browse Resources
          </Button>
        </div>
      )}

      <div className="mt-8">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate("/app/profile")}
        >
          Back to Profile
        </Button>
      </div>
    </div>
  );
};

export default SavedResources;
