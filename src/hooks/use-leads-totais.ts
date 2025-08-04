import { useState, useEffect, useCallback } from "react";
import { httpClient } from "@/services/httpClient";
import { ILeadsTotais, ILeadsTotaisFilters } from "@/services/interfaces/ILead";

interface UseLeadsTotaisReturn {
  totais: ILeadsTotais | null;
  loading: boolean;
  error: string | null;
  fetchTotais: (filters?: ILeadsTotaisFilters) => Promise<void>;
}

export const useLeadsTotais = (): UseLeadsTotaisReturn => {
  const [totais, setTotais] = useState<ILeadsTotais | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTotais = useCallback(async (filters: ILeadsTotaisFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response: ILeadsTotais = await httpClient.getLeadsTotais(filters);
      setTotais(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar totais");
      console.error("Erro ao carregar totais:", err);
      setTotais(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    fetchTotais();
  }, []);

  return {
    totais,
    loading,
    error,
    fetchTotais,
  };
};
