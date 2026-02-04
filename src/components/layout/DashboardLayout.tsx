import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Building2,
  Home,
  Users,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useStaleLeadsCount } from "@/hooks/useStaleLeads";

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  isActive: boolean;
  badge?: number;
}

function NavItem({ to, icon, label, isActive, badge }: NavItemProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <Badge 
          variant="destructive" 
          className={cn(
            "ml-auto h-5 min-w-5 px-1.5 text-xs",
            isActive && "bg-white text-primary"
          )}
        >
          {badge > 99 ? "99+" : badge}
        </Badge>
      )}
    </Link>
  );
}

const navigation = [
  { to: "/", icon: <BarChart3 className="h-4 w-4" />, label: "Dashboard" },
  { to: "/imoveis", icon: <Building2 className="h-4 w-4" />, label: "Imóveis" },
  { to: "/leads", icon: <Users className="h-4 w-4" />, label: "Leads" },
  { to: "/locacoes", icon: <FileText className="h-4 w-4" />, label: "Locações" },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const staleLeadsCount = useStaleLeadsCount();

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Add badge count dynamically to leads navigation item
  const navigationWithBadges = navigation.map((item) => ({
    ...item,
    badge: item.to === "/leads" ? staleLeadsCount : undefined,
  }));

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <Home className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-sidebar-foreground">
            CRM Imobiliário
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigationWithBadges.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              isActive={location.pathname === item.to}
            />
          ))}
        </nav>

        <Separator />

        {/* User section */}
        <div className="p-4">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user?.email ? getInitials(user.email) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sidebar-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1">
              <button
                onClick={() => signOut()}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-sidebar-accent"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            <span className="font-semibold">CRM Imobiliário</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
