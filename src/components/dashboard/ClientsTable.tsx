import React, { useState, useEffect } from "react";
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
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Eye,
  Target,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Receipt,
  Activity,
  PhoneCall,
  UserCheck2,
  Contact,
  MessageCircle,
  MessageSquare,
  ClipboardList,
} from "lucide-react";
import { ILead } from "@/services/interfaces/ILead";
import { useDropdowns } from "@/hooks/use-dropdowns";
// import { CreateLeadModal, CriarLeadRapidoData } from "./CreateLeadModal";
import { UpdateLeadStatusModal } from "./UpdateLeadStatusModal";
import { LeadAtividadesModal } from "./LeadAtividadesModal";
import { ConvertLeadToClientModal } from "./ConvertLeadToClientModal";
import { LeadDetailsModal } from "./LeadDetailsModal";
import { PedidosClienteModal } from "./PedidosClienteModal";
import { useToast } from "@/hooks/use-toast";
import { leadsService } from "@/services/LeadsService";

interface ClientsTableProps {
  title: string;
  leads: ILead[];
  total?: number;
  currentPage: number;
  totalPages: number;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onLeadCreated?: () => void;
  onDataChanged?: () => void;
  currentFilters?: {
    vendorId?: number | null;
    status?: string | null;
  };
}

type SortDirection = "asc" | "desc" | null;

