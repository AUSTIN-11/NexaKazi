import { Outlet, NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/customers", label: "Customers" },
  { to: "/products", label: "Products" },
  { to: "/projects", label: "Projects" },
];

function Layout({ children }) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col md:flex-row">
        <aside className="border-b border-slate-800 bg-slate-900 md:w-72 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between px-5 py-4 md:block">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
                MzigoFlow CRM
              </p>
              <h1 className="mt-1 text-xl font-semibold text-white">NexaKazi</h1>
              <p className="mt-1 text-sm text-slate-400">
                {user?.name || "Workspace"}
              </p>
            </div>
          </div>

          <nav className="grid gap-1 px-3 pb-4 md:pt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "rounded-lg px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-cyan-500/15 text-cyan-300"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="px-3 pb-5">
            <button
              onClick={handleLogout}
              className="w-full rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-red-400 hover:text-red-300"
            >
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-slate-800 bg-slate-950/80 px-5 py-4 backdrop-blur">
            <p className="text-sm text-slate-400">
              Manage customers, sales, payments, and stock from one place.
            </p>
          </header>

          <main className="flex-1 p-4 md:p-6">{children || <Outlet />}</main>
        </div>
      </div>
    </div>
  );
}

export default Layout;
