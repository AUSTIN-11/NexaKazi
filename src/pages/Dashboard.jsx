import { useEffect, useState } from "react";
import { fetchWithAuth } from "../services/api";

function Dashboard() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchWithAuth("/clients");
      setClients(data);
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">

        {/* CARD */}
        <div className="bg-gray-800 p-4 rounded-xl">
          <h2 className="text-gray-400">Total Clients</h2>
          <p className="text-2xl font-bold">{clients.length}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl">
          <h2 className="text-gray-400">Active Projects</h2>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl">
          <h2 className="text-gray-400">Revenue</h2>
          <p className="text-2xl font-bold">$0</p>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;