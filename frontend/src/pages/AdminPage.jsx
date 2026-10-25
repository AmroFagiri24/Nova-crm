import { useState } from "react";
import { Link } from "react-router-dom";
import UserManager from "../features/admin-users/UserManager";
import { createAgentAccount } from "../shared/api/client";

{/* Existing User Manager & Analytics */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <UserManager />
          <AgentAnalytics />
        </div>
export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Cold Caller");

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    try {
      // Calls your Flask backend, which handles Firebase Auth AND Firestore
      await createAgentAccount(email, password, role); 
      
      alert(`Agent created successfully as a ${role}`);
      setEmail(""); 
      setPassword(""); 
      setRole("Cold Caller");
    } catch (error) {
      console.error("Error creating agent:", error);
      alert("Failed to create agent.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="flex items-center justify-between bg-slate-800 px-6 py-3 shadow-md border-b border-slate-700">
        <h1 className="font-bold text-white text-lg">Team Management</h1>
        <Link to="/" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
          ← Back to pipeline
        </Link>
      </nav>
      
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* New Agent Creation Form */}
        <div className="col-span-1 p-6 bg-slate-800 rounded-xl border border-slate-700 h-fit shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-white">Create New Agent</h2>
          <form onSubmit={handleCreateAgent} className="flex flex-col gap-4">
            <input 
              type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="p-3 bg-slate-900 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500" required 
            />
            <input 
              type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="p-3 bg-slate-900 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500" required 
            />
            <select 
              value={role} onChange={(e) => setRole(e.target.value)}
              className="p-3 bg-slate-900 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Cold Caller">Cold Caller</option>
              <option value="Closer">Closer</option>
              <option value="Marketing Team">Marketing Team</option>
            </select>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 mt-2 p-3 rounded-lg text-white font-bold transition-colors">
              Add Agent
            </button>
          </form>
        </div>

        {/* Existing User Manager */}
        <div className="col-span-1 lg:col-span-2">
          <UserManager />
        </div>

      </div>
    </div>
  );
}