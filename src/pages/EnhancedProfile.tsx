
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Shield, Settings, ChevronRight, LogOut, MapPin, Phone, 
  Droplet, Heart, Bell, Mail, Calendar, FileText, Bookmark, 
  Clock, Languages, Lock, AlertCircle, Edit2, Moon, Sun
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/contexts/ThemeContext";

const EnhancedProfile = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const { theme, setTheme } = useTheme();
  
  const [notificationSettings, setNotificationSettings] = useState({
    emergencyAlerts: true,
    weatherAlerts: true,
    healthAlerts: false,
    locationBasedAlerts: true,
  });

  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    address: "123 Main St, New York, NY",
    dob: "1985-06-15",
    bloodType: "O+",
    allergies: "Penicillin",
    medications: "None",
    emergencyContacts: [
      { name: "Jane Doe", relationship: "Spouse", phone: "(555) 987-6543" },
      { name: "Mike Smith", relationship: "Brother", phone: "(555) 234-5678" }
    ],
    language: "English",
    theme: theme,
    notifications: true,
  });

  // Load saved profile from localStorage if available
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setUserProfile(parsed);
      } catch (e) {
        console.error("Failed to parse saved user profile");
      }
    }
    
    const savedNotificationSettings = localStorage.getItem("notificationSettings");
    if (savedNotificationSettings) {
      try {
        setNotificationSettings(JSON.parse(savedNotificationSettings));
      } catch (e) {
        console.error("Failed to parse saved notification settings");
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("hasSeenOnboarding");
    toast({
      title: "Signed out",
      description: "You have been successfully signed out",
    });
    navigate("/signin");
  };

  const handleToggleNotification = (key: string) => {
    const updated = {
      ...notificationSettings,
      [key]: !notificationSettings[key as keyof typeof notificationSettings],
    };
    
    setNotificationSettings(updated);
    localStorage.setItem("notificationSettings", JSON.stringify(updated));
    
    toast({
      title: "Settings Updated",
      description: `${key} notifications ${updated[key as keyof typeof updated] ? 'enabled' : 'disabled'}`,
    });
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    
    const updatedProfile = {
      ...userProfile,
      theme: newTheme
    };
    
    setUserProfile(updatedProfile);
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
    
    toast({
      title: "Theme Updated",
      description: `App theme changed to ${newTheme} mode`,
    });
  };

  const handleEditProfile = () => {
    // Save profile to localStorage
    localStorage.setItem("userProfile", JSON.stringify(userProfile));
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully",
    });
    setEditMode(false);
  };

  const profileSettings = [
    {
      icon: User,
      label: "Personal Information",
      description: "Name, address, and contact details",
      onClick: () => setActiveTab("personal"),
    },
    {
      icon: Shield,
      label: "Emergency Contacts",
      description: "Manage your emergency contacts",
      onClick: () => setActiveTab("emergency"),
    },
    {
      icon: Droplet,
      label: "Medical Information",
      description: "Blood type, allergies, and conditions",
      onClick: () => setActiveTab("medical"),
    },
    {
      icon: Heart,
      label: "Saved Resources",
      description: "View your bookmarked resources",
      onClick: () => navigate("/app/resources"),
    },
    {
      icon: Bell,
      label: "Notification Settings",
      description: "Manage alert preferences",
      onClick: () => setIsDialogOpen(true),
    },
    {
      icon: Settings,
      label: "App Settings",
      description: "Language, theme, and accessibility",
      onClick: () => setActiveTab("settings"),
    },
  ];

  return (
    <div className="page-container pb-24">
      <div className="flex flex-col items-center mb-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 relative">
          <User className="h-10 w-10 text-primary" />
          <button 
            className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full"
            onClick={() => setEditMode(!editMode)}
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
        <h1 className="text-xl font-bold">{userProfile.name}</h1>
        <div className="flex items-center mt-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1" />
          <span>{userProfile.address.split(',')[1]}</span>
        </div>
        <div className="flex items-center mt-1 text-sm text-muted-foreground">
          <Phone className="h-3 w-3 mr-1" />
          <span>{userProfile.phone}</span>
        </div>
      </div>

      {editMode ? (
        <div className="bg-white rounded-lg shadow-subtle p-4 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="emergency">Contacts</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            {activeTab === "personal" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded mt-1"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input 
                    type="email" 
                    className="w-full p-2 border rounded mt-1"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <input 
                    type="tel" 
                    className="w-full p-2 border rounded mt-1"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded mt-1"
                    value={userProfile.address}
                    onChange={(e) => setUserProfile({...userProfile, address: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Date of Birth</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border rounded mt-1"
                    value={userProfile.dob}
                    onChange={(e) => setUserProfile({...userProfile, dob: e.target.value})}
                  />
                </div>
              </div>
            )}
            
            {activeTab === "medical" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Blood Type</label>
                  <select 
                    className="w-full p-2 border rounded mt-1"
                    value={userProfile.bloodType}
                    onChange={(e) => setUserProfile({...userProfile, bloodType: e.target.value})}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Allergies</label>
                  <textarea 
                    className="w-full p-2 border rounded mt-1"
                    value={userProfile.allergies}
                    onChange={(e) => setUserProfile({...userProfile, allergies: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Medications</label>
                  <textarea 
                    className="w-full p-2 border rounded mt-1"
                    value={userProfile.medications}
                    onChange={(e) => setUserProfile({...userProfile, medications: e.target.value})}
                  />
                </div>
              </div>
            )}
            
            {activeTab === "emergency" && (
              <div className="space-y-4">
                {userProfile.emergencyContacts.map((contact, index) => (
                  <div key={index} className="border p-3 rounded space-y-2">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded mt-1"
                        value={contact.name}
                        onChange={(e) => {
                          const updated = [...userProfile.emergencyContacts];
                          updated[index].name = e.target.value;
                          setUserProfile({...userProfile, emergencyContacts: updated});
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Relationship</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded mt-1"
                        value={contact.relationship}
                        onChange={(e) => {
                          const updated = [...userProfile.emergencyContacts];
                          updated[index].relationship = e.target.value;
                          setUserProfile({...userProfile, emergencyContacts: updated});
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <input 
                        type="tel" 
                        className="w-full p-2 border rounded mt-1"
                        value={contact.phone}
                        onChange={(e) => {
                          const updated = [...userProfile.emergencyContacts];
                          updated[index].phone = e.target.value;
                          setUserProfile({...userProfile, emergencyContacts: updated});
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const updated = [...userProfile.emergencyContacts, {
                      name: "",
                      relationship: "",
                      phone: ""
                    }];
                    setUserProfile({...userProfile, emergencyContacts: updated});
                  }}
                >
                  Add Contact
                </Button>
              </div>
            )}
            
            {activeTab === "settings" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <select 
                    className="w-full p-2 border rounded mt-1"
                    value={userProfile.language}
                    onChange={(e) => setUserProfile({...userProfile, language: e.target.value})}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Chinese">Chinese</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Theme</label>
                  <div className="mt-2 flex flex-col space-y-2">
                    <div 
                      className={`flex items-center justify-between p-3 rounded-md ${theme === 'light' ? 'bg-primary/10 border border-primary/30' : 'bg-background border border-border'}`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <div className="flex items-center">
                        <Sun className="h-5 w-5 mr-2 text-amber-500" />
                        <span>Light</span>
                      </div>
                      {theme === 'light' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                    </div>
                    <div 
                      className={`flex items-center justify-between p-3 rounded-md ${theme === 'dark' ? 'bg-primary/10 border border-primary/30' : 'bg-background border border-border'}`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <div className="flex items-center">
                        <Moon className="h-5 w-5 mr-2 text-indigo-400" />
                        <span>Dark</span>
                      </div>
                      {theme === 'dark' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                    </div>
                    <div 
                      className={`flex items-center justify-between p-3 rounded-md ${theme === 'system' ? 'bg-primary/10 border border-primary/30' : 'bg-background border border-border'}`}
                      onClick={() => handleThemeChange('system')}
                    >
                      <div className="flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-gray-500" />
                        <span>System</span>
                      </div>
                      {theme === 'system' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Notifications</label>
                  <Switch 
                    checked={userProfile.notifications}
                    onCheckedChange={(checked) => setUserProfile({...userProfile, notifications: checked})}
                  />
                </div>
              </div>
            )}
            
            <div className="flex space-x-2 mt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleEditProfile}
              >
                Save Changes
              </Button>
            </div>
          </Tabs>
        </div>
      ) : (
        <div className="space-y-4">
          {profileSettings.map((setting, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-subtle hover:shadow-card transition-shadow"
              onClick={setting.onClick}
            >
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <setting.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">{setting.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {setting.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}

          <button
            className="w-full flex items-center p-4 bg-white rounded-lg shadow-subtle hover:shadow-card transition-shadow text-crisis-red mt-8"
            onClick={() => handleSignOut()}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>
              Customize which alerts and notifications you receive
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Emergency Alerts</h4>
                <p className="text-sm text-muted-foreground">
                  Critical emergency notifications
                </p>
              </div>
              <Switch 
                checked={notificationSettings.emergencyAlerts}
                onCheckedChange={() => handleToggleNotification('emergencyAlerts')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Weather Alerts</h4>
                <p className="text-sm text-muted-foreground">
                  Severe weather warnings
                </p>
              </div>
              <Switch 
                checked={notificationSettings.weatherAlerts}
                onCheckedChange={() => handleToggleNotification('weatherAlerts')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Health Alerts</h4>
                <p className="text-sm text-muted-foreground">
                  Public health notifications
                </p>
              </div>
              <Switch 
                checked={notificationSettings.healthAlerts}
                onCheckedChange={() => handleToggleNotification('healthAlerts')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Location-based Alerts</h4>
                <p className="text-sm text-muted-foreground">
                  Alerts based on your current location
                </p>
              </div>
              <Switch 
                checked={notificationSettings.locationBasedAlerts}
                onCheckedChange={() => handleToggleNotification('locationBasedAlerts')}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedProfile;
