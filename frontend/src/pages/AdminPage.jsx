import { Link } from "react-router-dom";
import UserManager from "../features/admin-users/UserManager";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between bg-white px-6 py-3 shadow-sm">
        <h1 className="font-semibold text-slate-900">Team management</h1>
        <Link to="/" className="text-sm text-indigo-600">← Back to pipeline</Link>
      </nav>
      <UserManager />
    </div>
  );
}
