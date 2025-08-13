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
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { httpClient } from "@/services/httpClient";
import {
  ILeadTotal,
  ILeadsFilters,
  ITotalPorVendedor,
  IVendedoresTotais,
} from "@/services/interfaces/ILead";

interface PaginacaoOutput<T> {
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
  dados: T[];
}

interface LeadsPorVendedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters?: ILeadsFilters;
}

export const LeadsPorVendedorModal: React.FC<LeadsPorVendedorModalProps> = ({
  isOpen,
  onClose,
  currentFilters,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingPagina, setLoadingPagina] = useState(false);
  const [totais, setTotais] = useState<ITotalPorVendedor[]>([]);
  const [totalVendedores, setTotalVendedores] = useState(0);
  const [vendedorSelecionado, setVendedorSelecionado] = useState<number | null>(
    null
  );
  const [leadsPorVendedor, setLeadsPorVendedor] = useState<{
    [id: number]: PaginacaoOutput<ILeadTotal>;
  }>({});
  const [selectedTipoProcura, setSelectedTipoProcura] = useState<string | null>(
    null
  );
  const [tiposProcura, setTiposProcura] = useState<
    Array<{ tipo_procura: string; total: number }>
  >([]);
  const [tiposProcuraVendedor, setTiposProcuraVendedor] = useState<
    Array<{ tipo_procura: string; total: number }>
  >([]);

  useEffect(() => {
    if (!isOpen) {
      // Limpar estados quando modal fechar
      setVendedorSelecionado(null);
      setTiposProcuraVendedor([]);
      setLeadsPorVendedor({});
      setSelectedTipoProcura(null);
      return;
    }

    const fetchTotais = async () => {
      setLoading(true);
      try {
        const response: IVendedoresTotais =
          await httpClient.getVendedoresTotais({
            ...(currentFilters || {}),
            pagina: 1,
            limite: 25,
          });
        setTotais(response.totais_por_vendedor || []);
        setTotalVendedores(response.total_vendedores || 0);
      } finally {
        setLoading(false);
      }
    };
    const fetchTipos = async () => {
      try {
        const lista = await httpClient.getTiposProcuraTotais({
          ...(currentFilters || {}),
        });
        setTiposProcura(lista || []);
      } catch (e) {
        setTiposProcura([]);
      }
    };
    fetchTotais();
    fetchTipos();
  }, [isOpen, currentFilters]);

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
      (situacaoConfig as any)[situacao] || (situacaoConfig as any)["Novo Lead"];

    return (
      <Badge variant={config.variant} className={config.className}>
        {situacao}
      </Badge>
    );
  };

  const handleVendedorClick = async (idVendedor: number) => {
    setVendedorSelecionado(idVendedor);
    setLoadingPagina(true);
    const firstPage = 1;

    try {
      // Buscar leads do vendedor
      const leadsResponse = await httpClient.getLeadsPorVendedor(idVendedor, {
        ...(currentFilters || {}),
        ...(selectedTipoProcura ? { tipo_procura: selectedTipoProcura } : {}),
        pagina: firstPage,
        limite: 10,
      });

      // Buscar totais detalhados de tipos de procura para este vendedor
      const tiposResponse = await httpClient.getTotaisTiposProcuraPorVendedor(
        idVendedor,
        {
          ...(currentFilters || {}),
        }
      );

      setLeadsPorVendedor((prev) => ({
        ...prev,
        [idVendedor]: leadsResponse as unknown as PaginacaoOutput<ILeadTotal>,
      }));

      setTiposProcuraVendedor(tiposResponse);
    } finally {
      setLoadingPagina(false);
    }
  };

  const handlePageChange = async (idVendedor: number, page: number) => {
    setLoadingPagina(true);
    try {
      const response = await httpClient.getLeadsPorVendedor(idVendedor, {
        ...(currentFilters || {}),
        ...(selectedTipoProcura ? { tipo_procura: selectedTipoProcura } : {}),
        pagina: page,
        limite: 10,
      });
      setLeadsPorVendedor((prev) => ({
        ...prev,
        [idVendedor]: response as unknown as PaginacaoOutput<ILeadTotal>,
      }));
    } finally {
      setLoadingPagina(false);
    }
  };

  const handleTipoProcuraChange = async (value: string) => {
    const nextValue = value === "__all__" ? null : value;
    setSelectedTipoProcura(nextValue);
    // Se já houver um vendedor selecionado, recarregar a primeira página com o novo filtro
    if (vendedorSelecionado) {
      setLoadingPagina(true);
      try {
        const response = await httpClient.getLeadsPorVendedor(
          vendedorSelecionado,
          {
            ...(currentFilters || {}),
            ...(nextValue ? { tipo_procura: nextValue } : {}),
            pagina: 1,
            limite: 10,
          }
        );
        setLeadsPorVendedor((prev) => ({
          ...prev,
          [vendedorSelecionado]:
            response as unknown as PaginacaoOutput<ILeadTotal>,
        }));
      } finally {
        setLoadingPagina(false);
      }
    }
  };

  const leadsAtuais = vendedorSelecionado
    ? leadsPorVendedor[vendedorSelecionado]
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg -m-6 mb-6 p-6">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Leads por Vendedor (Transferidos)
          </DialogTitle>
          <p className="text-emerald-100 text-sm mt-2">
            {totalVendedores} vendedores encontrados
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cards de vendedores */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Vendedores
            </h3>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="border-0">
                    <CardHeader className="pb-3">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {totais.map((vend) => (
                  <Card
                    key={vend.id_vendedor}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      vendedorSelecionado === vend.id_vendedor
                        ? "ring-2 ring-emerald-500 bg-emerald-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleVendedorClick(vend.id_vendedor)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-700">
                        {vend.vendedor || "Sem vendedor"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="bg-emerald-100 text-emerald-700 border-emerald-300 font-semibold"
                        >
                          {vend.total} leads total
                        </Badge>
                        {vendedorSelecionado === vend.id_vendedor && (
                          <Badge variant="default" className="bg-emerald-600">
                            Selecionado
                          </Badge>
                        )}
                      </div>

                      {/* Breakdown por tipo de procura */}
                      {/* {vend.totais_por_tipo_procura &&
                        vend.totais_por_tipo_procura.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                              Por tipo de procura:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {vend.totais_por_tipo_procura.map((tipo) => (
                                <Badge
                                  key={tipo.tipo_procura}
                                  variant="secondary"
                                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 border-blue-300"
                                >
                                  {tipo.tipo_procura}: {tipo.total}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )} */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes do vendedor selecionado */}
          {vendedorSelecionado && (
            <div className="border-t pt-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Detalhes do Vendedor:{" "}
                  <span className="text-emerald-600">
                    {totais.find((t) => t.id_vendedor === vendedorSelecionado)
                      ?.vendedor || vendedorSelecionado}
                  </span>
                </h3>

                {/* Totais detalhados por tipo de procura */}
                {tiposProcuraVendedor.length > 0 && (
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
                    <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                      Distribuição por Tipo de Procura
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {tiposProcuraVendedor.map((tipo) => (
                        <div
                          key={tipo.tipo_procura}
                          className="bg-white rounded-lg p-3 border border-emerald-200 shadow-sm"
                        >
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                            {tipo.tipo_procura}
                          </div>
                          <div className="text-lg font-bold text-emerald-700">
                            {tipo.total}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(
                              (tipo.total /
                                tiposProcuraVendedor.reduce(
                                  (sum, t) => sum + t.total,
                                  0
                                )) *
                              100
                            ).toFixed(1)}
                            %
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista de leads do vendedor */}
          {vendedorSelecionado && leadsAtuais && (
            <div
              className={tiposProcuraVendedor.length > 0 ? "" : "border-t pt-6"}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Lista de Leads
                </h3>
                <div className="flex items-center gap-3">
                  <div className="min-w-[220px]">
                    <label className="block text-xs font-semibold text-emerald-800 mb-1">
                      Tipo de Procura
                    </label>
                    <Select
                      value={selectedTipoProcura ?? "__all__"}
                      onValueChange={handleTipoProcuraChange}
                    >
                      <SelectTrigger className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 h-9">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Todos</SelectItem>
                        {tiposProcura.map((tp) => (
                          <SelectItem
                            key={tp.tipo_procura}
                            value={tp.tipo_procura}
                          >
                            {tp.tipo_procura}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 border-green-300"
                  >
                    {leadsAtuais.total} leads encontrados
                  </Badge>
                </div>
              </div>

              {loadingPagina ? (
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
                  <div className="rounded-lg border border-emerald-200 overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
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
                            Data Criação
                          </TableHead>
                          <TableHead className="text-white font-semibold">
                            UF
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leadsAtuais.dados && leadsAtuais.dados.length > 0 ? (
                          leadsAtuais.dados.map((lead, index) => (
                            <TableRow
                              key={lead.id}
                              className={`hover:bg-emerald-50 transition-colors ${
                                index % 2 === 0
                                  ? "bg-white"
                                  : "bg-emerald-50/30"
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
                                    className="border-emerald-300 text-emerald-700 bg-emerald-50 font-medium"
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
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8">
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
                  {leadsAtuais.total_paginas > 1 && (
                    <div className="flex items-center justify-between space-x-2 py-4">
                      <div className="text-sm text-emerald-600 font-medium">
                        Página {leadsAtuais.pagina} de{" "}
                        {leadsAtuais.total_paginas}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handlePageChange(
                              vendedorSelecionado,
                              leadsAtuais.pagina - 1
                            )
                          }
                          disabled={leadsAtuais.pagina === 1}
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
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
                                    handlePageChange(vendedorSelecionado, page)
                                  }
                                  className={`w-8 h-8 p-0 ${
                                    leadsAtuais.pagina === page
                                      ? "bg-emerald-600 hover:bg-emerald-700"
                                      : "border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
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
                              vendedorSelecionado,
                              leadsAtuais.pagina + 1
                            )
                          }
                          disabled={
                            leadsAtuais.pagina === leadsAtuais.total_paginas
                          }
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
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

          {/* Empty state */}
          {!vendedorSelecionado && (
            <div className="border-t pt-6">
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione um Vendedor
                </h3>
                <p className="text-gray-500">
                  Clique em um dos cartões acima para visualizar os leads
                  transferidos por vendedor.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
