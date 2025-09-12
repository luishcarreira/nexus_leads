import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { leadsService } from "@/services/LeadsService";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface PedidoResumo {
  pedido: number;
  status?: string | null;
  status_fiscal?: string | null;
  data_cadastro?: string | null;
  tipo_operacao?: string | null;
  numero_ecommerce?: string | null;
  total_pedido?: number | null;
  libera_comercial?: string | null;
  pedido_liberado_controle_documento?: string | null;
  liberacao_financeiro?: string | null;
  empresa?: number | null;
  vendedor?: string | null;
  id_tipo_operacao?: number | null;
  filial?: number | null;
  id_cliente?: number | null;
}

interface PedidosClienteModalProps {
  idCliente?: number | null;
  clienteNome?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PedidosClienteModal: React.FC<PedidosClienteModalProps> = ({
  idCliente,
  clienteNome,
  isOpen,
  onClose,
}) => {
  const [pedidos, setPedidos] = useState<PedidoResumo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const limite = 25;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPedidos = async (pageToLoad = 1) => {
    if (!idCliente) return;
    try {
      setLoading(true);
      const res = await leadsService.getPedidos({
        id_cliente: idCliente,
        pagina: pageToLoad,
        limite,
      });
      setPedidos(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(Math.max(1, Math.ceil((res.total || 0) / limite)));
      setPage(pageToLoad);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPedidos(1);
    }
  }, [isOpen, idCliente]);

  const displayPedidos = useMemo(() => {
    if (!debouncedSearch) return pedidos;
    const s = debouncedSearch.toLowerCase();
    return pedidos.filter((p) => {
      const fields = [
        p.pedido?.toString() || "",
        p.status || "",
        p.status_fiscal || "",
        p.tipo_operacao || "",
        p.numero_ecommerce || "",
        p.vendedor || "",
      ];
      return fields.some((f) => f.toLowerCase().includes(s));
    });
  }, [pedidos, debouncedSearch]);

  const formatDate = (iso?: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl border-0 shadow-2xl">
        <DialogHeader className="bg-primary text-primary-foreground rounded-t-lg -m-6 mb-6 p-6">
          <DialogTitle className="text-xl font-semibold">
            Pedidos do Cliente {clienteNome ? `- ${clienteNome}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-muted-foreground">
            Total: {total} pedido(s)
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-primary" />
            <Input
              placeholder="Buscar por número, status, operação..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-8 w-80 border-input focus:border-ring focus:ring-ring"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Pedido</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Status Fiscal</TableHead>
                <TableHead>Data Cadastro</TableHead>
                <TableHead>Operação</TableHead>
                <TableHead>Nº E-commerce</TableHead>
                <TableHead className="text-right">Total (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : displayPedidos.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Nenhum pedido encontrado
                  </TableCell>
                </TableRow>
              ) : (
                displayPedidos.map((p) => (
                  <TableRow key={p.pedido}>
                    <TableCell className="font-mono font-medium">
                      {p.pedido}
                    </TableCell>
                    <TableCell>{p.status || "-"}</TableCell>
                    <TableCell>{p.status_fiscal || "-"}</TableCell>
                    <TableCell>{formatDate(p.data_cadastro)}</TableCell>
                    <TableCell>{p.tipo_operacao || "-"}</TableCell>
                    <TableCell>{p.numero_ecommerce || "-"}</TableCell>
                    <TableCell className="text-right">
                      {typeof p.total_pedido === "number"
                        ? p.total_pedido.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground font-medium">
              Página {page} de {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1 || loading}
                onClick={() => fetchPedidos(page - 1)}
                className="border-input"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages || loading}
                onClick={() => fetchPedidos(page + 1)}
                className="border-input"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" className="border-input" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PedidosClienteModal;
