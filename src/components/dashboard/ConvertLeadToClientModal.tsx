import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ILead } from "@/services/interfaces/ILead";
import { useDropdowns } from "@/hooks/use-dropdowns";
import {
  User,
  Building2,
  Loader2,
  MapPin,
  Search,
  X,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { httpClient } from "@/services/httpClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConvertLeadToClientData {
  tipo: "fisica" | "juridica";
  documento: string; // CPF ou CNPJ
  uf: string;
  ddd: string;
  telefone: string;
  email: string;
  instagram: string;
  facebook: string;
  id_ramo_atividade: string;
  id_vendedor: number;
  id_cidade?: string;
}

interface ConvertLeadToClientModalProps {
  lead: ILead | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ConvertLeadToClientData) => Promise<void>;
  loading?: boolean;
}

export const ConvertLeadToClientModal: React.FC<
  ConvertLeadToClientModalProps
> = ({ lead, isOpen, onClose, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<ConvertLeadToClientData>({
    tipo: "fisica",
    documento: "",
    uf: "",
    ddd: "",
    telefone: "",
    email: "",
    instagram: "",
    facebook: "",
    id_ramo_atividade: "",
    id_vendedor: 0,
    id_cidade: undefined,
  });

  // Estado do seletor de cidade
  const [isCidadeModalOpen, setIsCidadeModalOpen] = useState(false);
  const [cidadeSearch, setCidadeSearch] = useState("");
  const [cidades, setCidades] = useState<{ id: string; descricao: string }[]>(
    []
  );
  const [cidadeTotal, setCidadeTotal] = useState(0);
  const [cidadePage, setCidadePage] = useState(1);
  const [cidadePageSize, setCidadePageSize] = useState(25);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [selectedCidadeDescricao, setSelectedCidadeDescricao] =
    useState<string>("");
  const [isVendedorOpen, setIsVendedorOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchCidades = async (page = 1) => {
    setLoadingCidades(true);
    try {
      const res = await httpClient.getDropdownCidade({
        pagina: page,
        limite: cidadePageSize,
        order_by: "CIDNOM",
        order_header: "ASC",
        nome: cidadeSearch || undefined,
      });
      setCidades(res.data);
      setCidadeTotal(res.total);
      setCidadePage(page);
    } finally {
      setLoadingCidades(false);
    }
  };

  // Buscar cidades automaticamente enquanto digita (debounced)
  useEffect(() => {
    if (!isCidadeModalOpen) return;
    const timeoutId = setTimeout(() => {
      // Reinicia na página 1 sempre que o termo mudar
      fetchCidades(1);
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [cidadeSearch, isCidadeModalOpen, cidadePageSize]);

  const {
    vendedores,
    ramosAtividade,
    loading: dropdownsLoading,
  } = useDropdowns();

  // Prefill form with lead data when modal opens
  useEffect(() => {
    if (lead && isOpen) {
      const phoneDigits = (lead.telefone || "").replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        uf: prev.uf || lead.uf || "",
        ddd: prev.ddd || phoneDigits.slice(0, 2),
        telefone:
          prev.telefone || (phoneDigits ? formatPhone(phoneDigits) : ""),
        email: prev.email || lead.email || "",
      }));
      // Carregar cidades na abertura do modal (primeira página)
      fetchCidades(1);
    }
  }, [lead, isOpen]);

  // Lista de UFs brasileiras
  const ufs = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  const handleInputChange = (
    field: keyof ConvertLeadToClientData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id_vendedor === 0 || !formData.id_ramo_atividade) {
      alert("Por favor, selecione vendedor e ramo de atividade");
      return;
    }
    await onSubmit(formData);
  };

  const handleConfirmSubmit = async () => {
    if (formData.id_vendedor === 0 || !formData.id_ramo_atividade) {
      alert("Por favor, selecione vendedor e ramo de atividade");
      return;
    }
    setIsConfirmOpen(false);
    await onSubmit(formData);
  };

  const formatDocument = (value: string, tipo: "fisica" | "juridica") => {
    if (tipo === "fisica") {
      // Formatar CPF: 000.000.000-00
      const numbers = value.replace(/\D/g, "");
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      // Formatar CNPJ: 00.000.000/0000-00
      const numbers = value.replace(/\D/g, "");
      return numbers.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg -m-6 mb-6 p-6">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="p-2 bg-white/20 rounded-lg">
                <User className="h-6 w-6" />
              </div>
              Converter Lead em Cliente
            </DialogTitle>
            <p className="text-blue-100 text-sm mt-2">
              Preencha os dados para converter este lead em um cliente
            </p>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Tipo de Pessoa */}
            <div className="space-y-3 md:col-span-2">
              <Label className="text-sm font-semibold text-blue-800">
                Tipo de Pessoa *
              </Label>
              <RadioGroup
                value={formData.tipo}
                onValueChange={(value: "fisica" | "juridica") =>
                  handleInputChange("tipo", value)
                }
                className="flex gap-6"
              >
                <div className="flex items-center space-x-3 p-3 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-colors">
                  <RadioGroupItem
                    value="fisica"
                    id="fisica"
                    className="text-blue-600"
                  />
                  <Label
                    htmlFor="fisica"
                    className="flex items-center gap-2 cursor-pointer text-blue-700 font-medium"
                  >
                    <User className="h-4 w-4" />
                    Pessoa Física
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-colors">
                  <RadioGroupItem
                    value="juridica"
                    id="juridica"
                    className="text-blue-600"
                  />
                  <Label
                    htmlFor="juridica"
                    className="flex items-center gap-2 cursor-pointer text-blue-700 font-medium"
                  >
                    <Building2 className="h-4 w-4" />
                    Pessoa Jurídica
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* CPF/CNPJ */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-blue-800">
                {formData.tipo === "fisica" ? "CPF" : "CNPJ"}
              </Label>
              <Input
                placeholder={
                  formData.tipo === "fisica"
                    ? "000.000.000-00"
                    : "00.000.000/0000-00"
                }
                value={formData.documento}
                onChange={(e) => {
                  const formatted = formatDocument(
                    e.target.value,
                    formData.tipo
                  );
                  handleInputChange("documento", formatted);
                }}
                maxLength={formData.tipo === "fisica" ? 14 : 18}
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* UF */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-blue-800">
                UF *
              </Label>
              <Select
                value={formData.uf}
                onValueChange={(value) => handleInputChange("uf", value)}
              >
                <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Selecione a UF" />
                </SelectTrigger>
                <SelectContent>
                  {ufs.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* DDD e Telefone */}
            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-blue-800">
                  DDD *
                </Label>
                <Input
                  placeholder="11"
                  value={formData.ddd}
                  onChange={(e) => {
                    const numbers = e.target.value.replace(/\D/g, "");
                    handleInputChange("ddd", numbers.slice(0, 2));
                  }}
                  maxLength={2}
                  required
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-blue-800">
                  Telefone *
                </Label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    handleInputChange("telefone", formatted);
                  }}
                  maxLength={15}
                  required
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-blue-800">
                Email *
              </Label>
              <Input
                type="email"
                placeholder="cliente@exemplo.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Cidade (busca no modal) */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-blue-800">
                Cidade
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder={selectedCidadeDescricao || "Selecionar cidade"}
                  value={selectedCidadeDescricao}
                  readOnly
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCidadeModalOpen(true)}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Selecionar
                </Button>
                {formData.id_cidade && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      handleInputChange("id_cidade", undefined as any);
                      setSelectedCidadeDescricao("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-blue-800">
                  Instagram
                </Label>
                <Input
                  placeholder="@usuario"
                  value={formData.instagram}
                  onChange={(e) =>
                    handleInputChange("instagram", e.target.value)
                  }
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-blue-800">
                  Facebook
                </Label>
                <Input
                  placeholder="facebook.com/usuario"
                  value={formData.facebook}
                  onChange={(e) =>
                    handleInputChange("facebook", e.target.value)
                  }
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Ramo de Atividade */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-blue-800">
                Ramo de Atividade *
              </Label>
              <Select
                defaultValue={
                  ramosAtividade.find((ramo) => ramo.codigo === "01")?.codigo
                }
                value={formData.id_ramo_atividade}
                onValueChange={(value) =>
                  handleInputChange("id_ramo_atividade", value)
                }
              >
                <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Selecione o ramo de atividade" />
                </SelectTrigger>
                <SelectContent>
                  {ramosAtividade.map((ramo) => (
                    <SelectItem key={ramo.codigo} value={ramo.codigo}>
                      {ramo.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vendedor (Combobox pesquisável) */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-blue-800">
                Vendedor *
              </Label>
              <Popover open={isVendedorOpen} onOpenChange={setIsVendedorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isVendedorOpen}
                    className="w-full justify-between border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  >
                    {formData.id_vendedor
                      ? vendedores.find(
                          (v) => v.codigo === formData.id_vendedor
                        )?.nome
                      : "Selecione um vendedor"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                  <Command>
                    <CommandInput placeholder="Buscar vendedor..." />
                    <CommandEmpty>Nenhum vendedor encontrado.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {dropdownsLoading ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            Carregando vendedores...
                          </div>
                        ) : (
                          vendedores.map((vendedor) => (
                            <CommandItem
                              key={vendedor.codigo}
                              value={`${vendedor.codigo} ${vendedor.nome}`}
                              onSelect={(value) => {
                                const id = parseInt(value.split(" ")[0], 10);
                                handleInputChange("id_vendedor", id);
                                setIsVendedorOpen(false);
                              }}
                            >
                              <Check
                                className={
                                  "mr-2 h-4 w-4 " +
                                  (formData.id_vendedor === vendedor.codigo
                                    ? "opacity-100"
                                    : "opacity-0")
                                }
                              />
                              <span>{vendedor.nome}</span>
                            </CommandItem>
                          ))
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-6 border-t border-blue-100 md:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                disabled={loading || dropdownsLoading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Convertendo...
                  </>
                ) : (
                  "Converter em Cliente"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmação antes de converter */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar conversão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja converter este lead em cliente? Esta ação
              poderá atualizar os dados do lead e atribuir o vendedor
              selecionado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit} disabled={loading}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Seleção de Cidade */}
      <Dialog open={isCidadeModalOpen} onOpenChange={setIsCidadeModalOpen}>
        <DialogContent className="max-w-2xl border-0 shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg -m-6 mb-6 p-6">
            <DialogTitle className="text-lg font-semibold">
              Selecionar Cidade
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-blue-600" />
            <Input
              placeholder="Buscar cidade (a busca é por paginação do backend)"
              value={cidadeSearch}
              onChange={(e) => setCidadeSearch(e.target.value)}
              className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              variant="default"
              onClick={() => fetchCidades(1)}
              disabled={loadingCidades}
            >
              {loadingCidades ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Buscar"
              )}
            </Button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto rounded border border-blue-100">
            {cidades.length === 0 && !loadingCidades ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhuma cidade encontrada
              </div>
            ) : (
              <ul>
                {cidades
                  .filter((c) =>
                    c.descricao
                      .toLowerCase()
                      .includes(cidadeSearch.toLowerCase())
                  )
                  .map((c) => (
                    <li
                      key={c.id}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        handleInputChange("id_cidade", c.id);
                        setSelectedCidadeDescricao(c.descricao);
                        setIsCidadeModalOpen(false);
                      }}
                    >
                      <span className="text-sm text-blue-900">
                        {c.descricao}
                      </span>
                      <span className="text-xs text-blue-600">ID: {c.id}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-blue-700">
              Página {cidadePage} de{" "}
              {Math.max(1, Math.ceil(cidadeTotal / cidadePageSize))}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => cidadePage > 1 && fetchCidades(cidadePage - 1)}
                disabled={cidadePage <= 1 || loadingCidades}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  cidadePage < Math.ceil(cidadeTotal / cidadePageSize) &&
                  fetchCidades(cidadePage + 1)
                }
                disabled={
                  cidadePage >= Math.ceil(cidadeTotal / cidadePageSize) ||
                  loadingCidades
                }
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
              >
                Próxima
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
