import React, { useEffect, useState } from "react";
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
import { httpClient } from "@/services/httpClient";
import { ILeadTotal, ILeadsFilters } from "@/services/interfaces/ILead";

interface PaginacaoOutput<T> {
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
  dados: T[];
}

interface LeadsPorGestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters?: ILeadsFilters;
}

export const LeadsPorGestorModal: React.FC<LeadsPorGestorModalProps> = ({
  isOpen,
  onClose,
  currentFilters,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingPagina, setLoadingPagina] = useState(false);
  const [totais, setTotais] = useState<Array<{ gestor: string; total: number }>>(
    []
  );
  const [gestorSelecionado, setGestorSelecionado] = useState<string | null>(null);
  const [leadsPorGestor, setLeadsPorGestor] = useState<{
    [gestor: string]: PaginacaoOutput<ILeadTotal>;
  }>({});

  useEffect(() => {
    if (!isOpen) {
      setGestorSelecionado(null);
      setLeadsPorGestor({});
      return;
    }
    const fetchTotais = async () => {
      setLoading(true);
      try {
        const response = await httpClient.getGestoresTotais({
          ...(currentFilters || {}),
          pagina: 1,
          limite: 25,
        });
        setTotais(response || []);
      } finally {
        setLoading(false);
      }
    };
    fetchTotais();
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

  const handleGestorClick = async (gestor: string) => {
    setGestorSelecionado(gestor);
    setLoadingPagina(true);
    const firstPage = 1;
    try {
      const leadsResponse = await httpClient.getLeadsPorGestor(gestor, {
        ...(currentFilters || {}),
        pagina: firstPage,
        limite: 10,
      });
      setLeadsPorGestor((prev) => ({
        ...prev,
        [gestor]: leadsResponse as unknown as PaginacaoOutput<ILeadTotal>,
      }));
    } finally {
      setLoadingPagina(false);
    }
  };

  const handlePageChange = async (gestor: string, page: number) => {
    setLoadingPagina(true);
    try {
      const response = await httpClient.getLeadsPorGestor(gestor, {
        ...(currentFilters || {}),
        pagina: page,
        limite: 10,
      });
      setLeadsPorGestor((prev) => ({
        ...prev,
        [gestor]: response as unknown as PaginacaoOutput<ILeadTotal>,
      }));
    } finally {
      setLoadingPagina(false);
    }
  };

  const leadsAtuais = gestorSelecionado
    ? leadsPorGestor[gestorSelecionado]
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-t-lg -m-6 mb-6 p-6">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Leads por Gestor
          </DialogTitle>
          <p className="text-sky-100 text-sm mt-2">
            {totais.length} gestores encontrados
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cards de gestores */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-sky-600" />
              Gestores
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
                {totais.map((g) => (
                  <Card
                    key={g.gestor}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      gestorSelecionado === g.gestor
                        ? "ring-2 ring-sky-500 bg-sky-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleGestorClick(g.gestor)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-700">
                        {g.gestor || "DESCONHECIDO"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="bg-sky-100 text-sky-700 border-sky-300 font-semibold"
                        >
                          {g.total} leads total
                        </Badge>
                        {gestorSelecionado === g.gestor && (
                          <Badge variant="default" className="bg-sky-600">
                            Selecionado
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Lista de leads do gestor */}
          {gestorSelecionado && leadsAtuais && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Lista de Leads — {gestorSelecionado}
                </h3>
                <Badge
                  variant="outline"
                  className="bg-sky-100 text-sky-700 border-sky-300"
                >
                  {leadsAtuais.total} leads encontrados
                </Badge>
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
                  <div className="rounded-lg border border-sky-200 overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-sky-600 to-sky-700 text-white">
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
                        {leadsAtuais.dados && leadsAtuais.dados.length > 0 ? (
                          leadsAtuais.dados.map((lead, index) => (
                            <TableRow
                              key={lead.id}
                              className={`hover:bg-sky-50 transition-colors ${
                                index % 2 === 0 ? "bg-white" : "bg-sky-50/30"
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
                                <Badge
                                  variant="outline"
                                  className="border-sky-300 text-sky-700 bg-sky-50 font-medium"
                                >
                                  {lead.situacao}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {lead.procura_para ? (
                                  <Badge
                                    variant="outline"
                                    className="border-sky-300 text-sky-700 bg-sky-50 font-medium"
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
                  {leadsAtuais.total_paginas > 1 && (
                    <div className="flex items-center justify-between space-x-2 py-4">
                      <div className="text-sm text-sky-600 font-medium">
                        Página {leadsAtuais.pagina} de {leadsAtuais.total_paginas}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handlePageChange(gestorSelecionado!, leadsAtuais.pagina - 1)
                          }
                          disabled={leadsAtuais.pagina === 1}
                          className="border-sky-300 text-sky-700 hover:bg-sky-50 hover:border-sky-400"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Anterior
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: Math.min(5, leadsAtuais.total_paginas) },
                            (_, i) => {
                              const page =
                                leadsAtuais.pagina <= 3 ? i + 1 : leadsAtuais.pagina - 2 + i;
                              if (page > leadsAtuais.total_paginas) return null;
                              return (
                                <Button
                                  key={page}
                                  variant={leadsAtuais.pagina === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() =>
                                    handlePageChange(gestorSelecionado!, page)
                                  }
                                  className={`w-8 h-8 p-0 ${
                                    leadsAtuais.pagina === page
                                      ? "bg-sky-600 hover:bg-sky-700"
                                      : "border-sky-300 text-sky-700 hover:bg-sky-50 hover:border-sky-400"
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
                            handlePageChange(gestorSelecionado!, leadsAtuais.pagina + 1)
                          }
                          disabled={leadsAtuais.pagina === leadsAtuais.total_paginas}
                          className="border-sky-300 text-sky-700 hover:bg-sky-50 hover:border-sky-400"
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
          {!gestorSelecionado && (
            <div className="border-t pt-6">
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione um Gestor
                </h3>
                <p className="text-gray-500">
                  Clique em um dos cartões acima para visualizar os leads por gestor.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};


