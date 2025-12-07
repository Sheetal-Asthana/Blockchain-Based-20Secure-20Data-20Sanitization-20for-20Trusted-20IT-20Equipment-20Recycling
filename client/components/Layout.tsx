import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface LayoutProps {
  children: ReactNode;
  userRole?: string;
  userName?: string;
  onLogout?: () => void;
}

export default function Layout({
  children,
  userRole = "admin",
  userName = "John Doe",
  onLogout,
}: LayoutProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar userRole={userRole} onLogout={onLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Topbar */}
        <Topbar
          userName={userName}
          userRole={userRole}
          onLogout={onLogout}
          theme={theme}
          onThemeChange={handleThemeChange}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
