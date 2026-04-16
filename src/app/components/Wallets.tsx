import { useState, useEffect } from "react";
import { Plus, ArrowUpCircle, X, Check } from "lucide-react";
import type { Wallet } from "../store/expenseStore";
import { api } from "../../api/client";


type WalletUI = Wallet & {
  color: string;
  icon: string;
};

function formatRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

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

// ─── Add Wallet Modal ────────────────────────────────────────────────────────

type CreateWalletInput = {
  name: string;
  balance: number;
};

interface AddWalletModalProps {
  onClose: () => void;
  onSave: (w: CreateWalletInput) => void;
}

function AddWalletModal({ onClose, onSave }: AddWalletModalProps) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState(WALLET_COLORS[0]);
  const [icon, setIcon] = useState(WALLET_ICONS[0].icon);
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!name.trim()) { setError("Please enter a wallet name"); return; }
    if (!balance || isNaN(Number(balance)) || Number(balance) < 0) {
      setError("Please enter a valid balance"); return;
    }
    onSave({
      name: name.trim(),
      balance: Number(balance),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-[#1F2937]" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Add Wallet</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Preview card */}
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: color + "18" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm bg-white">
              {icon}
            </div>
            <div>
              <p className="text-[#1F2937]" style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                {name || "Wallet Name"}
              </p>
              <p style={{ fontWeight: 600, fontSize: "0.82rem", color }}>
                {balance ? formatRp(Number(balance)) : "Rp 0"}
              </p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[#6B7280] mb-1.5" style={{ fontWeight: 500, fontSize: "0.8rem" }}>
              Wallet Name
            </label>
            <input
              type="text"
              placeholder="e.g. Main Wallet"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              className="w-full border-2 border-gray-200 focus:border-[#22C55E] rounded-xl px-4 py-3 outline-none text-[#1F2937] bg-gray-50 transition-colors"
              style={{ fontWeight: 500, fontSize: "0.9rem" }}
            />
          </div>

          {/* Balance */}
          <div>
            <label className="block text-[#6B7280] mb-1.5" style={{ fontWeight: 500, fontSize: "0.8rem" }}>
              Initial Balance (Rp)
            </label>
            <input
              type="number"
              placeholder="0"
              value={balance}
              onChange={(e) => { setBalance(e.target.value); setError(""); }}
              className="w-full border-2 border-gray-200 focus:border-[#22C55E] rounded-xl px-4 py-3 outline-none text-[#1F2937] bg-gray-50 transition-colors"
              style={{ fontWeight: 700, fontSize: "0.9rem" }}
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-[#6B7280] mb-2" style={{ fontWeight: 500, fontSize: "0.8rem" }}>Icon</label>
            <div className="flex gap-2 flex-wrap">
              {WALLET_ICONS.map((w) => (
                <button
                  key={w.icon}
                  onClick={() => setIcon(w.icon)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all hover:scale-105"
                  style={{
                    background: icon === w.icon ? color + "22" : "#F3F4F6",
                    outline: icon === w.icon ? `2px solid ${color}` : "none",
                    outlineOffset: "1px",
                  }}
                >
                  {w.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-[#6B7280] mb-2" style={{ fontWeight: 500, fontSize: "0.8rem" }}>Color</label>
            <div className="flex gap-2">
              {WALLET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-90"
                  style={{ background: c }}
                >
                  {color === c && <Check size={13} className="text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500" style={{ fontSize: "0.78rem" }}>{error}</p>}
        </div>

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
            className="flex-1 py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-md shadow-green-200 transition-all active:scale-95"
            style={{ fontWeight: 600, fontSize: "0.9rem" }}
          >
            Add Wallet
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Top Up Modal ────────────────────────────────────────────────────────────

interface TopUpModalProps {
  wallet: WalletUI;
  wallets: WalletUI[];
  onClose: () => void;
  onTopUp: (id: number, amount: number) => Promise<void>;
}

function TopUpModal({ wallet, wallets, onClose, onTopUp }: TopUpModalProps) {
  const [amount, setAmount] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState<number>(wallet.id);
  const QUICK = [50000, 100000, 200000, 500000];

  const selectedWallet = wallets.find(w => w.id === selectedWalletId) || wallet;

  const handleConfirm = () => {
    if (amount && Number(amount) > 0) {
      onTopUp(selectedWalletId, Number(amount));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-[#1F2937]" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Top Up</h2>
            <p className="text-[#9CA3AF]" style={{ fontSize: "0.78rem" }}>
              {selectedWallet.icon} {selectedWallet.name} · {formatRp(selectedWallet.balance)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-[#6B7280] mb-1.5" style={{ fontWeight: 500, fontSize: "0.8rem" }}>
              Select Wallet
            </label>
            <div className="flex items-center gap-3 border-2 border-gray-200 focus-within:border-[#22C55E] rounded-xl px-4 py-3 bg-gray-50 transition-colors">
              <span className="text-xl flex-shrink-0">{selectedWallet.icon}</span>
              <select
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(Number(e.target.value))}
                className="flex-1 bg-transparent outline-none text-[#1F2937] cursor-pointer"
                style={{ fontWeight: 500, fontSize: "0.9rem" }}
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[#6B7280] mb-1.5" style={{ fontWeight: 500, fontSize: "0.8rem" }}>
              Amount (Rp)
            </label>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-[#22C55E] rounded-xl px-4 py-3 outline-none text-[#1F2937] bg-gray-50 transition-colors"
              style={{ fontWeight: 700, fontSize: "1.1rem" }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => setAmount(String(q))}
                className="py-2 rounded-xl border border-gray-200 hover:border-[#22C55E] hover:bg-[#F0FDF4] text-[#374151] transition-colors"
                style={{ fontWeight: 500, fontSize: "0.78rem" }}
              >
                +{q >= 1000000 ? `${q / 1000000}M` : `${q / 1000}K`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-[#6B7280] hover:bg-gray-50 transition-colors"
            style={{ fontWeight: 600, fontSize: "0.9rem" }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-md shadow-green-200 transition-all active:scale-95"
            style={{ fontWeight: 600, fontSize: "0.9rem" }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Wallets Page ────────────────────────────────────────────────────────────

export function Wallets() {
  const [wallets, setWallets] = useState<WalletUI[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [topUpWallet, setTopUpWallet] = useState<WalletUI | null>(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const res = await api("/wallets");

      const mapped = res.map((w: Wallet, i: number) => ({
        ...w,
        color: WALLET_COLORS[i % WALLET_COLORS.length],
        icon: WALLET_ICONS[i % WALLET_ICONS.length].icon,
      }));

      setWallets(mapped);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);

  const handleAdd = async (w: CreateWalletInput) => {
    try {
      await api("/wallets", "POST", {
        name: w.name,
        balance: w.balance,
      });

      setShowAdd(false);
      fetchWallets();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTopUp = async (id: number, amount: number) => {
    try {
      await api(`/wallets/${id}/top-up`, "POST", {
        amount: Number(amount),
      });

      setTopUpWallet(null);
      fetchWallets();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="pb-28 flex flex-col gap-5 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-[#6B7280]" style={{ fontWeight: 500, fontSize: "0.8rem" }}>
              Total Balance
            </p>
            <p className="text-[#1F2937]" style={{ fontWeight: 800, fontSize: "1.5rem" }}>
              {formatRp(totalBalance)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 py-2.5 rounded-xl shadow-sm shadow-green-200 transition-all active:scale-95"
              style={{ fontWeight: 600, fontSize: "0.82rem" }}
            >
              <Plus size={15} />
              Add Wallet
            </button>
            {wallets.length > 0 && (
              <button
                onClick={() => setTopUpWallet(wallets[0])}
                className="flex items-center gap-1.5 bg-white border border-gray-200 text-[#374151] hover:bg-gray-50 px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95"
                style={{ fontWeight: 600, fontSize: "0.82rem" }}
              >
                <ArrowUpCircle size={15} className="text-[#22C55E]" />
                Top Up
              </button>
            )}
          </div>
        </div>

        {/* Wallet cards grid */}
        {wallets.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 shadow-sm border border-gray-100 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">💳</div>
            <p className="text-[#374151]" style={{ fontWeight: 600, fontSize: "0.95rem" }}>No wallets yet</p>
            <p className="text-[#9CA3AF]" style={{ fontSize: "0.82rem" }}>Add your first wallet to get started</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-2 bg-[#22C55E] text-white px-5 py-2.5 rounded-xl"
              style={{ fontWeight: 600, fontSize: "0.88rem" }}
            >
              + Add Wallet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wallets.map((wallet) => {
              const pct = totalBalance > 0 ? (wallet.balance / totalBalance) * 100 : 0;
              return (
                <div
                  key={wallet.id}
                  className="rounded-2xl p-5 relative overflow-hidden border shadow-sm transition-all hover:shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${wallet.color}15, ${wallet.color}05)`,
                    borderColor: wallet.color + "30",
                  }}
                >
                  {/* Decorative circle */}
                  <div
                    className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-10"
                    style={{ background: wallet.color }}
                  />
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm bg-white"
                    >
                      {wallet.icon}
                    </div>
                    <button
                      onClick={() => setTopUpWallet(wallet)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white transition-all active:scale-95 shadow-sm"
                      style={{ background: wallet.color, fontWeight: 600, fontSize: "0.75rem" }}
                    >
                      <ArrowUpCircle size={12} />
                      Top Up
                    </button>
                  </div>
                  <div className="relative z-10">
                    <p className="text-[#6B7280] mb-0.5" style={{ fontWeight: 500, fontSize: "0.78rem" }}>
                      {wallet.name}
                    </p>
                    <p className="text-[#1F2937]" style={{ fontWeight: 800, fontSize: "1.2rem" }}>
                      {formatRp(wallet.balance)}
                    </p>
                    <p className="mt-2" style={{ fontWeight: 500, fontSize: "0.72rem", color: wallet.color }}>
                      {pct.toFixed(1)}% of total balance
                    </p>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-1 rounded-full bg-black/10 relative z-10">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: wallet.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Wallet list summary */}
        {wallets.length > 0 && (
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <h2 className="text-[#1F2937] mb-4" style={{ fontWeight: 700, fontSize: "0.95rem" }}>
              All Wallets
            </h2>
            <div className="flex flex-col gap-1">
              {wallets.map((wallet, i) => (
                <div key={wallet.id}>
                  <div className="flex items-center gap-3 py-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: wallet.color + "18" }}
                    >
                      {wallet.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#374151]" style={{ fontWeight: 500, fontSize: "0.88rem" }}>
                        {wallet.name}
                      </p>
                      <p className="text-[#9CA3AF]" style={{ fontSize: "0.75rem" }}>
                        {totalBalance > 0
                          ? `${((wallet.balance / totalBalance) * 100).toFixed(1)}% of total`
                          : "—"}
                      </p>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: wallet.color }}>
                      {formatRp(wallet.balance)}
                    </p>
                  </div>
                  {i < wallets.length - 1 && <div className="h-px bg-gray-50 ml-12" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdd && (
        <AddWalletModal onClose={() => setShowAdd(false)} onSave={handleAdd} />
      )}
      {topUpWallet && (
        <TopUpModal
          wallet={topUpWallet}
          wallets={wallets}
          onClose={() => setTopUpWallet(null)}
          onTopUp={handleTopUp}
        />
      )}
    </>
  );
}
