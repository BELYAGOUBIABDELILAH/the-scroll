import { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item: typeof navItems[0]) => {
    if (item.href === "/settings") return location.pathname === "/settings";
    const tab = new URL(item.href, "http://x").searchParams.get("tab");
    return tab === activeTab;
  };

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setMobileOpen(false);
  };

  const sidebarContent = (collapsed: boolean) => (
    <>
      {/* Logo */}
      <div className={`flex h-16 items-center border-b border-border ${collapsed ? "justify-center px-0" : "gap-2.5 px-5"}`}>
        <Scroll className="h-5 w-5 shrink-0 text-primary" />
        {!collapsed && <span className="font-serif text-lg font-bold text-foreground">The Scroll</span>}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-4 space-y-1 ${collapsed ? "px-1.5" : "px-3"}`}>
        {navItems.map((item) => {
          const active = isActive(item);
          const activeClass = active
            ? "bg-primary/10 text-primary border-l-2 border-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary";

          const btn = (
            <div
              className={`flex items-center rounded-md text-sm font-medium transition-colors ${activeClass} ${
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </div>
          );

          const wrapped = collapsed ? (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>{item.href === "/settings" ? (
                <Link to={item.href} onClick={() => setMobileOpen(false)}>{btn}</Link>
              ) : (
                <button className="w-full" onClick={() => handleTabChange(new URL(item.href, "http://x").searchParams.get("tab")!)}>{btn}</button>
              )}</TooltipTrigger>
              <TooltipContent side="right" className="bg-popover border-border z-[60]">{item.label}</TooltipContent>
            </Tooltip>
          ) : item.href === "/settings" ? (
            <Link key={item.label} to={item.href} onClick={() => setMobileOpen(false)}>{btn}</Link>
          ) : (
            <button key={item.label} className="w-full" onClick={() => handleTabChange(new URL(item.href, "http://x").searchParams.get("tab")!)}>{btn}</button>
          );

          return wrapped;
        })}
      </nav>

      {/* Write CTA + Logout */}
      <div className={`border-t border-border space-y-2 ${collapsed ? "p-1.5" : "p-3"}`}>
        <Link
          to="/dashboard/write"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 ${
            collapsed ? "justify-center p-2.5" : "justify-center gap-2 px-4 py-2.5"
          }`}
        >
          <Feather className="h-4 w-4 shrink-0" />
          {!collapsed && "New Scroll"}
        </Link>
        <button
          onClick={signOut}
          className={`flex w-full items-center rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary ${
            collapsed ? "justify-center py-2" : "gap-3 px-3 py-2"
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-foreground md:hidden"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-56 flex-col border-r border-border bg-card transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* Desktop: icon-only mini sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-14 flex-col border-r border-border bg-card lg:hidden md:flex">
        {sidebarContent(true)}
      </aside>

      {/* Desktop wide: full sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-56 flex-col border-r border-border bg-card lg:flex">
        {sidebarContent(false)}
      </aside>
    </>
  );
};

/** Returns the correct margin class for the main content area */
export const SIDEBAR_MARGIN = "md:ml-14 lg:ml-56";
