
import React from "react";
import { Bell, AlertTriangle, Info, CloudRain, CloudLightning, MapPin, Clock } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type AlertSeverity = "critical" | "high" | "medium" | "low";

interface AlertCardProps {
  title: string;
  message: string;
  severity: AlertSeverity;
  time: string;
  icon?: LucideIcon;
  location?: string;
  category?: string;
  id?: number | string; // Accept both number and string IDs
  onClick?: () => void;
}

const AlertCard = ({ 
  title, 
  message, 
  severity, 
  time, 
  icon: Icon, 
  location, 
  category, 
  id, 
  onClick 
}: AlertCardProps) => {
  const navigate = useNavigate();
  
  const alertClasses: Record<AlertSeverity, string> = {
    critical: "alert-critical",
    high: "alert-high",
    medium: "alert-medium",
    low: "alert-low",
  };

  const severityIndicatorClasses: Record<AlertSeverity, string> = {
    critical: "severity-critical",
    high: "severity-high",
    medium: "severity-medium",
    low: "severity-low",
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical": return "bg-red-600";
      case "high": return "bg-red-500";
      case "medium": return "bg-orange-500";
      case "low": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  // Default icon based on category and severity if no specific icon is provided
  const DefaultIcon = () => {
    if (category === "weather") {
      return severity === "critical" || severity === "high" 
        ? <CloudLightning size={18} /> 
        : <CloudRain size={18} />;
    }
    
    if (severity === "critical" || severity === "high") {
      return <AlertTriangle size={18} />;
    }
    
    return <Info size={18} />;
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (id) {
      navigate(`/app/alerts/${id}`);
    }
  };

  return (
    <div 
      className={cn(
        "relative p-3 border border-border rounded-lg mb-3 hover:bg-muted/30 cursor-pointer", 
        alertClasses[severity]
      )}
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div className={`p-2 rounded-full ${getSeverityColor(severity)} bg-opacity-20 mr-3`}>
          {Icon ? <Icon size={18} /> : <DefaultIcon />}
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-1 justify-between">
            <div className="flex items-center">
              <span className={cn("w-2 h-2 rounded-full mr-2", severityIndicatorClasses[severity])}></span>
              <h3 className="font-semibold">{title}</h3>
            </div>
            {category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">
                {category}
              </span>
            )}
          </div>
          <p className="text-sm opacity-90 mb-1">{message}</p>
          <div className="flex items-center justify-between text-xs opacity-70">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {time}
            </span>
            {location && (
              <span className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {location}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
