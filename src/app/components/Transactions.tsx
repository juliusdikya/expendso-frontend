import { useContext, useState, useEffect } from "react";
import { LayoutContext } from "./Layout";
import { CATEGORY_META, MONTHS } from "../store/expenseStore";
import type { Transaction, WalletUI } from "../store/expenseStore";
import { TrendingUp, TrendingDown, Search, X } from "lucide-react";
import { api } from "../../api/client";

function formatRp(n: number) {
    return "Rp " + n.toLocaleString("id-ID");
}

function formatDateLabel(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    if (isSameDay(d, today)) return "Today";
    if (isSameDay(d, yesterday)) return "Yesterday";

    return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
}

function groupByDate(txs: Transaction[]) {
    const map: Record<string, Transaction[]> = {};

    // Sort transactions by date descending before grouping
    const sortedTxs = [...txs].sort((a, b) => {
        const dateDesc = b.date.localeCompare(a.date);
        if (dateDesc !== 0) return dateDesc;

        const aTime = (a as any).created_at ? new Date((a as any).created_at).getTime() : 0;
        const bTime = (b as any).created_at ? new Date((b as any).created_at).getTime() : 0;

        if (aTime !== bTime) {
            return bTime - aTime;
        }

        // Fallback to numeric ID sort if it's a number, otherwise return 0 to maintain array order
        const aIdNum = Number(a.id);
        const bIdNum = Number(b.id);
        if (!isNaN(aIdNum) && !isNaN(bIdNum)) {
            return bIdNum - aIdNum;
        }

        return 0;
    });

    sortedTxs.forEach((tx) => {
        if (!map[tx.date]) map[tx.date] = [];
        map[tx.date].push(tx);
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
}

// ─── Wallet Tab Header ─────────────────────────────────────────────

function WalletTabSummary({ wallet, txs }: { wallet: WalletUI; txs: Transaction[] }) {
    const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return (
        <div
            className="rounded-2xl p-4 mb-4 flex items-center gap-4"
            style={{ background: `linear-gradient(135deg, ${wallet.color}18, ${wallet.color}08)`, border: `1px solid ${wallet.color}25` }}
        >
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                {wallet.icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[#1F2937]" style={{ fontWeight: 700, fontSize: "0.92rem" }}>{wallet.name}</p>
                <p className="text-[#9CA3AF]" style={{ fontSize: "0.72rem" }}>{txs.length} transaction{txs.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex flex-col items-end gap-0.5">
                {income > 0 && (
                    <span className="text-[#22C55E]" style={{ fontWeight: 600, fontSize: "0.78rem" }}>
                        +{formatRp(income)}
                    </span>
                )}
                {expense > 0 && (
                    <span className="text-[#EF4444]" style={{ fontWeight: 600, fontSize: "0.78rem" }}>
                        -{formatRp(expense)}
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Transaction Group (by date) ──────────────────────────────────

function DateGroup({ date, txs }: { date: string; txs: Transaction[] }) {
    const dayTotal = txs.reduce(
        (s, t) => s + (t.type === "income" ? t.amount : -t.amount),
        0
    );

    return (
        <div className="mb-4">
            {/* Date header */}
            <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[#6B7280]" style={{ fontWeight: 600, fontSize: "0.78rem" }}>
                    {formatDateLabel(date)}
                </span>
                <span
                    style={{
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        color: dayTotal >= 0 ? "#22C55E" : "#EF4444",
                    }}
                >
                    {dayTotal >= 0 ? "+" : ""}{formatRp(dayTotal)}
                </span>
            </div>

            {/* Transaction rows */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {txs.map((tx, i) => {
                    const meta = CATEGORY_META[tx.category];
                    return (
                        <div key={tx.id}>
                            <div className="flex items-center gap-3 px-4 py-3">
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                                    style={{ background: meta.bg }}
                                >
                                    {meta.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[#374151] truncate" style={{ fontWeight: 500, fontSize: "0.88rem" }}>
                                        {tx.notes || tx.category}
                                    </p>
                                    <p className="text-[#9CA3AF]" style={{ fontSize: "0.72rem" }}>
                                        {tx.category}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                    <span
                                        style={{
                                            fontWeight: 700,
                                            fontSize: "0.88rem",
                                            color: tx.type === "income" ? "#22C55E" : "#EF4444",
                                        }}
                                    >
                                        {tx.type === "income" ? "+" : "-"}{formatRp(tx.amount)}
                                    </span>
                                    {/* <div className="flex items-center gap-1">
                                        <span className="text-[#9CA3AF]" style={{ fontSize: "0.65rem" }}>
                                            {(() => {
                                                const rawTime = (tx as any).created_at;
                                                if (!rawTime) return "";
                                                return new Date(rawTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                            })()}
                                        </span>
                                    </div> */}
                                </div>
                            </div>
                            {i < txs.length - 1 && <div className="h-px bg-gray-50 ml-16" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Main Expenses Page ────────────────────────────────────────────

const WALLET_ICONS = [
    { icon: "💳", label: "Card" },
    { icon: "📱", label: "E-Wallet" },
    { icon: "🏦", label: "Bank" },
    { icon: "💰", label: "Cash" },
    { icon: "💵", label: "Savings" },
    { icon: "🏧", label: "ATM" },
];

const WALLET_COLORS = [
    "#22C55E", "#3B82F6", "#A855F7", "#F97316", "#EC4899", "#EAB308",
];

export function Transactions() {
    const { transactions } = useContext(LayoutContext);
    const [wallets, setWallets] = useState<WalletUI[]>([]);
    const [activeTab, setActiveTab] = useState<string | number>("all");
    const [search, setSearch] = useState("");

    const [filterMonth, setFilterMonth] = useState<number | "all">(new Date().getMonth());

    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const res = await api("/wallets");
                const mapped = res.map((w: any, i: number) => ({
                    ...w,
                    color: WALLET_COLORS[i % WALLET_COLORS.length],
                    icon: WALLET_ICONS[i % WALLET_ICONS.length].icon,
                }));
                setWallets(mapped);
            } catch (err) {
                console.error("Failed to load wallets", err);
            }
        };
        fetchWallets();
    }, []);

    // Filter by search + month
    const baseFiltered = transactions.filter((tx) => {
        const matchesSearch =
            search === "" ||
            (tx.notes && tx.notes.toLowerCase().includes(search.toLowerCase())) ||
            (tx.category && tx.category.toLowerCase().includes(search.toLowerCase()));

        const matchesMonth =
            filterMonth === "all" ||
            new Date(tx.date).getMonth() === filterMonth;

        return matchesSearch && matchesMonth;
    });

    const filtered = baseFiltered.filter((tx) => activeTab === "all" || tx.walletId === activeTab);

    // Group by date
    const groups = groupByDate(filtered);

    // Summary for "all" tab
    const allIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const allExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    const activeWallet = wallets.find((w) => w.id === activeTab);
    const activeWalletTxs = activeTab === "all" ? filtered : filtered.filter((t) => t.walletId === activeTab);

    return (
        <div className="pb-28 flex flex-col gap-4 max-w-3xl mx-auto">
            {/* Search + Month Filter */}
            <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm focus-within:border-[#22C55E] transition-colors">
                    <Search size={15} className="text-[#9CA3AF] flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-[#374151] placeholder:text-gray-300"
                        style={{ fontWeight: 400, fontSize: "0.85rem" }}
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="text-[#9CA3AF] hover:text-[#6B7280]">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <select
                    value={filterMonth === "all" ? "all" : String(filterMonth)}
                    onChange={(e) => setFilterMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
                    className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm outline-none text-[#374151] cursor-pointer"
                    style={{ fontWeight: 500, fontSize: "0.82rem" }}
                >
                    <option value="all">All months</option>
                    {MONTHS.map((m, i) => (
                        <option key={m} value={i}>{m}</option>
                    ))}
                </select>
            </div>

            {/* Wallet tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                    onClick={() => setActiveTab("all")}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all
            ${activeTab === "all"
                            ? "bg-[#22C55E] text-white shadow-sm shadow-green-200"
                            : "bg-white border border-gray-200 text-[#6B7280] hover:bg-gray-50"
                        }`}
                    style={{ fontWeight: 600, fontSize: "0.82rem" }}
                >
                    🗂️ All
                    <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === "all" ? "bg-white/25 text-white" : "bg-gray-100 text-[#9CA3AF]"}`}
                    >
                        {baseFiltered.length}
                    </span>
                </button>

                {wallets.map((wallet) => {
                    const count = baseFiltered.filter((t) => t.walletId === wallet.id).length;
                    const isActive = activeTab === wallet.id;
                    return (
                        <button
                            key={wallet.id}
                            onClick={() => setActiveTab(wallet.id)}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all border
                ${isActive ? "text-white shadow-sm" : "bg-white text-[#6B7280] hover:bg-gray-50 border-gray-200"}`}
                            style={{
                                fontWeight: 600,
                                fontSize: "0.82rem",
                                background: isActive ? wallet.color : undefined,
                                borderColor: isActive ? wallet.color : undefined,
                                boxShadow: isActive ? `0 2px 8px ${wallet.color}40` : undefined,
                            }}
                        >
                            {wallet.icon} {wallet.name}
                            <span
                                className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/25 text-white" : "bg-gray-100 text-[#9CA3AF]"}`}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] flex items-center justify-center flex-shrink-0">
                        <TrendingUp size={14} className="text-[#22C55E]" />
                    </div>
                    <div>
                        <p className="text-[#9CA3AF]" style={{ fontWeight: 500, fontSize: "0.7rem" }}>Income</p>
                        <p className="text-[#22C55E]" style={{ fontWeight: 700, fontSize: "0.88rem" }}>+{formatRp(allIncome)}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
                        <TrendingDown size={14} className="text-[#EF4444]" />
                    </div>
                    <div>
                        <p className="text-[#9CA3AF]" style={{ fontWeight: 500, fontSize: "0.7rem" }}>Expenses</p>
                        <p className="text-[#EF4444]" style={{ fontWeight: 700, fontSize: "0.88rem" }}>-{formatRp(allExpense)}</p>
                    </div>
                </div>
            </div>

            {/* Transaction list grouped by date */}
            {groups.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center py-16 gap-3 text-center">
                    <span className="text-4xl">🔍</span>
                    <p className="text-[#374151]" style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                        No transactions found
                    </p>
                    <p className="text-[#9CA3AF]" style={{ fontSize: "0.82rem" }}>
                        {search ? "Try a different search term" : "Add your first expense using the button below"}
                    </p>
                </div>
            ) : (
                groups.map(([date, txs]) => (
                    <DateGroup key={date} date={date} txs={txs} />
                ))
            )}
        </div>
    );
}
