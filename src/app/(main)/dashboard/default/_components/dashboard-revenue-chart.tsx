"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function fmtMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency || "MRU",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DashboardRevenueChart({
  data,
  currency,
  loading,
}: {
  data: { date: string; revenue: number }[];
  currency: string;
  loading: boolean;
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Chiffre d’affaires</CardTitle>
        <CardDescription>Commandes livrées et expédiées — 14 derniers jours</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex h-62 items-center justify-center text-sm text-muted-foreground">Chargement…</div>
        ) : data.length === 0 ? (
          <div className="flex h-62 items-center justify-center text-sm text-muted-foreground">
            Pas encore de données sur cette période.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-62 w-full">
            <AreaChart data={data} margin={{ left: 8, right: 8 }}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.85} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={28}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      const row = payload?.[0]?.payload as { date?: string } | undefined;
                      const dateStr = row?.date;
                      if (!dateStr) return "";
                      return new Date(dateStr).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    formatter={(value) => <span>{fmtMoney(Number(value), currency)}</span>}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="revenue"
                type="monotone"
                fill="url(#fillRevenue)"
                stroke="var(--color-revenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
