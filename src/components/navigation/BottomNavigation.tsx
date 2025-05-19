
import { Home, Bell, BookOpen, Phone, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { icon: Home, label: "Home", to: "/app" },
  { icon: Bell, label: "Alerts", to: "/app/alerts" },
  { icon: BookOpen, label: "Resources", to: "/app/resources" },
  { icon: Phone, label: "Contacts", to: "/app/contacts" },
  { icon: User, label: "Profile", to: "/app/profile" },
];

const BottomNavigation = () => {
  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? "active" : ""}`
          }
          end={item.to === "/app"}
        >
          {({ isActive }) => (
            <>
              <item.icon
                size={20}
                className={`transition-all duration-200 ${
                  isActive ? "text-primary" : "text-crisis-gray"
                }`}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNavigation;
