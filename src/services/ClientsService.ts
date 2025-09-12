import { httpClient } from "./httpClient";
import { ILead } from "./interfaces/ILead";

// Interface específica para filtros de clientes
export interface IClientFilters {
  data_criacao_inicio?: string;
  data_criacao_fim?: string;
  id_vendedor?: number;
  situacao?: string;
  pagina?: number;
  limite?: number;
  order_by?: string;
  order_header?: string;
}

// Interface para resposta de clientes
export interface IClientsResponse {
  data: ILead[];
  total: number;
}

// Interface para totais de vendedores de clientes
export interface IVendedoresClientesResponse {
  totais_por_vendedor: Array<{
    id_vendedor: number;
    vendedor: string;
    total: number;
    valor_cotacoes_abertas?: number;
  }>;
  total_vendedores: number;
}

// Interface para status por vendedor de clientes
export interface IStatusVendedorClientesResponse {
  id_vendedor: number;
  vendedor: string;
  totais_por_situacao: Array<{
    situacao: string;
    total: number;
    valor_cotacoes_abertas?: number;
  }>;
  total_situacoes: number;
}

export class ClientsService {
  // Buscar clientes convertidos com filtros específicos
  async getClients(filters: IClientFilters = {}): Promise<IClientsResponse> {
    try {
      return await httpClient.get<IClientsResponse>("/leads", {
        params: {
          ...filters,
          somente_leads_convertidos: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // Buscar totais de vendedores para clientes
  async getVendedoresTotais(
    filters: IClientFilters = {}
  ): Promise<IVendedoresClientesResponse> {
    try {
      return await httpClient.get<IVendedoresClientesResponse>(
        "/leads/vendedores/totais",
        {
          params: {
            ...filters,
            transferido: true,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  }

  // Buscar status por vendedor para clientes
  async getStatusPorVendedor(
    idVendedor: number,
    filters: IClientFilters = {}
  ): Promise<IStatusVendedorClientesResponse> {
    try {
      const raw = await httpClient.get<{
        id_vendedor: number;
        vendedor: string;
        totais_por_situacao: Array<{
          situacao: string;
          total_leads: number;
          valor_cotacoes_abertas?: number;
        }>;
        total_situacoes: number;
      }>(`/leads/vendedores/${encodeURIComponent(idVendedor)}/status/totais`, {
        params: {
          ...filters,
          transferido: true,
        },
      });

      return {
        id_vendedor: raw.id_vendedor,
        vendedor: raw.vendedor,
        totais_por_situacao: raw.totais_por_situacao.map((s) => ({
          situacao: s.situacao,
          total: s.total_leads,
          valor_cotacoes_abertas: s.valor_cotacoes_abertas,
        })),
        total_situacoes: raw.total_situacoes,
      };
    } catch (error) {
      throw error;
    }
  }
}

export const clientsService = new ClientsService();
