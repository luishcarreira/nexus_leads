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
import { authService } from "./authService";

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
  private isRefreshing: boolean = false;
  private refreshQueue: Array<() => void> = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultParams = "";
  }

  // Função auxiliar para construir query params limpos
  private buildQueryParams(filters: ILeadsFilters): URLSearchParams {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
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

  private async handleTokenRefresh<T>(
    url: string,
    options: RequestInit & { _retry?: boolean },
    headers: Record<string, string>
  ): Promise<T> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      try {
        await authService.refreshAccessToken();

        // Processar fila de requisições aguardando
        this.refreshQueue.forEach((resolve) => resolve());
        this.refreshQueue = [];

        // Tentar a requisição novamente com o novo token
        const newAccessToken = authService.getAccessToken();
        if (newAccessToken) {
          headers.Authorization = `Bearer ${newAccessToken}`;
          options._retry = true;

          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });

          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }

          return retryResponse.json();
        }
      } catch (refreshError) {
        console.error("Erro ao fazer refresh do token:", refreshError);
        // Se o refresh falhar, o authService já fez logout
        throw new Error("Authentication failed");
      } finally {
        this.isRefreshing = false;
      }
    }

    // Enquanto está fazendo refresh, aguardar na fila
    return new Promise((resolve) => {
      this.refreshQueue.push(() => {
        const newAccessToken = authService.getAccessToken();
        if (newAccessToken) {
          headers.Authorization = `Bearer ${newAccessToken}`;
          options._retry = true;

          fetch(url, {
            ...options,
            headers,
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then(resolve)
            .catch((error) => {
              console.error("Erro na requisição após refresh:", error);
              throw error;
            });
        } else {
          throw new Error("No access token available after refresh");
        }
      });
    });
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { _retry?: boolean } = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}${endpoint.includes("?") ? "&" : "?"
      }${this.defaultParams}`;

    // Adicionar Bearer token se disponível
    const accessToken = authService.getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Se receber 401, tentar refresh do token
    if (response.status === 401 && accessToken && !options._retry) {
      return this.handleTokenRefresh(url, options, headers);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Dropdown paginado de cidades
  async getDropdownCidade(
    params: {
      pagina?: number;
      limite?: number;
      order_by?: string;
      order_header?: string;
      nome?: string;
    } = {}
  ): Promise<{ total: number; data: { id: string; descricao: string }[] }> {
    const query = new URLSearchParams();
    if (params.pagina) query.append("pagina", params.pagina.toString());
    if (params.limite) query.append("limite", params.limite.toString());
    if (params.order_by) query.append("order_by", params.order_by);
    if (params.order_header) query.append("order_header", params.order_header);
    if (params.nome) query.append("nome", params.nome);

    return this.request<{
      total: number;
      data: { id: string; descricao: string }[];
    }>(`/cidade/dropdown?${query.toString()}`);
  }

  // Método para buscar leads com filtros
  async getLeads(filters: ILeadsFilters = {}): Promise<ILeadsResponse> {
    try {
      const queryParams = this.buildQueryParams(filters);

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
      const queryParams = this.buildQueryParams(filters);

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
    // Usar endpoint dedicado com cache no backend
    return this.request<{ origem: string; total: number }[]>(
      `/leads/dropdown/origem`
    );
  }

  // Método para buscar dropdown de tipos de procura
  async getDropdownTipoProcura(): Promise<
    { tipo_procura: string; total: number }[]
  > {
    // Usar endpoint dedicado com cache no backend
    return this.request<{ tipo_procura: string; total: number }[]>(
      `/leads/dropdown/tipo-procura`
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
    id_cidade?: string;
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
    email?: string | null;
    origem?: string;
  }): Promise<boolean> {
    try {
      const response = await this.request<boolean>("/leads/criar-rapido", {
        method: "POST",
        body: JSON.stringify(leadData),
      });
      return response;
    } catch (error) {
      console.error("Erro ao criar lead rápido:", error);
      throw error;
    }
  }

  // Método para buscar totais por origem
  async getLeadsTotaisPorOrigem(
    filters: ILeadsFilters = {}
  ): Promise<TotaisPorOrigem> {
    // Deprecated old combined endpoint. Reconstructed using new endpoints for backward compatibility.
    const origens = await this.getOrigensTotais(filters);
    // For compatibility, we will not prefetch leads per origem here to avoid N+1 requests.
    return {
      total_leads: origens.reduce((sum, o) => sum + o.total, 0),
      totais_por_origem: origens.map((o) => ({
        origem: o.origem,
        total: o.total,
        leads: {
          total: 0,
          pagina: 1,
          limite: filters.limite || 10,
          total_paginas: 0,
          dados: [],
        },
      })),
    } as unknown as TotaisPorOrigem; // NOTE: shape matches the old consumer expectations for totals
  }

  // Método para buscar totais por tipo de procura
  async getLeadsTotaisPorTipoProcura(
    filters: ILeadsFilters = {}
  ): Promise<TotaisPorTipoProcura> {
    // Deprecated old combined endpoint. Reconstructed using new endpoints for backward compatibility.
    const tipos = await this.getTiposProcuraTotais(filters);
    return {
      total_leads: tipos.reduce((sum, t) => sum + t.total, 0),
      totais_por_tipo_procura: tipos.map((t) => ({
        tipo_procura: t.tipo_procura,
        total: t.total,
        leads: {
          total: 0,
          pagina: 1,
          limite: filters.limite || 10,
          total_paginas: 0,
          dados: [],
        },
      })),
    } as unknown as TotaisPorTipoProcura;
  }

  // Método para buscar totais de transferidos
  async getLeadsTotaisTransferidos(
    filters: ILeadsFilters = {}
  ): Promise<TotaisTransferidos> {
    // Deprecated old combined endpoint. Reconstructed using new endpoints for backward compatibility.
    const [transferidos, nao_transferidos] = await Promise.all([
      this.getLeadsTransferidos(filters),
      this.getLeadsNaoTransferidos(filters),
    ]);
    return {
      total_leads: transferidos.total + nao_transferidos.total,
      transferidos,
      nao_transferidos,
    } as unknown as TotaisTransferidos;
  }

  // Novos endpoints conforme especificação
  async getOrigensTotais(
    filters: ILeadsFilters = {}
  ): Promise<{ origem: string; total: number }[]> {
    const queryParams = this.buildQueryParams(filters);
    const raw = await this.request<Array<{ ORIGEM: string; TOTAL: number }>>(
      `/leads/origens/totais?${queryParams.toString()}`
    );
    // Normalizar para chaves minúsculas esperadas no front
    return raw.map((item) => ({ origem: item.ORIGEM, total: item.TOTAL }));
  }

  async getLeadsPorOrigem(
    origem: string,
    filters: ILeadsFilters = {}
  ): Promise<{
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILead[] | any[];
  }> {
    const { origem: _omit, ...rest } = filters;
    const queryParams = this.buildQueryParams(rest);
    return this.request(
      `/leads/origens/${encodeURIComponent(origem)}?${queryParams.toString()}`
    );
  }

  async getTiposProcuraTotais(
    filters: ILeadsFilters = {}
  ): Promise<{ tipo_procura: string; total: number }[]> {
    const queryParams = this.buildQueryParams(filters);
    const raw = await this.request<
      Array<{ TIPO_PROCURA: string; TOTAL: number }>
    >(`/leads/tipos-procura/totais?${queryParams.toString()}`);
    return raw.map((item) => ({
      tipo_procura: item.TIPO_PROCURA,
      total: item.TOTAL,
    }));
  }

  async getLeadsPorTipoProcura(
    tipoProcura: string,
    filters: ILeadsFilters = {}
  ): Promise<{
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILead[] | any[];
  }> {
    const { tipo_procura: _omit, ...rest } = filters;
    const queryParams = this.buildQueryParams(rest);
    return this.request(
      `/leads/tipos-procura/${encodeURIComponent(
        tipoProcura
      )}?${queryParams.toString()}`
    );
  }

  // Totais por campanha
  async getCampanhasTotais(
    filters: ILeadsFilters = {}
  ): Promise<Array<{ campanha: string; total: number }>> {
    const queryParams = this.buildQueryParams(filters);
    const raw = await this.request<
      Array<{ CAMPANHA?: string; campanha?: string; TOTAL: number }>
    >(
      `/leads/campanhas/totais${queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`
    );
    return raw.map((item) => ({
      campanha: (item as any).campanha ?? (item as any).CAMPANHA ?? "",
      total: item.TOTAL,
    }));
  }

  // Listar leads por campanha com filtros
  async getLeadsPorCampanha(
    campanha: string,
    filters: ILeadsFilters = {}
  ): Promise<{
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILead[] | any[];
  }> {
    const { campanha: _omit, ...rest } = filters;
    const queryParams = this.buildQueryParams(rest);
    return this.request(
      `/leads/campanhas/${encodeURIComponent(campanha)}${queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`
    );
  }

  // Totais por anúncio (conjunto)
  async getAnunciosTotais(
    filters: ILeadsFilters = {}
  ): Promise<Array<{ anuncio: string; total: number }>> {
    const queryParams = this.buildQueryParams(filters);
    const raw = await this.request<
      Array<{ ANUNCIO?: string; anuncio?: string; TOTAL: number }>
    >(
      `/leads/anuncios/totais${queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`
    );
    return raw.map((item) => ({
      anuncio: (item as any).anuncio ?? (item as any).ANUNCIO ?? "",
      total: item.TOTAL,
    }));
  }

  // Listar leads por anúncio com filtros
  async getLeadsPorAnuncio(
    anuncio: string,
    filters: ILeadsFilters = {}
  ): Promise<{
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILead[] | any[];
  }> {
    const { anuncio: _omit, ...rest } = filters;
    const queryParams = this.buildQueryParams(rest);
    return this.request(
      `/leads/anuncios/${encodeURIComponent(anuncio)}${queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`
    );
  }

  // Totais por gestor
  async getGestoresTotais(
    filters: ILeadsFilters = {}
  ): Promise<Array<{ gestor: string; total: number }>> {
    const queryParams = this.buildQueryParams(filters);
    const raw = await this.request<Array<{ GESTOR: string; TOTAL: number }>>(
      `/leads/gestores/totais?${queryParams.toString()}`
    );
    return raw.map((item) => ({
      gestor: (item as any).GESTOR ?? "DESCONHECIDO",
      total: item.TOTAL,
    }));
  }

  // Listar leads por gestor com filtros
  async getLeadsPorGestor(
    gestor: string,
    filters: ILeadsFilters = {}
  ): Promise<{
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILead[] | any[];
  }> {
    const { gestor: _omit, ...rest } = filters as any;
    const queryParams = this.buildQueryParams(rest);
    return this.request(
      `/leads/gestores/${encodeURIComponent(gestor)}${queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`
    );
  }

  async getLeadsTransferidos(filters: ILeadsFilters = {}): Promise<{
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILead[] | any[];
  }> {
    const queryParams = this.buildQueryParams(filters);
    return this.request(`/leads/transferidos?${queryParams.toString()}`);
  }

  async getLeadsNaoTransferidos(filters: ILeadsFilters = {}): Promise<{
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILead[] | any[];
  }> {
    const queryParams = this.buildQueryParams(filters);
    return this.request(`/leads/nao-transferidos?${queryParams.toString()}`);
  }

  // Totais por vendedor (apenas transferidos), com filtros e paginação
  async getVendedoresTotais(filters: ILeadsFilters = {}): Promise<{
    totais_por_vendedor: Array<{
      id_vendedor: number;
      vendedor: string;
      total: number;
    }>;
    total_vendedores: number;
  }> {
    const queryParams = this.buildQueryParams(filters);
    return this.request(`/leads/vendedores/totais?${queryParams.toString()}`);
  }

  // Totais de tipos de procura por vendedor específico
  async getTotaisTiposProcuraPorVendedor(
    idVendedor: number,
    filters: ILeadsFilters = {}
  ): Promise<{ tipo_procura: string; total: number }[]> {
    const queryParams = this.buildQueryParams(filters);
    const raw = await this.request<
      Array<{ TIPO_PROCURA: string; TOTAL: number }>
    >(
      `/leads/vendedores/${idVendedor}/tipos-procura/totais?${queryParams.toString()}`
    );
    return raw.map((item) => ({
      tipo_procura: item.TIPO_PROCURA,
      total: item.TOTAL,
    }));
  }

  // Listar leads por vendedor com filtros (inclui tipo_procura)
  async getLeadsPorVendedor(
    idVendedor: number,
    filters: ILeadsFilters = {}
  ): Promise<{
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILead[] | any[];
  }> {
    const { id_vendedor: _omit, ...rest } = filters;
    const queryParams = this.buildQueryParams(rest);
    return this.request(
      `/leads/vendedores/${encodeURIComponent(
        idVendedor
      )}?${queryParams.toString()}`
    );
  }

  // Método para exportar leads para Excel
  async exportarLeadsExcel(filters: ILeadsFilters = {}): Promise<Blob> {
    const queryParams = this.buildQueryParams(filters);
    const endpoint = `/leads/exportar-excel?${queryParams.toString()}`;
    const url = `${this.baseURL}${endpoint}`;

    const accessToken = authService.getAccessToken();
    const headers: Record<string, string> = {};

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (response.status === 401 && accessToken) {
      // Tentar refresh se necessário (simplificado aqui, idealmente usar a lógica do request)
      // Como é um caso específico de blob, talvez valha a pena refatorar o request para suportar tipos de resposta
      // Mas por enquanto vamos assumir que o token está válido ou o usuário será deslogado em outras chamadas
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  // Método para exportar logs do ChatGuru para Excel
  async exportarLogsChatGuruExcel(filters?: {
    filtro_data?: string;
    id_lead?: number;
    sucesso?: boolean;
    mensagem_confirmada?: boolean;
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();

    if (filters?.filtro_data) {
      queryParams.append("filtro_data", filters.filtro_data);
    }
    if (filters?.id_lead !== undefined) {
      queryParams.append("id_lead", filters.id_lead.toString());
    }
    if (filters?.sucesso !== undefined) {
      queryParams.append("sucesso", filters.sucesso.toString());
    }
    if (filters?.mensagem_confirmada !== undefined) {
      queryParams.append(
        "mensagem_confirmada",
        filters.mensagem_confirmada.toString()
      );
    }

    const endpoint = `/leads/exportar-logs-chatguru-excel${queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
    const url = `${this.baseURL}${endpoint}`;

    const accessToken = authService.getAccessToken();
    const headers: Record<string, string> = {};

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (response.status === 401 && accessToken) {
      // Tentar refresh se necessário
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }
}

export const httpClient = new HttpClient(
  import.meta.env.VITE_API_URL || "https://api.nexusvitally.com.br"
  // import.meta.env.VITE_API_URL || "http://localhost:8001"
);
