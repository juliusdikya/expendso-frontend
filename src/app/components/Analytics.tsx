import { useContext, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LayoutContext } from "./Layout";
import { CATEGORY_META, MONTHS } from "../store/expenseStore";
import type { Category } from "../store/expenseStore";
import { Trophy, TrendingDown, ChevronDown } from "lucide-react";

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    const meta = CATEGORY_META[name as Category];
    return (
      <div className="bg-white rounded-xl shadow-lg px-4 py-3 border border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <span>{meta?.icon}</span>
          <span className="text-[#374151]" style={{ fontWeight: 600, fontSize: "0.85rem" }}>{name}</span>
        </div>
        <p className="text-[#1F2937]" style={{ fontWeight: 700, fontSize: "0.95rem" }}>{formatRp(value)}</p>
      </div>
    );
  }
  return null;
};

export function Analytics() {
  const { transactions } = useContext(LayoutContext);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear] = useState(now.getFullYear());
  const [type, setType] = useState<"expense" | "income">("expense");

  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    return (
      t.type === type &&
      d.getMonth() === selectedMonth &&
      d.getFullYear() === selectedYear
    );
  });

  const catMap: Partial<Record<Category, number>> = {};
  filtered.forEach((t) => {
    catMap[t.category] = (catMap[t.category] ?? 0) + t.amount;
  });
  const chartData = Object.entries(catMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value) as { name: Category; value: number }[];

  const totalSpending = chartData.reduce((s, d) => s + d.value, 0);
  const topCategory = chartData[0];

  return (
    <div className="pb-28 flex flex-col gap-5 max-w-3xl mx-auto">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
            <span className="text-[#6B7280]" style={{ fontWeight: 500, fontSize: "0.82rem" }}>
              Month:
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="outline-none bg-transparent text-[#1F2937] pr-6 appearance-none cursor-pointer"
              style={{ fontWeight: 600, fontSize: "0.88rem" }}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 text-[#9CA3AF] pointer-events-none" />
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
            <span className="text-[#1F2937]" style={{ fontWeight: 600, fontSize: "0.88rem" }}>{selectedYear}</span>
          </div>
        </div>

        {/* Type toggle */}
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1 w-full sm:w-auto">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 sm:px-6 py-1.5 rounded-lg transition-all duration-200 capitalize
                ${type === t
                  ? t === "expense"
                    ? "bg-white text-[#EF4444] shadow-sm"
                    : "bg-white text-[#22C55E] shadow-sm"
                  : "text-[#9CA3AF]"
                }`}
              style={{ fontWeight: 600, fontSize: "0.85rem" }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <div className={`w-8 h-8 rounded-xl ${type === "expense" ? "bg-[#FEE2E2]" : "bg-[#DCFCE7]"} flex items-center justify-center mb-3`}>
            <TrendingDown size={15} className={type === "expense" ? "text-[#EF4444]" : "text-[#22C55E]"} style={{ transform: type === "income" ? "scaleY(-1)" : "none" }} />
          </div>
          <p className="text-[#6B7280] mb-1" style={{ fontWeight: 500, fontSize: "0.78rem" }}>{type === "expense" ? "Total Spending" : "Total Income"}</p>
          <p className="text-[#1F2937]" style={{ fontWeight: 700, fontSize: "1rem" }}>{formatRp(totalSpending)}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-[#FEF9C3] flex items-center justify-center mb-3">
            <Trophy size={15} className="text-[#CA8A04]" />
          </div>
          <p className="text-[#6B7280] mb-1" style={{ fontWeight: 500, fontSize: "0.78rem" }}>Categories</p>
          <p className="text-[#1F2937]" style={{ fontWeight: 700, fontSize: "1rem" }}>{chartData.length}</p>
        </div>
      </div>

      {/* Pie chart */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
        <h2 className="text-[#1F2937] mb-4" style={{ fontWeight: 700, fontSize: "0.95rem" }}>
          {type === "expense" ? "Spending by Category" : "Income by Category"}
        </h2>
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#9CA3AF]">
            <span className="text-4xl mb-3">📊</span>
            <p style={{ fontSize: "0.88rem" }}>No {type} data for this month</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={CATEGORY_META[entry.name]?.color ?? "#9CA3AF"}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
              {chartData.map((entry) => {
                const meta = CATEGORY_META[entry.name];
                return (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: meta?.color ?? "#9CA3AF" }}
                    />
                    <span style={{ color: "#6B7280", fontWeight: 500, fontSize: "0.78rem" }}>
                      {meta?.icon} {entry.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Top spending category */}
      {topCategory && (
        <div
          className="rounded-2xl p-5 border flex items-center gap-4"
          style={{
            background: CATEGORY_META[topCategory.name]?.bg ?? "#F9FAFB",
            borderColor: CATEGORY_META[topCategory.name]?.color + "33",
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
            style={{ background: "white" }}
          >
            {CATEGORY_META[topCategory.name]?.icon}
          </div>
          <div className="flex-1">
            <p className="text-[#6B7280]" style={{ fontWeight: 500, fontSize: "0.78rem" }}>
              {type === "expense" ? "Top Spending Category" : "Top Income Category"}
            </p>
            <p className="text-[#1F2937]" style={{ fontWeight: 700, fontSize: "1.05rem" }}>
              {topCategory.name}
            </p>
            <p style={{ fontWeight: 600, fontSize: "0.85rem", color: CATEGORY_META[topCategory.name]?.color }}>
              {formatRp(topCategory.value)}{" "}
              <span className="text-[#9CA3AF]" style={{ fontWeight: 400 }}>
                ({totalSpending > 0 ? ((topCategory.value / totalSpending) * 100).toFixed(1) : 0}% of total)
              </span>
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1">
              <Trophy size={14} className="text-amber-500" />
            </div>
          </div>
        </div>
      )}

      {/* Category breakdown list */}
      {chartData.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <h2 className="text-[#1F2937] mb-4" style={{ fontWeight: 700, fontSize: "0.95rem" }}>
            Breakdown
          </h2>
          <div className="flex flex-col gap-3">
            {chartData.map(({ name, value }, i) => {
              const meta = CATEGORY_META[name];
              const pct = totalSpending > 0 ? (value / totalSpending) * 100 : 0;
              return (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-[#9CA3AF] w-4 text-right flex-shrink-0" style={{ fontWeight: 600, fontSize: "0.78rem" }}>
                    #{i + 1}
                  </span>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                    style={{ background: meta.bg }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#374151]" style={{ fontWeight: 500, fontSize: "0.85rem" }}>{name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#9CA3AF]" style={{ fontSize: "0.75rem" }}>{pct.toFixed(1)}%</span>
                        <span className="text-[#1F2937]" style={{ fontWeight: 600, fontSize: "0.85rem" }}>{formatRp(value)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: meta.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}