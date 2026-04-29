import { useState } from "react";

const initialState = { name: "", phone: "" };

function CustomerForm({ onSubmit, isSubmitting }) {
  const [form, setForm] = useState(initialState);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await onSubmit(form);

    if (result) {
      setForm(initialState);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-[1.5fr_1fr_auto]"
    >
      <input
        value={form.name}
        onChange={(event) =>
          setForm((current) => ({ ...current, name: event.target.value }))
        }
        placeholder="Customer name"
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
        required
      />
      <input
        value={form.phone}
        onChange={(event) =>
          setForm((current) => ({ ...current, phone: event.target.value }))
        }
        placeholder="Phone number"
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
      />
      <button
        disabled={isSubmitting}
        className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-70"
      >
        {isSubmitting ? "Saving..." : "Add customer"}
      </button>
    </form>
  );
}

export default CustomerForm;
