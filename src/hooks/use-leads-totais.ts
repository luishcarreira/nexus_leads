import { useState, useEffect, useCallback } from "react";
import { httpClient } from "@/services/httpClient";
import {
  ILeadsTotaisFilters,
  ILeadsTotaisDetalhados,
  ITotalPorOrigemDetalhado,
  ITotalPorTipoProcuraDetalhado,
} from "@/services/interfaces/ILead";

interface PaginacaoOutput<T> {
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
  dados: T[];
}

interface ILeadResumo {
  id: number;
  nome: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  uf?: string;
  data_criacao?: string;
  vendedor?: string;
  consultor?: string;
  situacao?: string;
  origem?: string;
  procura_para?: string;
}

interface TotalPorOrigem {
  origem: string;
  total: number;
  leads: PaginacaoOutput<ILeadResumo>;
}

interface TotalPorTipoProcura {
  tipo_procura: string;
  total: number;
  leads: PaginacaoOutput<ILeadResumo>;
}

interface TotalTransferidos {
  total: number;
  leads: PaginacaoOutput<ILeadResumo>;
}

interface TotalNaoTransferidos {
  total: number;
  leads: PaginacaoOutput<ILeadResumo>;
}

// Removendo interface duplicada - usando a do arquivo de interfaces

interface UseLeadsTotaisReturn {
  totais: ILeadsTotaisDetalhados | null;
  loading: boolean;
  error: string | null;
  fetchTotais: (filters?: ILeadsTotaisFilters) => Promise<void>;
  fetchDetalhesOrigem: (origem: string, pagina: number) => Promise<void>;
  fetchDetalhesTipoProcura: (
    tipoProcura: string,
    pagina: number
  ) => Promise<void>;
  fetchDetalhesTransferidos: (pagina: number) => Promise<void>;
  fetchDetalhesNaoTransferidos: (pagina: number) => Promise<void>;
  currentFilters: ILeadsTotaisFilters;
}

const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);

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
  const defaultFilters = {
    ...getDefaultDateRange(),
    pagina: 1,
    limite: 10,
  };

  const [totais, setTotais] = useState<ILeadsTotaisDetalhados | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] =
    useState<ILeadsTotaisFilters>(defaultFilters);

  const fetchTotais = useCallback(async (filters: ILeadsTotaisFilters = {}) => {
    try {
      console.log("Buscando totais com filtros:", {
        ...defaultFilters,
        ...filters,
      });
      setLoading(true);
      setError(null);

      const mergedFilters = { ...defaultFilters, ...filters };
      setCurrentFilters(mergedFilters);

      // Buscar dados de cada endpoint em paralelo
      const [porOrigem, porTipoProcura, transferidos] = await Promise.all([
        httpClient.getLeadsTotaisPorOrigem(mergedFilters),
        httpClient.getLeadsTotaisPorTipoProcura(mergedFilters),
        httpClient.getLeadsTotaisTransferidos(mergedFilters),
      ]);

      console.log("Resposta por origem:", porOrigem);
      console.log("Resposta por tipo procura:", porTipoProcura);
      console.log("Por origem tem dados?", !!porOrigem.totais_por_origem);
      console.log(
        "Por tipo procura tem dados?",
        !!porTipoProcura.total_por_tipo_procura
      );
      console.log(
        "Por tipo procura tem total_por_tipo_procura?",
        !!porTipoProcura.total_por_tipo_procura
      );
      console.log("Chaves de porTipoProcura:", Object.keys(porTipoProcura));

      // Combinar os resultados
      const combinedData: ILeadsTotaisDetalhados = {
        total_leads: porOrigem.total_leads, // Todos devem retornar o mesmo total
        totais_por_origem: porOrigem.totais_por_origem,
        total_por_tipo_procura: porTipoProcura.total_por_tipo_procura || [],
        transferidos: transferidos.transferidos,
        nao_transferidos: transferidos.nao_transferidos,
      };

      console.log("Dados combinados:", combinedData);
      console.log("Totais por origem:", combinedData.totais_por_origem);
      console.log(
        "Totais por tipo procura:",
        combinedData.total_por_tipo_procura
      );
      console.log("Estrutura porOrigem:", Object.keys(porOrigem));
      console.log("Estrutura porTipoProcura:", Object.keys(porTipoProcura));

      setTotais(combinedData);
    } catch (err) {
      console.error("Erro ao carregar totais:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar totais");
      setTotais(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetalhesOrigem = useCallback(
    async (origem: string, pagina: number) => {
      try {
        setLoading(true);
        setError(null);

        const response = await httpClient.getLeadsTotaisPorOrigem({
          ...currentFilters,
          origem,
          pagina,
          limite: 10,
        });

        if (totais) {
          const updatedTotais = {
            ...totais,
            totais_por_origem: totais.totais_por_origem.map((item) =>
              item.origem === origem
                ? { ...item, leads: response.totais_por_origem[0].leads }
                : item
            ),
          };
          setTotais(updatedTotais);
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes por origem:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao carregar detalhes"
        );
      } finally {
        setLoading(false);
      }
    },
    [currentFilters, totais]
  );

  const fetchDetalhesTipoProcura = useCallback(
    async (tipoProcura: string, pagina: number) => {
      try {
        setLoading(true);
        setError(null);

        const response = await httpClient.getLeadsTotaisPorTipoProcura({
          ...currentFilters,
          tipo_procura: tipoProcura,
          pagina,
          limite: 10,
        });

        if (totais) {
          const updatedTotais = {
            ...totais,
            total_por_tipo_procura: totais.total_por_tipo_procura.map((item) =>
              item.tipo_procura === tipoProcura
                ? { ...item, leads: response.total_por_tipo_procura[0].leads }
                : item
            ),
          };
          setTotais(updatedTotais);
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes por tipo de procura:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao carregar detalhes"
        );
      } finally {
        setLoading(false);
      }
    },
    [currentFilters, totais]
  );

  const fetchDetalhesTransferidos = useCallback(
    async (pagina: number) => {
      try {
        setLoading(true);
        setError(null);

        const response = await httpClient.getLeadsTotaisTransferidos({
          ...currentFilters,
          transferidos: true,
          pagina,
          limite: 10,
        });

        if (totais) {
          const updatedTotais = {
            ...totais,
            transferidos: response.transferidos,
          };
          setTotais(updatedTotais);
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes de transferidos:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao carregar detalhes"
        );
      } finally {
        setLoading(false);
      }
    },
    [currentFilters, totais]
  );

  const fetchDetalhesNaoTransferidos = useCallback(
    async (pagina: number) => {
      try {
        setLoading(true);
        setError(null);

        const response = await httpClient.getLeadsTotaisTransferidos({
          ...currentFilters,
          nao_transferidos: true,
          pagina,
          limite: 10,
        });

        if (totais) {
          const updatedTotais = {
            ...totais,
            nao_transferidos: response.nao_transferidos,
          };
          setTotais(updatedTotais);
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes de não transferidos:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao carregar detalhes"
        );
      } finally {
        setLoading(false);
      }
    },
    [currentFilters, totais]
  );

  // Carregar dados iniciais com filtro default
  useEffect(() => {
    fetchTotais();
  }, [fetchTotais]);

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
