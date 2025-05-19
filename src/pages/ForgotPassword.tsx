
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import authService from "@/services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authService.resetPassword(email);
      
      if (response.success) {
        setIsSubmitted(true);
        toast({
          title: "Reset link sent",
          description: "Check your email for password reset instructions",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to send reset link",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-auto">
      <div className="p-4 border-b border-border">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="pl-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        {!isSubmitted ? (
          <>
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-2xl font-bold">Reset Password</h1>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                Enter your email address and we'll send you instructions to reset your password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-crisis"
                  autoComplete="email"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full py-6" 
                disabled={isLoading}
              >
                {isLoading ? "Sending Link..." : "Send Reset Link"}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center text-center max-w-sm mx-auto">
            <div className="bg-crisis-green/10 p-4 rounded-full mb-6">
              <ShieldCheck className="text-crisis-green h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Check Your Email</h2>
            <p className="text-muted-foreground mb-6">
              We've sent instructions to reset your password to <strong>{email}</strong>. 
              Please check your email and follow the link to reset your password.
            </p>
            <Button 
              onClick={() => navigate("/signin")} 
              variant="outline" 
              className="w-full"
            >
              Return to Sign In
            </Button>
            <Button 
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
              }} 
              variant="link" 
              className="mt-4 text-muted-foreground"
            >
              Didn't receive the email? Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
