import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ILeadTotal, ILeadsFilters } from "@/services/interfaces/ILead";
import { httpClient } from "@/services/httpClient";

interface PaginacaoOutput<T> {
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
  dados: T[];
}

interface LeadsTotaisDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  total: number;
  leads: PaginacaoOutput<ILeadTotal>;
  onPageChange: (page: number) => void;
  loading?: boolean;
  currentFilters?: ILeadsFilters; // Filtros atuais para aplicar na paginação
}

export const LeadsTotaisDetailsModal: React.FC<
  LeadsTotaisDetailsModalProps
> = ({
  isOpen,
  onClose,
  title,
  total,
  leads: initialLeads,
  onPageChange,
  loading = false,
  currentFilters,
}) => {
  // Estado de loading interno para controlar paginação específica
  const [internalLoading, setInternalLoading] = useState(false);
  // Estado interno para controlar os leads e paginação
  const [currentLeads, setCurrentLeads] =
    useState<PaginacaoOutput<ILeadTotal>>(initialLeads);
  const [currentPage, setCurrentPage] = useState(1);

  // Atualizar estado interno quando o modal abrir ou quando initialLeads mudar
  React.useEffect(() => {
    if (isOpen && initialLeads) {
      setCurrentLeads(initialLeads);
      setCurrentPage(initialLeads.pagina);
    }
  }, [isOpen, initialLeads]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSituacaoBadge = (situacao: string) => {
    const situacaoConfig = {
      "Novo Lead": {
        variant: "default" as const,
        className:
          "bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-sm",
      },
      "Em Andamento": {
        variant: "secondary" as const,
        className:
          "bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-sm",
      },
      "Em Negociacao": {
        variant: "secondary" as const,
        className:
          "bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-sm",
      },
      "Proposta Enviada": {
        variant: "secondary" as const,
        className:
          "bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-sm",
      },
      Convertido: {
        variant: "default" as const,
        className:
          "bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-sm",
      },
      Perdido: {
        variant: "destructive" as const,
        className:
          "bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-sm",
      },
      Aguardando: {
        variant: "outline" as const,
        className:
          "bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold shadow-sm",
      },
      Duplicado: {
        variant: "outline" as const,
        className:
          "bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold shadow-sm",
      },
    };

    const config =
      situacaoConfig[situacao as keyof typeof situacaoConfig] ||
      situacaoConfig["Novo Lead"];

    return (
      <Badge variant={config.variant} className={config.className}>
        {situacao}
      </Badge>
    );
  };

  // Função para lidar com mudança de página com loading interno
  const handlePageChange = async (page: number) => {
    setInternalLoading(true);
    try {
      // Determinar se é transferidos ou não transferidos baseado no título
      const isTransferidos = title.toLowerCase().includes("transferidos");
      const isNaoTransferidos =
        title.toLowerCase().includes("não transferidos") ||
        title.toLowerCase().includes("nao transferidos");

      let response;

      if (isTransferidos) {
        response = await httpClient.getLeadsTotaisTransferidos({
          transferido: true, // Buscar apenas transferidos
          pagina: page,
          limite: 10,
          // Aplicar filtros de data se disponíveis
          ...(currentFilters && {
            data_criacao_inicio: currentFilters.data_criacao_inicio,
            data_criacao_fim: currentFilters.data_criacao_fim,
          }),
        });
        setCurrentLeads(response.transferidos);
      } else if (isNaoTransferidos) {
        response = await httpClient.getLeadsTotaisTransferidos({
          transferido: false, // Buscar apenas não transferidos
          pagina: page,
          limite: 10,
          // Aplicar filtros de data se disponíveis
          ...(currentFilters && {
            data_criacao_inicio: currentFilters.data_criacao_inicio,
            data_criacao_fim: currentFilters.data_criacao_fim,
          }),
        });
        setCurrentLeads(response.nao_transferidos);
      } else {
        // Se não for nenhum dos dois, usar o callback original
        await onPageChange(page);
        return;
      }

      setCurrentPage(page);
    } catch (error) {
      console.error("Erro ao carregar página:", error);
    } finally {
      setInternalLoading(false);
    }
  };

  // Verificação de segurança para evitar erro quando leads é undefined
  if (!currentLeads || !currentLeads.dados) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg -m-6 mb-6 p-6">
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
            <p className="text-blue-100 text-sm mt-2">
              Total de {total} leads encontrados
            </p>
          </DialogHeader>
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500">Carregando dados...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Usar loading interno ou externo
  const isTableLoading = internalLoading || loading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg -m-6 mb-6 p-6">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <p className="text-blue-100 text-sm mt-2">
            Total de {total} leads encontrados
          </p>
        </DialogHeader>

        {isTableLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-blue-200 overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <TableHead className="text-white font-semibold">
                      Nome
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      Email
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      Telefone
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      Origem
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      Situação
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      Procura Para
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      Consultor
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      Vendedor
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      Data Criação
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      UF
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentLeads.dados && currentLeads.dados.length > 0 ? (
                    currentLeads.dados.map((lead, index) => (
                      <TableRow
                        key={lead.id}
                        className={`hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-blue-50/30"
                        }`}
                      >
                        <TableCell className="font-medium">
                          {lead.nome || "Sem nome"}
                        </TableCell>
                        <TableCell>
                          {lead.email || (
                            <span className="text-muted-foreground">
                              Não informado
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{lead.telefone}</TableCell>
                        <TableCell>
                          {lead.origem && lead.origem.trim() !== "" ? (
                            lead.origem
                          ) : (
                            <span className="text-muted-foreground">
                              Não informado
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getSituacaoBadge(lead.situacao || "")}
                        </TableCell>
                        <TableCell>
                          {lead.procura_para ? (
                            <Badge
                              variant="outline"
                              className="border-blue-300 text-blue-700 bg-blue-50 font-medium"
                            >
                              {lead.procura_para}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">
                              Não informado
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.consultor ? (
                            <span className="text-sm">{lead.consultor}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Não atribuído
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {lead.vendedor ? (
                            <span className="text-sm">{lead.vendedor}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Não atribuído
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(lead.data_criacao)}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {lead.uf || (
                              <span className="text-muted-foreground">
                                Não informado
                              </span>
                            )}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="text-gray-500">
                          Nenhum lead encontrado.
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {currentLeads.total_paginas > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-blue-600 font-medium">
                  Página {currentLeads.pagina} de {currentLeads.total_paginas}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentLeads.pagina - 1)}
                    disabled={currentLeads.pagina === 1 || internalLoading}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, currentLeads.total_paginas) },
                      (_, i) => {
                        const page =
                          currentLeads.pagina <= 3
                            ? i + 1
                            : currentLeads.pagina - 2 + i;
                        if (page > currentLeads.total_paginas) return null;

                        return (
                          <Button
                            key={page}
                            variant={
                              currentLeads.pagina === page
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            disabled={internalLoading}
                            className={`w-8 h-8 p-0 ${
                              currentLeads.pagina === page
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                            }`}
                          >
                            {page}
                          </Button>
                        );
                      }
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentLeads.pagina + 1)}
                    disabled={
                      currentLeads.pagina === currentLeads.total_paginas ||
                      internalLoading
                    }
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
