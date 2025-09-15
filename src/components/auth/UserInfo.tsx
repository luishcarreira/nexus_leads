import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2, MapPin, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserInfoProps {
  variant?: "sidebar" | "header" | "card";
  showLogout?: boolean;
  className?: string;
}

export const UserInfo: React.FC<UserInfoProps> = ({
  variant = "sidebar",
  showLogout = false,
  className = "",
}) => {
  const { userClaims, logout } = useAuth();

  if (!userClaims) {
    return null;
  }

  // Função para gerar iniciais do usuário
  const getUserInitials = (usuario?: string) => {
    if (!usuario) return "U";
    return usuario
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Função para formatar nome do usuário
  const formatUserName = (usuario?: string) => {
    if (!usuario) return "Usuário";
    return usuario.split(" ")[0]; // Primeiro nome apenas
  };

  // Variante para sidebar (compacta)
  if (variant === "sidebar") {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
              {getUserInitials(userClaims.usuario)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {formatUserName(userClaims.usuario)}
            </p>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {userClaims.empresa && (
                <span className="truncate">Empresa: {userClaims.empresa}</span>
              )}
              {userClaims.filial && userClaims.empresa && <span>•</span>}
              {userClaims.filial && (
                <span className="truncate">Filial: {userClaims.filial}</span>
              )}
            </div>
          </div>
        </div>

        {showLogout && (
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        )}
      </div>
    );
  }

  // Variante para header (horizontal)
  if (variant === "header") {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
            {getUserInitials(userClaims.usuario)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {formatUserName(userClaims.usuario)}
          </p>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {userClaims.empresa && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                <Building2 className="h-3 w-3 mr-1" />
                {userClaims.empresa}
              </Badge>
            )}
            {userClaims.filial && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                <MapPin className="h-3 w-3 mr-1" />
                Filial {userClaims.filial}
              </Badge>
            )}
          </div>
        </div>
        {showLogout && (
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // Variante para card (detalhada)
  if (variant === "card") {
    return (
      <Card className={`w-full max-w-sm ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg font-medium bg-primary text-primary-foreground">
                {getUserInitials(userClaims.usuario)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {userClaims.usuario || "Usuário"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {userClaims.sub && `ID: ${userClaims.sub}`}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            {userClaims.empresa && (
              <div className="flex items-center space-x-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Empresa</p>
                  <p className="text-sm text-muted-foreground">
                    {userClaims.empresa}
                  </p>
                </div>
              </div>
            )}

            {userClaims.filial && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Filial</p>
                  <p className="text-sm text-muted-foreground">
                    {userClaims.filial}
                  </p>
                </div>
              </div>
            )}

            {userClaims.usuario && (
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Usuário</p>
                  <p className="text-sm text-muted-foreground">
                    {userClaims.usuario}
                  </p>
                </div>
              </div>
            )}
          </div>

          {showLogout && (
            <>
              <Separator className="my-4" />
              <Button variant="destructive" onClick={logout} className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};
