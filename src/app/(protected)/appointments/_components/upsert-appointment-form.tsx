"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { upsertAppointment } from "@/actions/upsert-appointments";
import { upsertAppointmentSchema } from "@/actions/upsert-appointments/schema";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { doctorsTable, patientsTable } from "@/db/schema";

export type UpsertAppointmentFormPatient = typeof patientsTable.$inferSelect;
export type UpsertAppointmentFormDoctor = typeof doctorsTable.$inferSelect;

export type UpsertAppointmentFormValues = z.infer<
  typeof upsertAppointmentSchema
>;

interface UpsertAppointmentFormProps {
  patients: UpsertAppointmentFormPatient[];
  doctors: UpsertAppointmentFormDoctor[];
  appointment?: Partial<UpsertAppointmentFormValues>;
  onSuccess?: () => void;
}

const UpsertAppointmentForm = ({
  patients,
  doctors,
  appointment,
  onSuccess,
}: UpsertAppointmentFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    appointment?.date ? new Date(appointment.date) : undefined,
  );

  const form = useForm<UpsertAppointmentFormValues>({
    shouldUnregister: true,
    resolver: zodResolver(upsertAppointmentSchema),
    defaultValues: {
      patientId: appointment?.patientId ?? "",
      doctorId: appointment?.doctorId ?? "",
      appointmentPrice: appointment?.appointmentPrice ?? 0,
      date: appointment?.date ?? "",
      serviceType: appointment?.serviceType ?? "",
    },
  });

  const upsertAppointmentAction = useAction(upsertAppointment, {
    onSuccess: () => {
      toast.success("Agendamento salvo com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar agendamento.");
    },
  });

  const doctorId = form.watch("doctorId");
  const patientId = form.watch("patientId");

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id.toString() === doctorId),
    [doctorId, doctors],
  );

  const isDateEnabled = Boolean(doctorId && patientId);
  const isExtraSelectEnabled = Boolean(doctorId && patientId && selectedDate);

  // Atualiza preço automaticamente
  useEffect(() => {
    if (selectedDoctor) {
      form.setValue(
        "appointmentPrice",
        selectedDoctor.appointmentPriceInCents / 100,
      );
    }
  }, [selectedDoctor, form]);

  // Reset data se necessário
  useEffect(() => {
    if (!isDateEnabled) {
      setSelectedDate(undefined);
      form.setValue("date", "");
    }
  }, [isDateEnabled, form]);

  // Atualiza no form
  useEffect(() => {
    if (selectedDate) {
      form.setValue("date", selectedDate.toISOString());
    }
  }, [selectedDate, form]);

  // Horários disponíveis
  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];

    const times = [];

    for (let hour = 8; hour <= 18; hour++) {
      times.push(`${hour.toString().padStart(2, "0")}:00`);
    }

    return times;
  }, [selectedDate]);

  const onSubmit = (values: UpsertAppointmentFormValues) => {
    upsertAppointmentAction.execute({
      ...values,
      id: appointment?.id,
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {appointment ? "Editar agendamento" : "Novo agendamento"}
        </DialogTitle>
        <DialogDescription>
          {appointment
            ? "Atualize os dados do agendamento."
            : "Preencha os dados para criar um novo agendamento."}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* PACIENTE */}
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem
                        key={patient.id}
                        value={patient.id.toString()}
                      >
                        {patient.name}
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um médico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* VALOR */}
          <FormField
            control={form.control}
            name="appointmentPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da consulta</FormLabel>
                <NumericFormat
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value.floatValue ?? 0)
                  }
                  decimalScale={2}
                  fixedDecimalScale
                  decimalSeparator=","
                  thousandSeparator="."
                  prefix="R$ "
                  customInput={Input}
                  disabled={!selectedDoctor}
                />
              </FormItem>
            )}
          />

          {/* DATA + HORÁRIO */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* DATA */}
            <FormItem>
              <FormLabel>Data</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={!isDateEnabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date ?? undefined)}
                    locale={ptBR}
                    disabled={(date) =>
                      date.getDay() === 0 || date.getDay() === 6
                    }
                  />
                </PopoverContent>
              </Popover>
            </FormItem>

            {/* HORÁRIO */}
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário</FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className="w-full"
                        disabled={!isExtraSelectEnabled}
                      >
                        <SelectValue placeholder="Selecione um horário" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {availableTimes.length === 0 ? (
                        <SelectItem value="no-options" disabled>
                          Sem horários disponíveis
                        </SelectItem>
                      ) : (
                        availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={upsertAppointmentAction.isPending}>
              {upsertAppointmentAction.isPending
                ? "Salvando..."
                : appointment
                  ? "Salvar agendamento"
                  : "Criar agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertAppointmentForm;
