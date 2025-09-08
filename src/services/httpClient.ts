import axios, { AxiosRequestConfig } from "axios";
import { forceLogout } from "@/contexts/AuthContext";

class HttpClient {
  private instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8001",
  });

  constructor() {
    // Adiciona o interceptor para Authorization
    this.instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        if (!config.headers) {
          config.headers = {} as any;
        }
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor de resposta para logout automático em 401
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          if (typeof forceLogout === "function") forceLogout();
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    return this.instance.get<T>(url, config).then((res) => res.data);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.post<T>(url, data, config).then((res) => res.data);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.put<T>(url, data, config).then((res) => res.data);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.instance.delete<T>(url, config).then((res) => res.data);
  }
}

export const httpClient = new HttpClient();
