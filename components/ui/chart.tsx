"use client"

import * as React from "react"
import {
  Label,
  PolarGrid,
  RadialBar,
  RadialBarChart as RadialBarChartPrimitive,
  type RadialBarProps,
  Tooltip,
  type TooltipProps,
} from "recharts"
import {
  Area,
  AreaChart as AreaChartPrimitive,
  Bar,
  BarChart as BarChartPrimitive,
  CartesianGrid,
  Cell,
  type CellProps,
  Legend,
  type LegendProps,
  Line,
  LineChart as LineChartPrimitive,
  Pie,
  PieChart as PieChartPrimitive,
  type PieProps,
  PolarAngleAxis,
  type PolarAngleAxisProps,
  type PolarRadiusAxisProps,
  Rectangle,
  type RectangleProps,
  ResponsiveContainer,
  Sector,
  type SectorProps,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@/lib/utils"

// Chart Container
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig
    children: React.ReactElement<"svg"> | React.ReactNode
  }
>(({ id, className, children, config, ...props }, ref) => {
  const chartId = `chart-${id || React.useId()}`
  const [activeChart, setActiveChart] = React.useState<keyof typeof config>()

  return (
    <div
      data-chart={chartId}
      ref={ref}
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-polar-grid_[stroke=ccc]]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted/50 [&_.recharts-radial-bar-sector]:fill-primary [&_.recharts-sector[path]]:fill-primary [&_.recharts-sector[path]]:stroke-background",
        className
      )}
      {...props}
    >
      <ChartContext.Provider
        value={{
          chartId,
          config,
          activeChart: activeChart as keyof typeof config,
          setActiveChart,
        }}
      >
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </ChartContext.Provider>
    </div>
  )
})
ChartContainer.displayName = "Chart"

// Chart Context
type ChartContextProps = {
  chartId: string
  config: ChartConfig
  activeChart?: keyof ChartConfig
  setActiveChart: (chart: keyof ChartConfig | undefined) => void
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const Chart = Object.assign(ChartContainer, {
  Container: ChartContainer,
  Tooltip: ChartTooltip,
  TooltipContent: ChartTooltipContent,
  Legend: ChartLegend,
  Grid: CartesianGrid,
  XAxis: XAxis,
  YAxis: YAxis,
  Line: Line,
  Bar: Bar,
  Area: Area,
  Pie: Pie,
  Cell: Cell,
  Label: Label,
  PolarGrid: PolarGrid,
  PolarAngleAxis: PolarAngleAxis,
  PolarRadiusAxis: PolarRadiusAxis,
  RadialBar: RadialBar,
  Sector: Sector,
  Rectangle: Rectangle,
  LineChart: LineChartPrimitive,
  BarChart: BarChartPrimitive,
  PieChart: PieChartPrimitive,
  AreaChart: AreaChartPrimitive,
  RadialBarChart: RadialBarChartPrimitive,
  ResponsiveContainer: ResponsiveContainer,
})

// Chart Tooltip
const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  Omit<TooltipProps<any, any>, "content"> & {
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    hideLabel?: boolean
  }
>(
  (
    {
      className,
      indicator = "dot",
      hideIndicator = false,
      hideLabel = false,
      ...props
    },
    ref
  ) => {
    const { config } = useChart()

    return (
      <Tooltip
        wrapperStyle={{ outline: "none" }}
        isAnimationActive={false}
        cursor={
          hideIndicator
            ? false
            : {
                stroke: "hsl(var(--border))",
                strokeWidth: 1,
                ...(indicator === "line" && {
                  strokeWidth: 2,
                }),
                ...(indicator === "dashed" && {
                  strokeDasharray: "4 4",
                }),
              }
        }
        content={
          <ChartTooltipContent
            hideLabel={hideLabel}
            className={className}
            config={config}
          />
        }
        {...props}
      />
    )
  }
)
ChartTooltip.displayName = Tooltip.displayName

// Chart Legend
const ChartLegend = React.forwardRef<
  HTMLDivElement,
  Omit<LegendProps, "content"> & {
    hideIcon?: boolean
  }
>(({ className, hideIcon = false, ...props }, ref) => {
  const { config, activeChart, setActiveChart } = useChart()

  return (
    <Legend
      verticalAlign="bottom"
      height={40}
      content={({ payload }) => (
        <div
          ref={ref}
          className={cn(
            "flex items-center justify-center gap-4 !p-1 [&>div]:!flex [&>div]:items-center [&>div]:gap-1.5",
            className
          )}
        >
          {payload?.map((item) => {
            const key = item.dataKey as keyof typeof config
            const chart = config[key]
            const color =
              activeChart === key
                ? "hsl(var(--foreground))"
                : "hsl(var(--muted-foreground))"

            if (!chart) {
              return null
            }

            return (
              <div
                key={item.value}
                data-active={activeChart === key}
                className="cursor-pointer"
                onMouseEnter={() => setActiveChart(key)}
                onMouseLeave={() => setActiveChart(undefined)}
              >
                {!hideIcon && (
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: chart.color,
                    }}
                  />
                )}
                <span className="text-xs" style={{ color }}>
                  {chart.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
      {...props}
    />
  )
})
ChartLegend.displayName = Legend.displayName

// Chart Tooltip
export type ChartConfig = {
  [k in string]: {
    label: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  )
}

type ChartTooltipContentProps = React.ComponentProps<"div"> & {
  config?: ChartConfig
  indicator?: "line" | "dot" | "dashed"
  hideLabel?: boolean
  hideIndicator?: boolean
  name?: string
  label?: string
  color?: string
  payload?: unknown[]
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      className,
      config,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      name,
      label,
      color,
      payload,
      ...props
    },
    ref
  ) => {
    const { activeChart } = useChart()
    const item = payload?.[0]

    if (!item) {
      return null
    }

    const key = `${item.dataKey}` as keyof typeof config
    const chart = config?.[key]

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
        {...props}
      >
        {!hideLabel && (
          <div className="grid gap-1.5">
            <div className="font-semibold capitalize">
              {label || item.name}
            </div>
            {item.payload.date && (
              <div className="text-muted-foreground">
                {item.payload.date}
              </div>
            )}
          </div>
        )}
        <div className="grid gap-1.5">
          <div className="flex items-center gap-2 font-medium leading-none">
            {item.value}
            <span className="text-muted-foreground">{item.unit}</span>
          </div>
        </div>
      </div>
    )
  }
)

export {
  Chart,
  ChartContainer,
  ChartContext,
  ChartLegend,
  ChartTooltip,
  useChart,
  ChartTooltipContent,
}