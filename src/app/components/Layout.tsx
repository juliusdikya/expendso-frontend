import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router";
import {
  LayoutDashboard,
  BarChart2,
  Wallet,
  Menu,
  X,
  User,
  Leaf,
  Receipt,
} from "lucide-react";
import { AddExpenseModal } from "./AddExpenseModal";
import type { Transaction } from "../store/expenseStore";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/wallets", label: "Wallets", icon: Wallet },
];

interface LayoutContextValue {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

import React from "react";
import { api } from "../../api/client";

export const LayoutContext = React.createContext<LayoutContextValue>({
  transactions: [],
  setTransactions: () => { },
});

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api("/expenses");
        const mapped = res.map((t: any) => ({
          ...t,
          notes: t.note || "",
          type: t.type || "expense",
          category: t.category ? t.category.charAt(0).toUpperCase() + t.category.slice(1) : "Other",
          walletId: t.wallet_id || t.walletId,
        }));
        setTransactions(mapped);
      } catch (err) {
        console.error("Failed to load transactions", err);
      }
    };
    fetchTransactions();
  }, []);
  const location = useLocation();

  const pageTitle =
    NAV_ITEMS.find((n) => n.to === location.pathname)?.label ?? "Dashboard";

  return (
    <LayoutContext.Provider value={{ transactions, setTransactions }}>
      <div className="flex h-screen bg-[#F4F6F9] overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-white z-30 flex flex-col shadow-xl transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:shadow-none`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-[#22C55E] flex items-center justify-center shadow-sm">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="text-[#1F2937]" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
              SpendSmart
            </span>
            <button
              className="ml-auto lg:hidden text-gray-400 hover:text-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1 px-4 py-6 flex-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 group
                  ${isActive
                    ? "bg-[#DCFCE7] text-[#16A34A]"
                    : "text-[#6B7280] hover:bg-gray-50 hover:text-[#1F2937]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} className={isActive ? "text-[#16A34A]" : "text-[#9CA3AF] group-hover:text-[#4B5563]"} />
                    <span style={{ fontWeight: isActive ? 600 : 500, fontSize: "0.92rem" }}>
                      {label}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User profile */}
          <div className="px-4 pb-6">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F9FAFB] border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
                <User size={16} className="text-[#16A34A]" />
              </div>
              <div>
                <p className="text-[#1F2937]" style={{ fontWeight: 600, fontSize: "0.82rem" }}>Alex Johnson</p>
                <p className="text-[#9CA3AF]" style={{ fontSize: "0.72rem" }}>Personal</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
          <header className="flex items-center gap-4 px-4 sm:px-8 py-4 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
            <button
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-[#1F2937]" style={{ fontWeight: 700, fontSize: "1.15rem" }}>
              {pageTitle}
            </h1>
            <div className="ml-auto flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#22C55E]/20 flex items-center justify-center lg:hidden">
                <User size={15} className="text-[#16A34A]" />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 relative">
            <Outlet context={{ transactions, setTransactions }} />

            {/* FAB */}
            <button
              onClick={() => setShowAddExpense(true)}
              className="fixed bottom-8 right-6 sm:right-10 flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white px-5 py-3.5 rounded-2xl shadow-lg shadow-green-200 transition-all duration-200 active:scale-95 z-10"
              style={{ fontWeight: 600, fontSize: "0.9rem" }}
            >
              <span className="text-lg leading-none">+</span>
              Add Transactions
            </button>
          </main>
        </div>
      </div>

      {showAddExpense && (
        <AddExpenseModal
          onClose={() => setShowAddExpense(false)}
          onSave={(tx) => {
            setTransactions((prev) => [tx, ...prev]);
            setShowAddExpense(false);
          }}
        />
      )}
    </LayoutContext.Provider>
  );
}
