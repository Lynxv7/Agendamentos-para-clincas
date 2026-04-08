import { CalendarClock } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dayjs } from "@/lib/dayjs";

interface TodayAppointment {
  id: number;
  date: Date;
  patient: { name: string } | null;
  doctor: { name: string } | null;
}

interface TodayAppointmentsProps {
  appointments: TodayAppointment[];
}

export function TodayAppointments({ appointments }: TodayAppointmentsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CalendarClock className="text-muted-foreground h-5 w-5" />
          <CardTitle className="text-lg text-slate-800">
            Agendamentos de hoje
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            Nenhum agendamento para hoje.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-muted-foreground pb-3 text-left font-medium">
                  Paciente
                </th>
                <th className="pb-3 text-left font-medium text-slate-800">
                  Médico
                </th>
                <th className="pb-3 text-left font-medium text-slate-800">
                  Dia
                </th>
                <th className="pb-3 text-left font-medium text-slate-800">
                  Horário
                </th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => {
                const patientName = appointment.patient?.name ?? "-";
                const doctorName = appointment.doctor?.name ?? "-";
                const date = dayjs(appointment.date);

                return (
                  <tr key={appointment.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {patientName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-slate-800">
                          {patientName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-700">
                      Dr(a). {doctorName}
                    </td>
                    <td className="py-3 pr-4 text-slate-700">
                      {date.format("DD/MM/YYYY")}
                    </td>
                    <td className="py-3 text-slate-700">
                      {date.format("HH:mm")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
