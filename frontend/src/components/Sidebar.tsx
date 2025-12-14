import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Cpu,
  FileText,
  Award,
  CheckCircle,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ["admin", "operator", "enterprise", "auditor"],
  },
  {
    label: "Asset Verification",
    href: "/verify",
    icon: <CheckCircle className="w-5 h-5" />,
    roles: ["admin", "operator", "enterprise", "auditor"],
  },
  {
    label: "Blockchain Explorer",
    href: "/blockchain",
    icon: <Shield className="w-5 h-5" />,
    roles: ["admin", "operator", "enterprise", "auditor"],
  },
  {
    label: "QR Scanner",
    href: "/qr-scanner",
    icon: <CheckCircle className="w-5 h-5" />,
    roles: ["admin", "operator", "enterprise", "auditor"],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <ClipboardList className="w-5 h-5" />,
    roles: ["admin", "operator", "enterprise", "auditor"],
  },
  {
    label: "Bulk Operations",
    href: "/bulk-operations",
    icon: <Cpu className="w-5 h-5" />,
    roles: ["admin", "operator"],
  },
  {
    label: "Admin Settings",
    href: "/admin/settings",
    icon: <Settings className="w-5 h-5" />,
    roles: ["admin"],
  },
];

interface SidebarProps {
  userRole?: string;
  onLogout?: () => void;
}

export default function Sidebar({
  userRole = "admin",
  onLogout,
}: SidebarProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(userRole.toLowerCase()),
  );

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden p-2 rounded-lg bg-white dark:bg-sidebar border border-border dark:border-sidebar-border"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200 ease-in-out z-30 lg:relative lg:translate-x-0 lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg text-sidebar-foreground hover:opacity-80"
          >
            <Shield className="w-6 h-6 text-sidebar-primary" />
            <span>SanitizeChain</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={() => {
              onLogout?.();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
