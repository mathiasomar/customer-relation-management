"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
//   desktop: {
//     label: "Desktop",
//     color: "var(--chart-2)",
//   },
//   mobile: {
//     label: "Mobile",
//     color: "var(--chart-1)",
//   },
// } satisfies ChartConfig;

// const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
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
  gradient?: boolean;
}

const AppAreaChart = ({
  data,
  cofigs,
  xAxisKey,
  dataKeys,
  height = 300,
  gradient = true,
}: AppBarChartProps) => {
  return (
    <>
      <ChartContainer
        config={cofigs}
        className={cn("min-h-50 w-full", height && `h-[${height}px]`)}
      >
        <AreaChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={xAxisKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis tickLine={false} tickMargin={10} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {gradient && (
            <defs>
              {dataKeys.map((dataKey) => (
                <linearGradient
                  key={dataKey.key}
                  id={`color${dataKey.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={dataKey.color}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={dataKey.color}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
          )}
          {dataKeys.map((dataKey) => (
            <Area
              key={dataKey.key}
              type="monotone"
              dataKey={dataKey.key}
              name={dataKey.name}
              stroke={dataKey.color}
              fill={
                gradient ? `url(#color${dataKey.key})` : `${dataKey.color}20`
              }
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ChartContainer>
    </>
  );
};

export default AppAreaChart;
