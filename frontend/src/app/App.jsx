import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, RequireAuth } from "../features/auth/AuthProvider";
import LoginForm from "../features/auth/LoginForm";
import DashboardPage from "../pages/DashboardPage";
import AdminPage from "../pages/AdminPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth admin><AdminPage /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
