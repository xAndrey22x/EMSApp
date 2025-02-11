import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminDashboard from "./components/admin/AdminDashboard";
import LoginPage from "./components/LoginPage";
import UserDashboard from "./components/user/UserDashboard";
import UserEnergyConsumption from "./components/user/UserEnergyConsumption";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute isAdminRoute={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute isAdminRoute={false}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consumption/:deviceId"
          element={
            <ProtectedRoute isAdminRoute={false}>
              <UserEnergyConsumption />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
