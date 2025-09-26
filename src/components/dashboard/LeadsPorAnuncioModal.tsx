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
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { httpClient } from "@/services/httpClient";
import { ILeadTotal, ILeadsFilters } from "@/services/interfaces/ILead";

interface PaginacaoOutput<T> {
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
  dados: T[];
}

interface LeadsPorAnuncioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters?: ILeadsFilters;
}

export const LeadsPorAnuncioModal: React.FC<LeadsPorAnuncioModalProps> = ({
  isOpen,
  onClose,
  currentFilters,
}) => {
  const [loading, setLoading] = useState(false);
  const [anuncios, setAnuncios] = useState<
    Array<{ anuncio: string; total: number }>
  >([]);
  const [anuncioSelecionado, setAnuncioSelecionado] = useState<string | null>(
    null
  );
  const [leadsPorAnuncio, setLeadsPorAnuncio] = useState<{
    [key: string]: PaginacaoOutput<ILeadTotal>;
  }>({});

  React.useEffect(() => {
    if (!isOpen) {
      setAnuncioSelecionado(null);
      setAnuncios([]);
      setLeadsPorAnuncio({});
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const lista = await httpClient.getAnunciosTotais({
          ...(currentFilters || {}),
        });
        setAnuncios(lista || []);
      } finally {
        setLoading(false);
      }
    };
    load();
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
    const situacaoConfig: any = {
      "Novo Lead": {
        variant: "default",
        className:
          "bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-sm",
      },
      "Em Andamento": {
        variant: "secondary",
        className:
          "bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-sm",
      },
      Convertido: {
        variant: "default",
        className:
          "bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-sm",
      },
      Perdido: {
        variant: "destructive",
        className:
          "bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-sm",
      },
      Aguardando: {
        variant: "outline",
        className:
          "bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold shadow-sm",
      },
    };
    const config = situacaoConfig[situacao] || situacaoConfig["Novo Lead"];
    return (
      <Badge variant={config.variant} className={config.className}>
        {situacao}
      </Badge>
    );
  };

  const handleAnuncioClick = async (anuncio: string) => {
    setAnuncioSelecionado(anuncio);
    setLoading(true);
    try {
      const response = await httpClient.getLeadsPorAnuncio(anuncio, {
        ...(currentFilters || {}),
        pagina: 1,
        limite: 10,
      });
      setLeadsPorAnuncio((prev) => ({
        ...prev,
        [anuncio]: response as unknown as PaginacaoOutput<ILeadTotal>,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (anuncio: string, page: number) => {
    setLoading(true);
    try {
      const response = await httpClient.getLeadsPorAnuncio(anuncio, {
        ...(currentFilters || {}),
        pagina: page,
        limite: 10,
      });
      setLeadsPorAnuncio((prev) => ({
        ...prev,
        [anuncio]: response as unknown as PaginacaoOutput<ILeadTotal>,
      }));
    } finally {
      setLoading(false);
    }
  };

  const leadsAtuais = anuncioSelecionado
    ? leadsPorAnuncio[anuncioSelecionado]
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-t-lg -m-6 mb-6 p-6">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Leads por Conjunto/Anúncio
          </DialogTitle>
          <p className="text-amber-100 text-sm mt-2">
            {anuncios.length} anúncios encontrados
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lista de anúncios */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Conjuntos/Anúncios
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {anuncios.map((item) => (
                <Card
                  key={item.anuncio}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    anuncioSelecionado === item.anuncio
                      ? "ring-2 ring-amber-500 bg-amber-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleAnuncioClick(item.anuncio)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      {item.anuncio || "Sem anúncio"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-700 border-amber-300"
                      >
                        {item.total} leads
                      </Badge>
                      {anuncioSelecionado === item.anuncio && (
                        <Badge variant="default" className="bg-amber-600">
                          Selecionado
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Lista de leads do anúncio selecionado */}
          {anuncioSelecionado && leadsAtuais && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Leads do Anúncio:{" "}
                  <span className="text-amber-600">{anuncioSelecionado}</span>
                </h3>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-700 border-green-300"
                >
                  {leadsAtuais.total} leads encontrados
                </Badge>
              </div>

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
                  <div className="rounded-lg border border-amber-200 overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">
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
                        {leadsAtuais.dados && leadsAtuais.dados.length > 0 ? (
                          leadsAtuais.dados.map((lead, index) => (
                            <TableRow
                              key={lead.id}
                              className={`hover:bg-amber-50 transition-colors ${
                                index % 2 === 0 ? "bg-white" : "bg-amber-50/30"
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
                                {getSituacaoBadge((lead as any).situacao || "")}
                              </TableCell>
                              <TableCell>
                                {(lead as any).procura_para ? (
                                  <Badge
                                    variant="outline"
                                    className="border-amber-300 text-amber-700 bg-amber-50 font-medium"
                                  >
                                    {(lead as any).procura_para}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">
                                    Não informado
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {(lead as any).origem || "Desconhecido"}
                              </TableCell>
                              <TableCell>
                                {(lead as any).consultor ? (
                                  <span className="text-sm">
                                    {(lead as any).consultor}
                                  </span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    Não atribuído
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {(lead as any).vendedor ? (
                                  <span className="text-sm">
                                    {(lead as any).vendedor}
                                  </span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    Não atribuído
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {formatDate((lead as any).data_criacao)}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">
                                  {(lead as any).uf || "Não informado"}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={10}
                              className="text-center py-8"
                            >
                              <div className="text-gray-500">
                                Nenhum lead encontrado.
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {leadsAtuais.total_paginas > 1 && (
                    <div className="flex items-center justify-between space-x-2 py-4">
                      <div className="text-sm text-amber-600 font-medium">
                        Página {leadsAtuais.pagina} de{" "}
                        {leadsAtuais.total_paginas}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handlePageChange(
                              anuncioSelecionado!,
                              leadsAtuais.pagina - 1
                            )
                          }
                          disabled={leadsAtuais.pagina === 1}
                          className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400"
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
                                    handlePageChange(anuncioSelecionado!, page)
                                  }
                                  className={`w-8 h-8 p-0 ${
                                    leadsAtuais.pagina === page
                                      ? "bg-amber-600 hover:bg-amber-700"
                                      : "border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400"
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
                              anuncioSelecionado!,
                              leadsAtuais.pagina + 1
                            )
                          }
                          disabled={
                            leadsAtuais.pagina === leadsAtuais.total_paginas
                          }
                          className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400"
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
