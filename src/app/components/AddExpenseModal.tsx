import { useState, useEffect } from "react";
import { X, DollarSign, Tag, Calendar, FileText, Wallet as WalletIcon } from "lucide-react";
import type { Transaction, Category, Wallet } from "../store/expenseStore";
import { CATEGORY_META } from "../store/expenseStore";
import { api } from "../../api/client";

interface Props {
  onClose: () => void;
  onSave: (tx: Transaction) => void;
}

const EXPENSE_CATEGORIES: Category[] = [
  "Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other",
];

const INCOME_CATEGORIES: Category[] = [
  "Salary", "Freelance", "Bonus", "Investment", "Gift", "Other",
];

export function AddExpenseModal({ onClose, onSave }: Props) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [errors, setErrors] = useState<{ amount?: string }>({});
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletId, setWalletId] = useState<number>();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await api("/wallets");
        setWallets(res);
        if (res.length > 0) {
          setWalletId(res[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch wallets", err);
      }
    };
    fetchWallets();
  }, []);

  const validate = () => {
    const e: { amount?: string } = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      e.amount = "Please enter a valid amount";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!walletId) {
      alert("Please select a wallet first");
      return;
    }

    setIsSaving(true);
    try {
      await api("/expenses", "POST", {
        wallet_id: walletId,
        amount: Number(amount),
        category: category.toLowerCase(),
        type: type,
        note: notes,
        date: date,
      });

      onSave({
        id: Math.random().toString(36).slice(2, 9),
        amount: Number(amount),
        category,
        date,
        notes,
        type,
        walletId,
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-[#1F2937]" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
              Add Transaction
            </h2>
            <p className="text-[#9CA3AF]" style={{ fontSize: "0.8rem" }}>
              Record your income or expense
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Type toggle */}
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setCategory(t === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
                }}
                className={`flex-1 py-2 rounded-lg transition-all duration-200 capitalize
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

          {/* Amount */}
          <div>
            <label className="block text-[#6B7280] mb-1.5" style={{ fontWeight: 500, fontSize: "0.82rem" }}>
              Amount (Rp)
            </label>
            <div className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 transition-colors
              ${errors.amount ? "border-red-300 bg-red-50" : "border-gray-200 focus-within:border-[#22C55E] bg-gray-50"}`}>
              <DollarSign size={16} className="text-[#9CA3AF] flex-shrink-0" />
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors({}); }}
                className="flex-1 bg-transparent outline-none text-[#1F2937] placeholder:text-gray-300"
                style={{ fontWeight: 600, fontSize: "1rem" }}
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 mt-1" style={{ fontSize: "0.75rem" }}>{errors.amount}</p>
            )}
          </div>

          {/* Wallet */}
          <div>
            <label className="block text-[#6B7280] mb-1.5" style={{ fontWeight: 500, fontSize: "0.82rem" }}>
              Wallet
            </label>
            <div className="flex items-center gap-3 border-2 border-gray-200 focus-within:border-[#22C55E] rounded-xl px-4 py-3 bg-gray-50 transition-colors">
              <WalletIcon size={16} className="text-[#9CA3AF] flex-shrink-0" />
              <select
                value={walletId || ""}
                onChange={(e) => setWalletId(Number(e.target.value))}
                className="flex-1 bg-transparent outline-none text-[#1F2937] cursor-pointer"
                style={{ fontWeight: 500, fontSize: "0.9rem" }}
                disabled={wallets.length === 0}
              >
                {wallets.length === 0 ? (
                  <option value="" disabled>No wallets available</option>
                ) : (
                  wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Rp {w.balance.toLocaleString("id-ID")})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[#6B7280] mb-1.5" style={{ fontWeight: 500, fontSize: "0.82rem" }}>
              Category
            </label>
            <div className="flex items-center gap-3 border-2 border-gray-200 focus-within:border-[#22C55E] rounded-xl px-4 py-3 bg-gray-50 transition-colors">
              <Tag size={16} className="text-[#9CA3AF] flex-shrink-0" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="flex-1 bg-transparent outline-none text-[#1F2937] cursor-pointer"
                style={{ fontWeight: 500, fontSize: "0.9rem" }}
              >
                { (type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_META[c].icon} {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[#6B7280] mb-1.5" style={{ fontWeight: 500, fontSize: "0.82rem" }}>
              Date
            </label>
            <div className="flex items-center gap-3 border-2 border-gray-200 focus-within:border-[#22C55E] rounded-xl px-4 py-3 bg-gray-50 transition-colors">
              <Calendar size={16} className="text-[#9CA3AF] flex-shrink-0" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[#1F2937] cursor-pointer"
                style={{ fontWeight: 500, fontSize: "0.9rem" }}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[#6B7280] mb-1.5" style={{ fontWeight: 500, fontSize: "0.82rem" }}>
              Notes <span className="text-gray-300">(optional)</span>
            </label>
            <div className="flex items-start gap-3 border-2 border-gray-200 focus-within:border-[#22C55E] rounded-xl px-4 py-3 bg-gray-50 transition-colors">
              <FileText size={16} className="text-[#9CA3AF] flex-shrink-0 mt-0.5" />
              <textarea
                placeholder="Add a note..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="flex-1 bg-transparent outline-none text-[#1F2937] placeholder:text-gray-300 resize-none"
                style={{ fontWeight: 400, fontSize: "0.9rem" }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-[#6B7280] hover:bg-gray-50 transition-colors"
            style={{ fontWeight: 600, fontSize: "0.9rem" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-md shadow-green-200 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            style={{ fontWeight: 600, fontSize: "0.9rem" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
