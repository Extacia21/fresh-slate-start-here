
import { Phone, MessageSquare, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ContactCardProps {
  name: string;
  phone: string;
  type: "emergency" | "personal" | "service";
  isFavorite?: boolean;
  onCall?: () => void;
  onMessage?: () => void;
}

const ContactCard = ({
  name,
  phone,
  type,
  isFavorite: initialFavorite = false,
  onCall,
  onMessage,
}: ContactCardProps) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const typeColors = {
    emergency: "text-crisis-red",
    personal: "text-crisis-blue",
    service: "text-crisis-gray",
  };

  return (
    <div className="card-crisis mb-3">
      <div className="flex items-center p-4">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{name}</h3>
              <p className={cn("text-xs mt-0.5", typeColors[type])}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </p>
            </div>
            <button
              className="p-1 rounded-full hover:bg-secondary transition-colors"
              onClick={handleFavorite}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star
                size={18}
                className={cn(
                  "transition-colors",
                  isFavorite
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-crisis-gray"
                )}
              />
            </button>
          </div>
          <p className="text-sm text-foreground/70 mt-2">{phone}</p>
        </div>
      </div>
      <div className="border-t border-border p-3 flex justify-between items-center">
        <div className="space-x-3">
          <button
            className="p-2 rounded-full bg-crisis-blue/10 text-crisis-blue hover:bg-crisis-blue/20 transition-colors"
            onClick={onMessage}
            aria-label={`Message ${name}`}
          >
            <MessageSquare size={18} />
          </button>
          <button
            className="p-2 rounded-full bg-crisis-green/10 text-crisis-green hover:bg-crisis-green/20 transition-colors"
            onClick={onCall}
            aria-label={`Call ${name}`}
          >
            <Phone size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
