import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Search, Download, RefreshCw } from "lucide-react";
import { leadsService } from "@/services/LeadsService";
import {
  ILeadsConvertidosClientesFilters,
  IMotivoPerda,
} from "@/services/interfaces/ILead";
import { toast } from "@/hooks/use-toast";

const RelatorioMotivosPerda: React.FC = () => {
  const [filters, setFilters] = useState<ILeadsConvertidosClientesFilters>({
    pagina: 1,
    limite: 25,
    order_by: "Pessoa_Codigo",
    order_header: "ASC",
  });

  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: relatorioData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["leads-convertidos-clientes", filters],
    queryFn: () => leadsService.getLeadsConvertidosClientes(filters),
    enabled: true,
  });

  const { data: motivosPerda, isLoading: isLoadingMotivos } = useQuery({
    queryKey: ["motivos-perda"],
    queryFn: () => leadsService.getDropdownMotivosPerda(),
    enabled: true,
  });

  const handleFilterChange = (
    key: keyof ILeadsConvertidosClientesFilters,
    value: any
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      pagina: 1, // Reset to first page when filters change
    }));
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Simple search - you can enhance this to search in multiple fields
      handleFilterChange("pessoa_razao_social", searchTerm);
    } else {
      // Clear search
      setFilters((prev) => {
        const { pessoa_razao_social, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleClearFilters = () => {
    setFilters({
      pagina: 1,
      limite: 25,
      order_by: "Pessoa_Codigo",
      order_header: "ASC",
    });
    setSearchTerm("");
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      pagina: newPage,
    }));
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100); // Assuming values are in centavos
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getStatusBadgeVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "ativo":
        return "default";
      case "inativo":
        return "secondary";
      case "bloqueado":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (error) {
    return (
      <div className="flex-1 space-y-8 p-8">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <h1 className="text-3xl font-bold">Relatório de Motivos de Perda</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Erro ao carregar o relatório. Tente novamente.
              </p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-6 w-6 text-orange-500" />
          <h1 className="text-3xl font-bold">Relatório de Motivos de Perda</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca por nome/razão social */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar por Nome/Razão Social</Label>
              <div className="flex space-x-2">
                <Input
                  id="search"
                  placeholder="Digite o nome ou razão social..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.pessoa_status || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "pessoa_status",
                    value === "all" ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* UF */}
            <div className="space-y-2">
              <Label htmlFor="uf">UF</Label>
              <Input
                id="uf"
                placeholder="Ex: SP, RJ, MG..."
                value={filters.pessoa_uf || ""}
                onChange={(e) =>
                  handleFilterChange("pessoa_uf", e.target.value || undefined)
                }
              />
            </div>

            {/* Cidade */}
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                placeholder="Digite a cidade..."
                value={filters.pessoa_cidade || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "pessoa_cidade",
                    e.target.value || undefined
                  )
                }
              />
            </div>

            {/* Data de cadastro início */}
            <div className="space-y-2">
              <Label htmlFor="data-inicio">Data Cadastro Início</Label>
              <Input
                id="data-inicio"
                type="date"
                value={filters.pessoa_data_cadastro_inicio || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "pessoa_data_cadastro_inicio",
                    e.target.value || undefined
                  )
                }
              />
            </div>

            {/* Data de cadastro fim */}
            <div className="space-y-2">
              <Label htmlFor="data-fim">Data Cadastro Fim</Label>
              <Input
                id="data-fim"
                type="date"
                value={filters.pessoa_data_cadastro_fim || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "pessoa_data_cadastro_fim",
                    e.target.value || undefined
                  )
                }
              />
            </div>

            {/* Motivo de perda */}
            <div className="space-y-2">
              <Label htmlFor="motivo-perda">Motivo de Perda</Label>
              <Select
                value={filters.motivo_perda?.toString() || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "motivo_perda",
                    value === "all" ? undefined : value
                  )
                }
                disabled={isLoadingMotivos}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo de perda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {motivosPerda?.map((motivo) => (
                    <SelectItem key={motivo.id} value={motivo.descricao}>
                      {motivo.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Origem */}
            <div className="space-y-2">
              <Label htmlFor="origem">Origem</Label>
              <Input
                id="origem"
                placeholder="Digite a origem..."
                value={filters.source_name || ""}
                onChange={(e) =>
                  handleFilterChange("source_name", e.target.value || undefined)
                }
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
            <Button onClick={() => refetch()}>
              <Search className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex space-x-4">
              <Skeleton className="h-20 w-32" />
              <Skeleton className="h-20 w-32" />
              <Skeleton className="h-20 w-32" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {relatorioData?.total || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total de Registros
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {relatorioData?.data.filter(
                    (item) => item.pessoa_status?.toLowerCase() === "ativo"
                  ).length || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Clientes Ativos
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {relatorioData?.data.filter((item) => item.motivo_perda)
                    .length || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Com Motivo de Perda
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de dados */}
      <Card>
        <CardHeader>
          <CardTitle>Dados dos Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome/Razão Social</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Cadastro</TableHead>
                    <TableHead>UF</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Motivo Perda</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Último Pedido</TableHead>
                    <TableHead>Valor Último Pedido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatorioData?.data.map((item) => (
                    <TableRow key={item.pessoa_codigo}>
                      <TableCell className="font-medium">
                        {item.pessoa_codigo}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {item.pessoa_razao_social ||
                              item.pessoa_nome_fantasia ||
                              "-"}
                          </div>
                          {item.pessoa_nome_fantasia &&
                            item.pessoa_razao_social && (
                              <div className="text-sm text-muted-foreground">
                                {item.pessoa_nome_fantasia}
                              </div>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(item.pessoa_status)}
                        >
                          {item.pessoa_status || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(item.pessoa_data_cadastro)}
                      </TableCell>
                      <TableCell>{item.pessoa_uf || "-"}</TableCell>
                      <TableCell>{item.pessoa_cidade || "-"}</TableCell>
                      <TableCell>{item.pessoa_telefone || "-"}</TableCell>
                      <TableCell>{item.pessoa_email || "-"}</TableCell>
                      <TableCell>
                        {item.motivo_perda ? (
                          <Badge variant="destructive">
                            {item.motivo_perda}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{item.source_name || "-"}</TableCell>
                      <TableCell>
                        {formatDate(item.data_ultimo_pedido)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(item.valor_ultimo_pedido)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {relatorioData?.data.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhum registro encontrado com os filtros aplicados.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {relatorioData && relatorioData.total > (filters.limite || 25) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando{" "}
                {((filters.pagina || 1) - 1) * (filters.limite || 25) + 1} a{" "}
                {Math.min(
                  (filters.pagina || 1) * (filters.limite || 25),
                  relatorioData.total
                )}{" "}
                de {relatorioData.total} registros
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((filters.pagina || 1) - 1)}
                  disabled={!filters.pagina || filters.pagina <= 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((filters.pagina || 1) + 1)}
                  disabled={
                    !filters.pagina ||
                    (filters.pagina || 1) * (filters.limite || 25) >=
                      relatorioData.total
                  }
                >
                  Próximo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RelatorioMotivosPerda;
