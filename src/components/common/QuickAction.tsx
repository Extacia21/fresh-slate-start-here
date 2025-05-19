
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  color?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const QuickAction = ({
  icon: Icon,
  label,
  color = "text-primary",
  onClick,
  className,
  disabled = false,
}: QuickActionProps) => {
  return (
    <button 
      className={cn("quick-action", className, disabled && "opacity-50 cursor-not-allowed")}
      onClick={onClick}
      disabled={disabled}
    >
      <div className={cn("p-2 rounded-lg", color.replace("text-", "bg-") + "/10")}>
        <Icon className={color} size={22} />
      </div>
      <span className="text-xs font-medium text-foreground/80">{label}</span>
    </button>
  );
};

export default QuickAction;
