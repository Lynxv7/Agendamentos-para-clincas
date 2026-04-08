import { Stethoscope } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Doctor {
  id: number;
  name: string;
  avatarImageUrl: string | null;
  specialty: string;
  appointmentsCount: number;
}

interface DoctorsListProps {
  doctors: Doctor[];
}

export function TopDoctors({ doctors }: DoctorsListProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Stethoscope className="text-muted-foreground h-5 w-5" />
          <CardTitle className="text-lg text-slate-800">Médicos</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10 border-2 border-slate-100">
                <AvatarImage
                  src={doctor.avatarImageUrl || undefined}
                  alt={doctor.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-slate-100 text-sm font-medium text-slate-800">
                  {doctor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-slate-800">{doctor.name}</span>
                <span className="text-sm text-slate-500">
                  {doctor.specialty}
                </span>
              </div>
            </div>
            <span className="text-muted-foreground text-sm">
              {doctor.appointmentsCount} agend.
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
