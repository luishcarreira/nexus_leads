import { useState, useEffect, useCallback } from "react";
import { httpClient } from "@/services/httpClient";
import {
  IEtapaLead,
  ISituacaoLead,
  IConsultor,
} from "@/services/interfaces/ILead";

interface UseDropdownsReturn {
  etapas: IEtapaLead[];
  situacoes: ISituacaoLead[];
  consultores: IConsultor[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDropdowns = (): UseDropdownsReturn => {
  const [etapas, setEtapas] = useState<IEtapaLead[]>([]);
  const [situacoes, setSituacoes] = useState<ISituacaoLead[]>([]);
  const [consultores, setConsultores] = useState<IConsultor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDropdowns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [etapasData, situacoesData, consultoresData] = await Promise.all([
        httpClient.getEtapasLead(),
        httpClient.getSituacaoLead(),
        httpClient.getConsultores(),
      ]);

      setEtapas(etapasData);
      setSituacoes(situacoesData);
      setConsultores(consultoresData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      console.error("Erro ao carregar dropdowns:", err);
      // Em caso de erro, limpar os dados
      setEtapas([]);
      setSituacoes([]);
      setConsultores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar dados na inicialização
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [etapasData, situacoesData, consultoresData] = await Promise.all([
          httpClient.getEtapasLead(),
          httpClient.getSituacaoLead(),
          httpClient.getConsultores(),
        ]);

        setEtapas(etapasData);
        setSituacoes(situacoesData);
        setConsultores(consultoresData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
        console.error("Erro ao carregar dropdowns:", err);
        setEtapas([]);
        setSituacoes([]);
        setConsultores([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []); // Executar apenas uma vez na inicialização

  const refetch = useCallback(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  return {
    etapas,
    situacoes,
    consultores,
    loading,
    error,
    refetch,
  };
};
