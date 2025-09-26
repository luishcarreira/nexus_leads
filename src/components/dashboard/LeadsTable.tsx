import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useLayoutEffect,
} from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Plus,
  Users,
  UserCheck,
  UserX,
  Edit,
  Activity,
  UserPlus,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Square,
  Search,
  Eye,
  Target,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ILead } from "@/services/interfaces/ILead";
import { httpClient } from "@/services/httpClient";
import { useDropdowns } from "@/hooks/use-dropdowns";
import { CreateLeadModal, CriarLeadRapidoData } from "./CreateLeadModal";
import { UpdateLeadStatusModal } from "./UpdateLeadStatusModal";
import { LeadAtividadesModal } from "./LeadAtividadesModal";
import { ConvertLeadToClientModal } from "./ConvertLeadToClientModal";
import { LeadDetailsModal } from "./LeadDetailsModal";
import { useToast } from "@/hooks/use-toast";

interface LeadsTableProps {
  leads: ILead[];
  total?: number; // total retornado pela API
  currentPage: number;
  totalPages: number;
  loading?: boolean;
  onPageChange?: (page: number) => void; // Callback para mudança de página
  onLeadCreated?: () => void; // Callback para recarregar dados após criar lead
  onDataChanged?: () => void; // Callback para recarregar dados após qualquer modificação
}

