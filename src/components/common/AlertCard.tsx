
import React from "react";
import { Bell, AlertTriangle, Info, CloudRain, CloudLightning, MapPin, Clock, Shield } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { alertTypeColors } from "@/services/alertsService";
import { formatRelativeTime } from "@/services/alertsService";

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
  
  // Get type color or default to 'other'
  const typeKey = (category || 'other') as keyof typeof alertTypeColors;
  const typeColor = alertTypeColors[typeKey] || alertTypeColors.other;
  
  const severityIndicatorClasses: Record<AlertSeverity, string> = {
    critical: "bg-red-600",
    high: "bg-red-500",
    medium: "bg-orange-500",
    low: "bg-yellow-500",
  };

  // Default icon based on category
  const DefaultIcon = () => {
    if (category === "fire") {
      return <AlertTriangle size={18} className="text-red-600" />;
    }
    if (category === "police") {
      return <Shield size={18} className="text-yellow-600" />;
    }
    if (category === "health") {
      return <Info size={18} className="text-green-600" />;
    }
    if (category === "weather") {
      return <CloudRain size={18} className="text-blue-600" />;
    }
    return <Info size={18} className="text-gray-600" />;
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (id) {
      navigate(`/app/alerts/${id}`);
    }
  };

  // Format time as relative if it's a timestamp
  const formattedTime = time.includes('T') ? formatRelativeTime(time) : time;

  return (
    <div 
      className={cn(
        "relative p-3 border rounded-lg mb-3 hover:bg-muted/30 cursor-pointer", 
        typeColor.border
      )}
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div className={`p-2 rounded-full ${typeColor.bg} mr-3`}>
          {Icon ? <Icon size={18} className={typeColor.text} /> : <DefaultIcon />}
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-1 justify-between">
            <div className="flex items-center">
              <span className={cn("w-2 h-2 rounded-full mr-2", severityIndicatorClasses[severity])}></span>
              <h3 className="font-semibold">{title}</h3>
            </div>
            {category && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor.bg} ${typeColor.text} capitalize`}>
                {category}
              </span>
            )}
          </div>
          <p className="text-sm opacity-90 mb-1">{message}</p>
          <div className="flex items-center justify-between text-xs opacity-70">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formattedTime}
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
