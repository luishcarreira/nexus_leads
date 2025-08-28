import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

type LeadCard = {
  id: string;
  nome: string;
  empresa?: string;
  valor?: number;
  responsavel?: string;
  ultimoContato?: string;
  tags?: string[];
};

type Column = {
  id: string;
  titulo: string;
  cor?: string;
  leads: LeadCard[];
};

const currency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const mockColumns: Column[] = [
  {
    id: "novo",
    titulo: "Novo Lead",
    cor: "bg-blue-50 dark:bg-blue-950/20",
    leads: [
      {
        id: "l1",
        nome: "João Silva",
        empresa: "Empresa A",
        valor: 12000,
        responsavel: "Ana",
        ultimoContato: "Hoje",
      },
      {
        id: "l2",
        nome: "Maria Souza",
        empresa: "Empresa B",
        valor: 8000,
        responsavel: "Carlos",
        ultimoContato: "Ontem",
      },
    ],
  },
  {
    id: "contato",
    titulo: "Contato Inicial",
    cor: "bg-amber-50 dark:bg-amber-950/20",
    leads: [
      {
        id: "l3",
        nome: "Empresa X",
        valor: 15000,
        responsavel: "Bruna",
        ultimoContato: "2 dias",
      },
    ],
  },
  {
    id: "qualificado",
    titulo: "Qualificado",
    cor: "bg-violet-50 dark:bg-violet-950/20",
    leads: [
      {
        id: "l4",
        nome: "Carlos Santos",
        empresa: "Startup Y",
        valor: 25000,
        responsavel: "Diego",
        ultimoContato: "3 dias",
      },
    ],
  },
  {
    id: "proposta",
    titulo: "Proposta Enviada",
    cor: "bg-cyan-50 dark:bg-cyan-950/20",
    leads: [
      {
        id: "l5",
        nome: "Empresa Z",
        valor: 42000,
        responsavel: "Ana",
        ultimoContato: "1 semana",
      },
    ],
  },
  {
    id: "negociacao",
    titulo: "Negociação",
    cor: "bg-fuchsia-50 dark:bg-fuchsia-950/20",
    leads: [
      {
        id: "l6",
        nome: "Pedro Costa",
        empresa: "Comércio P",
        valor: 30000,
        responsavel: "Carlos",
        ultimoContato: "4 dias",
      },
    ],
  },
  {
    id: "fechado",
    titulo: "Fechado",
    cor: "bg-emerald-50 dark:bg-emerald-950/20",
    leads: [
      {
        id: "l7",
        nome: "Empresa K",
        valor: 50000,
        responsavel: "Bruna",
        ultimoContato: "Hoje",
      },
    ],
  },
];

