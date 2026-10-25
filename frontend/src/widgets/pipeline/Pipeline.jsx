import { useState } from "react";
import { api } from "../../shared/api/client";
import { STATUSES } from "../../entities/lead/statuses";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../shared/api/firebase";

export default function Pipeline({ leads, setLeads, showOwner }) {
  const [over, setOver] = useState(null);

  async function move(id, status) {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l))); 
    try { await api(`/api/leads/${id}`, { method: "PATCH", body: { status } }); }
    catch { setLeads(prev); alert("Couldn't update status. Reverted."); }
  }

  const handleDeleteLead = async (leadId) => {
    if (window.confirm("Are you sure you want to permanently delete this lead?")) {
      try {
        await deleteDoc(doc(db, "leads", leadId));
        setLeads((prev) => prev.filter(lead => lead.id !== leadId)); 
      } catch (error) {
        console.error("Error deleting lead: ", error);
        alert("Failed to delete lead.");
      }
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 p-2">
      {STATUSES.map((s) => {
        const col = leads.filter((l) => l.status === s);
        // Calculate total value if you add a 'value' field later; defaulting to $0 for now
        const totalValue = col.reduce((sum, l) => sum + (Number(l.value) || 0), 0);

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
            className={`w-72 shrink-0 rounded-md transition bg-slate-100 flex flex-col shadow-sm ${over === s ? "ring-2 ring-blue-400" : ""}`}>
            
            {/* Blue Column Header */}
            <header className="bg-blue-500 text-white rounded-t-md p-3">
              <div className="flex justify-between items-center mb-1">
                <h2 className="font-bold text-sm tracking-wide uppercase">{s}</h2>
                <button className="text-white hover:text-blue-200 font-bold text-lg leading-none">+</button>
              </div>
              <div className="text-xs text-blue-100 font-medium">
                {col.length} Deal{col.length !== 1 ? 's' : ''} • ${totalValue.toLocaleString()}
              </div>
            </header>

            {/* Column Body / Lead Cards */}
            <div className="space-y-3 p-2 min-h-[150px] bg-slate-800 rounded-b-md">
              {col.map((l) => (
                <article key={l.id} draggable
                  onDragStart={(e) => e.dataTransfer.setData("id", l.id)}
                  className="cursor-grab flex flex-col bg-slate-900 rounded-md shadow-sm border border-slate-700 active:cursor-grabbing hover:border-blue-500 transition-colors">
                  
                  {/* Card Main Content */}
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-white text-lg leading-tight">{l.customerName}</h3>
                        <a href={`tel:${l.phone}`} className="block text-sm text-slate-400 mt-1 hover:text-blue-400">
                          {l.phone}
                        </a>
                      </div>
                      <button className="text-slate-500 hover:text-white">
                        {/* Right Arrow Icon for details */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Status Pill (e.g., '3 days ago' or Appointment Info) */}
                    <div className="mt-3 inline-block bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">
                      📅 {l.appointmentDate}
                    </div>
                    {showOwner && <p className="text-xs text-slate-500 mt-2">Agent: {l.ownerName}</p>}
                  </div>
                  
                  {/* Bottom Action Bar */}
                  <div className="bg-blue-600 rounded-b-md p-2 flex justify-between items-center text-white">
                    <span className="text-sm font-semibold">${Number(l.value || 0).toLocaleString()}</span>
                    <div className="flex gap-3">
                      {/* Trash Can Icon */}
                      <button 
                        onClick={() => handleDeleteLead(l.id)}
                        className="hover:text-red-300 transition-colors"
                        title="Delete Lead"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>

                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}