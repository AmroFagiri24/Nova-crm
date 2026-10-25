import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../shared/api/client";
import { useAuth } from "../features/auth/AuthProvider";
import LeadForm from "../features/lead-create/LeadForm";
import Pipeline from "../widgets/pipeline/Pipeline";

export default function DashboardPage() {
  const { user, role, logout } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api("/api/leads").then(setLeads).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between bg-white px-6 py-3 shadow-sm">
        <h1 className="font-semibold text-slate-900">Sales CRM</h1>
        <div className="flex items-center gap-4 text-sm">
          {role === "admin" && <Link to="/admin" className="text-indigo-600">Manage team</Link>}
          <span className="text-slate-500">{user.displayName || user.email}</span>
          <button onClick={logout} className="text-slate-600 hover:text-slate-900">Log out</button>
        </div>
      </nav>
      <main className="mx-auto max-w-[1400px] space-y-6 p-6">
        <LeadForm onCreated={(l) => setLeads((ls) => [l, ...ls])} />
        {loading ? <p className="text-slate-500">Loading leads…</p>
          : <Pipeline leads={leads} setLeads={setLeads} showOwner={role === "admin"} />}
      </main>
    </div>
  );
}
