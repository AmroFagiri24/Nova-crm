import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function LoginForm() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: "", pw: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    try { await login(f.email, f.pw); nav("/"); }
    catch { setErr("Invalid email or password."); }
    finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <input type="email" required placeholder="Email" value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
        <input type="password" required placeholder="Password" value={f.pw}
          onChange={(e) => setF({ ...f, pw: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
        <button disabled={busy}
          className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
