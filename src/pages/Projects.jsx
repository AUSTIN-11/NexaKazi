import { useEffect, useState } from "react";
import { fetchWithAuth } from "../services/api";

const columns = ["lead", "proposal", "active", "completed"];

function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    client: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [projectData, clientData] = await Promise.all([
          fetchWithAuth("/projects"),
          fetchWithAuth("/clients"),
        ]);

        if (isMounted) {
          setProjects(projectData);
          setClients(clientData);
          setError("");
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const reloadProjects = async () => {
    const data = await fetchWithAuth("/projects");
    setProjects(data);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await fetchWithAuth("/projects", {
      method: "POST",
      body: JSON.stringify(form),
    });

    setForm({ title: "", description: "", client: "" });
    await reloadProjects();
  };

  const moveProject = async (id, status) => {
    await fetchWithAuth(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });

    await reloadProjects();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">Projects</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Pipeline board</h1>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-[1.4fr_1fr_auto]"
      >
        <input
          placeholder="Title"
          value={form.title}
          onChange={(event) =>
            setForm((current) => ({ ...current, title: event.target.value }))
          }
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
        />
        <select
          value={form.client}
          onChange={(event) =>
            setForm((current) => ({ ...current, client: event.target.value }))
          }
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
        >
          <option value="">Select Client</option>
          {clients.map((client) => (
            <option key={client._id} value={client._id}>
              {client.name}
            </option>
          ))}
        </select>
        <button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">
          Add
        </button>
      </form>

      <div className="grid gap-4 xl:grid-cols-4">
        {columns.map((column) => (
          <div key={column} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
              {column}
            </h2>

            <div className="space-y-3">
              {projects
                .filter((project) => project.status === column)
                .map((project) => (
                  <div
                    key={project._id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-3"
                  >
                    <p className="font-medium text-white">{project.title}</p>
                    <p className="text-sm text-slate-400">
                      {project.client?.name || "No client"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {columns.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => moveProject(project._id, status)}
                          className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects;
