import {
  ILead,
  ILeadsTotaisFilters,
  ILeadsFilters,
  ILeadsResponse,
  ILeadsTotais,
  IEtapaLead,
  ISituacaoLead,
  IConsultor,
  ILeadAtividade,
} from "./interfaces/ILead";

interface PaginacaoLeads {
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
  dados: ILead[];
}

interface TotalPorOrigem {
  origem: string;
  total: number;
  leads: PaginacaoLeads;
}

interface TotaisPorOrigem {
  total_leads: number;
  totais_por_origem: TotalPorOrigem[];
}

interface TotalPorTipoProcura {
  tipo_procura: string;
  total: number;
  leads: PaginacaoLeads;
}

interface TotaisPorTipoProcura {
  total_leads: number;
  totais_por_tipo_procura: TotalPorTipoProcura[];
}

interface TotaisTransferidos {
  total_leads: number;
  transferidos: {
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILead[];
  };
  nao_transferidos: {
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILead[];
  };
}

export class HttpClient {
  private baseURL: string;
  private defaultParams: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultParams = "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}${
      endpoint.includes("?") ? "&" : "?"
    }${this.defaultParams}`;

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Método para buscar leads com filtros
  async getLeads(filters: ILeadsFilters = {}): Promise<ILeadsResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Adicionar todos os filtros aos parâmetros da query
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });

      const response = await this.request<ILeadsResponse>(
        `/leads?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Método para buscar totais de leads
  async getLeadsTotais(filters: ILeadsFilters = {}): Promise<ILeadsTotais> {
    try {
      const queryParams = new URLSearchParams();

      // Filtros de data
      if (filters.data_criacao_inicio) {
        queryParams.append("data_criacao_inicio", filters.data_criacao_inicio);
      }
      if (filters.data_criacao_fim) {
        queryParams.append("data_criacao_fim", filters.data_criacao_fim);
      }

      // Filtros de situação
      if (filters.situacao) {
        queryParams.append("situacao", filters.situacao);
      }

      // Filtros de origem
      if (filters.origem) {
        queryParams.append("origem", filters.origem);
      }

      // Filtros de tipo de procura
      if (filters.tipo_procura) {
        queryParams.append("tipo_procura", filters.tipo_procura);
      }

      // Filtros de nome
      if (filters.nome) {
        queryParams.append("nome", filters.nome);
      }

      // Filtros de email
      if (filters.email) {
        queryParams.append("email", filters.email);
      }

      // Filtros de telefone
      if (filters.telefone) {
        queryParams.append("telefone", filters.telefone);
      }

      // Filtros de UF
      if (filters.uf) {
        queryParams.append("uf", filters.uf);
      }

      // Filtros de etapa
      if (filters.etapa) {
        queryParams.append("etapa", filters.etapa);
      }

      // Filtros de consultor
      if (filters.id_consultor) {
        queryParams.append("id_consultor", filters.id_consultor.toString());
      }

      // Filtros de vendedor
      if (filters.id_vendedor) {
        queryParams.append("id_vendedor", filters.id_vendedor.toString());
      }

      const response = await this.request<ILeadsTotais>(
        `/leads/totais?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Método para buscar etapas do lead
  async getEtapasLead(): Promise<IEtapaLead[]> {
    return this.request<IEtapaLead[]>("/etapas-lead/dropdown");
  }

  // Método para buscar situações do lead
  async getSituacaoLead(): Promise<ISituacaoLead[]> {
    return this.request<ISituacaoLead[]>("/situacao-lead/dropdown");
  }

  // Método para buscar consultores
  async getConsultores(): Promise<IConsultor[]> {
    return this.request<IConsultor[]>("/pessoa/representante/dropdown");
  }

  async getVendedores(): Promise<IConsultor[]> {
    return this.request<IConsultor[]>("/pessoa/vendedor/dropdown");
  }

  // Método para buscar dropdown de origens
  async getDropdownOrigem(): Promise<{ origem: string; total: number }[]> {
    return this.request<{ origem: string; total: number }[]>(
      "/leads/dropdown/origem"
    );
  }

  // Método para buscar dropdown de tipos de procura
  async getDropdownTipoProcura(): Promise<
    { tipo_procura: string; total: number }[]
  > {
    return this.request<{ tipo_procura: string; total: number }[]>(
      "/leads/dropdown/tipo-procura"
    );
  }

  // Método para vincular consultor ao lead
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
      throw error;
    }
  }

  // Método para vincular vendedor ao lead
  async vincularVendedorAoLead(
    idLead: number,
    idVendedor: number
  ): Promise<any> {
    try {
      const response = await this.request<any>(
        `/leads/${idLead}/vincular-vendedor?id_vendedor=${idVendedor}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
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
      throw error;
    }
  }

  // Método para buscar ramos de atividade
  async getRamosAtividade(): Promise<{ codigo: string; descricao: string }[]> {
    return this.request<{ codigo: string; descricao: string }[]>(
      "/ramo-atividade/dropdown"
    );
  }

  // Método para converter lead em cliente
  async converterLeadParaCliente(payload: {
    id_lead: number;
    nome: string;
    cpf?: string;
    cnpj?: string;
    email: string;
    telefone: string;
    fisica_juridica: "F" | "J";
    instagram?: string;
    facebook?: string;
    id_vendedor: number;
    id_ramo_atividade: string;
    id_usuario?: string;
  }): Promise<boolean> {
    const bodyWithUser = {
      ...payload,
      id_usuario:
        payload.id_usuario || localStorage.getItem("usrcod") || "admin",
    };

    return this.request<boolean>("/leads/converter-cliente", {
      method: "POST",
      body: JSON.stringify(bodyWithUser),
    });
  }

  // Método para criar lead rápido
  async criarLeadRapido(leadData: {
    nome: string;
    telefone: string;
    cidade: string;
    uf: string;
    valor_investimento: number | null;
    tem_ponto: boolean;
  }): Promise<boolean> {
    try {
      const response = await this.request<boolean>("/leads/criar-rapido", {
        method: "POST",
        body: JSON.stringify(leadData),
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Método para buscar totais por origem
  async getLeadsTotaisPorOrigem(
    filters: ILeadsFilters = {}
  ): Promise<TotaisPorOrigem> {
    try {
      const queryParams = new URLSearchParams();

      // Filtros de data
      if (filters.data_criacao_inicio) {
        queryParams.append("data_criacao_inicio", filters.data_criacao_inicio);
      }
      if (filters.data_criacao_fim) {
        queryParams.append("data_criacao_fim", filters.data_criacao_fim);
      }

      // Filtros de situação
      if (filters.situacao) {
        queryParams.append("situacao", filters.situacao);
      }

      // Filtros de origem
      if (filters.origem) {
        queryParams.append("origem", filters.origem);
      }

      // Filtros de tipo de procura
      if (filters.tipo_procura) {
        queryParams.append("tipo_procura", filters.tipo_procura);
      }

      // Filtros de nome
      if (filters.nome) {
        queryParams.append("nome", filters.nome);
      }

      // Filtros de email
      if (filters.email) {
        queryParams.append("email", filters.email);
      }

      // Filtros de telefone
      if (filters.telefone) {
        queryParams.append("telefone", filters.telefone);
      }

      // Filtros de UF
      if (filters.uf) {
        queryParams.append("uf", filters.uf);
      }

      // Filtros de etapa
      if (filters.etapa) {
        queryParams.append("etapa", filters.etapa);
      }

      // Filtros de consultor
      if (filters.id_consultor) {
        queryParams.append("id_consultor", filters.id_consultor.toString());
      }

      // Filtros de vendedor
      if (filters.id_vendedor) {
        queryParams.append("id_vendedor", filters.id_vendedor.toString());
      }

      // Filtros de paginação
      if (filters.pagina) {
        queryParams.append("pagina", filters.pagina.toString());
      }
      if (filters.limite) {
        queryParams.append("limite", filters.limite.toString());
      }

      const response = await this.request<TotaisPorOrigem>(
        `/leads/totais/por-origem?${queryParams.toString()}`
      );
      return response;
    } catch (err) {
      throw err;
    }
  }

  // Método para buscar totais por tipo de procura
  async getLeadsTotaisPorTipoProcura(
    filters: ILeadsFilters = {}
  ): Promise<TotaisPorTipoProcura> {
    try {
      const queryParams = new URLSearchParams();

      // Filtros de data
      if (filters.data_criacao_inicio) {
        queryParams.append("data_criacao_inicio", filters.data_criacao_inicio);
      }
      if (filters.data_criacao_fim) {
        queryParams.append("data_criacao_fim", filters.data_criacao_fim);
      }

      // Filtros de situação
      if (filters.situacao) {
        queryParams.append("situacao", filters.situacao);
      }

      // Filtros de origem
      if (filters.origem) {
        queryParams.append("origem", filters.origem);
      }

      // Filtros de tipo de procura
      if (filters.tipo_procura) {
        queryParams.append("tipo_procura", filters.tipo_procura);
      }

      // Filtros de nome
      if (filters.nome) {
        queryParams.append("nome", filters.nome);
      }

      // Filtros de email
      if (filters.email) {
        queryParams.append("email", filters.email);
      }

      // Filtros de telefone
      if (filters.telefone) {
        queryParams.append("telefone", filters.telefone);
      }

      // Filtros de UF
      if (filters.uf) {
        queryParams.append("uf", filters.uf);
      }

      // Filtros de etapa
      if (filters.etapa) {
        queryParams.append("etapa", filters.etapa);
      }

      // Filtros de consultor
      if (filters.id_consultor) {
        queryParams.append("id_consultor", filters.id_consultor.toString());
      }

      // Filtros de vendedor
      if (filters.id_vendedor) {
        queryParams.append("id_vendedor", filters.id_vendedor.toString());
      }

      // Filtros de paginação
      if (filters.pagina) {
        queryParams.append("pagina", filters.pagina.toString());
      }
      if (filters.limite) {
        queryParams.append("limite", filters.limite.toString());
      }

      const response = await this.request<TotaisPorTipoProcura>(
        `/leads/totais/por-tipo-procura?${queryParams.toString()}`
      );
      return response;
    } catch (err) {
      throw err;
    }
  }

  // Método para buscar totais de transferidos
  async getLeadsTotaisTransferidos(
    filters: ILeadsFilters = {}
  ): Promise<TotaisTransferidos> {
    try {
      const queryParams = new URLSearchParams();

      // Filtros de data
      if (filters.data_criacao_inicio) {
        queryParams.append("data_criacao_inicio", filters.data_criacao_inicio);
      }
      if (filters.data_criacao_fim) {
        queryParams.append("data_criacao_fim", filters.data_criacao_fim);
      }

      // Filtros de situação
      if (filters.situacao) {
        queryParams.append("situacao", filters.situacao);
      }

      // Filtros de origem
      if (filters.origem) {
        queryParams.append("origem", filters.origem);
      }

      // Filtros de tipo de procura
      if (filters.tipo_procura) {
        queryParams.append("tipo_procura", filters.tipo_procura);
      }

      // Filtros de nome
      if (filters.nome) {
        queryParams.append("nome", filters.nome);
      }

      // Filtros de email
      if (filters.email) {
        queryParams.append("email", filters.email);
      }

      // Filtros de telefone
      if (filters.telefone) {
        queryParams.append("telefone", filters.telefone);
      }

      // Filtros de UF
      if (filters.uf) {
        queryParams.append("uf", filters.uf);
      }

      // Filtros de etapa
      if (filters.etapa) {
        queryParams.append("etapa", filters.etapa);
      }

      // Filtros de consultor
      if (filters.id_consultor) {
        queryParams.append("id_consultor", filters.id_consultor.toString());
      }

      // Filtros de vendedor
      if (filters.id_vendedor) {
        queryParams.append("id_vendedor", filters.id_vendedor.toString());
      }

      // Filtros de paginação
      if (filters.pagina) {
        queryParams.append("pagina", filters.pagina.toString());
      }
      if (filters.limite) {
        queryParams.append("limite", filters.limite.toString());
      }

      // Filtro específico de transferido
      if (filters.transferido !== undefined && filters.transferido !== null) {
        queryParams.append("transferido", filters.transferido.toString());
      }

      const response = await this.request<TotaisTransferidos>(
        `/leads/totais/transferidos?${queryParams.toString()}`
      );
      return response;
    } catch (err) {
      throw err;
    }
  }
}

export const httpClient = new HttpClient(
  import.meta.env.VITE_API_URL || "https://api.nexusvitally.com.br"
);
