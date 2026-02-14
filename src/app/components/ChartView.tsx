import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { type ColumnDef } from "../services/geotab-mock";
import { BarChart3, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";

const CHART_COLORS = [
  "#003a63",
  "#78be20",
  "#0077b6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export type ChartType = "bar" | "line" | "pie";

interface ChartViewProps {
  data: Record<string, unknown>[];
  columns: ColumnDef[];
  chartType: ChartType;
  groupByColumn: string | null;
  aggregateColumn: string | null;
  aggregateFn: "sum" | "avg" | "count" | "min" | "max";
}

function aggregate(values: number[], fn: string): number {
  if (values.length === 0) return 0;
  switch (fn) {
    case "sum":
      return values.reduce((a, b) => a + b, 0);
    case "avg":
      return values.reduce((a, b) => a + b, 0) / values.length;
    case "count":
      return values.length;
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
    default:
      return values.reduce((a, b) => a + b, 0);
  }
}

export function ChartView({
  data,
  columns,
  chartType,
  groupByColumn,
  aggregateColumn,
  aggregateFn,
}: ChartViewProps) {
  if (!groupByColumn || !aggregateColumn || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-48 border border-dashed border-[#e2e8f0] rounded-xl bg-white"
      >
        <div className="text-center max-w-xs">
          <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center mx-auto mb-3">
            <SlidersHorizontal className="w-5 h-5 text-[#94a3b8]" />
          </div>
          <p className="text-[13px] text-[#64748b]" style={{ fontWeight: 500 }}>
            Configure summarization
          </p>
          <p className="text-[12px] text-[#94a3b8] mt-1 leading-relaxed">
            Set <span style={{ fontWeight: 500 }} className="text-[#64748b]">Group by</span> and{" "}
            <span style={{ fontWeight: 500 }} className="text-[#64748b]">Measure</span> in the
            Summarize panel to generate a chart.
          </p>
        </div>
      </motion.div>
    );
  }

  // Aggregate data by group
  const groupedMap = new Map<string, number[]>();
  data.forEach((row) => {
    const groupVal = String(row[groupByColumn] || "Unknown");
    const aggVal = Number(row[aggregateColumn]) || 0;
    if (!groupedMap.has(groupVal)) {
      groupedMap.set(groupVal, []);
    }
    groupedMap.get(groupVal)!.push(aggVal);
  });

  const aggCol = columns.find((c) => c.key === aggregateColumn);
  const groupCol = columns.find((c) => c.key === groupByColumn);
  const aggLabel = aggCol?.label || aggregateColumn;
  const groupLabel = groupCol?.label || groupByColumn;
  const fnLabel = aggregateFn.charAt(0).toUpperCase() + aggregateFn.slice(1);

  const chartData = Array.from(groupedMap.entries())
    .map(([name, values]) => ({
      name: name.length > 18 ? name.substring(0, 18) + "..." : name,
      value: Math.round(aggregate(values, aggregateFn) * 100) / 100,
      count: values.length,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);

  const chartTitle = `${fnLabel} of ${aggLabel} by ${groupLabel}`;

  const tooltipStyle = {
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "12px",
    boxShadow: "0 4px 12px -2px rgba(0,0,0,0.08)",
    padding: "8px 12px",
  };

  if (chartType === "bar") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm shadow-[#003a63]/[0.03]"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-3.5 h-3.5 text-[#94a3b8]" />
          <p
            className="text-[13px] text-[#003a63]"
            style={{ fontWeight: 500 }}
          >
            {chartTitle}
          </p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  if (chartType === "line") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm shadow-[#003a63]/[0.03]"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-3.5 h-3.5 text-[#94a3b8]" />
          <p
            className="text-[13px] text-[#003a63]"
            style={{ fontWeight: 500 }}
          >
            {chartTitle}
          </p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#003a63" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#003a63" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#003a63"
              strokeWidth={2}
              fill="url(#lineGradient)"
              dot={{ fill: "#003a63", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#78be20", stroke: "#003a63", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  if (chartType === "pie") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm shadow-[#003a63]/[0.03]"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-3.5 h-3.5 text-[#94a3b8]" />
          <p
            className="text-[13px] text-[#003a63]"
            style={{ fontWeight: 500 }}
          >
            {chartTitle}
          </p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend
              wrapperStyle={{ fontSize: "11px" }}
              formatter={(value) => (
                <span style={{ color: "#334155" }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  return null;
}
