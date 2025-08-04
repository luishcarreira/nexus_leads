import React, { useState, useCallback } from "react";
import { FilterSection } from "@/components/dashboard/FilterSection";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { useLeads } from "@/hooks/use-leads";
import { useLeadsTotais } from "@/hooks/use-leads-totais";
import {
  ILeadsFilters,
  ILeadsTotaisFilters,
} from "@/services/interfaces/ILead";
import { format } from "date-fns";

// Interface para os filtros da interface
interface UIFilters {
  creationDateRange?: { from: Date; to: Date };
  situacoes?: string[];
  origem?: string;
  tipoProcura?: string;
  nome?: string;
  email?: string;
  consultores?: string[];
  vendedores?: string[];
  ufs?: string[];
  apenasSemConsultor?: boolean;
}

const Index = () => {
  const [currentFilters, setCurrentFilters] = useState<UIFilters>({});
  const { leads, total, loading, error, fetchLeads } = useLeads();
  const {
    totais,
    loading: totaisLoading,
    error: totaisError,
    fetchTotais,
  } = useLeadsTotais();

  // Função para formatar data para o formato da API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date): string => {
    return format(date, "yyyy-MM-dd");
  };

  // Converter filtros da interface para o formato da API
  const convertFiltersToAPI = (filters: UIFilters): ILeadsFilters => {
    const apiFilters: ILeadsFilters = {};

    // Filtro por período de criação
    if (filters.creationDateRange?.from) {
      apiFilters.data_criacao_inicio = formatDateForAPI(
        filters.creationDateRange.from
      );
    }
    if (filters.creationDateRange?.to) {
      apiFilters.data_criacao_fim = formatDateForAPI(
        filters.creationDateRange.to
      );
    }

    // Filtro por situações
    if (filters.situacoes?.length > 0) {
      apiFilters.situacao = filters.situacoes.join(",");
    }

    // Filtro por origem
    if (filters.origem) {
      apiFilters.origem = filters.origem;
    }

    // Filtro por tipo de procura
    if (filters.tipoProcura) {
      apiFilters.tipo_procura = filters.tipoProcura;
    }

    // Filtro por nome
    if (filters.nome) {
      apiFilters.nome = filters.nome;
    }

    // Filtro por email
    if (filters.email) {
      apiFilters.email = filters.email;
    }

    // Filtro por consultores
    if (filters.consultores?.length > 0) {
      apiFilters.id_consultor = parseInt(filters.consultores[0]);
    }

    // Filtro por vendedores
    if (filters.vendedores?.length > 0) {
      apiFilters.id_vendedor = parseInt(filters.vendedores[0]);
    }

    return apiFilters;
  };

  // Converter filtros para totais (apenas período de criação)
  const convertFiltersToTotais = (filters: UIFilters): ILeadsTotaisFilters => {
    const totaisFilters: ILeadsTotaisFilters = {};

    // Filtro por período de criação
    if (filters.creationDateRange?.from) {
      totaisFilters.data_criacao_inicio = formatDateForAPI(
        filters.creationDateRange.from
      );
    }
    if (filters.creationDateRange?.to) {
      totaisFilters.data_criacao_fim = formatDateForAPI(
        filters.creationDateRange.to
      );
    }

    return totaisFilters;
  };

  const handleFiltersChange = useCallback(
    (newFilters: UIFilters) => {
      // Salvar os filtros no estado para manter na interface
      setCurrentFilters(newFilters);

      // Buscar leads com os novos filtros
      const leadsFilters = convertFiltersToAPI(newFilters);
      fetchLeads(leadsFilters);

      // Buscar totais com os novos filtros
      const totaisFilters = convertFiltersToTotais(newFilters);
      fetchTotais(totaisFilters);
    },
    [fetchLeads, fetchTotais]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar leads: {error}</p>
          <button
            onClick={() => fetchLeads()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-bg p-6">
      <div className="container mx-auto">
        {/* Seção de Filtros */}
        <FilterSection
          onFiltersChange={handleFiltersChange}
          currentFilters={currentFilters}
        />

        {/* Cards de Resumo */}
        <SummaryCards data={totais} loading={totaisLoading} />

        {/* Tabela de Leads */}
        <LeadsTable leads={leads} loading={loading} />
      </div>
    </div>
  );
};

export default Index;
