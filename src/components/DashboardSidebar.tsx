import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Send,
  Users,
  Handshake,
  Settings,
  Feather,
  LogOut,
  Scroll,
} from "lucide-react";

const navItems = [
  { label: "Drafts", href: "/dashboard?tab=drafts", icon: FileText },
  { label: "Published", href: "/dashboard?tab=published", icon: Send },
  { label: "Bannermen", href: "/dashboard?tab=bannermen", icon: Users },
  { label: "Alliances", href: "/dashboard?tab=alliances", icon: Handshake },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const DashboardSidebar = ({ activeTab, onTabChange }: DashboardSidebarProps) => {
  const { signOut } = useAuth();
  const location = useLocation();

  const isActive = (item: typeof navItems[0]) => {
    if (item.href === "/settings") return location.pathname === "/settings";
    const tab = new URL(item.href, "http://x").searchParams.get("tab");
    return tab === activeTab;
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-border">
        <Scroll className="h-5 w-5 text-primary" />
        <span className="font-serif text-lg font-bold text-foreground">The Scroll</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item);
          if (item.href === "/settings") {
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          }
          const tab = new URL(item.href, "http://x").searchParams.get("tab")!;
          return (
            <button
              key={item.label}
              onClick={() => onTabChange(tab)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Write CTA + Logout */}
      <div className="border-t border-border p-3 space-y-2">
        <Link
          to="/dashboard/write"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Feather className="h-4 w-4" />
          New Scroll
        </Link>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
