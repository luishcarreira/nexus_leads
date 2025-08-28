import { httpClient } from "./httpClient";
import {
  ILead,
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

export class LeadsService {
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
    return httpClient.get<{
      total: number;
      data: { id: string; descricao: string }[];
    }>("/cidade/dropdown", { params });
  }

  // Método para buscar leads com filtros
  async getLeads(filters: ILeadsFilters = {}): Promise<ILeadsResponse> {
    try {
      return await httpClient.get<ILeadsResponse>("/leads", {
        params: filters,
      });
    } catch (error) {
      throw error;
    }
  }

  // Método para buscar totais de leads
  async getLeadsTotais(filters: ILeadsFilters = {}): Promise<ILeadsTotais> {
    try {
      return await httpClient.get<ILeadsTotais>("/leads/totais", {
        params: filters,
      });
    } catch (error) {
      throw error;
    }
  }

  // Método para buscar etapas do lead
  async getEtapasLead(): Promise<IEtapaLead[]> {
    return httpClient.get<IEtapaLead[]>("/etapas-lead/dropdown");
  }

  // Método para buscar situações do lead
  async getSituacaoLead(): Promise<ISituacaoLead[]> {
    return httpClient.get<ISituacaoLead[]>("/situacao-lead/dropdown");
  }

  // Método para buscar consultores
  async getConsultores(): Promise<IConsultor[]> {
    return httpClient.get<IConsultor[]>("/pessoa/representante/dropdown");
  }

  async getVendedores(): Promise<IConsultor[]> {
    return httpClient.get<IConsultor[]>("/pessoa/vendedor/dropdown");
  }

  // Método para buscar dropdown de origens
  async getDropdownOrigem(): Promise<{ origem: string; total: number }[]> {
    return httpClient.get<{ origem: string; total: number }[]>(
      "/leads/dropdown/origem"
    );
  }

  // Método para buscar dropdown de tipos de procura
  async getDropdownTipoProcura(): Promise<
    { tipo_procura: string; total: number }[]
  > {
    return httpClient.get<{ tipo_procura: string; total: number }[]>(
      "/leads/dropdown/tipo-procura"
    );
  }

  // Método para vincular consultor ao lead
  async vincularConsultorAoLead(
    idLead: number,
    idConsultor: number
  ): Promise<any> {
    try {
      return await httpClient.get<any>(`/leads/${idLead}/vincular-consultor`, {
        params: { id_consultor: idConsultor },
      });
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
      return await httpClient.get<any>(`/leads/${idLead}/vincular-vendedor`, {
        params: { id_vendedor: idVendedor },
      });
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
      return await httpClient.put<any>(
        `/leads/${idLead}/atualizar-etapa-situacao`,
        undefined,
        { params: { id_etapa: idEtapa, id_situacao: idSituacao } }
      );
    } catch (error) {
      throw error;
    }
  }

  // Método para buscar atividades do lead
  async getLeadAtividades(idLead: number): Promise<ILeadAtividade[]> {
    try {
      return await httpClient.get<ILeadAtividade[]>(
        `/leads/${idLead}/atividades`
      );
    } catch (error) {
      throw error;
    }
  }

  // Método para buscar ramos de atividade
  async getRamosAtividade(): Promise<{ codigo: string; descricao: string }[]> {
    return httpClient.get<{ codigo: string; descricao: string }[]>(
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

    return httpClient.post<boolean>("/leads/converter-cliente", bodyWithUser);
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
  }): Promise<boolean> {
    try {
      return await httpClient.post<boolean>("/leads/criar-rapido", leadData);
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
    } as unknown as TotaisPorOrigem;
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
    const raw = await httpClient.get<Array<{ ORIGEM: string; TOTAL: number }>>(
      "/leads/origens/totais",
      { params: filters }
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
    return httpClient.get(`/leads/origens/${encodeURIComponent(origem)}`, {
      params: rest,
    });
  }

  async getTiposProcuraTotais(
    filters: ILeadsFilters = {}
  ): Promise<{ tipo_procura: string; total: number }[]> {
    const raw = await httpClient.get<
      Array<{ TIPO_PROCURA: string; TOTAL: number }>
    >("/leads/tipos-procura/totais", { params: filters });
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
    return httpClient.get(
      `/leads/tipos-procura/${encodeURIComponent(tipoProcura)}`,
      { params: rest }
    );
  }

  async getLeadsTransferidos(filters: ILeadsFilters = {}): Promise<{
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILead[] | any[];
  }> {
    return httpClient.get("/leads/transferidos", { params: filters });
  }

  async getLeadsNaoTransferidos(filters: ILeadsFilters = {}): Promise<{
    total: number;
    pagina: number;
    limite: number;
    total_paginas: number;
    dados: ILead[] | any[];
  }> {
    return httpClient.get("/leads/nao-transferidos", { params: filters });
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
    return httpClient.get("/leads/vendedores/totais", { params: filters });
  }

  // Totais de tipos de procura por vendedor específico
  async getTotaisTiposProcuraPorVendedor(
    idVendedor: number,
    filters: ILeadsFilters = {}
  ): Promise<{ tipo_procura: string; total: number }[]> {
    const raw = await httpClient.get<
      Array<{ TIPO_PROCURA: string; TOTAL: number }>
    >(`/leads/vendedores/${idVendedor}/tipos-procura/totais`, {
      params: filters,
    });
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
    return httpClient.get(
      `/leads/vendedores/${encodeURIComponent(idVendedor)}`,
      { params: rest }
    );
  }
}

export const leadsService = new LeadsService();
