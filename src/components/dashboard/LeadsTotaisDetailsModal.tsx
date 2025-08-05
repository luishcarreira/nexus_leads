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
import { ILeadTotal } from "@/services/interfaces/ILead";

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
}

export const LeadsTotaisDetailsModal: React.FC<
  LeadsTotaisDetailsModalProps
> = ({
  isOpen,
  onClose,
  title,
  total,
  leads,
  onPageChange,
  loading = false,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
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

  // Verificação de segurança para evitar erro quando leads é undefined
  if (!leads || !leads.dados) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg -m-6 mb-6 p-6">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <p className="text-blue-100 text-sm mt-2">
            Total de {total} leads encontrados
          </p>
        </DialogHeader>

        {loading ? (
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
                  {leads.dados.map((lead, index) => (
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
                        {lead.origem || (
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
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {leads.total_paginas > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-blue-600 font-medium">
                  Página {leads.pagina} de {leads.total_paginas}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(leads.pagina - 1)}
                    disabled={leads.pagina === 1}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, leads.total_paginas) },
                      (_, i) => {
                        const page =
                          leads.pagina <= 3 ? i + 1 : leads.pagina - 2 + i;
                        if (page > leads.total_paginas) return null;

                        return (
                          <Button
                            key={page}
                            variant={
                              leads.pagina === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => onPageChange(page)}
                            className={`w-8 h-8 p-0 ${
                              leads.pagina === page
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
                    onClick={() => onPageChange(leads.pagina + 1)}
                    disabled={leads.pagina === leads.total_paginas}
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
