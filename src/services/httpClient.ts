export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string> = {};
  public defaults: {
    headers: {
      common: Record<string, string>;
    };
  };

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaults = {
      headers: {
        common: {},
      },
    };
  }

  // Função auxiliar para construir query params limpos
  private buildQueryParams(params: Record<string, any>): URLSearchParams {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "undefined"
      ) {
        queryParams.append(key, value.toString());
      }
    });

    return queryParams;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    config: RequestConfig = {}
  ): Promise<T> {
    let url = `${this.baseURL}${endpoint}`;

    // Add query parameters if provided
    if (config.params) {
      const queryParams = this.buildQueryParams(config.params);
      if (queryParams.toString()) {
        url += (endpoint.includes("?") ? "&" : "?") + queryParams.toString();
      }
    }

    const headers = {
      ...this.defaults.headers.common,
      ...this.defaultHeaders,
      ...config.headers,
      ...options.headers,
    };

    // Only set Content-Type if not already set and data is not FormData or URLSearchParams
    if (
      !headers["Content-Type"] &&
      !(options.body instanceof FormData) &&
      !(options.body instanceof URLSearchParams)
    ) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as any).response = {
        status: response.status,
        data: await response.text().catch(() => null),
      };
      throw error;
    }

    return response.json();
  }

  // Generic HTTP methods
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, config);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body:
          data instanceof FormData || data instanceof URLSearchParams
            ? data
            : data
            ? JSON.stringify(data)
            : undefined,
      },
      config
    );
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    );
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" }, config);
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PATCH",
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    );
  }

  // Interceptors para compatibilidade com axios-like behavior
  interceptors = {
    response: {
      use: (
        onFulfilled: (response: any) => any,
        onRejected: (error: any) => any
      ) => {
        // Para simplicidade, vamos apenas retornar um ID fictício
        // Em uma implementação real, você manteria uma lista de interceptors
        return Math.random();
      },
      eject: (id: number) => {
        // Remove interceptor
      },
    },
  };
}

export const httpClient = new HttpClient(
  import.meta.env.VITE_API_URL
);
