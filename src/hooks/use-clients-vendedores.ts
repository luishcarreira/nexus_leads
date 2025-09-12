import { useState, useCallback, useRef } from "react";
import { clientsService, IClientFilters } from "@/services/ClientsService";

interface VendedorCliente {
  id_vendedor: number;
  vendedor: string;
  total: number;
  valor_cotacoes_abertas?: number;
}

interface StatusVendedorCliente {
  situacao: string;
  total: number;
  valor_cotacoes_abertas?: number;
}

interface UseClientsVendedoresReturn {
  vendedores: VendedorCliente[];
  statusVendedor: StatusVendedorCliente[];
  loading: boolean;
  error: string | null;
  fetchVendedores: (filters?: IClientFilters) => Promise<void>;
  fetchStatusPorVendedor: (
    idVendedor: number,
    filters?: IClientFilters
  ) => Promise<void>;
  lastFilters: IClientFilters;
}

export const useClientsVendedores = (): UseClientsVendedoresReturn => {
  const [vendedores, setVendedores] = useState<VendedorCliente[]>([]);
  const [statusVendedor, setStatusVendedor] = useState<StatusVendedorCliente[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Referência para os últimos filtros efetivamente enviados
  const lastFiltersRef = useRef<IClientFilters>({});

  const fetchVendedores = useCallback(async (filters: IClientFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await clientsService.getVendedoresTotais(filters);

      setVendedores(response.totais_por_vendedor || []);

      // Armazenar os filtros efetivamente enviados
      lastFiltersRef.current = filters;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar vendedores"
      );
      console.error("Erro ao buscar vendedores:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatusPorVendedor = useCallback(
    async (idVendedor: number, filters: IClientFilters = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await clientsService.getStatusPorVendedor(
          idVendedor,
          filters
        );

        setStatusVendedor(response.totais_por_situacao || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar status do vendedor"
        );
        console.error("Erro ao buscar status do vendedor:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    vendedores,
    statusVendedor,
    loading,
    error,
    fetchVendedores,
    fetchStatusPorVendedor,
    lastFilters: lastFiltersRef.current,
  };
};
