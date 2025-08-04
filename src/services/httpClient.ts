import {
  ILead,
  ILeadsResponse,
  ILeadsFilters,
  ILeadsTotais,
  ILeadsTotaisFilters,
  IEtapaLead,
  ISituacaoLead,
  IConsultor,
  ILeadAtividade,
} from "./interfaces/ILead";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.nexusvitally.com.br";

class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorMessage = `HTTP error! status: ${response.status} - ${response.statusText}`;
        console.error(`Request failed for ${url}:`, errorMessage);
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error(`Network error - API não disponível em ${url}:`, error);
        throw new Error(
          `API não disponível em ${this.baseURL}. Verifique se o servidor está rodando.`
        );
      }
      console.error(`Request failed for ${url}:`, error);
      throw error;
    }
  }

  // Métodos para leads
  async getLeads(filters: ILeadsFilters = {}): Promise<ILeadsResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/leads?${queryString}` : "/leads";

    return this.request<ILeadsResponse>(endpoint);
  }

  // Método para buscar totais de leads
  async getLeadsTotais(
    filters: ILeadsTotaisFilters = {}
  ): Promise<ILeadsTotais> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString
      ? `/leads/totais?${queryString}`
      : "/leads/totais";

    return this.request<ILeadsTotais>(endpoint);
  }

  // Métodos para dropdowns
  async getEtapasLead(): Promise<IEtapaLead[]> {
    return this.request<IEtapaLead[]>("/etapas-lead/dropdown");
  }

  async getSituacaoLead(): Promise<ISituacaoLead[]> {
    return this.request<ISituacaoLead[]>("/situacao-lead/dropdown");
  }

  async getConsultores(): Promise<IConsultor[]> {
    return this.request<IConsultor[]>("/pessoa/representante/dropdown");
  }

  async vincularConsultorAoLead(
    idLead: number,
    idConsultor: number
  ): Promise<any> {
    try {
      const response = await this.request<any>(
        `/leads/${idLead}/vincular-consultor?id_consultor=${idConsultor}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao vincular consultor ao lead:", error);
      throw error;
    }
  }

  async atualizarEtapaSituacaoLead(
    idLead: number,
    idEtapa: number,
    idSituacao: number
  ): Promise<any> {
    try {
      const response = await this.request<any>(
        `/leads/${idLead}/atualizar-etapa-situacao?id_etapa=${idEtapa}&id_situacao=${idSituacao}`,
        {
          method: "PUT",
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao atualizar etapa e situação do lead:", error);
      throw error;
    }
  }

  // Método para buscar atividades do lead
  async getLeadAtividades(idLead: number): Promise<ILeadAtividade[]> {
    try {
      const response = await this.request<ILeadAtividade[]>(
        `/leads/${idLead}/atividades`
      );
      return response;
    } catch (error) {
      console.error("Erro ao buscar atividades do lead:", error);
      throw error;
    }
  }
}

export const httpClient = new HttpClient(API_BASE_URL);
