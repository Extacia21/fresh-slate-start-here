
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12 animate-fade-in">
      <div className="bg-crisis-red/10 p-4 rounded-full mb-6">
        <AlertCircle className="text-crisis-red h-12 w-12" />
      </div>
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-lg mb-6 text-muted-foreground text-center">
        Oops! This page couldn't be found
      </p>
      <Button onClick={() => navigate("/app")} className="mt-2">
        Return to Home
      </Button>
    </div>
  );
};

export default NotFound;
