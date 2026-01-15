"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { cn } from "@/lib/utils";

// const chartConfig = {
//   total: {
//     label: "Total",
//     color: "var(--chart-1)",
//   },
//   successful: {
//     label: "Successful",
//     color: "var(--chart-4)",
//   },
// } satisfies ChartConfig;

// const chartData = [
//   { month: "January", total: 186, successful: 80 },
//   { month: "February", total: 305, successful: 200 },
//   { month: "March", total: 237, successful: 120 },
//   { month: "April", total: 173, successful: 100 },
//   { month: "May", total: 209, successful: 130 },
//   { month: "June", total: 214, successful: 140 },
// ];

export interface AppBarChartProps {
  cofigs: ChartConfig;
  data: unknown[];
  xAxisKey: string;
  dataKeys: {
    key: string;
    name: string;
    color: string;
  }[];
  height?: number;
  showGrid?: boolean;
  stacked?: boolean;
  layout?: "horizontal" | "vertical";
  barSize?: number;
}

const AppBarChart = ({
  data,
  cofigs,
  xAxisKey,
  dataKeys,
  height = 300,
  stacked = false,
  layout = "vertical",
  barSize = 30,
}: AppBarChartProps) => {
  return (
    <ChartContainer
      config={cofigs}
      className={cn("min-h-50 w-full", height && `h-[${height}px]`)}
    >
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          type={layout === "vertical" ? "category" : "number"}
          dataKey={layout === "vertical" ? xAxisKey : undefined}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          type={layout === "vertical" ? "number" : "category"}
          dataKey={layout === "vertical" ? undefined : xAxisKey}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {dataKeys.map((dataKey) => (
          <Bar
            key={dataKey.key}
            dataKey={dataKey.key}
            name={dataKey.name}
            fill={dataKey.color}
            stackId={stacked ? "stack" : undefined}
            radius={[4, 4, 0, 0]}
            barSize={barSize}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
};

export default AppBarChart;
