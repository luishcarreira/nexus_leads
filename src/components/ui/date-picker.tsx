import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface DatePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecionar período",
  className,
}: DatePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  const handleSelect = (selectedRange: DateRange | undefined) => {
    setDate(selectedRange);
    onChange?.(selectedRange);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDate(undefined);
    onChange?.(undefined);
  };

  const formatDateRange = (range?: DateRange): string => {
    if (!range?.from) {
      return placeholder;
    }

    if (range.to) {
      return `${format(range.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(
        range.to,
        "dd/MM/yyyy",
        { locale: ptBR }
      )}`;
    }

    return format(range.from, "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal border-blue-200 focus:border-blue-500 focus:ring-blue-500",
              !date?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(date)}
            {(date?.from || date?.to) && (
              <X
                className="ml-auto h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer"
                onClick={handleClear}
                onMouseDown={(e) => e.stopPropagation()}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
