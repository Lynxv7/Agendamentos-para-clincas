import { HospitalIcon } from "lucide-react";

import { medicalSpecialtyIcons } from "@/app/(protected)/doctors/_constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Specialty {
  specialty: string;
  appointmentsCount: number;
}

interface TopSpecialtiesProps {
  specialty: Specialty[];
}

export function TopSpecialties({ specialty: item }: TopSpecialtiesProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <HospitalIcon className="text-muted-foreground h-5 w-5" />
          <CardTitle className="text-lg text-slate-800">
            Especialidades
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {item.map((item) => {
          const Icon =
            medicalSpecialtyIcons[
              item.specialty as keyof typeof medicalSpecialtyIcons
            ];
          const progressValue = (item.appointmentsCount / 100) * 100;

          return (
            <div
              key={item.specialty}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  {Icon ? (
                    <Icon className="h-5 w-5 text-blue-600" />
                  ) : (
                    <HospitalIcon className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <Progress
                    value={progressValue}
                    className="mt-2 h-4 w-100 rounded-full bg-slate-200"
                  />
                </div>
                <span className="font-medium text-slate-800">
                  {item.specialty}
                </span>
              </div>
              <span className="text-muted-foreground text-sm">
                {item.appointmentsCount} agend.
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