const SortableLeadCard: React.FC<{ lead: LeadCard }> = ({ lead }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className={cn(
          "mb-2 border-border hover:border-primary/50 transition-colors",
          isDragging && "opacity-70 ring-2 ring-primary/40"
        )}
      >
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-semibold">{lead.nome}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>{lead.empresa || lead.responsavel || ""}</span>
            {typeof lead.valor === "number" && (
              <span className="font-medium text-foreground">
                {currency(lead.valor)}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Último contato: {lead.ultimoContato || "-"}</span>
            <div className="flex gap-1">
              {lead.tags?.map((t) => (
                <span
                  key={t}
                  className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground text-[10px]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ColumnDroppable: React.FC<{
  columnId: string;
  children: React.ReactNode;
}> = ({ columnId, children }) => {
  const { setNodeRef } = useDroppable({ id: columnId });
  return (
    <div ref={setNodeRef} className="min-h-[80px]">
      {children}
    </div>
  );
};

const Pipeline: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>(mockColumns);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<{
    search: string;
    responsavel: string;
    valorMin: string;
    valorMax: string;
    etapasAtivas: string[];
  }>(() => ({
    search: "",
    responsavel: "all",
    valorMin: "",
    valorMax: "",
    etapasAtivas: mockColumns.map((c) => c.id),
  }));

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    })
  );

  const containerIds = useMemo(() => columns.map((c) => c.id), [columns]);
  const responsaveis = useMemo(() => {
    const set = new Set<string>();
    columns.forEach((col) =>
      col.leads.forEach((l) => l.responsavel && set.add(l.responsavel))
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [columns]);

  const filteredColumns = useMemo(() => {
    const valorMinNum = filters.valorMin ? Number(filters.valorMin) : null;
    const valorMaxNum = filters.valorMax ? Number(filters.valorMax) : null;
    const searchLower = filters.search.trim().toLowerCase();

    const passes = (lead: LeadCard) => {
      if (searchLower) {
        const alvo = `${lead.nome} ${lead.empresa || ""}`.toLowerCase();
        if (!alvo.includes(searchLower)) return false;
      }
      if (
        filters.responsavel !== "all" &&
        lead.responsavel !== filters.responsavel
      )
        return false;
      if (
        valorMinNum !== null &&
        typeof lead.valor === "number" &&
        lead.valor < valorMinNum
      )
        return false;
      if (
        valorMaxNum !== null &&
        typeof lead.valor === "number" &&
        lead.valor > valorMaxNum
      )
        return false;
      return true;
    };

    return columns
      .filter((col) => filters.etapasAtivas.includes(col.id))
      .map((col) => ({ ...col, leads: col.leads.filter(passes) }));
  }, [columns, filters]);

  const getColumnByLeadId = (leadId: string) => {
    return columns.find((c) => c.leads.some((l) => l.id === leadId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Determine origin and destination containers
    const originColumn = getColumnByLeadId(activeId);
    if (!originColumn) return;

    // If dropped over a lead card, destination is that lead's column; if over a column droppable, destination is that column
    const overIsLead = columns.some((col) =>
      col.leads.some((l) => l.id === overId)
    );
    const destinationColumn = overIsLead
      ? getColumnByLeadId(overId)
      : columns.find((c) => c.id === overId);

    if (!destinationColumn) return;

    // If same column, reorder; else move
    if (originColumn.id === destinationColumn.id) {
      const fromIndex = originColumn.leads.findIndex((l) => l.id === activeId);
      const toIndex = overIsLead
        ? destinationColumn.leads.findIndex((l) => l.id === overId)
        : destinationColumn.leads.length;

      if (fromIndex === -1 || toIndex === -1) return;

      setColumns((prev) =>
        prev.map((col) =>
          col.id === originColumn.id
            ? { ...col, leads: arrayMove(col.leads, fromIndex, toIndex) }
            : col
        )
      );
    } else {
      const lead = originColumn.leads.find((l) => l.id === activeId);
      if (!lead) return;

      const newColumns = columns.map((col) => {
        if (col.id === originColumn.id) {
          return { ...col, leads: col.leads.filter((l) => l.id !== activeId) };
        }
        if (col.id === destinationColumn.id) {
          const toIndex = overIsLead
            ? col.leads.findIndex((l) => l.id === overId)
            : col.leads.length;
          const newLeads = [...col.leads];
          newLeads.splice(toIndex, 0, lead);
          return { ...col, leads: newLeads };
        }
        return col;
      });
      setColumns(newColumns);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pipeline</h1>
          <p className="text-muted-foreground">
            Kanban visual com dados mockados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
            Filtros
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo lead
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="busca">Busca</Label>
                <Input
                  id="busca"
                  placeholder="Nome ou empresa"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, search: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select
                  value={filters.responsavel}
                  onValueChange={(v) =>
                    setFilters((f) => ({ ...f, responsavel: v }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {responsaveis.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorMin">Valor mín.</Label>
                <Input
                  id="valorMin"
                  type="number"
                  min="0"
                  value={filters.valorMin}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, valorMin: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorMax">Valor máx.</Label>
                <Input
                  id="valorMax"
                  type="number"
                  min="0"
                  value={filters.valorMax}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, valorMax: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="mt-4">
              <Label>Etapas</Label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {columns.map((col) => {
                  const checked = filters.etapasAtivas.includes(col.id);
                  return (
                    <label
                      key={col.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(val) => {
                          setFilters((f) => {
                            const ativo = Array.from(f.etapasAtivas);
                            const isChecked = Boolean(val);
                            if (isChecked && !ativo.includes(col.id))
                              ativo.push(col.id);
                            if (!isChecked) {
                              const idx = ativo.indexOf(col.id);
                              if (idx >= 0) ativo.splice(idx, 1);
                            }
                            return { ...f, etapasAtivas: ativo };
                          });
                        }}
                      />
                      <span>{col.titulo}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    search: "",
                    responsavel: "all",
                    valorMin: "",
                    valorMax: "",
                    etapasAtivas: columns.map((c) => c.id),
                  })
                }
              >
                Limpar filtros
              </Button>
              <Button variant="secondary" onClick={() => setShowFilters(false)}>
                Ocultar filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {filteredColumns.map((column) => {
            const totalValor = column.leads.reduce(
              (acc, l) => acc + (l.valor || 0),
              0
            );
            return (
              <div key={column.id} className="flex flex-col">
                <div className={cn("rounded-md border p-3 mb-2", column.cor)}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{column.titulo}</span>
                    <span className="text-xs text-muted-foreground">
                      {column.leads.length} leads
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currency(totalValor)}
                  </div>
                </div>

                <Card className="flex-1">
                  <CardContent className="p-3">
                    <SortableContext
                      items={column.leads.map((l) => l.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <ColumnDroppable columnId={column.id}>
                        {column.leads.map((lead) => (
                          <SortableLeadCard key={lead.id} lead={lead} />
                        ))}
                      </ColumnDroppable>
                    </SortableContext>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
};

export default Pipeline;
