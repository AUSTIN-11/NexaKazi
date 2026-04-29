import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TransactionModal from "../components/TransactionModal";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { createTransaction, getCustomerDetail, syncCrmQueue } from "../services/crmApi";
import { getSyncQueue } from "../services/crmStorage";

function CustomerDetailPage() {
  const { customerId } = useParams();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(getSyncQueue().length);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    let isMounted = true;

    const loadDetail = async () => {
      try {
        if (isOnline) {
          const syncResult = await syncCrmQueue();
          if (isMounted) {
            setPendingSyncCount(syncResult.pending);
          }
        }

        const data = await getCustomerDetail(customerId);
        if (isMounted) {
          setDetail(data);
          setError("");
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message);
        }
      }
    };

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [customerId, isOnline]);

  const handleCreateTransaction = async (payload) => {
    setIsSubmitting(true);
    try {
      await createTransaction(payload);
      const data = await getCustomerDetail(customerId);
      setDetail(data);
      setPendingSyncCount(getSyncQueue().length);
      return true;
    } catch (transactionError) {
      setError(transactionError.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/customers" className="text-sm text-cyan-300 hover:text-cyan-200">
        Back to customers
      </Link>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {detail ? (
        <>
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
                  Customer detail
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-white">
                  {detail.customer.name}
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  {detail.customer.phone || "No phone number"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                <p className="text-sm text-slate-400">Current balance</p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  KES {Number(detail.customer.balance || 0).toLocaleString()}
                </p>
                {pendingSyncCount ? (
                  <p className="mt-1 text-xs uppercase text-amber-300">
                    {pendingSyncCount} pending sync
                  </p>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-5 rounded-lg bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950"
            >
              Add transaction
            </button>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold text-white">Transactions</h2>
            <div className="mt-4 space-y-3">
              {detail.transactions.length ? (
                detail.transactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium capitalize text-white">
                        {transaction.type}
                      </p>
                      <p className="text-sm text-slate-400">
                        {transaction.paymentMethod} • {transaction.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        KES {Number(transaction.amount || 0).toLocaleString()}
                      </p>
                      {transaction.isPendingSync ? (
                        <p className="text-xs uppercase text-amber-300">
                          Pending sync
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No transactions recorded yet.</p>
              )}
            </div>
          </section>
        </>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          Loading customer...
        </div>
      )}

      <TransactionModal
        key={`${detail?.customer?._id || "customer"}-${isModalOpen ? "open" : "closed"}`}
        customer={detail?.customer}
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTransaction}
      />
    </div>
  );
}

export default CustomerDetailPage;
