import { useEffect, useState } from "react";
import { fetchWithAuth } from "../services/api";

function Clients() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // GET CLIENTS
  const loadClients = async () => {
    const data = await fetchWithAuth("/clients");
    setClients(data);
  };

  useEffect(() => {
    loadClients();
  }, []);

  // CREATE CLIENT
  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetchWithAuth("/clients", {
      method: "POST",
      body: JSON.stringify(form)
    });

    setForm({ name: "", email: "", phone: "" });
    loadClients();
  };

  // DELETE
  const handleDelete = async (id) => {
    await fetchWithAuth(`/clients/${id}`, {
      method: "DELETE"
    });

    loadClients();
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">Clients</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-2 mb-6">
        <input placeholder="Name"
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
          className="p-2 text-black"
        />

        <input placeholder="Email"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          className="p-2 text-black"
        />

        <input placeholder="Phone"
          value={form.phone}
          onChange={e => setForm({...form, phone: e.target.value})}
          className="p-2 text-black"
        />

        <button className="bg-blue-500 px-4 py-2">Add Client</button>
      </form>

      {/* LIST */}
      <ul>
        {clients.map(c => (
          <li key={c._id} className="mb-2 flex justify-between">
            <span>{c.name} - {c.email}</span>
            <button onClick={() => handleDelete(c._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Clients;