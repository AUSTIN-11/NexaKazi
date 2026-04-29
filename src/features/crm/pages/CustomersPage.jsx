import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CustomerForm from "../components/CustomerForm";
import OfflineBadge from "../components/OfflineBadge";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { createCustomer, getCustomers, syncCrmQueue } from "../services/crmApi";
import { getSyncQueue } from "../services/crmStorage";

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(getSyncQueue().length);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    let isMounted = true;

    const loadCustomers = async () => {
      try {
        if (isOnline) {
          const result = await syncCrmQueue();
          if (isMounted) {
            setPendingSyncCount(result.pending);
          }
        }

        const data = await getCustomers(search);
        if (isMounted) {
          setCustomers(data);
          setError("");
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message);
        }
      }
    };

    const timeout = window.setTimeout(loadCustomers, search ? 200 : 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timeout);
    };
  }, [isOnline, search]);

  const handleCreateCustomer = async (form) => {
    setIsSubmitting(true);
    try {
      await createCustomer(form);
      const data = await getCustomers(search);
      setCustomers(data);
      setPendingSyncCount(getSyncQueue().length);
      return true;
    } catch (createError) {
      setError(createError.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSync = async () => {
    const result = await syncCrmQueue();
    setPendingSyncCount(result.pending);
    setCustomers(await getCustomers(search));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
          Customers
        </p>
        <h1 className="text-2xl font-semibold text-white">Customer ledger</h1>
      </div>

      <OfflineBadge
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
        onSync={handleSync}
      />

      <CustomerForm onSubmit={handleCreateCustomer} isSubmitting={isSubmitting} />

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-white">All customers</h2>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or phone"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400 md:max-w-xs"
          />
        </div>

        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

        <div className="mt-4 space-y-3">
          {customers.length ? (
            customers.map((customer) => (
              <Link
                key={customer._id}
                to={`/customers/${customer._id}`}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 transition hover:border-cyan-500/40"
              >
                <div>
                  <p className="font-medium text-white">{customer.name}</p>
                  <p className="text-sm text-slate-400">{customer.phone || "No phone"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    KES {Number(customer.balance || 0).toLocaleString()}
                  </p>
                  {customer.isPendingSync ? (
                    <p className="text-xs uppercase text-amber-300">Pending sync</p>
                  ) : null}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-slate-400">No customers found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomersPage;
