"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { CalendarIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
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
} from "@/components/ui/form";
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

dayjs.extend(utc);
dayjs.extend(timezone);

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

const NewAppointmentDialog = ({ patients, doctors }: Props) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [times, setTimes] = useState<{ value: string; available: boolean }[]>(
    [],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      appointmentPrice: 0,
      date: "",
    },
  });

  const createAction = useAction(createAppointment, {
    onSuccess: () => {
      toast.success("Agendamento criado");
      setOpen(false);
      form.reset();
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setTimes([]);
    },
    onError: () => toast.error("Erro ao criar"),
  });

  const getTimesAction = useAction(getAvailableTimes);

  const doctorId = form.watch("doctorId");

  // reset ao trocar médico
  useEffect(() => {
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setTimes([]);
    form.setValue("date", "");
  }, [doctorId]);

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d.id.toString() === doctorId),
    [doctorId, doctors],
  );

  // bloquear dias inválidos
  const disabledDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!selectedDoctor) return [{ before: today }];

    return [
      { before: today },
      (date: Date) => {
        const day = date.getDay();
        return (
          day < selectedDoctor.availableFromWeekDay ||
          day > selectedDoctor.availableToWeekDay
        );
      },
    ];
  }, [selectedDoctor]);

  // preço automático
  useEffect(() => {
    if (selectedDoctor) {
      form.setValue(
        "appointmentPrice",
        selectedDoctor.appointmentPriceInCents / 100,
      );
    }
  }, [selectedDoctor]);

  // 🔥 CORREÇÃO: NÃO salvar data aqui
  useEffect(() => {
    setSelectedTime(undefined);
  }, [selectedDate]);

  // buscar horários
  useEffect(() => {
    if (!selectedDate || !doctorId) return;

    getTimesAction.execute({
      doctorId,
      date: format(selectedDate, "yyyy-MM-dd"),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }, [selectedDate, doctorId]);

  // salvar horários
  useEffect(() => {
    if (getTimesAction.result?.data) {
      setTimes(getTimesAction.result.data);
    } else if (!getTimesAction.isPending) {
      setTimes([]);
    }
  }, [getTimesAction.result, getTimesAction.isPending]);

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
            onSubmit={form.handleSubmit((data) => {
              if (!selectedTime) {
                toast.error("Selecione um horário");
                return;
              }
              createAction.execute(data);
            })}
            className="space-y-4"
          >
            {/* PACIENTE */}
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
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

            {/* MÉDICO */}
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Médico</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
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

            {/* DATA */}
            <FormItem>
              <FormLabel>Data</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate
                      ? format(selectedDate, "PPP", { locale: ptBR })
                      : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={disabledDays}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </FormItem>

            {/* HORÁRIO */}
            <FormItem>
              <FormLabel>Horário</FormLabel>

              <Select
                value={selectedTime || undefined}
                onValueChange={(time) => {
                  setSelectedTime(time);

                  if (selectedDate) {
                    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

                    const dateTimeUTC = dayjs
                      .tz(`${format(selectedDate, "yyyy-MM-dd")} ${time}`, tz)
                      .utc()
                      .toISOString();

                    form.setValue("date", dateTimeUTC);
                  }
                }}
                disabled={!selectedDate}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {getTimesAction.isPending && (
                    <div className="p-2 text-sm">Carregando...</div>
                  )}

                  {!getTimesAction.isPending && times.length === 0 && (
                    <div className="p-2 text-sm">Sem horários disponíveis</div>
                  )}

                  {times.map((t) => (
                    <SelectItem
                      key={t.value}
                      value={t.value}
                      disabled={!t.available}
                    >
                      {t.value} {!t.available && "(ocupado)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            <DialogFooter>
              <Button type="submit">
                {createAction.isPending ? "Salvando..." : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewAppointmentDialog;
