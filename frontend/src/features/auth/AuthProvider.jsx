import { createContext, useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../shared/api/firebase";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, role: null, loading: true });

  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) return setState({ user: null, role: null, loading: false });
    const { claims } = await user.getIdTokenResult();
    setState({ user, role: claims.role || "agent", loading: false });
  }), []);

  const login = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
  const logout = () => signOut(auth);

  return <Ctx.Provider value={{ ...state, login, logout }}>{children}</Ctx.Provider>;
}

export function RequireAuth({ children, admin = false }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="p-10 text-slate-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && role !== "admin") return <div className="p-10">Not authorised.</div>;
  return children;
}
