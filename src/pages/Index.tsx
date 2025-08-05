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
import { ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [showTotais, setShowTotais] = useState(true);
  const { leads, total, loading, error, fetchLeads } = useLeads();
  const {
    totais,
    loading: totaisLoading,
    error: totaisError,
    fetchTotais,
    fetchDetalhesTransferidos,
    fetchDetalhesNaoTransferidos,
  } = useLeadsTotais();

  // Função para formatar data para o formato da API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date): string => {
    const formatted = format(date, "yyyy-MM-dd");
    console.log("Formatando data:", date, "para:", formatted);
    return formatted;
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

    // Filtro por UFs
    if (filters.ufs?.length > 0) {
      apiFilters.uf = filters.ufs.join(",");
    }

    return apiFilters;
  };

  // Converter filtros para totais (apenas período de criação)
  const convertFiltersToTotais = (filters: UIFilters): ILeadsTotaisFilters => {
    const totaisFilters: ILeadsTotaisFilters = {};

    console.log(
      "Convertendo filtros para totais - filtros recebidos:",
      filters
    );
    console.log("creationDateRange:", filters.creationDateRange);

    // Filtro por período de criação
    if (filters.creationDateRange?.from) {
      const dataInicio = formatDateForAPI(filters.creationDateRange.from);
      totaisFilters.data_criacao_inicio = dataInicio;
      console.log("Data início formatada:", dataInicio);
    }
    if (filters.creationDateRange?.to) {
      const dataFim = formatDateForAPI(filters.creationDateRange.to);
      totaisFilters.data_criacao_fim = dataFim;
      console.log("Data fim formatada:", dataFim);
    }

    // Log para debug
    console.log("Filtros convertidos para totais:", totaisFilters);

    return totaisFilters;
  };

  const handleFiltersChange = useCallback(
    (newFilters: UIFilters) => {
      console.log("Novos filtros aplicados:", newFilters);

      // Buscar leads com os novos filtros
      const leadsFilters = convertFiltersToAPI(newFilters);
      console.log("Filtros para leads:", leadsFilters);
      fetchLeads(leadsFilters);

      // Buscar totais com os novos filtros
      const totaisFilters = convertFiltersToTotais(newFilters);
      console.log("Filtros para totais:", totaisFilters);
      fetchTotais(totaisFilters);

      // Salvar os filtros no estado para manter na interface
      setCurrentFilters(newFilters);
    },
    [fetchLeads, fetchTotais]
  );

  // Carregar dados iniciais
  React.useEffect(() => {
    fetchLeads();
    fetchTotais();
  }, [fetchLeads, fetchTotais]);

  // Exibir tela de loading APENAS na primeira carga
  const [initialLoading, setInitialLoading] = React.useState(true);
  React.useEffect(() => {
    if (!loading) {
      setInitialLoading(false);
    }
  }, [loading]);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
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

        {/* Botão para colapsar/expandir totais */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => setShowTotais(!showTotais)}
            className="flex items-center gap-2 text-blue-700 hover:text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">
              {showTotais ? "Ocultar" : "Mostrar"} Resumo de Totais
            </span>
            {showTotais ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showTotais && totaisError && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-md">
              Erro ao carregar totais: {totaisError}
            </div>
          )}
        </div>

        {/* Cards de Resumo - Agora colapsáveis */}
        {showTotais && (
          <SummaryCards
            data={totais}
            loading={totaisLoading}
            onPageChange={{
              transferidos: fetchDetalhesTransferidos,
              naoTransferidos: fetchDetalhesNaoTransferidos,
            }}
          />
        )}

        {/* Tabela de Leads */}
        <LeadsTable leads={leads} total={total} loading={loading} />
      </div>
    </div>
  );
};

export default Index;
