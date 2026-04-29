import { useState } from "react";

const initialState = {
  type: "sale",
  amount: "",
  paymentMethod: "cash",
};

function TransactionModal({ customer, isOpen, isSubmitting, onClose, onSubmit }) {
  const [form, setForm] = useState(initialState);

  if (!isOpen || !customer) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await onSubmit({
      customerId: customer._id,
      type: form.type,
      amount: Number(form.amount),
      paymentMethod: form.paymentMethod,
      status: form.type === "payment" ? "paid" : "unpaid",
    });

    if (result) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/70 p-4 md:items-center md:justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">New transaction</h2>
            <p className="text-sm text-slate-400">{customer.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm((current) => ({ ...current, type: "sale" }))}
              className={[
                "rounded-lg border px-4 py-3 text-sm font-medium",
                form.type === "sale"
                  ? "border-cyan-400 bg-cyan-500/10 text-cyan-200"
                  : "border-slate-700 text-slate-300",
              ].join(" ")}
            >
              Sale
            </button>
            <button
              type="button"
              onClick={() => setForm((current) => ({ ...current, type: "payment" }))}
              className={[
                "rounded-lg border px-4 py-3 text-sm font-medium",
                form.type === "payment"
                  ? "border-cyan-400 bg-cyan-500/10 text-cyan-200"
                  : "border-slate-700 text-slate-300",
              ].join(" ")}
            >
              Payment
            </button>
          </div>

          <input
            value={form.amount}
            onChange={(event) =>
              setForm((current) => ({ ...current, amount: event.target.value }))
            }
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
            required
          />

          <select
            value={form.paymentMethod}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                paymentMethod: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="mpesa">M-Pesa Ready</option>
          </select>

          <button
            disabled={isSubmitting}
            className="w-full rounded-lg bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Save transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TransactionModal;
