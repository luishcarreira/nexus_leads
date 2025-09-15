interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface LoginResponse extends TokenResponse {
  user?: {
    id: string;
    username: string;
    email?: string;
    [key: string]: any;
  };
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface UserClaims {
  empresa?: string;
  filial?: string;
  usuario?: string;
  sub?: string;
}

class AuthService {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokensFromStorage();
  }

  // Carrega tokens do localStorage
  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem("access_token");
    this.refreshToken = localStorage.getItem("refresh_token");
  }

  // Salva tokens no localStorage
  private saveTokensToStorage(accessToken: string, refreshToken: string): void {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  // Remove tokens do localStorage
  private clearTokensFromStorage(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    this.accessToken = null;
    this.refreshToken = null;
  }

  // Faz exchange do token do IdP para nossos tokens
  async exchangeToken(idpToken: string): Promise<TokenResponse> {
    try {
      const response = await fetch(`${this.baseURL}/token/exchange`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: idpToken }),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`);
      }

      const tokenData: TokenResponse = await response.json();
      this.saveTokensToStorage(tokenData.access_token, tokenData.refresh_token);

      return tokenData;
    } catch (error) {
      console.error("Erro no exchange de token:", error);
      throw error;
    }
  }

  // Login direto na API com username/password
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const formData = new URLSearchParams();
      formData.append("username", credentials.username);
      formData.append("password", credentials.password);

      const response = await fetch(`${this.baseURL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const loginData: LoginResponse = await response.json();
      this.saveTokensToStorage(loginData.access_token, loginData.refresh_token);

      return loginData;
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  }

  // Faz refresh do access token usando o refresh token
  async refreshAccessToken(): Promise<TokenResponse> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await fetch(`${this.baseURL}/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (!response.ok) {
        // Se o refresh falhar, limpar tokens e redirecionar para login
        this.logout();
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const tokenData: TokenResponse = await response.json();
      this.saveTokensToStorage(tokenData.access_token, tokenData.refresh_token);

      return tokenData;
    } catch (error) {
      console.error("Erro no refresh de token:", error);
      this.logout();
      throw error;
    }
  }

  // Retorna o access token atual
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Verifica se o usuário está autenticado
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Decodifica o JWT para extrair claims (sem verificação de assinatura)
  getUserClaims(): UserClaims | null {
    if (!this.accessToken) {
      return null;
    }

    try {
      const payload = this.accessToken.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      return null;
    }
  }

  // Logout - limpa tokens e redireciona para login
  logout(): void {
    this.clearTokensFromStorage();
    // Redirecionar para a página de login do IdP
    const idpLoginUrl =
      import.meta.env.VITE_IDP_LOGIN_URL || "https://seu-idp/login";
    const redirectUrl = encodeURIComponent(window.location.href);
    window.location.href = `${idpLoginUrl}?redirect=${redirectUrl}`;
  }

  // Processa o token da URL após redirect do IdP
  async processIdpRedirect(): Promise<boolean> {
    const urlParams = new URLSearchParams(window.location.search);
    const idpToken = urlParams.get("token");

    if (idpToken) {
      try {
        await this.exchangeToken(idpToken);

        // Limpar a URL removendo o parâmetro token
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("token");
        window.history.replaceState({}, "", newUrl.toString());

        return true;
      } catch (error) {
        console.error("Erro ao processar redirect do IdP:", error);
        return false;
      }
    }

    return false;
  }
}

export const authService = new AuthService(
  import.meta.env.VITE_API_URL || "https://apihomol.nexusvitally.com.br"
);
