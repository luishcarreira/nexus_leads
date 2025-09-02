import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FilterSection } from "@/components/dashboard/FilterSection";
import { useLeads } from "@/hooks/use-leads";
import { useLeadsTotais } from "@/hooks/use-leads-totais";
import { ILeadsFilters } from "@/services/interfaces/ILead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientsTable } from "@/components/dashboard/ClientsTable";
import { format } from "date-fns";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { leadsService } from "@/services/LeadsService";

type UIFilters = {
  creationDateRange?: { from?: Date; to?: Date } | undefined;
  situacoes?: string[];
  etapas?: string[];
  origem?: string;
  tipoProcura?: string;
  nome?: string;
  email?: string;
  telefone?: string;
  consultores?: string[];
  vendedores?: string[];
  ufs?: string[];
  apenasSemConsultor?: boolean;
};

const formatDateForAPI = (date: Date): string => format(date, "yyyy-MM-dd");

const convertFiltersToAPI = (filters: UIFilters): ILeadsFilters => {
  const api: ILeadsFilters = {};
  if (filters.creationDateRange?.from)
    api.data_criacao_inicio = formatDateForAPI(filters.creationDateRange.from);
  if (filters.creationDateRange?.to)
    api.data_criacao_fim = formatDateForAPI(filters.creationDateRange.to);
  if (filters.situacoes?.length) api.situacao = filters.situacoes.join(",");
  if (filters.etapas?.length) api.etapa = filters.etapas.join(",");
  if (filters.origem) api.origem = filters.origem;
  if (filters.tipoProcura) api.tipo_procura = filters.tipoProcura;
  if (filters.nome) api.nome = filters.nome;
  if (filters.email) api.email = filters.email;
  if (filters.telefone) api.telefone = filters.telefone;
  if (filters.consultores?.length)
    api.id_consultor = parseInt(filters.consultores[0]);
  if (filters.vendedores?.length)
    api.id_vendedor = parseInt(filters.vendedores[0]);
  if (filters.ufs?.length) api.uf = filters.ufs.join(",");
  return api;
};

