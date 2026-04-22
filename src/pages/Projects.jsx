import { useEffect, useState } from "react";
import { fetchWithAuth } from "../services/api";

const columns = ["lead", "proposal", "active", "completed"];

function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    client: ""
  });

  const [clients, setClients] = useState([]);

  // LOAD DATA
  const loadData = async () => {
    const proj = await fetchWithAuth("/projects");
    const cli = await fetchWithAuth("/clients");

    setProjects(proj);
    setClients(cli);
  };

  useEffect(() => {
    loadData();
  }, []);

  // CREATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetchWithAuth("/projects", {
      method: "POST",
      body: JSON.stringify(form)
    });

    setForm({ title: "", description: "", client: "" });
    loadData();
  };

  // MOVE STATUS
  const moveProject = async (id, status) => {
    await fetchWithAuth(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });

    loadData();
  };

  return (
    <div>
      <h1 className="text-2xl mb-4">Projects</h1>

      {/* CREATE FORM */}
      <form onSubmit={handleSubmit} className="mb-6 space-x-2">
        <input placeholder="Title"
          value={form.title}
          onChange={e => setForm({...form, title: e.target.value})}
          className="p-2 text-black"
        />

        <select
          value={form.client}
          onChange={e => setForm({...form, client: e.target.value})}
          className="p-2 text-black"
        >
          <option value="">Select Client</option>
          {clients.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <button className="bg-blue-500 px-4 py-2">Add</button>
      </form>

      {/* KANBAN */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map(col => (
          <div key={col} className="bg-gray-800 p-3 rounded">
            <h2 className="mb-2 capitalize">{col}</h2>

            {projects
              .filter(p => p.status === col)
              .map(p => (
                <div key={p._id} className="bg-gray-700 p-2 mb-2 rounded">
                  <p>{p.title}</p>
                  <p className="text-sm text-gray-400">
                    {p.client?.name}
                  </p>

                  {/* MOVE BUTTONS */}
                  <div className="flex gap-1 mt-2">
                    {columns.map(s => (
                      <button
                        key={s}
                        onClick={() => moveProject(p._id, s)}
                        className="text-xs bg-blue-500 px-1"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects;