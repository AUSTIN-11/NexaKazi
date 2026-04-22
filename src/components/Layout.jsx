import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";

function Layout({ children }) {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-800 p-5">
        <h1 className="text-xl font-bold mb-6">NexaKazi</h1>

        <nav className="space-y-3">
          <Link to="/" className="block hover:text-blue-400">Dashboard</Link>
          <Link to="/clients" className="block hover:text-blue-400">Clients</Link>
        </nav>

        <button
          onClick={logout}
          className="mt-10 bg-red-500 px-3 py-2 w-full"
        >
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <header className="bg-gray-800 p-4 border-b border-gray-700">
          <h2 className="text-lg">Welcome to NexaKazi</h2>
        </header>

        {/* CONTENT */}
        <main className="p-6 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}

export default Layout;