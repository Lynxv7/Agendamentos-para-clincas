"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createAppointment } from "@/actions/create-appointment";
import { createAppointmentSchema } from "@/actions/create-appointment/schema";
import { getAvailableTimes } from "@/actions/get-available-times";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { dayjs } from "@/lib/dayjs";

// Computado uma única vez fora do componente — nunca muda durante a sessão
const USER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

type FormValues = z.infer<typeof createAppointmentSchema>;

interface Patient {
  id: number;
  name: string;
}

interface Doctor {
  id: number;
  name: string;
  appointmentPriceInCents: number;
  availableFromWeekDay: number;
  availableToWeekDay: number;
}

interface Props {
  patients: Patient[];
  doctors: Doctor[];
}

type TimeSlot = {
  value: string;
  available: boolean;
  hasPreviousBooking?: boolean;
  label?: string;
};

const NewAppointmentDialog = ({ patients, doctors }: Props) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [times, setTimes] = useState<TimeSlot[]>([]);
  const [priceDisplay, setPriceDisplay] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      appointmentPrice: 0,
      date: "",
      timeZone: USER_TIMEZONE,
      description: "",
    },
  });

  const { execute: createExecute, isPending: isCreating } = useAction(
    createAppointment,
    {
      onSuccess: () => {
        toast.success("Agendamento criado com sucesso!");
        setOpen(false);
        form.reset();
        setSelectedDate(undefined);
        setSelectedTime(undefined);
        setTimes([]);
        router.refresh();
      },
      onError: ({ error }) =>
        toast.error(error.serverError ?? "Erro ao criar agendamento"),
    },
  );

  const {
    execute: fetchTimesExecute,
    result: timesResult,
    isPending: isFetchingTimes,
  } = useAction(getAvailableTimes);

  // Ref para sempre ter a versão mais recente de fetchTimesExecute
  // sem adicioná-la como dependência do useEffect (evita loop infinito)
  const fetchTimesRef = useRef(fetchTimesExecute);
  fetchTimesRef.current = fetchTimesExecute;

  const doctorId = form.watch("doctorId");

  // Reset ao trocar médico
  useEffect(() => {
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setTimes([]);
    form.setValue("date", "");
  }, [doctorId, form]);

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d.id.toString() === doctorId),
    [doctorId, doctors],
  );

  // Dias desabilitados no calendário
  const disabledDays = useMemo(() => {
    const today = dayjs().startOf("day").toDate();

    if (!selectedDoctor) return [{ before: today }];

    return [
      { before: today },
      (date: Date) => {
        const day = dayjs(date).day();

        return (
          day < selectedDoctor.availableFromWeekDay ||
          day > selectedDoctor.availableToWeekDay
        );
      },
    ];
  }, [selectedDoctor]);

  // Preenche preço automaticamente ao selecionar médico
  useEffect(() => {
    if (selectedDoctor) {
      const price = selectedDoctor.appointmentPriceInCents / 100;

      form.setValue("appointmentPrice", price);
      setPriceDisplay(
        new Intl.NumberFormat("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(price),
      );
    } else {
      setPriceDisplay("");
    }
  }, [selectedDoctor, form]);

  // Reset horário ao trocar data
  useEffect(() => {
    setSelectedTime(undefined);
  }, [selectedDate]);

  // Buscar horários disponíveis — usa ref para evitar loop infinito
  useEffect(() => {
    if (!selectedDate || !doctorId) return;

    const formattedDate = dayjs(selectedDate)
      .tz(USER_TIMEZONE)
      .format("YYYY-MM-DD");

    fetchTimesRef.current({
      doctorId,
      date: formattedDate,
      timeZone: USER_TIMEZONE,
    });
  }, [selectedDate, doctorId]);

  // Atualizar lista de horários quando resultado chega
  useEffect(() => {
    if (timesResult?.data) {
      setTimes(timesResult.data);
    } else if (!isFetchingTimes) {
      setTimes([]);
    }
  }, [timesResult, isFetchingTimes]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Novo agendamento</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
          <DialogDescription>Preencha os dados</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              (data) => {
                if (!selectedTime) {
                  toast.error("Selecione um horário");
                  return;
                }
                createExecute({ ...data, timeZone: USER_TIMEZONE });
              },
              (errors) => {
                const firstError = Object.values(errors)[0];
                const message =
                  firstError?.message ?? "Preencha todos os campos";
                toast.error(message);
              },
            )}
            className="space-y-4"
          >
            {/* Paciente */}
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Médico */}
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Médico</FormLabel>

                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Valor */}
            <FormField
              control={form.control}
              name="appointmentPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                        R$
                      </span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="0,00"
                        className="pl-9"
                        value={priceDisplay}
                        onChange={(e) => {
                          // Mantém apenas dígitos e converte centavos -> reais
                          const digits = e.target.value.replace(/\D/g, "");
                          const cents = parseInt(digits || "0", 10);
                          const reais = cents / 100;

                          setPriceDisplay(
                            new Intl.NumberFormat("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(reais),
                          );
                          field.onChange(reais);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data */}
            <FormItem>
              <FormLabel>Data</FormLabel>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate
                      ? dayjs(selectedDate).format("DD/MM/YYYY")
                      : "Selecione"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={disabledDays}
                  />
                </PopoverContent>
              </Popover>
            </FormItem>

            {/* Horário */}
            <FormItem>
              <FormLabel>Horário</FormLabel>

              <Select
                value={selectedTime || undefined}
                onValueChange={(time) => {
                  setSelectedTime(time);

                  if (selectedDate) {
                    const dateTimeUTC = dayjs
                      .tz(
                        `${dayjs(selectedDate).format("YYYY-MM-DD")} ${time}`,
                        USER_TIMEZONE,
                      )
                      .utc()
                      .toISOString();

                    form.setValue("date", dateTimeUTC);
                  }
                }}
                disabled={!selectedDate}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {isFetchingTimes && (
                    <div className="p-2 text-sm">Carregando...</div>
                  )}

                  {!isFetchingTimes &&
                    times.filter((t) => t.available).length === 0 && (
                      <div className="p-2 text-sm">
                        Sem horários disponíveis
                      </div>
                    )}

                  {times.map((t) => (
                    <SelectItem
                      key={t.value}
                      value={t.value}
                      disabled={!t.available}
                    >
                      <span>
                        {t.label ?? t.value}
                        {!t.available && (
                          <span className="text-muted-foreground ml-2 text-xs">
                            (indisponível)
                          </span>
                        )}
                        {t.available && t.hasPreviousBooking && (
                          <span className="ml-2 text-xs text-amber-600">
                            ⚠️ consulta antes
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      placeholder="Descreva o motivo ou observações da consulta"
                      rows={3}
                      className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Salvando..." : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewAppointmentDialog;
