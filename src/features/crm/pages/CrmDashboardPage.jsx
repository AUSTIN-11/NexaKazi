import { useEffect, useState } from "react";
import OfflineBadge from "../components/OfflineBadge";
import StatCard from "../components/StatCard";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { getDashboard, syncCrmQueue } from "../services/crmApi";
import { getSyncQueue } from "../services/crmStorage";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function CrmDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [pendingSyncCount, setPendingSyncCount] = useState(getSyncQueue().length);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        if (isOnline) {
          await syncCrmQueue();
          if (isMounted) {
            setPendingSyncCount(getSyncQueue().length);
          }
        }

        const data = await getDashboard();
        if (isMounted) {
          setDashboard(data);
          setError("");
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [isOnline]);

  const handleSync = async () => {
    const result = await syncCrmQueue();
    setPendingSyncCount(result.pending);
    const data = await getDashboard();
    setDashboard(data);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
          Dashboard
        </p>
        <h1 className="text-2xl font-semibold text-white">Business overview</h1>
      </div>

      <OfflineBadge
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        onSync={handleSync}
      />

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total sales"
          value={formatCurrency(dashboard?.totalSales)}
          hint="All recorded sales"
        />
        <StatCard
          label="Total debt"
          value={formatCurrency(dashboard?.totalDebt)}
          hint="Outstanding customer balances"
        />
        <StatCard
          label="Today's sales"
          value={formatCurrency(dashboard?.todaysSales)}
          hint="Since midnight"
        />
        <StatCard
          label="Customers"
          value={dashboard?.customerCount || 0}
          hint={`${dashboard?.productCount || 0} tracked products`}
        />
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent activity</h2>
          <p className="text-sm text-slate-400">Latest 5 transactions</p>
        </div>

        <div className="mt-4 space-y-3">
          {(dashboard?.recentTransactions || []).length ? (
            dashboard.recentTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-white">
                    {transaction.customerId?.name || transaction.customerName || "Customer"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {transaction.type} via {transaction.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs uppercase text-slate-500">
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No transactions yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default CrmDashboardPage;
