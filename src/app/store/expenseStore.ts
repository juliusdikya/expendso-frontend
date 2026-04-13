export type Category =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Bills"
  | "Entertainment"
  | "Health"
  | "Salary"
  | "Other";

export interface Transaction {
  id: string;
  amount: number;
  category: Category;
  date: string;
  notes: string;
  type: "expense" | "income";
}

export interface Wallet {
  id: number;
  name: string;
  balance: number;
}

export type WalletUI = Wallet & {
  color: string;
  icon: string;
};

export const CATEGORY_META: Record<
  Category,
  { icon: string; color: string; bg: string }
> = {
  Food: { icon: "🍔", color: "#F97316", bg: "#FFF7ED" },
  Transport: { icon: "🚗", color: "#3B82F6", bg: "#EFF6FF" },
  Shopping: { icon: "🛍️", color: "#A855F7", bg: "#FAF5FF" },
  Bills: { icon: "📄", color: "#EF4444", bg: "#FEF2F2" },
  Entertainment: { icon: "🎬", color: "#EC4899", bg: "#FDF2F8" },
  Health: { icon: "💊", color: "#10B981", bg: "#ECFDF5" },
  Salary: { icon: "💵", color: "#22C55E", bg: "#F0FDF4" },
  Other: { icon: "📦", color: "#6B7280", bg: "#F9FAFB" },
};

export const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

// --- Initial mock data ---
const makeId = () => Math.random().toString(36).slice(2, 9);

export const initialTransactions: Transaction[] = [
  { id: makeId(), amount: 50000, category: "Food", date: "2026-04-09", notes: "Starbucks coffee", type: "expense" },
  { id: makeId(), amount: 25000, category: "Transport", date: "2026-04-08", notes: "Gojek ride", type: "expense" },
  { id: makeId(), amount: 3000000, category: "Salary", date: "2026-04-01", notes: "Monthly salary", type: "income" },
  { id: makeId(), amount: 150000, category: "Food", date: "2026-04-07", notes: "Dinner with family", type: "expense" },
  { id: makeId(), amount: 75000, category: "Transport", date: "2026-04-06", notes: "Grab ride", type: "expense" },
  { id: makeId(), amount: 200000, category: "Shopping", date: "2026-04-05", notes: "New shirt", type: "expense" },
  { id: makeId(), amount: 300000, category: "Bills", date: "2026-04-04", notes: "Electricity bill", type: "expense" },
  { id: makeId(), amount: 100000, category: "Entertainment", date: "2026-04-03", notes: "Netflix subscription", type: "expense" },
  { id: makeId(), amount: 50000, category: "Health", date: "2026-04-02", notes: "Vitamins", type: "expense" },
  { id: makeId(), amount: 120000, category: "Food", date: "2026-04-01", notes: "Grocery shopping", type: "expense" },
  { id: makeId(), amount: 80000, category: "Shopping", date: "2026-03-30", notes: "Skincare products", type: "expense" },
  { id: makeId(), amount: 300000, category: "Bills", date: "2026-03-28", notes: "Internet bill", type: "expense" },
];
