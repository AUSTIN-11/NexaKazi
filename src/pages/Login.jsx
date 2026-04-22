import { useState } from "react";
import useAuthStore from "../store/authStore";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        // Optional: handle error from backend, e.g. show message
        console.error(data.message || "Login failed");
        return;
      }

      // Expecting data = { user: {...}, token: "..." }
      login(data.user, data.token);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-10 space-y-4">
      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="border px-2 py-1 block"
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="border px-2 py-1 block"
      />
      <button className="bg-indigo-600 text-white px-4 py-2 rounded">
        Login
      </button>
    </form>
  );
}

export default Login;