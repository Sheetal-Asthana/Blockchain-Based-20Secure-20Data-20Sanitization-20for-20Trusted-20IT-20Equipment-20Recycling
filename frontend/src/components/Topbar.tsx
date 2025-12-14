import { useState } from "react";
import { Bell, Moon, Sun, User, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
  theme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
}

export default function Topbar({
  userName = "John Doe",
  userRole = "Admin",
  onLogout,
  theme = "light",
  onThemeChange,
}: TopbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    onThemeChange?.(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-border bg-background">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Spacer for sidebar offset */}
        <div className="hidden lg:block" />

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors relative group">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
              <div className="p-4">
                <h3 className="font-semibold text-card-foreground mb-3">
                  Notifications
                </h3>
                <div className="space-y-2">
                  <div className="p-2 rounded hover:bg-secondary/50 text-sm text-card-foreground">
                    <p className="font-medium">Device Sanitization Complete</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Device #DEV-001 sanitization finished
                    </p>
                  </div>
                  <div className="p-2 rounded hover:bg-secondary/50 text-sm text-card-foreground">
                    <p className="font-medium">Certificate Issued</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Certificate #CERT-2024-001 verified
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-foreground" />
            ) : (
              <Sun className="w-5 h-5 text-foreground" />
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                {userName.charAt(0)}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </div>
            </button>

            {/* Profile Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg">
                <div className="p-4 border-b border-border">
                  <p className="font-medium text-card-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userRole}</p>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-secondary transition-colors text-card-foreground text-sm">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-secondary transition-colors text-card-foreground text-sm">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-destructive/10 transition-colors text-destructive text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
