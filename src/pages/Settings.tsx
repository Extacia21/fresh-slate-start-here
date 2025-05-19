
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Languages, Globe, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState({
    language: "english",
    notifications: true,
    locationServices: true,
    dataUsage: "low",
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to load app settings:", e);
      }
    }
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    toast({
      title: "Theme updated",
      description: `App theme changed to ${newTheme} mode`
    });
  };

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem("appSettings", JSON.stringify(newSettings));
    
    toast({
      title: "Settings updated",
      description: `${key} setting has been updated`
    });
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">App Settings</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-card rounded-lg p-4 shadow-subtle">
          <h2 className="font-medium mb-4">Appearance</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Theme</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  className={`p-3 flex flex-col items-center justify-center rounded-lg border ${
                    theme === "light" ? "bg-primary/10 border-primary" : "bg-background border-border"
                  }`}
                  onClick={() => handleThemeChange("light")}
                >
                  <Sun className="h-5 w-5 mb-1 text-amber-500" />
                  <span className="text-xs">Light</span>
                </button>
                <button
                  className={`p-3 flex flex-col items-center justify-center rounded-lg border ${
                    theme === "dark" ? "bg-primary/10 border-primary" : "bg-background border-border"
                  }`}
                  onClick={() => handleThemeChange("dark")}
                >
                  <Moon className="h-5 w-5 mb-1 text-indigo-400" />
                  <span className="text-xs">Dark</span>
                </button>
                <button
                  className={`p-3 flex flex-col items-center justify-center rounded-lg border ${
                    theme === "system" ? "bg-primary/10 border-primary" : "bg-background border-border"
                  }`}
                  onClick={() => handleThemeChange("system")}
                >
                  <SettingsIcon className="h-5 w-5 mb-1 text-gray-500" />
                  <span className="text-xs">System</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-subtle">
          <h2 className="font-medium mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <p className="text-xs text-muted-foreground">Choose your preferred language</p>
                </div>
                <select
                  id="language"
                  className="text-sm p-2 bg-background border rounded-md"
                  value={settings.language}
                  onChange={(e) => handleSettingChange("language", e.target.value)}
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Enable alerts and notifications</p>
              </div>
              <Switch 
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(value) => handleSettingChange("notifications", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="location">Location Services</Label>
                <p className="text-xs text-muted-foreground">Allow access to your device location</p>
              </div>
              <Switch 
                id="location"
                checked={settings.locationServices}
                onCheckedChange={(value) => handleSettingChange("locationServices", value)}
              />
            </div>

            <div>
              <Label>Data Usage</Label>
              <p className="text-xs text-muted-foreground mb-3">Control how much data the app uses</p>
              <RadioGroup 
                value={settings.dataUsage}
                onValueChange={(value) => handleSettingChange("dataUsage", value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Low (Save data)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium (Balanced)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">High (Best quality)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>

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

export default Settings;
