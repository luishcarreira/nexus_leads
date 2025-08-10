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
  creationDateRange?: { from?: Date; to?: Date } | undefined;
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
  const {
    leads,
    total,
    currentPage,
    totalPages,
    loading,
    error,
    fetchLeads,
    setPage,
  } = useLeads();
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
    return formatted;
  };

  // Converter filtros da interface para o formato da API
  const convertFiltersToAPI = (filters: UIFilters): ILeadsFilters => {
    const apiFilters: ILeadsFilters = {};

    // Filtro por período de criação - só adiciona se o range existir e tiver datas
    if (filters.creationDateRange && filters.creationDateRange.from) {
      apiFilters.data_criacao_inicio = formatDateForAPI(
        filters.creationDateRange.from
      );
    }
    if (filters.creationDateRange && filters.creationDateRange.to) {
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

  const handleFiltersChange = useCallback(
    (newFilters: UIFilters) => {
      // Buscar leads com os novos filtros
      const leadsFilters = convertFiltersToAPI(newFilters);
      fetchLeads(leadsFilters);

      // Buscar totais com os mesmos filtros
      fetchTotais(leadsFilters);

      // Salvar os filtros no estado para manter na interface
      setCurrentFilters(newFilters);
    },
    [fetchLeads, fetchTotais]
  );

  // Carregar dados iniciais com filtros padrão
  React.useEffect(() => {
    // Aplicar filtros padrão (últimos 3 dias)
    const defaultFilters: UIFilters = {
      creationDateRange: {
        from: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
        to: new Date(), // hoje
      },
    };

    // Buscar leads e totais com filtros padrão
    const leadsFilters = convertFiltersToAPI(defaultFilters);
    const totaisFilters = convertFiltersToAPI(defaultFilters); // This line was not in the new_code, but should be changed for consistency

    fetchLeads(leadsFilters);
    fetchTotais(totaisFilters);

    // Definir filtros padrão no estado
    setCurrentFilters(defaultFilters);
  }, []); // Executar apenas uma vez na montagem - fetchLeads e fetchTotais são estáveis

  // Exibir tela de loading APENAS na primeira carga
  const [initialLoading, setInitialLoading] = React.useState(true);
  React.useEffect(() => {
    // Só parar o loading inicial quando ambos leads e totais terminarem de carregar
    if (!loading && !totaisLoading) {
      setInitialLoading(false);
    }
  }, [loading, totaisLoading]);

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
            currentFilters={convertFiltersToAPI(currentFilters)}
          />
        )}

        {/* Tabela de Leads */}
        <LeadsTable
          leads={leads}
          total={total}
          currentPage={currentPage}
          totalPages={totalPages}
          loading={loading}
          onPageChange={setPage}
          onLeadCreated={() => {
            // Recarregar leads e totais mantendo filtros atuais
            const apiFilters = convertFiltersToAPI(currentFilters);
            fetchLeads(apiFilters);
            fetchTotais(apiFilters);
          }}
          onDataChanged={() => {
            // Recarregar leads e totais mantendo filtros atuais
            const apiFilters = convertFiltersToAPI(currentFilters);
            fetchLeads(apiFilters);
            fetchTotais(apiFilters);
          }}
        />
      </div>
    </div>
  );
};

export default Index;
