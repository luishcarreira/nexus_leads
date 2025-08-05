import * as React from "react";
import { addDays, format, subDays } from "date-fns";
import type { Locale as DateFnsLocale } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  onUpdate: (values: { range: DateRange; rangeCompare?: DateRange }) => void;
  initialDateFrom?: Date | string;
  initialDateTo?: Date | string;
  initialCompareFrom?: Date | string;
  initialCompareTo?: Date | string;
  align?: "start" | "center" | "end";
  locale?: DateFnsLocale;
  showCompare?: boolean;
  className?: string;
  placeholder?: string;
}

const formatDateRange = (
  range: DateRange,
  locale: DateFnsLocale = ptBR
): string => {
  if (!range.from) {
    return "Selecionar período";
  }

  if (range.to) {
    return `${format(range.from, "dd/MM/yyyy", { locale })} - ${format(
      range.to,
      "dd/MM/yyyy",
      { locale }
    )}`;
  }

  return format(range.from, "dd/MM/yyyy", { locale });
};

const getPresetRange = (preset: string): DateRange => {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  switch (preset) {
    case "today":
      return { from: startOfToday, to: startOfToday };
    case "yesterday":
      const yesterday = subDays(startOfToday, 1);
      return { from: yesterday, to: yesterday };
    case "last7":
      return { from: subDays(startOfToday, 6), to: startOfToday };
    case "last30":
      return { from: subDays(startOfToday, 29), to: startOfToday };
    case "thisMonth":
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: startOfMonth, to: startOfToday };
    case "lastMonth":
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: lastMonth, to: endOfLastMonth };
    default:
      return {};
  }
};

export function DateRangePicker({
  onUpdate,
  initialDateFrom,
  initialDateTo,
  align = "end",
  locale = ptBR,
  showCompare = false,
  className,
  placeholder = "Selecionar período",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const [range, setRange] = React.useState<DateRange>({
    from: initialDateFrom ? new Date(initialDateFrom) : undefined,
    to: initialDateTo ? new Date(initialDateTo) : undefined,
  });

  const [rangeCompare, setRangeCompare] = React.useState<DateRange>({});
  const [selectedPreset, setSelectedPreset] = React.useState<string>("");

  // Resetar selectedPreset quando o range for alterado manualmente
  React.useEffect(() => {
    if (range.from || range.to) {
      setSelectedPreset("");
    }
  }, [range]);

  const presetOptions = [
    { label: "Hoje", value: "today" },
    { label: "Ontem", value: "yesterday" },
    { label: "Últimos 7 dias", value: "last7" },
    { label: "Últimos 30 dias", value: "last30" },
    { label: "Este mês", value: "thisMonth" },
    { label: "Mês passado", value: "lastMonth" },
  ];

  const handleRangeSelect = (selectedRange: DateRange | undefined) => {
    if (!selectedRange) return;
    setRange(selectedRange);
    // Notificar imediatamente para manter filtros simples
    onUpdate({ range: selectedRange, ...(showCompare && { rangeCompare }) });
    if (selectedRange.from && selectedRange.to) {
      // Fechar após selecionar o range completo
      setTimeout(() => {
        setIsOpen(false);
      }, 100);
    }
  };

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    const presetRange = getPresetRange(preset);
    setRange(presetRange);
    onUpdate({ range: presetRange, ...(showCompare && { rangeCompare }) });

    if (presetRange.from && presetRange.to) {
      setTimeout(() => {
        setIsOpen(false);
      }, 100);
    }
  };

  const handleApply = () => {
    onUpdate({
      range,
      ...(showCompare && { rangeCompare }),
    });
    setIsOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal border-blue-200 focus:border-blue-500 focus:ring-blue-500",
              !range.from && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {formatDateRange(range, locale)}
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <div className="flex">
            {/* Presets */}
            {/* <div className="flex flex-col border-r">
              <div className="px-3 py-2">
                <div className="space-y-1">
                  {presetOptions.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={
                        selectedPreset === preset.value ? "default" : "ghost"
                      }
                      className="w-full justify-start font-normal"
                      size="sm"
                      onClick={() => handlePresetSelect(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div> */}

            {/* Calendar */}
            <div className="p-3">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={range.from}
                selected={range as any /* tipo compat */}
                onSelect={handleRangeSelect}
                numberOfMonths={2}
                locale={locale}
              />

              {/* Apply button */}
              <div className="flex justify-end pt-2 border-t mt-2">
                <Button size="sm" onClick={handleApply}>
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
