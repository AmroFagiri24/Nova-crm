import { useEffect, useState } from "react";
import { api } from "../../shared/api/client";

const blank = { name: "", email: "", password: "", role: "agent" };

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [f, setF] = useState(blank);
  const [err, setErr] = useState("");
  const load = () => api("/api/admin/users").then(setUsers);
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault(); setErr("");
    try { await api("/api/admin/users", { method: "POST", body: f }); setF(blank); load(); }
    catch (e) { setErr(e.message); }
  }
  const toggle = (u) =>
    api(`/api/admin/users/${u.uid}`, { method: "PATCH", body: { active: !u.active } })
      .then(load).catch((e) => setErr(e.message));

  const cls = "rounded-lg border border-slate-300 px-3 py-2";
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <form onSubmit={create} className="grid gap-3 rounded-2xl bg-white p-5 shadow sm:grid-cols-2">
        <input required placeholder="Full name" className={cls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input required type="email" placeholder="Email" className={cls} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input required minLength={8} type="password" placeholder="Temp password (8+)" className={cls} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <select className={cls} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
          <option value="agent">Agent</option><option value="admin">Admin</option>
        </select>
        <button className="rounded-lg bg-indigo-600 py-2 text-white sm:col-span-2">Create account</button>
        {err && <p className="text-sm text-red-600 sm:col-span-2">{err}</p>}
      </form>
      <ul className="divide-y rounded-2xl bg-white shadow">
        {users.map((u) => (
          <li key={u.uid} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{u.name} <span className="text-xs text-slate-400">({u.role})</span></p>
              <p className="text-sm text-slate-500">{u.email}</p>
            </div>
            <button onClick={() => toggle(u)} className={`text-sm ${u.active ? "text-red-600" : "text-emerald-600"}`}>
              {u.active ? "Deactivate" : "Reactivate"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
