import { useState, useEffect, useCallback } from "react";
import { leadsService } from "@/services/LeadsService";
import {
  ILead,
  ILeadsResponse,
  ILeadsFilters,
} from "@/services/interfaces/ILead";

interface UseLeadsReturn {
  leads: ILead[];
  total: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  fetchLeads: (filters?: ILeadsFilters) => Promise<void>;
  setPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
}

export const useLeads = (): UseLeadsReturn => {
  const [leads, setLeads] = useState<ILead[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [loading, setLoading] = useState(false); // Alterado de true para false
  const [error, setError] = useState<string | null>(null);
  const [lastFilters, setLastFilters] = useState<ILeadsFilters>({});

  const fetchLeads = useCallback(
    async (filters: ILeadsFilters = {}) => {
      try {
        setLoading(true);
        setError(null);

        // Se novos filtros forem aplicados, resetar para página 1
        const filtersChanged =
          JSON.stringify(filters) !== JSON.stringify(lastFilters);
        const pageToUse = filtersChanged ? 1 : currentPage;

        if (filtersChanged) {
          setCurrentPage(1);
        }

        const filtersWithPagination: ILeadsFilters = {
          ...filters,
          pagina: pageToUse,
          limite: itemsPerPage,
        };

        const response: ILeadsResponse = await leadsService.getLeads(
          filtersWithPagination
        );
        setLeads(response.data);
        setTotal(response.total);
        setLastFilters(filters);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar leads");
        setLeads([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, itemsPerPage, lastFilters]
  );

  // Função para mudar página
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Função para mudar items per page
  const setItemsPerPageAndRefresh = useCallback((items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset para primeira página
  }, []);

  // Recarregar quando página mudar
  useEffect(() => {
    if (Object.keys(lastFilters).length > 0) {
      fetchLeads(lastFilters);
    }
  }, [currentPage, itemsPerPage]);

  // Calcular total de páginas
  const totalPages = Math.ceil(total / itemsPerPage);

  return {
    leads,
    total,
    currentPage,
    itemsPerPage,
    totalPages,
    loading,
    error,
    fetchLeads,
    setPage,
    setItemsPerPage: setItemsPerPageAndRefresh,
  };
};
