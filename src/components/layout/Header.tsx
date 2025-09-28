import React from "react";
import { UserInfo } from "@/components/auth/UserInfo";
import { Button } from "@/components/ui/button";
import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  className?: string;
  onMenuToggle?: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  className = "",
  onMenuToggle,
  showSearch = true,
  showNotifications = true,
}) => {
  return (
    <header
      className={`bg-background border-b border-border px-4 py-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {showSearch && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar leads, clientes..."
                className="pl-10 w-64"
              />
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {showNotifications && (
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                3
              </span>
            </Button>
          )}

          <UserInfo variant="header" showLogout={true} />
        </div>
      </div>
    </header>
  );
};
