import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Analytics } from "./components/Analytics";
import { Wallets } from "./components/Wallets";
import { Transactions } from "./components/Transactions";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "transactions", Component: Transactions },
      { path: "analytics", Component: Analytics },
      { path: "wallets", Component: Wallets },
    ],
  },
]);
