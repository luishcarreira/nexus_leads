import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UserInfo } from "@/components/auth/UserInfo";

/**
 * Exemplo de componente demonstrando o fluxo de autenticação
 * Este componente mostra como usar os diferentes métodos de login
 */
export const AuthExample: React.FC = () => {
  const {
    isAuthenticated,
    isLoading,
    userClaims,
    login,
    loginWithIdpToken,
    logout,
    processIdpRedirect,
  } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [idpToken, setIdpToken] = useState("");

  // Processar redirect do IdP quando o componente carrega
  React.useEffect(() => {
    processIdpRedirect();
  }, [processIdpRedirect]);

  const handleDirectLogin = async () => {
    if (!username || !password) {
      alert("Por favor, preencha username e password");
      return;
    }

    const success = await login(username, password);
    if (success) {
      alert("Login realizado com sucesso!");
    } else {
      alert("Falha no login. Verifique suas credenciais.");
    }
  };

  const handleIdpTokenLogin = async () => {
    if (!idpToken) {
      alert("Por favor, insira o token do IdP");
      return;
    }

    const success = await loginWithIdpToken(idpToken);
    if (success) {
      alert("Token trocado com sucesso!");
    } else {
      alert("Falha ao trocar token. Verifique o token.");
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuário Autenticado</CardTitle>
            <CardDescription>Você está logado com sucesso!</CardDescription>
          </CardHeader>
          <CardContent>
            <UserInfo variant="card" showLogout={true} />
          </CardContent>
        </Card>

        {/* Exemplo de diferentes variantes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Variante Sidebar</CardTitle>
              <CardDescription>Versão compacta para sidebar</CardDescription>
            </CardHeader>
            <CardContent>
              <UserInfo variant="sidebar" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variante Header</CardTitle>
              <CardDescription>Versão horizontal para header</CardDescription>
            </CardHeader>
            <CardContent>
              <UserInfo variant="header" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Login direto com username/password */}
      <Card>
        <CardHeader>
          <CardTitle>Login Direto</CardTitle>
          <CardDescription>
            Faça login diretamente com username e password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
            />
          </div>
          <Button onClick={handleDirectLogin} className="w-full">
            Login
          </Button>
        </CardContent>
      </Card>

      {/* Login com token do IdP */}
      <Card>
        <CardHeader>
          <CardTitle>Login com Token IdP</CardTitle>
          <CardDescription>
            Troque um token do IdP por tokens internos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="idpToken">Token do IdP</Label>
            <Input
              id="idpToken"
              type="text"
              value={idpToken}
              onChange={(e) => setIdpToken(e.target.value)}
              placeholder="Cole o token JWT do IdP aqui"
            />
          </div>
          <Button onClick={handleIdpTokenLogin} className="w-full">
            Trocar Token
          </Button>
        </CardContent>
      </Card>

      {/* Informações sobre o fluxo */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Autenticação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Cenário 1:</strong> Login direto com username/password
          </p>
          <p>
            <strong>Cenário 2:</strong> IdP redireciona com token na URL
            (?token=...)
          </p>
          <p>
            <strong>Auto-refresh:</strong> Tokens são renovados automaticamente
          </p>
          <p>
            <strong>Logout:</strong> Redireciona para o IdP
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
