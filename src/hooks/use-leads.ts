import { useState, useEffect, useCallback } from "react";
import { httpClient } from "@/services/httpClient";
import {
  ILead,
  ILeadsResponse,
  ILeadsFilters,
} from "@/services/interfaces/ILead";

interface UseLeadsReturn {
  leads: ILead[];
  total: number;
  loading: boolean;
  error: string | null;
  fetchLeads: (filters?: ILeadsFilters) => Promise<void>;
}

export const useLeads = (): UseLeadsReturn => {
  const [leads, setLeads] = useState<ILead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async (filters: ILeadsFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response: ILeadsResponse = await httpClient.getLeads(filters);
      setLeads(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar leads");
      console.error("Erro ao carregar leads:", err);
      setLeads([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    fetchLeads();
  }, []);

  return {
    leads,
    total,
    loading,
    error,
    fetchLeads,
  };
};
