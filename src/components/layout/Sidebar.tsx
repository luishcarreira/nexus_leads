import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigation } from "@/hooks/use-navigation";
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
    href: "/",
  },
  {
    id: "leads",
    label: "Leads",
    icon: Users,
    href: "/leads",
    subItems: [
      {
        id: "leads-list",
        label: "Lista de Leads",
        icon: FileText,
        href: "/leads",
      },
      {
        id: "leads-create",
        label: "Novo Lead",
        icon: UserCheck,
        href: "/leads/create",
      },
      {
        id: "leads-import",
        label: "Importar Leads",
        icon: FileText,
        href: "/leads/import",
      },
    ],
  },
  {
    id: "reports",
    label: "Relatórios",
    icon: BarChart3,
    subItems: [
      {
        id: "reports-sales",
        label: "Relatório de Vendas",
        icon: BarChart3,
        href: "/reports/sales",
      },
      {
        id: "reports-leads",
        label: "Relatório de Leads",
        icon: Users,
        href: "/reports/leads",
      },
      {
        id: "reports-performance",
        label: "Performance",
        icon: TrendingUp,
        href: "/reports/performance",
      },
    ],
  },

  {
    id: "settings",
    label: "Configurações",
    icon: Settings,
    subItems: [
      {
        id: "settings-profile",
        label: "Perfil",
        icon: UserCheck,
        href: "/settings/profile",
      },
      {
        id: "settings-users",
        label: "Usuários",
        icon: Users,
        href: "/settings/users",
      },
      {
        id: "settings-system",
        label: "Sistema",
        icon: Settings,
        href: "/settings/system",
      },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const navigate = useNavigate();
  const { isActive } = useNavigation();
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

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>© 2024 Nexus Leads</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );
};
