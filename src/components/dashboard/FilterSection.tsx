import React, { useState, useEffect, useCallback } from "react";
import { Filter, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { useDropdowns } from "@/hooks/use-dropdowns";
import { httpClient } from "@/services/httpClient";
import type { DateRange as DayPickerDateRange } from "react-day-picker";

// Using DayPicker's DateRange type for compatibility with DatePicker component

interface FilterProps {
  onFiltersChange: (filters: any) => void;
  currentFilters?: any;
}

const getDefaultDateRange = (): DayPickerDateRange => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 3);
  return { from: start, to: end };
};

export const FilterSection: React.FC<FilterProps> = ({
  onFiltersChange,
  currentFilters,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [creationDateRange, setCreationDateRange] = useState<
    DayPickerDateRange | undefined
  >(getDefaultDateRange());
  const [nextAgendaDateRange, setNextAgendaDateRange] = useState<
    DayPickerDateRange | undefined
  >(undefined);
  const [creationHourRange, setCreationHourRange] = useState<
    { from?: string; to?: string } | undefined
  >(undefined);
  const [selectedSituacoes, setSelectedSituacoes] = useState<string[]>([]);
  const [selectedEtapas, setSelectedEtapas] = useState<string[]>([]);
  const [selectedConsultores, setSelectedConsultores] = useState<string[]>([]);
  const [selectedVendedores, setSelectedVendedores] = useState<string[]>([]);
  const [selectedUFs, setSelectedUFs] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    origem: "",
    tipoProcura: "",
    nome: "",
    email: "",
    telefone: "",
    apenasSemConsultor: false,
  });

  // Buscar dados dos dropdowns
  const {
    etapas,
    situacoes,
    consultores,
    vendedores,
    loading: dropdownsLoading,
    error: dropdownsError,
  } = useDropdowns();

  // Estados para dropdowns de origem e tipo de procura
  const [origens, setOrigens] = useState<{ origem: string; total: number }[]>(
    []
  );
  const [tiposProcura, setTiposProcura] = useState<
    { tipo_procura: string; total: number }[]
  >([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const ufs = ["SP", "RJ", "MG", "RS", "PR", "SC", "BA", "GO", "PE", "CE"];

  // Buscar dados dos dropdowns de origem e tipo de procura
  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoadingDropdowns(true);
      try {
        const [origensData, tiposProcuraData] = await Promise.all([
          httpClient.getDropdownOrigem(),
          httpClient.getDropdownTipoProcura(),
        ]);
        setOrigens(origensData);
        setTiposProcura(tiposProcuraData);
      } catch (error) {
      } finally {
        setLoadingDropdowns(false);
      }
    };

    fetchDropdowns();
  }, []);

  const handleMultiSelectChange = (
    value: string,
    currentSelected: string[],
    setter: (value: string[]) => void,
    maxLimit: number = 3
  ) => {
    if (currentSelected.includes(value)) {
      setter(currentSelected.filter((item) => item !== value));
    } else if (currentSelected.length < maxLimit) {
      setter([...currentSelected, value]);
    }
  };

  const applyFilters = useCallback(() => {
    const allFilters = {
      creationDateRange,
      creationHourRange,
      nextAgendaDateRange,
      situacoes: selectedSituacoes,
      etapas: selectedEtapas,
      consultores: selectedConsultores,
      vendedores: selectedVendedores,
      ufs: selectedUFs,
      ...filters,
    };
    onFiltersChange(allFilters);
  }, [
    creationDateRange,
    creationHourRange,
    nextAgendaDateRange,
    selectedSituacoes,
    selectedEtapas,
    selectedConsultores,
    selectedVendedores,
    selectedUFs,
    filters,
    onFiltersChange,
  ]);

  // Sincronizar com os filtros atuais do componente pai apenas na inicialização
  // Sincronizar filtros APENAS na montagem
  useEffect(() => {
    if (!currentFilters) return;

    if (currentFilters.creationDateRange) {
      setCreationDateRange(currentFilters.creationDateRange);
    }
    if (currentFilters.creationHourRange) {
      setCreationHourRange(currentFilters.creationHourRange);
    }
    if (currentFilters.nextAgendaDateRange) {
      setNextAgendaDateRange(currentFilters.nextAgendaDateRange);
    }
    setSelectedSituacoes(currentFilters.situacoes ?? []);
    setSelectedEtapas(currentFilters.etapas ?? []);
    setSelectedConsultores(currentFilters.consultores ?? []);
    setSelectedVendedores(currentFilters.vendedores ?? []);
    setSelectedUFs(currentFilters.ufs ?? []);

    setFilters({
      origem: currentFilters.origem || "",
      tipoProcura: currentFilters.tipoProcura || "",
      nome: currentFilters.nome || "",
      email: currentFilters.email || "",
      telefone: currentFilters.telefone || "",
      apenasSemConsultor: currentFilters.apenasSemConsultor || false,
    });
    // DICA: se precisar refletir filtros externos novamente, remova []
  }, []);

  // Aplicar filtros iniciais automaticamente
  // useEffect(() => {
  //   applyFilters();
  // }, []); // Executar apenas uma vez na montagem

  const MultiSelect = ({
    options,
    selected,
    onChange,
    placeholder,
    maxLimit = 3,
  }: {
    options: string[] | { label: string; value: string }[];
    selected: string[];
    onChange: (value: string) => void;
    placeholder: string;
    maxLimit?: number;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Fechar dropdown quando clicar fora
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchTerm(""); // Limpar busca quando fechar
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Função para obter o label de uma opção
    const getOptionLabel = (
      option: string | { label: string; value: string }
    ) => {
      if (typeof option === "string") return option;
      return option.label;
    };

    // Função para obter o valor de uma opção
    const getOptionValue = (
      option: string | { label: string; value: string }
    ) => {
      if (typeof option === "string") return option;
      return option.value;
    };

    // Função para obter o label de um valor selecionado
    const getSelectedLabel = (value: string) => {
      const option = options.find((opt) => getOptionValue(opt) === value);
      return option ? getOptionLabel(option) : value;
    };

    // Filtrar opções baseado no termo de busca
    const filteredOptions = options.filter((option) => {
      const label = getOptionLabel(option).toLowerCase();
      const search = searchTerm.toLowerCase();
      return label.includes(search);
    });

    return (
      <div className="relative" ref={dropdownRef}>
        <div
          className="min-h-[40px] border border-blue-200 rounded-md px-3 py-2 bg-white cursor-pointer hover:border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selected && selected.length > 0 ? (
            <div className="flex flex-wrap gap-1 max-w-full">
              {selected.slice(0, 2).map((item) => (
                <span
                  key={item}
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1"
                >
                  {getSelectedLabel(item)}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-blue-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(item);
                    }}
                  />
                </span>
              ))}
              {selected.length > 2 && (
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-medium">
                  +{selected.length - 2} mais
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-blue-200 rounded-md shadow-lg">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {selected.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      selected.forEach((item) => onChange(item));
                    }}
                    className="ml-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Limpar
                  </Button>
                )}
              </div>

              <div className="max-h-[200px] overflow-y-auto space-y-1">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => {
                    const value = getOptionValue(option);
                    const label = getOptionLabel(option);
                    return (
                      <div
                        key={value}
                        className={cn(
                          "flex items-center space-x-3 p-2 hover:bg-blue-50 cursor-pointer rounded-lg transition-colors",
                          selected.includes(value) &&
                            "bg-blue-100 border border-blue-200"
                        )}
                        onClick={() => onChange(value)}
                      >
                        <Checkbox
                          checked={selected.includes(value)}
                          className="text-blue-600 border-blue-300"
                        />
                        <span
                          className={cn(
                            "text-sm flex-1",
                            selected.includes(value)
                              ? "text-blue-700 font-medium"
                              : "text-gray-700"
                          )}
                        >
                          {label}
                        </span>
                        {selected.includes(value) && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    {searchTerm
                      ? "Nenhum resultado encontrado"
                      : "Nenhuma opção disponível"}
                  </div>
                )}
              </div>

              {selected.length >= maxLimit && (
                <div className="text-xs text-orange-600 p-2 border-t border-gray-200 mt-2 bg-orange-50 rounded">
                  ⚠️ Máximo de {maxLimit} seleções permitidas
                </div>
              )}

              {selected.length > 0 && (
                <div className="text-xs text-gray-500 p-2 border-t border-gray-200 mt-2">
                  {selected.length} item(s) selecionado(s)
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-6 mb-6 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
      <div className="space-y-6">
        {/* Filtros principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label className="text-blue-800 font-medium">
              Período de Criação
            </Label>
            <DatePicker
              value={creationDateRange}
              onChange={(range) => {
                setCreationDateRange(range);
              }}
              placeholder="Selecionar período"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-blue-800 font-medium">Situação</Label>
            {dropdownsLoading ? (
              <div className="flex items-center justify-center h-10 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Carregando...
                </span>
              </div>
            ) : dropdownsError ? (
              <div className="h-10 border rounded-md flex items-center justify-center">
                <span className="text-sm text-red-500">Erro ao carregar</span>
              </div>
            ) : (
              <MultiSelect
                options={situacoes.map((s) => ({
                  label: s.descricao,
                  value: s.descricao,
                }))}
                selected={selectedSituacoes}
                onChange={(value) =>
                  handleMultiSelectChange(
                    value,
                    selectedSituacoes,
                    setSelectedSituacoes
                  )
                }
                placeholder="Selecionar situações"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-blue-800 font-medium">Origem</Label>
            {loadingDropdowns ? (
              <div className="flex items-center justify-center h-10 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Carregando...
                </span>
              </div>
            ) : (
              <Select
                value={filters.origem}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, origem: value }))
                }
              >
                <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Selecionar origem" />
                </SelectTrigger>
                <SelectContent>
                  {origens.map((origem) => (
                    <SelectItem key={origem.origem} value={origem.origem}>
                      {origem.origem} ({origem.total})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-blue-800 font-medium">Hora de Criação</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="time"
                value={creationHourRange?.from || ""}
                onChange={(e) =>
                  setCreationHourRange((prev) => ({
                    ...prev,
                    from: e.target.value,
                  }))
                }
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <Input
                type="time"
                value={creationHourRange?.to || ""}
                onChange={(e) =>
                  setCreationHourRange((prev) => ({
                    ...prev,
                    to: e.target.value,
                  }))
                }
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-blue-800 font-medium">Etapas</Label>
            {dropdownsLoading ? (
              <div className="flex items-center justify-center h-10 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Carregando...
                </span>
              </div>
            ) : dropdownsError ? (
              <div className="h-10 border rounded-md flex items-center justify-center">
                <span className="text-sm text-red-500">Erro ao carregar</span>
              </div>
            ) : (
              <MultiSelect
                options={etapas.map((e) => ({
                  label: e.descricao,
                  value: e.descricao,
                }))}
                selected={selectedEtapas}
                onChange={(value) =>
                  handleMultiSelectChange(
                    value,
                    selectedEtapas,
                    setSelectedEtapas
                  )
                }
                placeholder="Selecionar etapas"
              />
            )}
          </div>
        </div>

        {/* Botão para mostrar filtros avançados */}
        <div className="flex justify-between items-center pt-6 border-t border-blue-200">
          <Button
            variant="ghost"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-blue-700 hover:text-blue-800 hover:bg-blue-50"
          >
            <Filter className="mr-2 h-4 w-4" />
            {showAdvancedFilters ? "Ocultar filtros" : "Mostrar mais filtros"}
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={applyFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Aplicar Filtros
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const emptyFilters = {
                  creationDateRange: {}, // Enviar None (sem datas)
                  creationHourRange: {},
                  nextAgendaDateRange: {},
                  situacoes: [],
                  etapas: [],
                  consultores: [],
                  vendedores: [],
                  ufs: [],
                  origem: "",
                  tipoProcura: "",
                  nome: "",
                  email: "",
                  telefone: "",
                  apenasSemConsultor: false,
                };

                // Limpar estado local
                setCreationDateRange(undefined); // Enviar None (sem datas)
                setCreationHourRange(undefined);
                setNextAgendaDateRange(undefined);
                setSelectedSituacoes([]);
                setSelectedEtapas([]);
                setSelectedConsultores([]);
                setSelectedVendedores([]);
                setSelectedUFs([]);
                setFilters({
                  origem: "",
                  tipoProcura: "",
                  nome: "",
                  email: "",
                  telefone: "",
                  apenasSemConsultor: false,
                });

                // Aplicar filtros limpos imediatamente
                onFiltersChange(emptyFilters);
              }}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>

        {/* Filtros avançados */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 border-t border-blue-200">
            <div className="space-y-2">
              <Label className="text-blue-800 font-medium">
                Tipo de Procura
              </Label>
              {loadingDropdowns ? (
                <div className="flex items-center justify-center h-10 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Carregando...
                  </span>
                </div>
              ) : (
                <Select
                  value={filters.tipoProcura}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, tipoProcura: value }))
                  }
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposProcura.map((tipo) => (
                      <SelectItem
                        key={tipo.tipo_procura}
                        value={tipo.tipo_procura}
                      >
                        {tipo.tipo_procura} ({tipo.total})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-blue-800 font-medium">Nome</Label>
              <Input
                placeholder="Buscar por nome"
                value={filters.nome}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, nome: e.target.value }))
                }
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-blue-800 font-medium">Email</Label>
              <Input
                placeholder="Buscar por email"
                value={filters.email}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, email: e.target.value }))
                }
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-blue-800 font-medium">Telefone</Label>
              <Input
                placeholder="Buscar por telefone"
                value={filters.telefone}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, telefone: e.target.value }))
                }
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-blue-800 font-medium">
                Período da Próxima Agenda
              </Label>
              <DatePicker
                value={nextAgendaDateRange}
                onChange={(range) => {
                  setNextAgendaDateRange(range);
                }}
                placeholder="Selecionar período"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-blue-800 font-medium">Consultor</Label>
              {dropdownsLoading ? (
                <div className="flex items-center justify-center h-10 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Carregando...
                  </span>
                </div>
              ) : dropdownsError ? (
                <div className="h-10 border rounded-md flex items-center justify-center">
                  <span className="text-sm text-red-500">Erro ao carregar</span>
                </div>
              ) : (
                <MultiSelect
                  options={consultores.map((c) => ({
                    label: c.nome,
                    value: c.codigo.toString(),
                  }))}
                  selected={selectedConsultores}
                  onChange={(value) =>
                    handleMultiSelectChange(
                      value,
                      selectedConsultores,
                      setSelectedConsultores
                    )
                  }
                  placeholder="Selecionar consultores"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-blue-800 font-medium">Vendedor</Label>
              {dropdownsLoading ? (
                <div className="flex items-center justify-center h-10 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Carregando...
                  </span>
                </div>
              ) : dropdownsError ? (
                <div className="h-10 border rounded-md flex items-center justify-center">
                  <span className="text-sm text-red-500">Erro ao carregar</span>
                </div>
              ) : (
                <MultiSelect
                  options={vendedores.map((v) => ({
                    label: v.nome,
                    value: v.codigo.toString(),
                  }))}
                  selected={selectedVendedores}
                  onChange={(value) =>
                    handleMultiSelectChange(
                      value,
                      selectedVendedores,
                      setSelectedVendedores
                    )
                  }
                  placeholder="Selecionar vendedores"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-blue-800 font-medium">UF</Label>
              <MultiSelect
                options={ufs.map((uf) => ({ label: uf, value: uf }))}
                selected={selectedUFs}
                onChange={(value) =>
                  handleMultiSelectChange(value, selectedUFs, setSelectedUFs)
                }
                placeholder="Selecionar UFs"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="apenasSemConsultor"
                checked={filters.apenasSemConsultor}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    apenasSemConsultor: !!checked,
                  }))
                }
                className="text-blue-600 border-blue-300"
              />
              <Label
                htmlFor="apenasSemConsultor"
                className="text-blue-800 font-medium"
              >
                Apenas sem Consultor
              </Label>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
