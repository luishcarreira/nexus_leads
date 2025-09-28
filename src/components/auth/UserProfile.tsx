import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  LogOut,
  Settings,
} from "lucide-react";

interface UserProfileProps {
  className?: string;
  showActions?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  className = "",
  showActions = true,
}) => {
  const { userClaims, logout } = useAuth();

  if (!userClaims) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma informação de usuário disponível</p>
          </div>
        </CardContent>
      </Card>
    );
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

  // Função para formatar data de expiração do token (se disponível)
  const formatTokenExpiry = (token?: string) => {
    if (!token) return null;
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      if (decoded.exp) {
        const expiryDate = new Date(decoded.exp * 1000);
        return expiryDate.toLocaleString("pt-BR");
      }
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Card principal do usuário */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                {getUserInitials(userClaims.usuario)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {userClaims.usuario || "Usuário"}
              </CardTitle>
              <CardDescription className="text-base">
                {userClaims.sub && `ID: ${userClaims.sub}`}
              </CardDescription>
            </div>
            {showActions && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
                <Button variant="destructive" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações da empresa */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Informações da Empresa
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userClaims.empresa && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Empresa
                  </label>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-sm">
                      <Building2 className="h-3 w-3 mr-1" />
                      {userClaims.empresa}
                    </Badge>
                  </div>
                </div>
              )}

              {userClaims.filial && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Filial
                  </label>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      {userClaims.filial}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Informações do token */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Informações da Sessão
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Status da Sessão
                </label>
                <Badge variant="default" className="text-sm">
                  <Shield className="h-3 w-3 mr-1" />
                  Ativa
                </Badge>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Última Atualização
                </label>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de estatísticas (opcional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Usuário</p>
                <p className="text-xs text-muted-foreground">Ativo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Empresa</p>
                <p className="text-xs text-muted-foreground">
                  {userClaims.empresa || "Não definida"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Filial</p>
                <p className="text-xs text-muted-foreground">
                  {userClaims.filial || "Não definida"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
