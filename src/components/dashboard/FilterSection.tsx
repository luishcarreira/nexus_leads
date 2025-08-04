import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Filter, Search, X, Loader2 } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useDropdowns } from "@/hooks/use-dropdowns";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface FilterProps {
  onFiltersChange: (filters: any) => void;
  currentFilters?: any;
}

export const FilterSection: React.FC<FilterProps> = ({
  onFiltersChange,
  currentFilters,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [creationDateRange, setCreationDateRange] = useState<DateRange>({});
  const [nextAgendaDateRange, setNextAgendaDateRange] = useState<DateRange>({});
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
    apenasSemConsultor: false,
  });

  // Buscar dados dos dropdowns
  const {
    etapas,
    situacoes,
    loading: dropdownsLoading,
    error: dropdownsError,
  } = useDropdowns();

  // Dados estáticos (pode ser movido para API no futuro)
  const origens = [
    "Website",
    "Facebook",
    "Google Ads",
    "Indicação",
    "WhatsApp",
    "Telefone",
  ];
  const tiposProcura = ["Produto A", "Produto B", "Produto C"];
  const consultores = [
    "Ana Silva",
    "Carlos Santos",
    "Maria Oliveira",
    "João Costa",
    "Paula Lima",
  ];
  const vendedores = [
    "Pedro Souza",
    "Juliana Alves",
    "Ricardo Martins",
    "Fernanda Cruz",
    "Lucas Pereira",
  ];
  const ufs = ["SP", "RJ", "MG", "RS", "PR", "SC", "BA", "GO", "PE", "CE"];

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
    nextAgendaDateRange,
    selectedSituacoes,
    selectedEtapas,
    selectedConsultores,
    selectedVendedores,
    selectedUFs,
    filters,
    onFiltersChange,
  ]);

  // Sincronizar com os filtros atuais do componente pai
  useEffect(() => {
    if (currentFilters) {
      if (currentFilters.creationDateRange) {
        setCreationDateRange(currentFilters.creationDateRange);
      }
      if (currentFilters.nextAgendaDateRange) {
        setNextAgendaDateRange(currentFilters.nextAgendaDateRange);
      }
      if (currentFilters.situacoes) {
        setSelectedSituacoes(currentFilters.situacoes);
      }
      if (currentFilters.etapas) {
        setSelectedEtapas(currentFilters.etapas);
      }
      if (currentFilters.consultores) {
        setSelectedConsultores(currentFilters.consultores);
      }
      if (currentFilters.vendedores) {
        setSelectedVendedores(currentFilters.vendedores);
      }
      if (currentFilters.ufs) {
        setSelectedUFs(currentFilters.ufs);
      }
      setFilters({
        origem: currentFilters.origem || "",
        tipoProcura: currentFilters.tipoProcura || "",
        nome: currentFilters.nome || "",
        email: currentFilters.email || "",
        apenasSemConsultor: currentFilters.apenasSemConsultor || false,
      });
    }
  }, [currentFilters]);

  // Não aplicar filtros automaticamente - apenas quando o usuário clicar no botão

  const DateRangePicker = ({
    value,
    onChange,
    placeholder,
  }: {
    value: DateRange;
    onChange: (range: DateRange) => void;
    placeholder: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (range: any) => {
      if (range) {
        onChange(range);
        // Fechar o popover apenas quando ambas as datas estiverem selecionadas
        if (range.from && range.to) {
          setIsOpen(false);
        }
      }
    };

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal border-blue-200 focus:border-blue-500 focus:ring-blue-500",
              !value.from && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {value.from ? (
              value.to ? (
                <>
                  {format(value.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(value.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(value.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            initialFocus
            mode="range"
            defaultMonth={value.from}
            selected={{ from: value.from, to: value.to }}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={ptBR}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    );
  };

  const MultiSelect = ({
    options,
    selected,
    onChange,
    placeholder,
    maxLimit = 3,
  }: {
    options: string[];
    selected: string[];
    onChange: (value: string) => void;
    placeholder: string;
    maxLimit?: number;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Fechar dropdown quando clicar fora
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

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
                  {item}
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
                    className="pl-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
                {options.map((option) => (
                  <div
                    key={option}
                    className={cn(
                      "flex items-center space-x-3 p-2 hover:bg-blue-50 cursor-pointer rounded-lg transition-colors",
                      selected.includes(option) &&
                        "bg-blue-100 border border-blue-200"
                    )}
                    onClick={() => onChange(option)}
                  >
                    <Checkbox
                      checked={selected.includes(option)}
                      className="text-blue-600 border-blue-300"
                    />
                    <span
                      className={cn(
                        "text-sm flex-1",
                        selected.includes(option)
                          ? "text-blue-700 font-medium"
                          : "text-gray-700"
                      )}
                    >
                      {option}
                    </span>
                    {selected.includes(option) && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                ))}
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
            <DateRangePicker
              value={creationDateRange}
              onChange={setCreationDateRange}
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
                options={situacoes.map((s) => s.descricao)}
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
                  <SelectItem key={origem} value={origem}>
                    {origem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-blue-800 font-medium">Tipo de Procura</Label>
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
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                options={etapas.map((e) => e.descricao)}
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
                  creationDateRange: {},
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
                  apenasSemConsultor: false,
                };

                // Limpar estado local
                setCreationDateRange({});
                setNextAgendaDateRange({});
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
              <Label className="text-blue-800 font-medium">
                Período da Próxima Agenda
              </Label>
              <DateRangePicker
                value={nextAgendaDateRange}
                onChange={setNextAgendaDateRange}
                placeholder="Selecionar período"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-blue-800 font-medium">Consultor</Label>
              <MultiSelect
                options={consultores}
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
            </div>

            <div className="space-y-2">
              <Label className="text-blue-800 font-medium">Vendedor</Label>
              <MultiSelect
                options={vendedores}
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
            </div>

            <div className="space-y-2">
              <Label className="text-blue-800 font-medium">UF</Label>
              <MultiSelect
                options={ufs}
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
