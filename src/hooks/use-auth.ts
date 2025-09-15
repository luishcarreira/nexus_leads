import { useState, useEffect, useCallback } from "react";
import { authService } from "@/services/authService";

interface UserClaims {
  empresa?: string;
  filial?: string;
  usuario?: string;
  sub?: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userClaims, setUserClaims] = useState<UserClaims | null>(null);

  // Verificar status de autenticação
  const checkAuthStatus = useCallback(() => {
    const authenticated = authService.isAuthenticated();
    const claims = authService.getUserClaims();

    setIsAuthenticated(authenticated);
    setUserClaims(claims);
    setIsLoading(false);
  }, []);

  // Login com token do IdP
  const loginWithIdpToken = useCallback(
    async (idpToken: string) => {
      try {
        setIsLoading(true);
        await authService.exchangeToken(idpToken);
        checkAuthStatus();
        return true;
      } catch (error) {
        console.error("Erro no login:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [checkAuthStatus]
  );

  // Login direto com username/password
  const login = useCallback(
    async (username: string, password: string) => {
      try {
        setIsLoading(true);
        await authService.login({ username, password });
        checkAuthStatus();
        return true;
      } catch (error) {
        console.error("Erro no login:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [checkAuthStatus]
  );

  // Logout
  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setUserClaims(null);
  }, []);

  // Processar redirect do IdP
  const processIdpRedirect = useCallback(async () => {
    try {
      setIsLoading(true);
      const success = await authService.processIdpRedirect();
      if (success) {
        checkAuthStatus();
      }
      return success;
    } catch (error) {
      console.error("Erro ao processar redirect:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkAuthStatus]);

  // Verificar autenticação na inicialização
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    isAuthenticated,
    isLoading,
    userClaims,
    login,
    loginWithIdpToken,
    logout,
    processIdpRedirect,
    checkAuthStatus,
  };
};
