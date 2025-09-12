import { useState, useCallback, useRef } from "react";
import { clientsService, IClientFilters } from "@/services/ClientsService";
import { ILead } from "@/services/interfaces/ILead";

interface UseClientsReturn {
  clients: ILead[];
  total: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  fetchClients: (filters?: IClientFilters) => Promise<void>;
  setPage: (page: number) => void;
  lastFilters: IClientFilters;
}

export const useClients = (itemsPerPage: number = 25): UseClientsReturn => {
  const [clients, setClients] = useState<ILead[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Referência para os últimos filtros efetivamente enviados
  const lastFiltersRef = useRef<IClientFilters>({});

  const fetchClients = useCallback(
    async (filters: IClientFilters = {}) => {
      try {
        setLoading(true);
        setError(null);

        const page = filters.pagina ?? 1;
        const limite = filters.limite ?? itemsPerPage;

        const response = await clientsService.getClients({
          ...filters,
          pagina: page,
          limite,
        });

        setClients(response.data || []);
        setTotal(response.total ?? 0);
        setCurrentPage(page);
        setTotalPages(Math.max(1, Math.ceil((response.total ?? 0) / limite)));

        // Armazenar os filtros efetivamente enviados
        lastFiltersRef.current = {
          ...filters,
          pagina: page,
          limite,
        };
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar clientes"
        );
        console.error("Erro ao buscar clientes:", err);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage]
  );

  const setPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchClients({
        ...lastFiltersRef.current,
        pagina: page,
      });
    },
    [fetchClients]
  );

  return {
    clients,
    total,
    currentPage,
    totalPages,
    loading,
    error,
    fetchClients,
    setPage,
    lastFilters: lastFiltersRef.current,
  };
};
