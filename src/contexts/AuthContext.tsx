import React, { createContext, useContext, useEffect, useState } from "react";
import { httpClient } from "@/services/httpClient";
import { User } from "@/types/User";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app start
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // Validate token and get user info
      validateToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      // Set the token in the http client
      httpClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // You might want to call a /me endpoint to validate the token
      // For now, we'll assume the token is valid if it exists
      // const response = await httpClient.get('/auth/me');
      // setUser(response.data.user);

      // Temporary: if token exists, assume user is logged in
      // You should replace this with actual user data from your backend
      setUser({
        id: "1",
        nome: "Usuário Teste",
        cargo: "Administrador",
        status: "ativo",
        tipo: "admin",
        gam_guid: "test-guid",
        id_vendedor_vinculado: null,
        id_cliente_vinculado: null,
        id_operador: 1,
      });
    } catch (error) {
      console.error("Token validation failed:", error);
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      delete httpClient.defaults.headers.common["Authorization"];
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);

      // Create URLSearchParams for OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      // Call your backend login endpoint
      const response = await httpClient.post<{
        access_token: string;
        refresh_token: string;
        user: User;
        token_type: string;
      }>("/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const {
        access_token: token,
        refresh_token: newRefreshToken,
        user: userData,
      } = response;

      // Store tokens
      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", newRefreshToken);

      // Set authorization header
      httpClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Set user data
      setUser(userData);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    delete httpClient.defaults.headers.common["Authorization"];
  };

  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await httpClient.post<{
        token: string;
        refreshToken: string;
      }>("/refresh", {
        refreshToken: storedRefreshToken,
      });

      const { token, refreshToken: newRefreshToken } = response;

      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", newRefreshToken);
      httpClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      throw error;
    }
  };

  // Note: For automatic token refresh, you would need to implement
  // a more sophisticated interceptor system or handle 401 errors
  // in the service layer or individual API calls

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
