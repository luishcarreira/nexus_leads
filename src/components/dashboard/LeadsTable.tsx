import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  Edit,
  Share2,
  MoreHorizontal,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckSquare,
  Square,
  Plus,
  Target,
  FileText,
  UserCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ILead } from "@/services/interfaces/ILead";
import { LeadDetailsModal } from "./LeadDetailsModal";
import { CreateLeadModal, CreateLeadData } from "./CreateLeadModal";
import { UpdateLeadStatusModal } from "./UpdateLeadStatusModal";
import { LeadAtividadesModal } from "./LeadAtividadesModal";
import { ConvertLeadToClientModal } from "./ConvertLeadToClientModal";
import { httpClient } from "@/services/httpClient";
import { useDropdowns } from "@/hooks/use-dropdowns";

interface LeadsTableProps {
  leads: ILead[];
  loading?: boolean;
}

type SortDirection = "asc" | "desc" | null;

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
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

  // Buscar dados dos dropdowns
  const {
    consultores,
    etapas,
    situacoes,
    loading: dropdownsLoading,
  } = useDropdowns();

  // Lista de vendedores (pode vir da API no futuro)
  const vendedores = [
    { id: 1, nome: "Pedro Souza" },
    { id: 2, nome: "Juliana Alves" },
    { id: 3, nome: "Ricardo Martins" },
    { id: 4, nome: "Fernanda Cruz" },
    { id: 5, nome: "Lucas Pereira" },
    { id: 6, nome: "Camila Santos" },
    { id: 7, nome: "Diego Pereira" },
    { id: 8, nome: "Beatriz Costa" },
  ];

  // Filtrar leads baseado no termo de busca
  const filteredLeads = leads.filter((lead) =>
    Object.values(lead).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Ordenar leads
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;

    const aValue = a[sortColumn]?.toString() || "";
    const bValue = b[sortColumn]?.toString() || "";

    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  // Paginação
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = sortedLeads.slice(startIndex, endIndex);

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
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const handleAction = (action: string, lead: ILead) => {
    switch (action) {
      case "view":
        setSelectedLead(lead);
        setIsModalOpen(true);
        break;
      case "edit":
        console.log(`Editar lead ${lead.id}`);
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
      case "transfer":
        console.log(`Transferir lead ${lead.id}`);
        // Implementar transferência
        break;
      default:
        console.log(`Ação ${action} para o lead ${lead.id}`);
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
    if (selectedLeads.size === currentLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(currentLeads.map((lead) => lead.id)));
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
            console.log(
              `Consultor ${selectedConsultor} vinculado aos leads:`,
              Array.from(selectedLeads)
            );
          }
          break;
        case "vincular_vendedor":
          if (selectedVendedor) {
            console.log(
              `Vincular vendedor ${selectedVendedor} aos leads:`,
              Array.from(selectedLeads)
            );
            // TODO: Implementar endpoint para vincular vendedor
          }
          break;
        default:
          console.log(
            `Ação em lote ${batchAction} para leads:`,
            Array.from(selectedLeads)
          );
      }

      setSelectedLeads(new Set());
      setBatchAction("");
      setSelectedConsultor(null);
      setSelectedVendedor(null);
      setIsBatchActionModalOpen(false);
    } catch (error) {
      console.error("Erro ao executar ação em lote:", error);
      // Aqui você pode adicionar um toast de erro
    }
  };

  const handleCloseBatchModal = () => {
    setIsBatchActionModalOpen(false);
    setBatchAction("");
    setSelectedConsultor(null);
    setSelectedVendedor(null);
  };

  const handleCreateLead = async (leadData: CreateLeadData) => {
    setIsCreatingLead(true);
    try {
      console.log("Criando novo lead:", leadData);
      // Implementar API call para criar lead
      // Exemplo: await createLead(leadData);

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fechar modal e limpar estado
      setIsCreateModalOpen(false);
      setIsCreatingLead(false);

      // Aqui você pode adicionar um toast de sucesso
      console.log("Lead criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar lead:", error);
      setIsCreatingLead(false);
      // Aqui você pode adicionar um toast de erro
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

      console.log(
        `Lead ${selectedLeadForUpdate.id} atualizado - Etapa: ${idEtapa}, Situação: ${idSituacao}`
      );

      // Fechar modal e limpar estado
      setIsUpdateStatusModalOpen(false);
      setSelectedLeadForUpdate(null);
      setIsUpdatingStatus(false);

      // Aqui você pode adicionar um toast de sucesso
      // Aqui você pode recarregar a lista de leads
    } catch (error) {
      console.error("Erro ao atualizar status do lead:", error);
      setIsUpdatingStatus(false);
      // Aqui você pode adicionar um toast de erro
    }
  };

  const handleConvertToClient = async (clientData: any) => {
    if (!selectedLeadForConversion) return;

    setIsConvertingToClient(true);
    try {
      console.log("Convertendo lead em cliente:", {
        leadId: selectedLeadForConversion.id,
        clientData,
      });

      // TODO: Implementar API call para converter lead em cliente
      // Exemplo: await httpClient.converterLeadEmCliente(selectedLeadForConversion.id, clientData);

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(
        `Lead ${selectedLeadForConversion.id} convertido em cliente com sucesso!`
      );

      // Fechar modal e limpar estado
      setIsConvertToClientModalOpen(false);
      setSelectedLeadForConversion(null);
      setIsConvertingToClient(false);

      // Aqui você pode adicionar um toast de sucesso
      // Aqui você pode recarregar a lista de leads
    } catch (error) {
      console.error("Erro ao converter lead em cliente:", error);
      setIsConvertingToClient(false);
      // Aqui você pode adicionar um toast de erro
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
              {filteredLeads.length} leads encontrados
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
                  <DropdownMenuItem
                    onClick={() => handleBatchAction("vincular_vendedor")}
                    className="cursor-pointer"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Vincular Vendedor
                  </DropdownMenuItem>
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
                className="pl-8 w-64 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-lg border border-blue-200 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <TableHead className="w-12 text-white">
                  <Checkbox
                    checked={
                      selectedLeads.size === currentLeads.length &&
                      currentLeads.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Selecionar todos"
                    className="text-white border-white"
                  />
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
                    onClick={() => handleSort("data_criacao")}
                    className="h-auto p-0 font-semibold text-white hover:bg-blue-600"
                  >
                    Data Criação
                    {getSortIcon("data_criacao")}
                  </Button>
                </TableHead>
                <TableHead className="text-white font-semibold">UF</TableHead>
                <TableHead className="text-white font-semibold">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLeads.map((lead, index) => (
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
                  <TableCell className="font-medium">{lead.nome}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.telefone}</TableCell>
                  <TableCell>{lead.origem}</TableCell>
                  <TableCell>{getSituacaoBadge(lead.situacao)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-blue-300 text-blue-700 bg-blue-50 font-medium"
                    >
                      {lead.procura_para}
                    </Badge>
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
                  <TableCell>{formatDate(lead.data_criacao)}</TableCell>
                  <TableCell>
                    <span className="text-sm">{lead.uf}</span>
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
                          <FileText className="mr-2 h-4 w-4" />
                          Ver Atividades
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleAction("convert_to_client", lead)
                          }
                          className="cursor-pointer"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Converter em Cliente
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAction("transfer", lead)}
                          className="cursor-pointer"
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Transferir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-6 border-t border-blue-100">
            <div className="text-sm text-blue-600 font-medium">
              Mostrando {startIndex + 1} a{" "}
              {Math.min(endIndex, filteredLeads.length)} de{" "}
              {filteredLeads.length} leads
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                      onClick={() => setCurrentPage(page)}
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
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
                    {vendedores.map((vendedor) => (
                      <SelectItem
                        key={vendedor.id}
                        value={vendedor.id.toString()}
                      >
                        {vendedor.nome}
                      </SelectItem>
                    ))}
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
