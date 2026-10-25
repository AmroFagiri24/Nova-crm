import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../shared/api/firebase";

export default function AgentAnalytics() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchAnalytics = async () => {
      const querySnapshot = await getDocs(collection(db, "leads"));
      const data = {};

      querySnapshot.forEach((doc) => {
        const lead = doc.data();
        const agent = lead.agentName || "Unassigned";
        const status = lead.status || "New";

        if (!data[agent]) data[agent] = { total: 0, statuses: {} };
        
        data[agent].total += 1;
        data[agent].statuses[status] = (data[agent].statuses[status] || 0) + 1;
      });

      setStats(data);
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Agent Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(stats).map(([agent, data]) => (
          <div key={agent} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <h3 className="text-lg font-bold text-blue-400">{agent}</h3>
            <p className="text-slate-300 font-semibold mb-2">Total Leads: {data.total}</p>
            <div className="space-y-1">
              {Object.entries(data.statuses).map(([status, count]) => (
                <div key={status} className="flex justify-between text-sm text-slate-400">
                  <span>{status}</span>
                  <span className="text-white bg-slate-700 px-2 rounded">{count}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}