import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Filter, Users } from "lucide-react";
import { httpClient } from "@/services/httpClient";
import {
  ILeadTotal,
  ILeadsFilters,
  ISituacaoLead,
} from "@/services/interfaces/ILead";

interface PaginacaoOutput<T> {
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
  dados: T[];
}

interface LeadsNaoTransferidosPorSituacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
  currentFilters?: ILeadsFilters;
}

export const LeadsNaoTransferidosPorSituacaoModal: React.FC<
  LeadsNaoTransferidosPorSituacaoModalProps
> = ({ isOpen, onClose, loading = false, currentFilters }) => {
  const [situacaoSelecionada, setSituacaoSelecionada] = useState<string | null>(
    null
  );
  const [paginaAtual, setPaginaAtual] = useState<{ [key: string]: number }>({});
  const [leadsPorSituacao, setLeadsPorSituacao] = useState<{
    [key: string]: PaginacaoOutput<ILeadTotal>;
  }>({});
  const [loadingPagina, setLoadingPagina] = useState(false);
  const [totaisPorSituacao, setTotaisPorSituacao] = useState<
    Array<{ situacao: string; total: number }>
  >([]);
  const [todasSituacoes, setTodasSituacoes] = useState<ISituacaoLead[]>([]);

  const { situacao: filtroSituacao, ...filtersSemSituacao } =
    currentFilters || {};
  const situacoesFiltradas = useMemo(() => {
    if (!filtroSituacao || filtroSituacao.trim() === "") return undefined;
    return new Set(
      filtroSituacao
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "")
    );
  }, [filtroSituacao]);

  useEffect(() => {
    if (!isOpen) {
      setSituacaoSelecionada(null);
      setPaginaAtual({});
      setLeadsPorSituacao({});
      setTotaisPorSituacao([]);
      return;
    }

    const fetchTotais = async () => {
      try {
        const situacoes = await httpClient.getSituacaoLead();
        setTodasSituacoes(situacoes || []);

        const listaBase = (situacoes || [])
          .map((s) => s.descricao)
          .filter((desc) =>
            situacoesFiltradas ? situacoesFiltradas.has(desc) : true
          );

        const totals = await Promise.all(
          listaBase.map(async (descricao) => {
            try {
              const resp = await httpClient.getLeadsNaoTransferidos({
                ...filtersSemSituacao,
                situacao: descricao,
                pagina: 1,
                limite: 1,
              });
              return { situacao: descricao, total: resp.total || 0 };
            } catch {
              return { situacao: descricao, total: 0 };
            }
          })
        );

        const filtered = totals.filter((t) => t.total > 0);
        filtered.sort((a, b) => b.total - a.total);
        setTotaisPorSituacao(filtered);
      } catch (e) {
        setTotaisPorSituacao([]);
      }
    };
    fetchTotais();
  }, [
    isOpen,
    JSON.stringify(filtersSemSituacao),
    situacoesFiltradas ? Array.from(situacoesFiltradas).join("|") : "*",
  ]);

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
      (situacaoConfig as any)[situacao] || (situacaoConfig as any)["Novo Lead"];
    return (
      <Badge variant={config.variant} className={config.className}>
        {situacao}
      </Badge>
    );
  };

  const handleSituacaoClick = async (situacao: string) => {
    setSituacaoSelecionada(situacao);
    setLoadingPagina(true);
    const firstPage = 1;
    try {
      setPaginaAtual((prev) => ({ ...prev, [situacao]: firstPage }));
      const response = await httpClient.getLeadsNaoTransferidos({
        ...filtersSemSituacao,
        situacao,
        pagina: firstPage,
        limite: 10,
      });
      setLeadsPorSituacao((prev) => ({
        ...prev,
        [situacao]: response as unknown as PaginacaoOutput<ILeadTotal>,
      }));
    } finally {
      setLoadingPagina(false);
    }
  };

  const handlePageChange = async (situacao: string, page: number) => {
    setLoadingPagina(true);
    try {
      const response = await httpClient.getLeadsNaoTransferidos({
        ...filtersSemSituacao,
        situacao,
        pagina: page,
        limite: 10,
      });
      setPaginaAtual((prev) => ({ ...prev, [situacao]: page }));
      setLeadsPorSituacao((prev) => ({
        ...prev,
        [situacao]: response as unknown as PaginacaoOutput<ILeadTotal>,
      }));
    } finally {
      setLoadingPagina(false);
    }
  };

  const leadsAtuais = situacaoSelecionada
    ? leadsPorSituacao[situacaoSelecionada]
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg -m-6 mb-6 p-6">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Leads Não Transferidos por Situação
          </DialogTitle>
          <p className="text-blue-100 text-sm mt-2">
            {totaisPorSituacao.length} situações com leads não transferidos
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Situações Disponíveis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {totaisPorSituacao.map((item) => (
                <Card
                  key={item.situacao}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    situacaoSelecionada === item.situacao
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleSituacaoClick(item.situacao)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      {getSituacaoBadge(item.situacao)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-700 border-blue-300"
                      >
                        {item.total} leads
                      </Badge>
                      {situacaoSelecionada === item.situacao && (
                        <Badge variant="default" className="bg-blue-600">
                          Selecionado
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {situacaoSelecionada && leadsAtuais && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Leads da Situação:{" "}
                  <span className="text-blue-600">{situacaoSelecionada}</span>
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
                            Situação
                          </TableHead>
                          <TableHead className="text-white font-semibold">
                            Procura Para
                          </TableHead>
                          <TableHead className="text-white font-semibold">
                            Origem
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
                              {lead.origem && lead.origem.trim() !== ""
                                ? lead.origem
                                : "Desconhecido"}
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

                  {leadsAtuais.total_paginas > 1 && (
                    <div className="flex items-center justify-between space-x-2 py-4">
                      <div className="text-sm text-blue-600 font-medium">
                        Página {leadsAtuais.pagina} de{" "}
                        {leadsAtuais.total_paginas}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handlePageChange(
                              situacaoSelecionada!,
                              leadsAtuais.pagina - 1
                            )
                          }
                          disabled={leadsAtuais.pagina === 1}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
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
                                    handlePageChange(situacaoSelecionada!, page)
                                  }
                                  className={`w-8 h-8 p-0 ${
                                    leadsAtuais.pagina === page
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
                          onClick={() =>
                            handlePageChange(
                              situacaoSelecionada!,
                              leadsAtuais.pagina + 1
                            )
                          }
                          disabled={
                            leadsAtuais.pagina === leadsAtuais.total_paginas
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
            </div>
          )}

          {!situacaoSelecionada && (
            <div className="border-t pt-6">
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione uma Situação
                </h3>
                <p className="text-gray-500">
                  Clique em uma das situações acima para visualizar os leads não
                  transferidos correspondentes.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
