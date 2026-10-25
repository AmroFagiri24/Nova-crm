import { auth } from "./firebase";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function api(path, { method = "GET", body } = {}) {
  const token = await auth.currentUser?.getIdToken(); // auto-refreshes
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
