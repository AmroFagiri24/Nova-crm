import { useState } from "react";
import { api } from "../../shared/api/client";
import { STATUSES, STATUS_STYLE } from "../../entities/lead/statuses";

export default function Pipeline({ leads, setLeads, showOwner }) {
  const [over, setOver] = useState(null);

  async function move(id, status) {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l))); // instant
    try { await api(`/api/leads/${id}`, { method: "PATCH", body: { status } }); }
    catch { setLeads(prev); alert("Couldn't update status. Reverted."); }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map((s) => {
        const col = leads.filter((l) => l.status === s);
        return (
          <section key={s}
            onDragOver={(e) => { e.preventDefault(); setOver(s); }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => {
              setOver(null);
              const id = e.dataTransfer.getData("id");
              const lead = leads.find((l) => l.id === id);
              if (lead && lead.status !== s) move(id, s);
            }}
            className={`w-72 shrink-0 rounded-2xl p-3 transition ${over === s ? "bg-indigo-100" : "bg-slate-100"}`}>
            <header className="mb-3 flex items-center justify-between">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[s]}`}>{s}</span>
              <span className="text-sm text-slate-500">{col.length}</span>
            </header>
            <div className="space-y-3 min-h-24">
              {col.map((l) => (
                <article key={l.id} draggable
                  onDragStart={(e) => e.dataTransfer.setData("id", l.id)}
                  className="cursor-grab rounded-xl bg-white p-3 shadow-sm hover:shadow-md active:cursor-grabbing">
                  <h3 className="font-medium text-slate-900">{l.customerName}</h3>
                  <a href={`tel:${l.phone}`} className="block text-sm text-indigo-600">{l.phone}</a>
                  <p className="truncate text-sm text-slate-500">{l.email}</p>
                  <p className="mt-1 text-xs text-slate-500">📅 {l.appointmentDate} · {l.appointmentTime}</p>
                  {showOwner && <p className="text-xs text-slate-400">Agent: {l.ownerName}</p>}
                  <select value={l.status} onChange={(e) => move(l.id, e.target.value)}
                    className="mt-2 w-full rounded-md border border-slate-200 text-xs py-1">
                    {STATUSES.map((x) => <option key={x}>{x}</option>)}
                  </select>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
