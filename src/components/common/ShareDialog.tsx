
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Facebook,
  Twitter,
  Link,
  Copy,
  Send,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
  description?: string;
  isEmergency?: boolean;
}

const ShareDialog = ({ 
  open, 
  onOpenChange, 
  title, 
  url, 
  description, 
  isEmergency = false 
}: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`;
    window.open(shareUrl, "_blank", "width=600,height=400");
    onOpenChange(false);
    toast.success("Opening Facebook share dialog");
  };

  const shareViaTwitter = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "width=600,height=400");
    onOpenChange(false);
    toast.success("Opening Twitter share dialog");
  };

  const shareViaSMS = () => {
    const smsUrl = `sms:?body=${encodeURIComponent(`${title} - ${url}`)}`;
    window.open(smsUrl);
    onOpenChange(false);
    toast.success("Opening SMS app");
  };

  const shareViaEmail = () => {
    const emailUrl = `mailto:?subject=${encodeURIComponent(isEmergency ? "EMERGENCY ALERT" : title)}&body=${encodeURIComponent(`${description || title}\n\n${url}`)}`;
    window.open(emailUrl);
    onOpenChange(false);
    toast.success("Opening email client");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEmergency ? "Emergency Alert" : "Share"}</DialogTitle>
          <DialogDescription>
            {isEmergency 
              ? "Share your emergency status and location with others."
              : `Share this ${description ? "information" : "alert"} with others.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 mt-2">
          <div className="grid flex-1 gap-2">
            <Input
              value={url}
              readOnly
              className="font-mono text-sm"
            />
          </div>
          <Button 
            type="submit" 
            size="icon" 
            onClick={handleCopyLink} 
            variant="outline"
          >
            {copied ? <Copy className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-3">Share via</h4>
          <div className="grid grid-cols-4 gap-2">
            <Button 
              variant="outline" 
              className="flex flex-col items-center py-3 h-auto" 
              onClick={shareViaFacebook}
            >
              <Facebook className="h-6 w-6 mb-1 text-blue-600" />
              <span className="text-xs">Facebook</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center py-3 h-auto" 
              onClick={shareViaTwitter}
            >
              <Twitter className="h-6 w-6 mb-1 text-sky-500" />
              <span className="text-xs">Twitter</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center py-3 h-auto" 
              onClick={shareViaSMS}
            >
              <MessageCircle className="h-6 w-6 mb-1 text-green-500" />
              <span className="text-xs">SMS</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center py-3 h-auto" 
              onClick={shareViaEmail}
            >
              <Send className="h-6 w-6 mb-1 text-amber-500" />
              <span className="text-xs">Email</span>
            </Button>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-start mt-6">
          <Button 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
