
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, MapPin, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";

const onboardingSlides = [
  {
    icon: Shield,
    title: "Stay Safe During Emergencies",
    description: "Access critical information, alerts, and resources to help you navigate through emergencies safely.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: MapPin,
    title: "Find Resources Near You",
    description: "Quickly locate emergency services, shelters, and other vital resources in your area when you need them most.",
    color: "text-crisis-blue",
    bgColor: "bg-crisis-blue/10",
  },
  {
    icon: AlertCircle,
    title: "Real-time Alerts & Notifications",
    description: "Receive timely alerts about emergencies in your area so you can take immediate action to stay safe.",
    color: "text-crisis-red",
    bgColor: "bg-crisis-red/10",
  },
];

const Onboarding = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (activeSlide < onboardingSlides.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else {
      // Completed onboarding
      localStorage.setItem("hasSeenOnboarding", "true");
      navigate("/signin");
    }
  };

  const handlePrevious = () => {
    if (activeSlide > 0) {
      setActiveSlide(activeSlide - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/signin");
  };

  const slide = onboardingSlides[activeSlide];
  const Icon = slide.icon;

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-sm w-full flex flex-col items-center">
          <div className={`p-5 rounded-full ${slide.bgColor} mb-8 animate-scale`}>
            <Icon className={`h-12 w-12 ${slide.color}`} />
          </div>
          <h1 className="text-2xl font-bold mb-3 text-center animate-fade-in">
            {slide.title}
          </h1>
          <p className="text-center text-muted-foreground mb-8 animate-fade-in delay-100">
            {slide.description}
          </p>

          <div className="flex justify-center space-x-2 mb-10">
            {onboardingSlides.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                  index === activeSlide ? "bg-primary" : "bg-primary/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-border">
        <div className="flex justify-between items-center">
          {activeSlide > 0 ? (
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              className="px-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip
            </Button>
          )}

          <Button onClick={handleNext} className="px-4">
            {activeSlide < onboardingSlides.length - 1 ? (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