const Clientes: React.FC = () => {
  const { user } = useAuth();
  const [currentFilters, setCurrentFilters] = React.useState<UIFilters>({});
  const [showTotais, setShowTotais] = React.useState(true);
  const [selectedVendorId, setSelectedVendorId] = React.useState<number | null>(
    null
  );
  const [statusSelected, setStatusSelected] = React.useState<string | null>(
    null
  );
  // Estado local para grid de convertidos (transferidos)
  const [convertedLeads, setConvertedLeads] = React.useState<any[]>([]);
  const [convertedTotal, setConvertedTotal] = React.useState(0);
  const [convertedCurrentPage, setConvertedCurrentPage] = React.useState(1);
  const [convertedTotalPages, setConvertedTotalPages] = React.useState(1);
  const [convertedLoading, setConvertedLoading] = React.useState(false);
  const convertedItemsPerPage = 25;
  const lastConvertedFiltersRef = React.useRef<ILeadsFilters>({});
  const [vendedoresTotais, setVendedoresTotais] = React.useState<
    Array<{
      id_vendedor: number;
      vendedor: string;
      total: number;
      valor_cotacoes_abertas?: number;
    }>
  >([]);
  const [statusTotais, setStatusTotais] = React.useState<
    Array<{ situacao: string; total: number; valor_cotacoes_abertas?: number }>
  >([]);
  const isAdmin = user?.tipo === "admin";

  const {
    leads,
    total,
    currentPage,
    totalPages,
    loading,
    error,
    fetchLeads,
    setPage,
  } = useLeads();
  const {
    totais,
    loading: totaisLoading,
    error: totaisError,
    fetchTotais,
    fetchDetalhesTransferidos,
    fetchDetalhesNaoTransferidos,
  } = useLeadsTotais();

  // Buscar convertidos via endpoint geral (mantém campos como id_cliente)
  const fetchConvertedLeads = React.useCallback(
    async (filters: ILeadsFilters = {}) => {
      try {
        setConvertedLoading(true);
        const page = filters.pagina ?? 1;
        const limite = filters.limite ?? convertedItemsPerPage;
        const response = await leadsService.getLeads({
          ...filters,
          pagina: page,
          limite,
          somente_leads_convertidos: true,
        });

        console.log("response.data", response.data);
        setConvertedLeads(response.data.filter((l) => !!l.id_cliente) || []);
        setConvertedTotal(
          response.data.filter((l) => !!l.id_cliente).length || 0
        );
        console.log(
          "response.data.filter((l) => !!l.id_cliente).length",
          response.data.filter((l) => !!l.id_cliente).length
        );
        setConvertedCurrentPage(page);
        setConvertedTotalPages(
          Math.max(
            1,
            Math.ceil(
              (response.data.filter((l) => !!l.id_cliente).length || 0) / limite
            )
          )
        );
        lastConvertedFiltersRef.current = {
          ...filters,
          somente_leads_convertidos: true,
        };
      } finally {
        setConvertedLoading(false);
      }
    },
    []
  );

  const applyGridFilters = React.useCallback(
    (base: ILeadsFilters, overrides?: Partial<ILeadsFilters>) => {
      const merged: ILeadsFilters = { ...base };
      if (selectedVendorId) merged.id_vendedor = selectedVendorId;
      if (statusSelected) merged.situacao = statusSelected;
      // Buscar apenas convertidos na grid de Clientes
      fetchConvertedLeads({
        ...merged,
        pagina: 1,
        limite: convertedItemsPerPage,
      });
    },
    [selectedVendorId, statusSelected, fetchConvertedLeads]
  );

  const handleFiltersChange = React.useCallback(
    async (newFilters: UIFilters) => {
      const api = convertFiltersToAPI(newFilters);
      await Promise.all([
        (async () => applyGridFilters(api))(),
        (async () => fetchTotais(api))(),
        (async () => {
          const res = await leadsService.getVendedoresTotais({
            ...api,
            transferido: true,
          });
          setVendedoresTotais(res.totais_por_vendedor || []);
        })(),
      ]);
      setCurrentFilters(newFilters);
    },
    [applyGridFilters, fetchTotais, isAdmin]
  );

  React.useEffect(() => {
    const defaultFilters: UIFilters = {
      creationDateRange: {
        from: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        to: new Date(),
      },
    };
    const api = convertFiltersToAPI(defaultFilters);

    (async () => {
      await applyGridFilters(api);
      await fetchTotais(api);
      const res = await leadsService.getVendedoresTotais({
        ...api,
        transferido: true,
      });
      setVendedoresTotais(res.totais_por_vendedor || []);
      setCurrentFilters(defaultFilters);
    })();
  }, []);

  const [initialLoading, setInitialLoading] = React.useState(true);
  React.useEffect(() => {
    if (!convertedLoading && !totaisLoading) setInitialLoading(false);
  }, [convertedLoading, totaisLoading]);

  // Charts data
  const barData = React.useMemo(() => {
    console.log(vendedoresTotais);
    return vendedoresTotais.map((v) => ({
      id_vendedor: v.id_vendedor,
      name: v.vendedor,
      total: v.total,
      valor: (v.valor_cotacoes_abertas || 0) / 100,
    }));
  }, [vendedoresTotais]);

  const pieData = React.useMemo(() => {
    if (!totais) return [] as Array<{ name: string; value: number }>;
    const all = [
      ...(totais.transferidos?.dados || []),
      ...(totais.nao_transferidos?.dados || []),
    ];
    const porStatus = new Map<string, number>();
    all.forEach((lead) => {
      const key = lead.situacao || "Sem status";
      porStatus.set(key, (porStatus.get(key) || 0) + 1);
    });
    return Array.from(porStatus.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [totais]);

  const selectedVendor = React.useMemo(
    () =>
      vendedoresTotais.find((v) => v.id_vendedor === selectedVendorId) || null,
    [vendedoresTotais, selectedVendorId]
  );

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <FilterSection
          onFiltersChange={handleFiltersChange}
          currentFilters={currentFilters}
        />

        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => setShowTotais(!showTotais)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 hover:bg-accent px-4 py-2 rounded-lg transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">
              {showTotais ? "Ocultar" : "Mostrar"} Resumo de Totais
            </span>
            {showTotais ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showTotais && totaisError && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-1 rounded-md">
              Erro ao carregar totais: {totaisError}
            </div>
          )}
        </div>

        {showTotais && (
          <>
            {/* Cards de vendedores */}
            {!selectedVendorId && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {vendedoresTotais.map((v) => (
                  <Card
                    key={v.id_vendedor}
                    className="border-0 shadow-lg hover:shadow-xl cursor-pointer"
                    onClick={() => {
                      setSelectedVendorId(v.id_vendedor);
                      setStatusSelected(null);
                      const api = convertFiltersToAPI(currentFilters);
                      applyGridFilters(api);
                      // Buscar drill-down por status
                      (async () => {
                        const s = await leadsService.getTotaisStatusPorVendedor(
                          v.id_vendedor,
                          { ...api, transferido: true }
                        );
                        setStatusTotais(s.totais_por_situacao || []);
                      })();
                    }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">
                        {v.vendedor}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{v.total ?? 0}</div>
                      <div className="text-sm font-medium mt-1">
                        R{"$ "}
                        {(
                          Number(v.valor_cotacoes_abertas ?? 0) / 100
                        ).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Leads transferidos
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {selectedVendorId && (
              <>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Button
                        variant="ghost"
                        className="h-7 px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setSelectedVendorId(null);
                          setStatusSelected(null);
                          setStatusTotais([]);
                          const api = convertFiltersToAPI(currentFilters);
                          applyGridFilters(api, {});
                        }}
                      >
                        Vendedores
                      </Button>
                      <span className="text-muted-foreground">/</span>
                      <Badge variant="outline" className="text-foreground">
                        {selectedVendor?.vendedor || "Vendedor"}
                      </Badge>
                      {statusSelected && (
                        <>
                          <span className="text-muted-foreground">/</span>
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-2"
                          >
                            {statusSelected}
                            <button
                              onClick={() => {
                                const api = convertFiltersToAPI(currentFilters);
                                setStatusSelected(null);
                                applyGridFilters({
                                  ...api,
                                  situacao: undefined,
                                });
                              }}
                              className="ml-1 text-xs opacity-70 hover:opacity-100"
                              aria-label="Limpar status"
                            >
                              ×
                            </button>
                          </Badge>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      className="border-input"
                      onClick={() => {
                        setSelectedVendorId(null);
                        setStatusSelected(null);
                        setStatusTotais([]);
                        const api = convertFiltersToAPI(currentFilters);
                        applyGridFilters(api, {});
                      }}
                    >
                      Voltar
                    </Button>
                  </div>
                  {selectedVendor && (
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div>
                        Leads:{" "}
                        <span className="font-semibold text-foreground">
                          {selectedVendor.total.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        Cotações abertas:{" "}
                        <span className="font-semibold text-foreground">
                          R${" "}
                          {(
                            Number(selectedVendor.valor_cotacoes_abertas ?? 0) /
                            100
                          ).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <Card
                    key="__todos__"
                    className={`border-0 shadow-lg hover:shadow-xl cursor-pointer ${
                      statusSelected === null ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => {
                      const api = convertFiltersToAPI(currentFilters);
                      setStatusSelected(null);
                      applyGridFilters({ ...api, situacao: undefined });
                    }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">
                        Todos os status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {(selectedVendor?.total ?? 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Leads</p>
                    </CardContent>
                  </Card>
                  {statusTotais.map(
                    ({ situacao, total, valor_cotacoes_abertas }) => (
                      <Card
                        key={situacao}
                        className={`border-0 shadow-lg hover:shadow-xl cursor-pointer ${
                          statusSelected === situacao
                            ? "ring-2 ring-primary"
                            : ""
                        }`}
                        onClick={() => {
                          const newStatus =
                            statusSelected === situacao ? null : situacao;
                          setStatusSelected(newStatus);
                          const api = convertFiltersToAPI(currentFilters);
                          const filters: ILeadsFilters = {
                            ...api,
                            situacao: newStatus || undefined,
                          };
                          applyGridFilters(filters);
                        }}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold">
                            {situacao}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">
                            {(total ?? 0).toLocaleString()}
                          </div>
                          <div className="text-sm font-medium mt-1">
                            R{"$ "}
                            {(
                              Number(valor_cotacoes_abertas ?? 0) / 100
                            ).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </div>
                          <p className="text-xs text-muted-foreground">Leads</p>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </>
            )}

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="p-4 rounded-lg border border-border bg-card shadow">
                <h3 className="text-sm font-semibold mb-3">
                  Total de leads por vendedor
                </h3>
                <ChartContainer
                  config={{
                    total: { label: "Leads", color: "hsl(var(--primary))" },
                    valor: {
                      label: "Cotações (R$)",
                      color: "hsl(var(--muted-foreground))",
                    },
                  }}
                  className="h-80"
                >
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => (
                            <>
                              <span className="text-muted-foreground">
                                {name}
                              </span>
                              <span className="font-mono font-medium tabular-nums text-foreground ml-2">
                                {typeof value === "number" &&
                                name === "Cotações (R$)"
                                  ? value.toLocaleString("pt-BR", {
                                      minimumFractionDigits: 2,
                                    })
                                  : Number(value).toLocaleString()}
                              </span>
                            </>
                          )}
                        />
                      }
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="total"
                      name="Leads"
                      fill="var(--color-total)"
                      onClick={(data) => {
                        if (
                          !data ||
                          typeof (data as any).payload?.id_vendedor !== "number"
                        )
                          return;
                        const api = convertFiltersToAPI(currentFilters);
                        setSelectedVendorId((data as any).payload.id_vendedor);
                        setStatusSelected(null);
                        applyGridFilters(api);
                        (async () => {
                          const s =
                            await leadsService.getTotaisStatusPorVendedor(
                              (data as any).payload.id_vendedor,
                              { ...api, transferido: true }
                            );
                          setStatusTotais(s.totais_por_situacao || []);
                        })();
                      }}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="valor"
                      name="Cotações (R$)"
                      fill="var(--color-valor)"
                    />
                  </BarChart>
                </ChartContainer>
              </div>

              <div className="p-4 rounded-lg border border-border bg-card shadow">
                <h3 className="text-sm font-semibold mb-3">
                  Distribuição por status
                </h3>
                <ChartContainer
                  config={{
                    value: { label: "Leads", color: "hsl(var(--primary))" },
                  }}
                  className="h-80"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={110}
                      label
                    >
                      {pieData.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={`hsl(${(idx * 57) % 360}, 70%, 55%)`}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>
            </div>
          </>
        )}

        <ClientsTable
          title="Clientes Transferidos"
          leads={convertedLeads}
          total={convertedTotal}
          currentPage={convertedCurrentPage}
          totalPages={convertedTotalPages}
          loading={convertedLoading}
          onPageChange={(page) => {
            setConvertedCurrentPage(page);
            const last = lastConvertedFiltersRef.current || {};
            fetchConvertedLeads({
              ...last,
              pagina: page,
              limite: convertedItemsPerPage,
            });
          }}
          onLeadCreated={() => {
            const api = convertFiltersToAPI(currentFilters);
            fetchConvertedLeads({
              ...api,
              pagina: 1,
              limite: convertedItemsPerPage,
            });
            fetchTotais(api);
          }}
          onDataChanged={() => {
            const api = convertFiltersToAPI(currentFilters);
            fetchConvertedLeads({
              ...api,
              pagina: convertedCurrentPage,
              limite: convertedItemsPerPage,
            });
            fetchTotais(api);
          }}
        />
      </div>
    </div>
  );
};

export default Clientes;