export const ClientsTable: React.FC<ClientsTableProps> = ({
  title,
  leads,
  total,
  currentPage,
  totalPages,
  loading = false,
  onPageChange,
  onLeadCreated,
  onDataChanged,
  currentFilters,
}) => {
  const { toast } = useToast();
  const {
    etapas,
    situacoes,
    consultores,
    vendedores,
    loading: dropdownsLoading,
    error: dropdownsError,
  } = useDropdowns();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof ILead | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedLead, setSelectedLead] = useState<ILead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPedidosModalOpen, setIsPedidosModalOpen] = useState(false);
  const [clientePedidosContext, setClientePedidosContext] = useState<{
    idCliente: number | null;
    nome: string | null;
  }>({ idCliente: null, nome: null });

  // Removidos: seleção em lote e criação rápida de lead

  // Estados para atualização de status
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [selectedLeadForUpdate, setSelectedLeadForUpdate] =
    useState<ILead | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Estados para modal de atividades
  const [isAtividadesModalOpen, setIsAtividadesModalOpen] = useState(false);
  const [selectedLeadForAtividades, setSelectedLeadForAtividades] =
    useState<ILead | null>(null);

  // Estados para modal de conversão em cliente
  const [isConvertToClientModalOpen, setIsConvertToClientModalOpen] =
    useState(false);
  const [selectedLeadForConversion, setSelectedLeadForConversion] =
    useState<ILead | null>(null);
  const [isConvertingToClient, setIsConvertingToClient] = useState(false);

  // Estado para inclusão no Chatguru
  const [includingChatguruId, setIncludingChatguruId] = useState<number | null>(
    null
  );

  // Debounce para o termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filtro local para busca visual rápida
  const displayLeads = debouncedSearchTerm
    ? leads.filter((lead) => {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const searchFields = [
          lead.nome,
          lead.email,
          lead.telefone,
          lead.telefone_tratado,
          lead.origem,
          lead.situacao,
          lead.uf,
          lead.cidade,
          lead.etapa,
          lead.procura_para,
          lead.consultor,
          lead.vendedor,
          lead.id.toString(),
          lead.id_cliente?.toString(),
        ];
        return searchFields.some((field) => {
          if (!field) return false;
          return field.toString().toLowerCase().includes(searchLower);
        });
      })
    : leads;

  // Ordenação local
  const sortedLeads = [...displayLeads].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;

    const aValue = a[sortColumn]?.toString() || "";
    const bValue = b[sortColumn]?.toString() || "";

    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const handleSort = (column: keyof ILead) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: keyof ILead) => {
    if (sortColumn !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    if (sortDirection === "asc") return <ArrowUp className="ml-2 h-4 w-4" />;
    if (sortDirection === "desc") return <ArrowDown className="ml-2 h-4 w-4" />;
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  const getSituacaoBadge = (situacao: string) => {
    const situacaoConfig = {
      "Novo Lead": {
        variant: "default" as const,
        className: "bg-primary text-primary-foreground font-semibold shadow-sm",
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAction = (action: string, lead: ILead) => {
    switch (action) {
      case "view":
        setSelectedLead(lead);
        setIsModalOpen(true);
        break;
      case "edit":
        // Implementar edição
        break;
      case "update_status":
        setSelectedLeadForUpdate(lead);
        setIsUpdateStatusModalOpen(true);
        break;
      case "atividades":
        setSelectedLeadForAtividades(lead);
        setIsAtividadesModalOpen(true);
        break;
      case "convert_to_client":
        setSelectedLeadForConversion(lead);
        setIsConvertToClientModalOpen(true);
        break;
      case "pedidos_venda":
        setClientePedidosContext({
          idCliente: lead.id_cliente || null,
          nome: lead.nome,
        });
        setIsPedidosModalOpen(true);
        break;
      case "notas_fiscais":
        // Implementar visualização de notas fiscais
        console.log("Visualizar notas fiscais para:", lead.nome);
        break;
      case "chamados":
        // Implementar visualização de chamados
        console.log("Visualizar chamados para:", lead.nome);
        break;
      case "dados_cliente":
        // Implementar visualização de dados do cliente
        console.log("Visualizar dados do cliente:", lead.nome);
        break;
      case "contatos":
        // Implementar visualização de contatos
        console.log("Visualizar contatos para:", lead.nome);
        break;
      case "chamar_zap":
        // Abrir conversa no WhatsApp com o telefone do lead
        try {
          const raw = (lead.telefone_tratado || lead.telefone || "").toString();
          const digits = raw.replace(/\D/g, "");

          if (!digits) {
            toast({
              title: "Telefone não disponível",
              description:
                "Este cliente não possui telefone válido para WhatsApp.",
              variant: "destructive",
            });
            return;
          }

          let phone = digits.replace(/^0+/, "");
          if (!phone.startsWith("55") && phone.length <= 11) {
            phone = `55${phone}`;
          }

          const text = encodeURIComponent(`Olá ${lead.nome}, tudo bem?`);
          const url = `https://wa.me/${phone}?text=${text}`;
          window.open(url, "_blank", "noopener,noreferrer");
        } catch (e) {
          toast({
            title: "Não foi possível abrir o WhatsApp",
            description: "Tente novamente ou verifique o número do cliente.",
            variant: "destructive",
          });
        }
        break;
      case "cotacoes_abertas":
        // Implementar visualização de cotações em aberto
        console.log("Visualizar cotações em aberto para:", lead.nome);
        break;
      default:
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  // Removidos: seleção em lote e criação rápida de lead

  const handleUpdateLeadStatus = async (
    idEtapa: number,
    idSituacao: number
  ) => {
    if (!selectedLeadForUpdate) return;

    setIsUpdatingStatus(true);
    try {
      await leadsService.atualizarEtapaSituacaoLead(
        selectedLeadForUpdate.id,
        idEtapa,
        idSituacao
      );

      setIsUpdateStatusModalOpen(false);
      setSelectedLeadForUpdate(null);
      setIsUpdatingStatus(false);

      if (onDataChanged) {
        onDataChanged();
      }

      toast({
        title: "Status atualizado com sucesso!",
        description: `O status do cliente "${selectedLeadForUpdate.nome}" foi atualizado.`,
        variant: "default",
      });
    } catch (error) {
      setIsUpdatingStatus(false);

      toast({
        title: "Erro ao atualizar status",
        description:
          "Não foi possível atualizar o status do cliente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleConvertToClient = async (clientData: any) => {
    if (!selectedLeadForConversion) return;

    setIsConvertingToClient(true);
    try {
      const fisicaJuridica = clientData.tipo === "fisica" ? "F" : "J";

      const payload: any = {
        id_lead: selectedLeadForConversion.id,
        nome: selectedLeadForConversion.nome,
        email: clientData.email,
        telefone: clientData.telefone,
        fisica_juridica: fisicaJuridica,
        instagram: clientData.instagram,
        facebook: clientData.facebook,
        id_vendedor: clientData.id_vendedor,
        id_ramo_atividade: clientData.id_ramo_atividade,
        id_cidade: clientData.id_cidade,
      };

      if (fisicaJuridica === "F") {
        payload.cpf = clientData.documento.replace(/\D/g, "");
      } else {
        payload.cnpj = clientData.documento.replace(/\D/g, "");
      }

      await leadsService.converterLeadParaCliente(payload);

      setIsConvertToClientModalOpen(false);
      setSelectedLeadForConversion(null);
      setIsConvertingToClient(false);

      if (onDataChanged) {
        onDataChanged();
      }

      toast({
        title: "Lead convertido com sucesso!",
        description: `O lead "${selectedLeadForConversion.nome}" foi convertido em cliente.`,
        variant: "default",
      });
    } catch (error) {
      setIsConvertingToClient(false);

      toast({
        title: "Erro ao converter lead",
        description:
          "Não foi possível converter o lead em cliente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 border-0 shadow-lg bg-card">
        {/* Header da tabela */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {total ?? 0} clientes encontrados
              {currentFilters?.vendorId && (
                <span className="ml-2 text-blue-700 dark:text-blue-300 font-semibold bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                  Vendedor filtrado
                </span>
              )}
              {currentFilters?.status && (
                <span className="ml-2 text-purple-700 dark:text-purple-300 font-semibold bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                  Status: {currentFilters.status}
                </span>
              )}
              {debouncedSearchTerm && (
                <span className="ml-2 text-green-700 dark:text-green-300 font-semibold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  Filtro local: "{debouncedSearchTerm}" ({sortedLeads.length}{" "}
                  exibidos)
                </span>
              )}
              {/* Indicador de seleção em lote removido */}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Botões removidos: Novo Lead e Ações em lote */}

            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-primary" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-8 w-64 border-input focus:border-ring focus:ring-ring"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-lg border border-border overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-primary">
              <TableRow>
                {/* Coluna de seleção removida */}
                <TableHead className="text-white font-semibold">
                  Ações
                </TableHead>
                <TableHead className="text-white">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("nome")}
                    className="h-auto p-0 font-semibold text-white hover:bg-transparent focus-visible:ring-0"
                  >
                    Nome
                    {getSortIcon("nome")}
                  </Button>
                </TableHead>
                <TableHead className="text-white">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("email")}
                    className="h-auto p-0 font-semibold text-white hover:bg-transparent focus-visible:ring-0"
                  >
                    Email
                    {getSortIcon("email")}
                  </Button>
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Telefone
                </TableHead>
                <TableHead className="text-white">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("origem")}
                    className="h-auto p-0 font-semibold text-white hover:bg-transparent focus-visible:ring-0"
                  >
                    Origem
                    {getSortIcon("origem")}
                  </Button>
                </TableHead>
                <TableHead className="text-white">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("situacao")}
                    className="h-auto p-0 font-semibold text-white hover:bg-transparent focus-visible:ring-0"
                  >
                    Situação
                    {getSortIcon("situacao")}
                  </Button>
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Procura Para
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Consultor
                </TableHead>
                <TableHead className="text-white">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("vendedor")}
                    className="h-auto p-0 font-semibold text-white hover:bg-transparent focus-visible:ring-0"
                  >
                    Vendedor
                    {getSortIcon("vendedor")}
                  </Button>
                </TableHead>
                <TableHead className="text-white font-semibold">UF</TableHead>
                <TableHead className="text-white">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("etapa")}
                    className="h-auto p-0 font-semibold text-white hover:bg-transparent focus-visible:ring-0"
                  >
                    Etapa
                    {getSortIcon("etapa")}
                  </Button>
                </TableHead>
                <TableHead className="text-white">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("id_cliente")}
                    className="h-auto p-0 font-semibold text-white hover:bg-transparent focus-visible:ring-0"
                  >
                    ID Cliente
                    {getSortIcon("id_cliente")}
                  </Button>
                </TableHead>
                <TableHead className="text-white">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("data_criacao")}
                    className="h-auto p-0 font-semibold text-white hover:bg-transparent focus-visible:ring-0"
                  >
                    Data Criação
                    {getSortIcon("data_criacao")}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLeads.map((lead, index) => (
                <TableRow
                  key={lead.id}
                  className={`hover:bg-accent transition-colors ${
                    index % 2 === 0 ? "bg-background" : "bg-muted/30"
                  }`}
                >
                  {/* Coluna de seleção removida */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>

                        {/* Ações principais */}
                        <DropdownMenuItem
                          onClick={() => handleAction("view", lead)}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Ações de negócio */}
                        <DropdownMenuItem
                          onClick={() => handleAction("pedidos_venda", lead)}
                          className="cursor-pointer"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Visualizar Pedidos de Venda
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction("notas_fiscais", lead)}
                          className="cursor-pointer"
                        >
                          <Receipt className="mr-2 h-4 w-4" />
                          Visualizar Notas Fiscais
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction("cotacoes_abertas", lead)}
                          className="cursor-pointer"
                        >
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Visualizar Cotações em Aberto
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Ações de gestão */}
                        <DropdownMenuItem
                          onClick={() => handleAction("update_status", lead)}
                          className="cursor-pointer"
                        >
                          <Target className="mr-2 h-4 w-4" />
                          Atualizar Status
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction("atividades", lead)}
                          className="cursor-pointer"
                        >
                          <Activity className="mr-2 h-4 w-4" />
                          Visualizar Atividades
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction("chamados", lead)}
                          className="cursor-pointer"
                        >
                          <PhoneCall className="mr-2 h-4 w-4" />
                          Visualizar Chamados
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Ações de cliente */}
                        <DropdownMenuItem
                          onClick={() => handleAction("dados_cliente", lead)}
                          className="cursor-pointer"
                        >
                          <UserCheck2 className="mr-2 h-4 w-4" />
                          Visualizar Dados do Cliente
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction("contatos", lead)}
                          className="cursor-pointer"
                        >
                          <Contact className="mr-2 h-4 w-4" />
                          Visualizar Contatos
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Ações de comunicação */}
                        <DropdownMenuItem
                          onClick={() => handleAction("chamar_zap", lead)}
                          className="cursor-pointer"
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Chamar no WhatsApp
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="font-medium">{lead.nome}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.telefone}</TableCell>
                  <TableCell>{lead.origem}</TableCell>
                  <TableCell>{getSituacaoBadge(lead.situacao)}</TableCell>
                  <TableCell>
                    {lead.procura_para ? (
                      <Badge
                        variant="outline"
                        className="border-input text-primary bg-primary/10 font-medium"
                      >
                        {lead.procura_para}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">
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
                  <TableCell>
                    <span className="text-sm">{lead.uf}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-input text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 font-medium"
                    >
                      {lead.etapa || "Não informado"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">
                      {lead.id_cliente ? lead.id_cliente : "Não atribuído"}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(lead.data_criacao)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-6 border-t border-border">
            <div className="text-sm text-muted-foreground font-medium">
              Página {currentPage} de {totalPages} - Total: {total} clientes
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-input text-primary hover:bg-accent hover:border-ring"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (page > totalPages) return null;

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange?.(page)}
                      className={`w-8 h-8 p-0 ${
                        currentPage === page
                          ? "bg-primary hover:bg-primary/90"
                          : "border-input text-primary hover:bg-accent hover:border-ring"
                      }`}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-input text-primary hover:bg-accent hover:border-ring"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal de Detalhes */}
      <LeadDetailsModal
        lead={selectedLead}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Modal de Pedidos por Cliente */}
      <PedidosClienteModal
        idCliente={clientePedidosContext.idCliente || undefined}
        clienteNome={clientePedidosContext.nome || undefined}
        isOpen={isPedidosModalOpen}
        onClose={() => setIsPedidosModalOpen(false)}
      />

      {/* Removidos: Modal de Ações em Lote e Criação de Lead */}

      {/* Modal de Atualização de Status */}
      <UpdateLeadStatusModal
        lead={selectedLeadForUpdate}
        isOpen={isUpdateStatusModalOpen}
        onClose={() => {
          setIsUpdateStatusModalOpen(false);
          setSelectedLeadForUpdate(null);
        }}
        onSubmit={handleUpdateLeadStatus}
        loading={isUpdatingStatus}
        etapas={etapas}
        situacoes={situacoes}
      />

      {/* Modal de Atividades */}
      <LeadAtividadesModal
        lead={selectedLeadForAtividades}
        isOpen={isAtividadesModalOpen}
        onClose={() => {
          setIsAtividadesModalOpen(false);
          setSelectedLeadForAtividades(null);
        }}
      />

      {/* Modal de Conversão em Cliente */}
      <ConvertLeadToClientModal
        lead={selectedLeadForConversion}
        isOpen={isConvertToClientModalOpen}
        onClose={() => {
          setIsConvertToClientModalOpen(false);
          setSelectedLeadForConversion(null);
        }}
        onSubmit={handleConvertToClient}
        loading={isConvertingToClient}
      />
    </>
  );
};
