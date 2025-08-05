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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import {
  ILeadTotal,
  ITotalPorTipoProcuraDetalhado,
} from "@/services/interfaces/ILead";

interface PaginacaoOutput<T> {
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
  dados: T[];
}

interface LeadsPorTipoProcuraModalProps {
  isOpen: boolean;
  onClose: () => void;
  totaisPorTipoProcura: ITotalPorTipoProcuraDetalhado[];
  loading?: boolean;
}

export const LeadsPorTipoProcuraModal: React.FC<
  LeadsPorTipoProcuraModalProps
> = ({ isOpen, onClose, totaisPorTipoProcura, loading = false }) => {
  const [tipoProcuraSelecionado, setTipoProcuraSelecionado] = useState<
    string | null
  >(null);
  const [paginaAtual, setPaginaAtual] = useState<{ [key: string]: number }>({});
  const [leadsPorTipoProcura, setLeadsPorTipoProcura] = useState<{
    [key: string]: any;
  }>({});
  const [loadingPagina, setLoadingPagina] = useState(false);

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

  const handleTipoProcuraClick = (tipoProcura: string) => {
    setTipoProcuraSelecionado(tipoProcura);
    // Inicializar página 1 se não existir
    if (!paginaAtual[tipoProcura]) {
      setPaginaAtual((prev) => ({ ...prev, [tipoProcura]: 1 }));
    }
    // Usar dados iniciais se não tiver carregado ainda
    const tipoProcuraData = totaisPorTipoProcura.find(
      (t) => t.tipo_procura === tipoProcura
    );
    if (tipoProcuraData && !leadsPorTipoProcura[tipoProcura]) {
      setLeadsPorTipoProcura((prev) => ({
        ...prev,
        [tipoProcura]: tipoProcuraData.leads,
      }));
    }
  };

  const handlePageChange = async (tipoProcura: string, page: number) => {
    setLoadingPagina(true);
    try {
      // Simular carregamento - você pode implementar uma chamada real aqui se necessário
      await new Promise((resolve) => setTimeout(resolve, 300));

      setPaginaAtual((prev) => ({ ...prev, [tipoProcura]: page }));

      // Se você quiser buscar dados reais da API, descomente e implemente:
      // const response = await httpClient.getLeadsTotaisPorTipoProcura({
      //   tipo_procura: tipoProcura,
      //   pagina: page,
      //   limite: 10,
      // });
      // setLeadsPorTipoProcura(prev => ({ ...prev, [tipoProcura]: response.total_por_tipo_procura[0].leads }));
    } catch (error) {
      console.error("Erro ao carregar página:", error);
    } finally {
      setLoadingPagina(false);
    }
  };

  const tipoProcuraAtual = totaisPorTipoProcura.find(
    (t) => t.tipo_procura === tipoProcuraSelecionado
  );

  // Usar dados do estado interno se disponível, senão usar dados iniciais
  const leadsAtuais = tipoProcuraSelecionado
    ? leadsPorTipoProcura[tipoProcuraSelecionado] || tipoProcuraAtual?.leads
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg -m-6 mb-6 p-6">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Leads por Tipo de Procura
          </DialogTitle>
          <p className="text-purple-100 text-sm mt-2">
            Total de {totaisPorTipoProcura.length} tipos de procura encontrados
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seção de Tipos de Procura */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Search className="h-5 w-5 text-purple-600" />
              Tipos de Procura Disponíveis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {totaisPorTipoProcura.map((tipoProcura) => (
                <Card
                  key={tipoProcura.tipo_procura}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    tipoProcuraSelecionado === tipoProcura.tipo_procura
                      ? "ring-2 ring-purple-500 bg-purple-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    handleTipoProcuraClick(tipoProcura.tipo_procura)
                  }
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      {tipoProcura.tipo_procura || "Sem tipo"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="bg-purple-100 text-purple-700 border-purple-300"
                      >
                        {tipoProcura.total} leads
                      </Badge>
                      {tipoProcuraSelecionado === tipoProcura.tipo_procura && (
                        <Badge variant="default" className="bg-purple-600">
                          Selecionado
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Seção de Leads do Tipo de Procura Selecionado */}
          {tipoProcuraSelecionado && leadsAtuais && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Leads do Tipo:{" "}
                  <span className="text-purple-600">
                    {tipoProcuraSelecionado}
                  </span>
                </h3>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-700 border-green-300"
                >
                  {leadsAtuais.total} leads encontrados
                </Badge>
              </div>

              {loading || loadingPagina ? (
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
                  <div className="rounded-lg border border-purple-200 overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
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
                        {leadsAtuais.dados.map((lead, index) => (
                          <TableRow
                            key={lead.id}
                            className={`hover:bg-purple-50 transition-colors ${
                              index % 2 === 0 ? "bg-white" : "bg-purple-50/30"
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
                              {getSituacaoBadge(lead.situacao || "")}
                            </TableCell>
                            <TableCell>
                              {lead.procura_para ? (
                                <Badge
                                  variant="outline"
                                  className="border-purple-300 text-purple-700 bg-purple-50 font-medium"
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
                                <span className="text-sm">
                                  {lead.consultor}
                                </span>
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
                            <TableCell>
                              {formatDate(lead.data_criacao)}
                            </TableCell>
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
                  {leadsAtuais.total_paginas > 1 && (
                    <div className="flex items-center justify-between space-x-2 py-4">
                      <div className="text-sm text-purple-600 font-medium">
                        Página {leadsAtuais.pagina} de{" "}
                        {leadsAtuais.total_paginas}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handlePageChange(
                              tipoProcuraSelecionado,
                              leadsAtuais.pagina - 1
                            )
                          }
                          disabled={leadsAtuais.pagina === 1}
                          className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Anterior
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: Math.min(5, leadsAtuais.total_paginas) },
                            (_, i) => {
                              const page =
                                leadsAtuais.pagina <= 3
                                  ? i + 1
                                  : leadsAtuais.pagina - 2 + i;
                              if (page > leadsAtuais.total_paginas) return null;

                              return (
                                <Button
                                  key={page}
                                  variant={
                                    leadsAtuais.pagina === page
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    handlePageChange(
                                      tipoProcuraSelecionado,
                                      page
                                    )
                                  }
                                  className={`w-8 h-8 p-0 ${
                                    leadsAtuais.pagina === page
                                      ? "bg-purple-600 hover:bg-purple-700"
                                      : "border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
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
                          onClick={() =>
                            handlePageChange(
                              tipoProcuraSelecionado,
                              leadsAtuais.pagina + 1
                            )
                          }
                          disabled={
                            leadsAtuais.pagina === leadsAtuais.total_paginas
                          }
                          className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
                        >
                          Próximo
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Mensagem quando nenhum tipo de procura está selecionado */}
          {!tipoProcuraSelecionado && (
            <div className="border-t pt-6">
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione um Tipo de Procura
                </h3>
                <p className="text-gray-500">
                  Clique em um dos tipos de procura acima para visualizar os
                  leads correspondentes.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
