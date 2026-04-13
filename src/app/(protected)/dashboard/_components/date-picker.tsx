"use client";

import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { parseAsIsoDate, useQueryState } from "nuqs";
import * as React from "react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [from, setFrom] = useQueryState("from", parseAsIsoDate);
  const [to, setTo] = useQueryState("to", parseAsIsoDate);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const date: DateRange = {
    from: from ?? undefined,
    to: to ?? undefined,
  };

  const handleDateSelect = async (dateRange: DateRange | undefined) => {
    if (!dateRange) return;

    // usuário selecionou FROM
    if (dateRange.from && !dateRange.to) {
      const newFrom = dateRange.from;
      const newTo = addDays(newFrom, 30);

      await setFrom(newFrom);
      await setTo(newTo);

      return;
    }

    // usuário selecionou TO
    if (dateRange.from && dateRange.to) {
      await setFrom(dateRange.from);

      // 🔥 força reload da página
      await setTo(dateRange.to, {
        shallow: false,
      });
    }
  };

  return (
    <Field className={`mx-auto w-60 ${className ?? ""}`}>
      <FieldLabel htmlFor="date-picker-range">Datas</FieldLabel>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker-range"
            className="justify-start px-2.5 font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />

            {mounted && date?.from ? (
              date?.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione uma data</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
