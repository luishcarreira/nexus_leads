import { useState, useEffect, useCallback } from "react";
import { leadsService } from "@/services/LeadsService";
import {
  ILeadsFilters,
  ILeadsTotaisDetalhados,
  ITotalPorOrigemDetalhado,
  ITotalPorTipoProcuraDetalhado,
  ILeadTotal,
} from "@/services/interfaces/ILead";

interface PaginacaoOutput<T> {
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
  dados: T[];
}

interface TotalPorOrigem {
  origem: string;
  total: number;
  leads: PaginacaoOutput<ILeadTotal>;
}

interface TotalPorTipoProcura {
  tipo_procura: string;
  total: number;
  leads: PaginacaoOutput<ILeadTotal>;
}

interface TotalTransferidos {
  total: number;
  leads: PaginacaoOutput<ILeadTotal>;
}

interface TotalNaoTransferidos {
  total: number;
  leads: PaginacaoOutput<ILeadTotal>;
}

// Removendo interface duplicada - usando a do arquivo de interfaces

interface UseLeadsTotaisReturn {
  totais: ILeadsTotaisDetalhados | null;
  loading: boolean;
  error: string | null;
  fetchTotais: (filters?: ILeadsFilters) => Promise<void>;
  fetchDetalhesOrigem: (origem: string, pagina: number) => Promise<void>;
  fetchDetalhesTipoProcura: (
    tipoProcura: string,
    pagina: number
  ) => Promise<void>;
  fetchDetalhesTransferidos: (pagina: number) => Promise<void>;
  fetchDetalhesNaoTransferidos: (pagina: number) => Promise<void>;
  currentFilters: ILeadsFilters;
}

const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 3); // Alterado de 7 para 3 dias para ser consistente

  // Formatar para YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  return {
    data_criacao_inicio: formatDate(start),
    data_criacao_fim: formatDate(end),
  };
};

export const useLeadsTotais = (): UseLeadsTotaisReturn => {
  // Não aplicar datas por padrão. Datas só devem ser enviadas quando o usuário selecionar.
  const defaultFilters = {
    pagina: 1,
    limite: 10,
  } as ILeadsFilters;

  const [totais, setTotais] = useState<ILeadsTotaisDetalhados | null>(null);
  const [loading, setLoading] = useState(false); // Alterado de true para false
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] =
    useState<ILeadsFilters>(defaultFilters);

  const fetchTotais = useCallback(async (filters: ILeadsFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Aplicar apenas pagina/limite como default, sem injetar datas automaticamente
      const mergedFilters: ILeadsFilters = {
        pagina: filters.pagina ?? defaultFilters.pagina,
        limite: filters.limite ?? defaultFilters.limite,
        ...filters,
      };
      setCurrentFilters(mergedFilters);

      // Buscar dados de cada endpoint em paralelo (novos endpoints)
      const [origensTotais, tiposTotais, transferidos] = await Promise.all([
        leadsService.getOrigensTotais(mergedFilters),
        leadsService.getTiposProcuraTotais(mergedFilters),
        leadsService.getLeadsTotaisTransferidos({
          ...mergedFilters,
          transferido: null, // Buscar totais (transferidos + não transferidos)
          pagina: 1,
          limite: 10,
        }),
      ]);

      // Combinar os resultados ajustando para a interface usada no front
      const combinedData: ILeadsTotaisDetalhados = {
        total_leads:
          origensTotais.reduce((sum, o) => sum + o.total, 0) ||
          tiposTotais.reduce((sum, t) => sum + t.total, 0) ||
          (transferidos.transferidos?.total || 0) +
            (transferidos.nao_transferidos?.total || 0),
        totais_por_origem: origensTotais.map((o) => ({
          origem: o.origem,
          total: o.total,
          // leads serão buscados on-demand no modal específico
          leads: {
            total: 0,
            pagina: 1,
            limite: 10,
            total_paginas: 0,
            dados: [],
          },
        })),
        total_por_tipo_procura: tiposTotais.map((t) => ({
          tipo_procura: t.tipo_procura,
          total: t.total,
          leads: {
            total: 0,
            pagina: 1,
            limite: 10,
            total_paginas: 0,
            dados: [],
          },
        })),
        transferidos: transferidos.transferidos,
        nao_transferidos: transferidos.nao_transferidos,
      };

      setTotais(combinedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar totais");
      setTotais(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetalhesOrigem = useCallback(
    async (origem: string, pagina: number) => {
      try {
        // Não setar loading global para não afetar outros componentes
        setError(null);

        const response = await leadsService.getLeadsPorOrigem(origem, {
          ...currentFilters,
          pagina,
          limite: 10,
        });

        if (totais) {
          const updatedTotais = {
            ...totais,
            totais_por_origem: totais.totais_por_origem.map((item) =>
              item.origem === origem ? { ...item, leads: response } : item
            ),
          };
          setTotais(updatedTotais);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar detalhes"
        );
      }
    },
    [currentFilters, totais]
  );

  const fetchDetalhesTipoProcura = useCallback(
    async (tipoProcura: string, pagina: number) => {
      try {
        // Não setar loading global para não afetar outros componentes
        setError(null);

        const response = await leadsService.getLeadsPorTipoProcura(
          tipoProcura,
          {
            ...currentFilters,
            pagina,
            limite: 10,
          }
        );

        if (totais) {
          const updatedTotais = {
            ...totais,
            total_por_tipo_procura: totais.total_por_tipo_procura.map((item) =>
              item.tipo_procura === tipoProcura
                ? { ...item, leads: response }
                : item
            ),
          };
          setTotais(updatedTotais);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar detalhes"
        );
      }
    },
    [currentFilters, totais]
  );

  const fetchDetalhesTransferidos = useCallback(
    async (pagina: number) => {
      try {
        // Não setar loading global para não afetar outros componentes
        setError(null);

        const response = await leadsService.getLeadsTransferidos({
          ...currentFilters,
          pagina,
          limite: 10,
        });

        if (totais) {
          const updatedTotais = {
            ...totais,
            transferidos: response as unknown as PaginacaoOutput<ILeadTotal>,
          };
          setTotais(updatedTotais);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar detalhes"
        );
      }
    },
    [currentFilters, totais]
  );

  const fetchDetalhesNaoTransferidos = useCallback(
    async (pagina: number) => {
      try {
        // Não setar loading global para não afetar outros componentes
        setError(null);

        const response = await leadsService.getLeadsNaoTransferidos({
          ...currentFilters,
          pagina,
          limite: 10,
        });

        if (totais) {
          const updatedTotais = {
            ...totais,
            nao_transferidos:
              response as unknown as PaginacaoOutput<ILeadTotal>,
          };
          setTotais(updatedTotais);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar detalhes"
        );
      }
    },
    [currentFilters, totais]
  );

  // Carregar dados iniciais com filtro default
  // useEffect(() => {
  //   fetchTotais();
  // }, [fetchTotais]);

  return {
    totais,
    loading,
    error,
    fetchTotais,
    fetchDetalhesOrigem,
    fetchDetalhesTipoProcura,
    fetchDetalhesTransferidos,
    fetchDetalhesNaoTransferidos,
    currentFilters,
  };
};
