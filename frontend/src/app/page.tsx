"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type NavItem = {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { id: "nav-dashboard", label: "Dashboard", href: "/", enabled: true },
  { id: "nav-wallets", label: "Wallet Management", href: "/wallets", enabled: false },
  { id: "nav-categories", label: "Category Management", href: "/categories", enabled: false },
  { id: "nav-budgets", label: "Budget Management", href: "/budgets", enabled: false },
  { id: "nav-transactions", label: "Transaction Management", href: "/transactions", enabled: false },
  { id: "nav-reports", label: "Financial Reporting", href: "/reports", enabled: false },
];

const SUMMARY_CARDS = [
  { id: "card-total-income", label: "Total Income", accent: "border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/30" },
  { id: "card-total-expense", label: "Total Expense", accent: "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30" },
  { id: "card-total-saving", label: "Total Saving", accent: "border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/30" },
];

function SkeletonBar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800 ${className}`} />;
}

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("pfm_access_token")) {
      router.replace("/login");
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("pfm_access_token");
    localStorage.removeItem("pfm_refresh_token");
    router.push("/login");
  }

  return (
    <div className="flex flex-1">
      {/* Sidebar — mirrors ui/Dashboard.png's blue nav panel */}
      <aside className="flex w-64 shrink-0 flex-col bg-blue-600 px-6 py-8 text-white">
        <span className="text-2xl font-extrabold tracking-tight">PFM</span>

        <div className="mt-8 flex flex-col items-center gap-2 border-b border-white/15 pb-6">
          <div className="h-16 w-16 rounded-full bg-white/20" />
          <span className="text-sm font-medium">Homer Truong</span>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              id={item.id}
              type="button"
              disabled={!item.enabled}
              onClick={() => item.enabled && router.push(item.href)}
              className={`rounded-lg px-4 py-2.5 text-left text-sm font-medium transition ${
                item.enabled
                  ? "bg-white/15 text-white"
                  : "text-blue-100/70 hover:bg-white/10 disabled:cursor-not-allowed"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          id="btn-logout"
          type="button"
          onClick={handleLogout}
          className="mt-6 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-blue-100 transition hover:bg-white/10"
        >
          Log out
        </button>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
        <header className="flex items-center justify-between border-b border-black/[.08] px-8 py-6 dark:border-white/[.145]">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <button
              id="btn-new-transaction"
              type="button"
              disabled
              className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
            >
              + New Transaction
            </button>
            <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-8 overflow-y-auto p-8">
          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {SUMMARY_CARDS.map((card) => (
              <div key={card.id} id={card.id} className={`rounded-2xl border p-5 ${card.accent}`}>
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  {card.label}
                </span>
                <SkeletonBar className="mt-3 h-6 w-24" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="flex flex-col gap-8 lg:col-span-2">
              {/* Goals */}
              <section id="section-goals">
                <h2 className="mb-4 text-lg font-semibold text-black dark:text-zinc-50">Goals</h2>
                <div className="flex flex-col gap-4 rounded-2xl border border-black/[.08] bg-white p-5 dark:border-white/[.145] dark:bg-white/5">
                  {[1, 2].map((row) => (
                    <div key={row} className="flex flex-col gap-2">
                      <SkeletonBar className="h-4 w-32" />
                      <SkeletonBar className="h-2.5 w-full" />
                    </div>
                  ))}
                </div>
              </section>

              {/* Activity Graph */}
              <section id="section-activity-graph">
                <h2 className="mb-4 text-lg font-semibold text-black dark:text-zinc-50">
                  Activity Graph
                </h2>
                <div className="flex h-56 items-center justify-center rounded-2xl border border-black/[.08] bg-white dark:border-white/[.145] dark:bg-white/5">
                  <span className="text-sm text-zinc-400 dark:text-zinc-500">
                    Chart will appear once Transaction data is available
                  </span>
                </div>
              </section>
            </div>

            {/* Recent Transactions */}
            <section id="section-recent-transactions">
              <h2 className="mb-4 text-lg font-semibold text-black dark:text-zinc-50">
                Recent Transactions
              </h2>
              <div id="table-transactions" className="flex flex-col gap-4 rounded-2xl border border-black/[.08] bg-white p-5 dark:border-white/[.145] dark:bg-white/5">
                {[1, 2, 3, 4].map((row) => (
                  <div key={row} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                      <div className="flex flex-col gap-1.5">
                        <SkeletonBar className="h-3.5 w-20" />
                        <SkeletonBar className="h-3 w-14" />
                      </div>
                    </div>
                    <SkeletonBar className="h-3.5 w-14" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