type SortDirection = "asc" | "desc" | null;

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  total,
  currentPage,
  totalPages,
  loading = false,
  onPageChange,
  onLeadCreated,
  onDataChanged,
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

  // Estados para seleção múltipla e ações em lote
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [isBatchActionModalOpen, setIsBatchActionModalOpen] = useState(false);
  const [batchAction, setBatchAction] = useState<string>("");
  const [selectedConsultor, setSelectedConsultor] = useState<number | null>(
    null
  );
  const [selectedVendedor, setSelectedVendedor] = useState<number | null>(null);

  // Refs e estados para scrollbar horizontal superior sincronizada com a tabela
  const topScrollRef = useRef<HTMLDivElement | null>(null);
  const bottomScrollRef = useRef<HTMLDivElement | null>(null);
  const tableInnerRef = useRef<HTMLDivElement | null>(null);
  const isSyncingScrollRef = useRef(false);
  const [contentWidth, setContentWidth] = useState<number>(0);

  // Estados para criação de lead
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingLead, setIsCreatingLead] = useState(false);

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

  // Debounce para o termo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms de delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // A busca agora será tratada pelo componente pai via API

  // Como a busca agora é feita na API, vamos apenas mostrar os dados
  // O filtro local será apenas para busca visual rápida se necessário
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

  // Ordenação local (pode ser removida se implementada na API)
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

  // Sincronização das barras de rolagem horizontal (topo <-> tabela)
  const handleTopScroll = () => {
    if (!topScrollRef.current || !bottomScrollRef.current) return;
    if (isSyncingScrollRef.current) return;
    isSyncingScrollRef.current = true;
    bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    isSyncingScrollRef.current = false;
  };

  const handleBottomScroll = () => {
    if (!topScrollRef.current || !bottomScrollRef.current) return;
    if (isSyncingScrollRef.current) return;
    isSyncingScrollRef.current = true;
    topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft;
    isSyncingScrollRef.current = false;
  };

  // Ajuste dinâmico da largura do conteúdo para a barra superior
  useLayoutEffect(() => {
    const updateWidth = () => {
      const tableWidth = tableInnerRef.current?.scrollWidth || 0;
      const containerWidth = bottomScrollRef.current?.clientWidth || 0;
      const finalWidth = Math.max(tableWidth, containerWidth);
      setContentWidth(finalWidth);
    };

    // Medição após o próximo frame para garantir DOM atualizado
    const rafMeasure = () => {
      requestAnimationFrame(() => {
        updateWidth();
      });
    };

    rafMeasure();

    // Observa mudanças de tamanho do conteúdo da tabela e do container inferior
    let tableObserver: ResizeObserver | null = null;
    let containerObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      if (tableInnerRef.current) {
        tableObserver = new ResizeObserver(() => {
          updateWidth();
        });
        tableObserver.observe(tableInnerRef.current);
      }
      if (bottomScrollRef.current) {
        containerObserver = new ResizeObserver(() => {
          updateWidth();
        });
        containerObserver.observe(bottomScrollRef.current);
      }
    }

    const onResize = () => updateWidth();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (tableObserver) tableObserver.disconnect();
      if (containerObserver) containerObserver.disconnect();
    };
  }, [leads, sortedLeads.length]);

  // Garante sincronização inicial da posição do scroll
  useEffect(() => {
    if (!topScrollRef.current || !bottomScrollRef.current) return;
    topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft;
  }, [contentWidth, leads]);

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
      default:
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  // Funções para seleção múltipla
  const handleSelectLead = (leadId: number) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === sortedLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(sortedLeads.map((lead) => lead.id)));
    }
  };

  const handleBatchAction = (action: string) => {
    setBatchAction(action);
    setIsBatchActionModalOpen(true);
  };

  const handleExecuteBatchAction = async () => {
    if (selectedLeads.size === 0) return;

    try {
      switch (batchAction) {
        case "vincular_consultor":
          if (selectedConsultor) {
            // Vincular consultor a todos os leads selecionados
            const promises = Array.from(selectedLeads).map((leadId) =>
              httpClient.vincularConsultorAoLead(leadId, selectedConsultor)
            );
            await Promise.all(promises);

            // Toast de sucesso para vinculação de consultor
            const consultorNome =
              consultores.find((c) => c.codigo === selectedConsultor)?.nome ||
              "Consultor";
            toast({
              title: "Consultor vinculado com sucesso!",
              description: `${selectedLeads.size} lead(s) vinculado(s) ao consultor ${consultorNome}.`,
              variant: "default",
            });
          }
          break;
        case "vincular_vendedor":
          if (selectedVendedor) {
            // Vincular vendedor a todos os leads selecionados
            const promises = Array.from(selectedLeads).map((leadId) =>
              httpClient.vincularVendedorAoLead(leadId, selectedVendedor)
            );
            await Promise.all(promises);

            // Toast de sucesso para vinculação de vendedor
            const vendedorNome =
              vendedores.find((v) => v.codigo === selectedVendedor)?.nome ||
              "Vendedor";
            toast({
              title: "Vendedor vinculado com sucesso!",
              description: `${selectedLeads.size} lead(s) vinculado(s) ao vendedor ${vendedorNome}.`,
              variant: "default",
            });
          }
          break;
        default:
      }

      setSelectedLeads(new Set());
      setBatchAction("");
      setSelectedConsultor(null);
      setSelectedVendedor(null);
      setIsBatchActionModalOpen(false);

      // Recarregar dados após ação em lote
      if (onDataChanged) {
        onDataChanged();
      }
    } catch (error) {
      // Toast de erro para ações em lote
      toast({
        title: "Erro na ação em lote",
        description: "Não foi possível executar a ação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCloseBatchModal = () => {
    setIsBatchActionModalOpen(false);
    setBatchAction("");
    setSelectedConsultor(null);
    setSelectedVendedor(null);
  };

  const handleCreateLead = async (leadData: CriarLeadRapidoData) => {
    setIsCreatingLead(true);
    try {
      // Chamar o endpoint de criação rápida
      const response = await httpClient.criarLeadRapido(leadData);

      // Fechar modal e limpar estado
      setIsCreateModalOpen(false);
      setIsCreatingLead(false);

      // Recarregar a lista de leads após criar
      if (onLeadCreated) {
        onLeadCreated();
      }

      // Toast de sucesso
      toast({
        title: "Lead criado com sucesso!",
        description: `O lead "${leadData.nome}" foi criado e adicionado à lista.`,
        variant: "default",
      });
    } catch (error) {
      setIsCreatingLead(false);

      // Toast de erro
      toast({
        title: "Erro ao criar lead",
        description: "Não foi possível criar o lead. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLeadStatus = async (
    idEtapa: number,
    idSituacao: number
  ) => {
    if (!selectedLeadForUpdate) return;

    setIsUpdatingStatus(true);
    try {
      await httpClient.atualizarEtapaSituacaoLead(
        selectedLeadForUpdate.id,
        idEtapa,
        idSituacao
      );

      // Fechar modal e limpar estado
      setIsUpdateStatusModalOpen(false);
      setSelectedLeadForUpdate(null);
      setIsUpdatingStatus(false);

      // Recarregar dados após atualizar status
      if (onDataChanged) {
        onDataChanged();
      }

      // Toast de sucesso
      toast({
        title: "Status atualizado com sucesso!",
        description: `O status do lead "${selectedLeadForUpdate.nome}" foi atualizado.`,
        variant: "default",
      });
    } catch (error) {
      setIsUpdatingStatus(false);

      // Toast de erro
      toast({
        title: "Erro ao atualizar status",
        description:
          "Não foi possível atualizar o status do lead. Tente novamente.",
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

      await httpClient.converterLeadParaCliente(payload);

      // Fechar modal e limpar estado
      setIsConvertToClientModalOpen(false);
      setSelectedLeadForConversion(null);
      setIsConvertingToClient(false);

      // Recarregar dados após converter lead
      if (onDataChanged) {
        onDataChanged();
      }

      // Toast de sucesso
      toast({
        title: "Lead convertido com sucesso!",
        description: `O lead "${selectedLeadForConversion.nome}" foi convertido em cliente.`,
        variant: "default",
      });
    } catch (error) {
      setIsConvertingToClient(false);

      // Toast de erro
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
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
        {/* Header da tabela */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">
              Leads Cadastrados
            </h3>
            <p className="text-sm text-blue-600">
              {total ?? 0} leads encontrados
              {debouncedSearchTerm && (
                <span className="ml-2 text-green-800 font-semibold bg-green-100 px-2 py-1 rounded-full">
                  Filtro local: "{debouncedSearchTerm}" ({sortedLeads.length}{" "}
                  exibidos)
                </span>
              )}
              {selectedLeads.size > 0 && (
                <span className="ml-2 text-blue-800 font-semibold bg-blue-100 px-2 py-1 rounded-full">
                  {selectedLeads.size} selecionado(s)
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Botão Novo Lead */}
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Novo Lead
            </Button>

            {/* Ações em lote */}
            {selectedLeads.size > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                  >
                    <Users className="h-4 w-4" />
                    Ações em Lote ({selectedLeads.size})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações Disponíveis</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => handleBatchAction("vincular_consultor")}
                    className="cursor-pointer"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Vincular Consultor
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem
                    onClick={() => handleBatchAction("vincular_vendedor")}
                    className="cursor-pointer"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Vincular Vendedor
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setSelectedLeads(new Set())}
                    className="cursor-pointer text-red-600"
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Limpar Seleção
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-blue-500" />
              <Input
                placeholder="Buscar leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-8 w-64 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scroll horizontal no topo */}
        <div className="mb-3">
          <div
            ref={topScrollRef}
            className="h-6 overflow-x-auto overflow-y-hidden rounded border border-blue-200 bg-blue-50/30"
            onScroll={handleTopScroll}
          >
            <div style={{ width: contentWidth }} />
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-lg border border-blue-200 shadow-sm">
          <div
            ref={bottomScrollRef}
            className="overflow-x-auto"
            onScroll={handleBottomScroll}
          >
            <div ref={tableInnerRef} className="inline-block min-w-max">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <TableHead className="w-12 text-white">
                      <Checkbox
                        checked={
                          selectedLeads.size === sortedLeads.length &&
                          sortedLeads.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Selecionar todos"
                        className="text-white border-white"
                      />
                    </TableHead>
                    <TableHead className="text-white font-semibold">
                      Ações
                    </TableHead>
                    <TableHead className="text-white">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("nome")}
                        className="h-auto p-0 font-semibold text-white hover:bg-blue-600"
                      >
                        Nome
                        {getSortIcon("nome")}
                      </Button>
                    </TableHead>
                    <TableHead className="text-white">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("email")}
                        className="h-auto p-0 font-semibold text-white hover:bg-blue-600"
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
                        className="h-auto p-0 font-semibold text-white hover:bg-blue-600"
                      >
                        Origem
                        {getSortIcon("origem")}
                      </Button>
                    </TableHead>
                    <TableHead className="text-white">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("situacao")}
                        className="h-auto p-0 font-semibold text-white hover:bg-blue-600"
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
                        className="h-auto p-0 font-semibold text-white hover:bg-blue-600"
                      >
                        Vendedor
                        {getSortIcon("vendedor")}
                      </Button>
                    </TableHead>

                    <TableHead className="text-white font-semibold">
                      UF
                    </TableHead>
                    <TableHead className="text-white">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("etapa")}
                        className="h-auto p-0 font-semibold text-white hover:bg-blue-600"
                      >
                        Etapa
                        {getSortIcon("etapa")}
                      </Button>
                    </TableHead>
                    <TableHead className="text-white">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("id_cliente")}
                        className="h-auto p-0 font-semibold text-white hover:bg-blue-600"
                      >
                        ID Cliente
                        {getSortIcon("id_cliente")}
                      </Button>
                    </TableHead>
                    <TableHead className="text-white">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("data_criacao")}
                        className="h-auto p-0 font-semibold text-white hover:bg-blue-600"
                      >
                        Data Criação
                        {getSortIcon("data_criacao")}
                      </Button>
                    </TableHead>
                    <TableHead className="text-white">
                      <Button
                        variant="ghost"
                        // onClick={() => handleSort("data_criacao")}
                        className="h-auto p-0 font-semibold text-white hover:bg-blue-600"
                      >
                        Anuncio
                        {/* {getSortIcon("data_criacao")} */}
                      </Button>
                    </TableHead>
                    <TableHead className="text-white">
                      <Button
                        variant="ghost"
                        // onClick={() => handleSort("data_criacao")}
                        className="h-auto p-0 font-semibold text-white hover:bg-blue-600"
                      >
                        Campanha
                        {/* {getSortIcon("data_criacao")} */}
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {sortedLeads.map((lead, index) => (
                    <TableRow
                      key={lead.id}
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-blue-50/30"
                      }`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedLeads.has(lead.id)}
                          onCheckedChange={() => handleSelectLead(lead.id)}
                          aria-label={`Selecionar ${lead.nome}`}
                        />
                      </TableCell>
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
                            <DropdownMenuItem
                              onClick={() => handleAction("view", lead)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAction("edit", lead)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleAction("update_status", lead)
                              }
                              className="cursor-pointer"
                            >
                              <Target className="mr-2 h-4 w-4" />
                              Atualizar Status
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAction("atividades", lead)}
                              className="cursor-pointer"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Ver Atividades
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleAction("convert_to_client", lead)
                              }
                              className="cursor-pointer"
                              disabled={lead.vendedor !== null}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Converter em Cliente
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
                            className="border-blue-300 text-blue-700 bg-blue-50 font-medium"
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
                          className="border-green-300 text-green-700 bg-green-50 font-medium"
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
                      <TableCell>
                        <span className="text-sm font-mono">
                          {lead.conjunto_anuncio
                            ? lead.conjunto_anuncio
                            : "Não atribuído"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">
                          {lead.campanha ? lead.campanha : "Não atribuído"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-6 border-t border-blue-100">
            <div className="text-sm text-blue-600 font-medium">
              Página {currentPage} de {totalPages} - Total: {total} leads
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
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
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
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
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
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

      {/* Modal de Ações em Lote */}
      <Dialog
        open={isBatchActionModalOpen}
        onOpenChange={handleCloseBatchModal}
      >
        <DialogContent className="max-w-md border-0 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg -m-6 mb-6 p-6">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              {batchAction === "vincular_consultor" && "Vincular Consultor"}
              {batchAction === "vincular_vendedor" && "Vincular Vendedor"}
            </DialogTitle>
            <p className="text-blue-100 text-sm mt-2">
              {batchAction === "vincular_consultor" &&
                "Vincular consultor aos leads selecionados"}
              {batchAction === "vincular_vendedor" &&
                "Vincular vendedor aos leads selecionados"}
            </p>
          </DialogHeader>

          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                {batchAction === "vincular_consultor" &&
                  `Vincular consultor a ${selectedLeads.size} lead(s) selecionado(s)`}
                {batchAction === "vincular_vendedor" &&
                  `Vincular vendedor a ${selectedLeads.size} lead(s) selecionado(s)`}
              </p>
            </div>

            {batchAction === "vincular_consultor" && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-blue-800">
                  Selecionar Consultor
                </label>
                <Select
                  value={selectedConsultor?.toString() || ""}
                  onValueChange={(value) =>
                    setSelectedConsultor(parseInt(value))
                  }
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Escolha um consultor" />
                  </SelectTrigger>
                  <SelectContent>
                    {dropdownsLoading ? (
                      <SelectItem value="" disabled>
                        Carregando consultores...
                      </SelectItem>
                    ) : (
                      consultores.map((consultor) => (
                        <SelectItem
                          key={consultor.codigo}
                          value={consultor.codigo.toString()}
                        >
                          {consultor.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {batchAction === "vincular_vendedor" && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-blue-800">
                  Selecionar Vendedor
                </label>
                <Select
                  value={selectedVendedor?.toString() || ""}
                  onValueChange={(value) =>
                    setSelectedVendedor(parseInt(value))
                  }
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Escolha um vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {dropdownsLoading ? (
                      <SelectItem value="" disabled>
                        Carregando vendedores...
                      </SelectItem>
                    ) : (
                      vendedores.map((vendedor) => (
                        <SelectItem
                          key={vendedor.codigo}
                          value={vendedor.codigo.toString()}
                        >
                          {vendedor.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-blue-100">
              <Button
                variant="outline"
                onClick={handleCloseBatchModal}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleExecuteBatchAction}
                disabled={
                  dropdownsLoading ||
                  (batchAction === "vincular_consultor" &&
                    !selectedConsultor) ||
                  (batchAction === "vincular_vendedor" && !selectedVendedor)
                }
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Criação de Lead */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateLead}
        loading={isCreatingLead}
      />

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
