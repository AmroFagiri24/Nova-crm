import { useState } from "react";
import { api } from "../../shared/api/client";

const empty = { customerName: "", phone: "", email: "", appointmentDate: "", appointmentTime: "" };
const input = "w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none";

export default function LeadForm({ onCreated }) {
  const [f, setF] = useState(empty);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    try { onCreated(await api("/api/leads", { method: "POST", body: f })); setF(empty); }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow p-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6 items-end">
      <label className="lg:col-span-2 text-sm text-slate-600">Customer name
        <input required className={input} value={f.customerName} onChange={set("customerName")} /></label>
      <label className="text-sm text-slate-600">Phone
        <input required type="tel" className={input} value={f.phone} onChange={set("phone")} /></label>
      <label className="text-sm text-slate-600">Email
        <input required type="email" className={input} value={f.email} onChange={set("email")} /></label>
      <label className="text-sm text-slate-600">Date
        <input required type="date" className={input} value={f.appointmentDate} onChange={set("appointmentDate")} /></label>
      <label className="text-sm text-slate-600">Time
        <input required type="time" className={input} value={f.appointmentTime} onChange={set("appointmentTime")} /></label>
      <div className="sm:col-span-2 lg:col-span-6 flex items-center gap-3">
        <button disabled={busy} className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
          {busy ? "Saving…" : "Add lead"}</button>
        {err && <span className="text-sm text-red-600">{err}</span>}
      </div>
    </form>
  );
}
