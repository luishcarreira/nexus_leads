import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigation } from "@/hooks/use-navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  BarChart3,
  Settings,
  FileText,
  UserCheck,
  TrendingUp,
  LogOut,
  User,
  FileBarChart,
  AlertTriangle,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  subItems?: MenuItem[];
}

interface SidebarProps {
  className?: string;
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    id: "leads",
    label: "Leads",
    icon: Users,
    href: "/leads",
  },
  {
    id: "pipeline",
    label: "Pipeline",
    icon: TrendingUp,
    href: "/pipeline",
  },
  {
    id: "clientes",
    label: "Clientes",
    icon: UserCheck,
    href: "/clientes",
  },
  {
    id: "reports",
    label: "Relatórios",
    icon: FileBarChart,
    subItems: [
      {
        id: "motivos-perda",
        label: "Motivos de Perda",
        icon: AlertTriangle,
        href: "/relatorios/motivos-perda",
      },
    ],
  },
  {
    id: "users",
    label: "Usuários",
    icon: Users,
    href: "/users",
  },
  {
    id: "settings",
    label: "Configurações",
    icon: Settings,
    href: "/settings",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const navigate = useNavigate();
  const { isActive } = useNavigation();
  const { user, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isExpanded = (itemId: string) => expandedItems.has(itemId);

  const handleNavigation = (href?: string) => {
    if (href) {
      navigate(href);
    }
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const expanded = isExpanded(item.id);
    const active = isActive(item.id);

    return (
      <div key={item.id}>
        <Button
          variant={active ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start h-10 px-3",
            level > 0 && "ml-4",
            "hover:bg-accent hover:text-accent-foreground",
            "transition-colors duration-200",
            active && "bg-accent text-accent-foreground"
          )}
          onClick={() => {
            if (hasSubItems) {
              toggleExpanded(item.id);
            } else if (item.href) {
              handleNavigation(item.href);
            }
          }}
        >
          <item.icon className="h-4 w-4 mr-3" />
          <span className="flex-1 text-left">{item.label}</span>
          {hasSubItems && (
            <div className="ml-auto">
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          )}
        </Button>

        {hasSubItems && expanded && (
          <div className="mt-1">
            {item.subItems!.map((subItem) =>
              renderMenuItem(subItem, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background border-r border-border",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">N</span>
          </div>
          <div>
            <h1 className="font-semibold text-lg">Nexus Leads</h1>
            <p className="text-xs text-muted-foreground">CRM System</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>
      </ScrollArea>

      {/* User Menu & Theme Switcher */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <ThemeSwitcher />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {user?.nome
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">
                    {user?.nome || "Usuário"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.cargo || "Cargo não definido"}
                  </p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
