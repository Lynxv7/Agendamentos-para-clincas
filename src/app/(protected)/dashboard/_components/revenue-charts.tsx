"use client";

import dayjs from "dayjs";
import { DollarSign } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrencyInCents } from "@/helpers/currency";

const chartConfig = {
  appointments: {
    label: "Agendamentos",
    color: "#0B68F7",
  },
  revenue: {
    label: "Faturamento",
    color: "#10B981",
  },
} satisfies ChartConfig;

interface RevenueChartProps {
  daylyAppointmentsData: {
    date: string;
    appointments: number;
    revenue: number;
  }[];
}

export function RevenueChart({ daylyAppointmentsData }: RevenueChartProps) {
  const chartDays = Array.from({ length: 21 }, (_, index) =>
    dayjs()
      .subtract(20 - index, "days")
      .format("YYYY-MM-DD"),
  );

  const chartData = chartDays.map((date) => {
    const dayData = daylyAppointmentsData.find(
      (d) => dayjs(d.date).format("YYYY-MM-DD") === date,
    );

    return {
      date,
      appointments: dayData?.appointments ?? 0,
      revenue: dayData?.revenue ?? 0,
    };
  });

  return (
    <Card>
      <CardHeader>
        <DollarSign className="text-green-500" />
        <CardTitle>Receita e Agendamentos</CardTitle>
        <CardDescription>Últimos 21 dias de movimentação</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px]">
          <AreaChart data={chartData}>
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="date"
              tickFormatter={(value) => dayjs(value).format("DD/MM")}
            />

            {/* Eixo agendamentos */}
            <YAxis yAxisId="left" />

            {/* Eixo faturamento */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => formatCurrencyInCents(value)}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === "revenue") {
                      return formatCurrencyInCents(Number(value));
                    }
                    return value;
                  }}
                  labelFormatter={(label) =>
                    dayjs(label).format("DD/MM/YYYY (dddd)")
                  }
                />
              }
            />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="appointments"
              stroke="#0B68F7"
              fill="#0B68F7"
              fillOpacity={0.3}
            />

            <Area
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default RevenueChart;
