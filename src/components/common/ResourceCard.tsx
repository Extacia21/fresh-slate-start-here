
import { Bookmark, ChevronRight, FileText } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  title: string;
  description: string;
  category: string;
  isBookmarked?: boolean;
  onClick?: () => void;
}

const ResourceCard = ({
  title,
  description,
  category,
  isBookmarked: initialBookmarked = false,
  onClick,
}: ResourceCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  return (
    <div
      className="card-crisis mb-3 transition-transform active:scale-[0.99]"
      onClick={onClick}
    >
      <div className="flex items-center p-4">
        <div className="mr-3 bg-primary/10 p-2 rounded-lg">
          <FileText className="text-primary" size={20} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-xs text-crisis-gray mt-1">{category}</p>
            </div>
            <button
              className="p-1 rounded-full hover:bg-secondary transition-colors"
              onClick={handleBookmark}
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              <Bookmark
                size={18}
                className={cn(
                  "transition-colors",
                  isBookmarked
                    ? "fill-primary text-primary"
                    : "text-crisis-gray"
                )}
              />
            </button>
          </div>
          <p className="text-sm text-foreground/80 mt-2 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
      <div className="border-t border-border p-3 flex justify-between items-center">
        <span className="text-xs text-crisis-gray">Tap to view details</span>
        <ChevronRight size={16} className="text-crisis-gray" />
      </div>
    </div>
  );
};

export default ResourceCard;
