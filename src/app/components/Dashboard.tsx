import { useContext, useState, useEffect } from "react";
import { api } from "../../api/client";
import { TrendingDown, TrendingUp, ArrowRight } from "lucide-react";
import { LayoutContext } from "./Layout";
import { CATEGORY_META, MONTHS } from "../store/expenseStore";
import type { Category } from "../store/expenseStore";

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function Dashboard() {
  const { transactions } = useContext(LayoutContext);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await api("/wallets");
        const total = res.reduce((s: number, w: any) => s + w.balance, 0);
        setBalance(total);
      } catch (err) {
        console.error("Failed to load wallets", err);
      }
    };
    fetchBalance();
  }, [transactions]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTx = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const monthlySpending = monthlyTx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  // Category breakdown (monthly expenses)
  const catMap: Partial<Record<Category, number>> = {};
  monthlyTx
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      catMap[t.category] = (catMap[t.category] ?? 0) + t.amount;
    });
  const categories = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) as [Category, number][];

  const recentTx = [...transactions].slice(0, 6);

  return (
    <div className="pb-28 flex flex-col gap-5 max-w-3xl mx-auto">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Balance */}
        <div className="sm:col-span-2 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] p-6 text-white shadow-md shadow-green-200 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white/10" />
          <p className="text-white/80 mb-1 relative z-10" style={{ fontWeight: 500, fontSize: "0.82rem" }}>
            Total Balance
          </p>
          <p className="text-white relative z-10" style={{ fontWeight: 800, fontSize: "2rem" }}>
            {formatRp(balance)}
          </p>
          <p className="text-white/70 mt-1 relative z-10" style={{ fontSize: "0.75rem" }}>
            {MONTHS[currentMonth]} {currentYear}
          </p>
        </div>

        {/* Income */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] flex items-center justify-center">
              <TrendingUp size={15} className="text-[#22C55E]" />
            </div>
            <span className="text-[#6B7280]" style={{ fontWeight: 500, fontSize: "0.8rem" }}>Total Income</span>
          </div>
          <p className="text-[#1F2937]" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            {formatRp(totalIncome)}
          </p>
        </div>

        {/* Monthly spending */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-[#FEE2E2] flex items-center justify-center">
              <TrendingDown size={15} className="text-[#EF4444]" />
            </div>
            <span className="text-[#6B7280]" style={{ fontWeight: 500, fontSize: "0.8rem" }}>This Month</span>
          </div>
          <p className="text-[#1F2937]" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
            {formatRp(monthlySpending)}
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#1F2937]" style={{ fontWeight: 700, fontSize: "0.95rem" }}>
            Categories
          </h2>
          <button className="flex items-center gap-1 text-[#22C55E]" style={{ fontWeight: 500, fontSize: "0.8rem" }}>
            See all <ArrowRight size={14} />
          </button>
        </div>
        {categories.length === 0 ? (
          <p className="text-[#9CA3AF] text-center py-4" style={{ fontSize: "0.85rem" }}>
            No expenses this month
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {categories.map(([cat, amount]) => {
              const meta = CATEGORY_META[cat];
              const pct = monthlySpending > 0 ? (amount / monthlySpending) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                      style={{ background: meta.bg }}
                    >
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#374151]" style={{ fontWeight: 500, fontSize: "0.85rem" }}>
                          {cat}
                        </span>
                        <span className="text-[#1F2937]" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                          {formatRp(amount)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: meta.color }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#1F2937]" style={{ fontWeight: 700, fontSize: "0.95rem" }}>
            Recent Transactions
          </h2>
          <span className="text-[#9CA3AF]" style={{ fontSize: "0.78rem" }}>
            {recentTx.length} records
          </span>
        </div>
        {recentTx.length === 0 ? (
          <p className="text-[#9CA3AF] text-center py-4" style={{ fontSize: "0.85rem" }}>
            No transactions yet
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {recentTx.map((tx, i) => {
              const meta = CATEGORY_META[tx.category];
              return (
                <div key={tx.id}>
                  <div className="flex items-center gap-3 py-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                      style={{ background: meta.bg }}
                    >
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#374151] truncate" style={{ fontWeight: 500, fontSize: "0.88rem" }}>
                        {tx.notes || tx.category}
                      </p>
                      <p className="text-[#9CA3AF]" style={{ fontSize: "0.75rem" }}>
                        {formatDate(tx.date)} · {tx.category}
                      </p>
                    </div>
                    <span
                      style={{ fontWeight: 700, fontSize: "0.9rem", color: tx.type === "income" ? "#22C55E" : "#EF4444" }}
                    >
                      {tx.type === "income" ? "+" : "-"}{formatRp(tx.amount)}
                    </span>
                  </div>
                  {i < recentTx.length - 1 && <div className="h-px bg-gray-50 ml-12" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
