import { Routes, Route } from "react-router-dom";
import AuthPage from "../auth/Auth";
import ExportPage from "../pages/ExportPage/ExportReport";
import AdminLayout from "../layouts/AdminLayout";
import HostLayout from "../layouts/HostLayout";
import SecurityLayout from "../layouts/SecurityLayout";

import AdminDashboard from "../pages/admin/AdminDashboard";
import HostDashboard from "../pages/host/HostDashboard";
import SecurityDashboard from "../pages/SecurtiyDashboard/SecurityDashboard";
import SuperAdminDashboard from "../pages/SuperAdmin/SuperAdminDashboard";

import VisitorManagementLanding from "../pages/LandingPage/LandingPage";
import DashboardSelection from "../pages/DashboardSelection/DashboardSelection";
import VisitorRegistration from "../pages/VisitorRegistration/VisitorRegistration";
import ProtectedRoute from "./ProtectedRoute"; // Import Secure Route Wrapper

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/export" element={<ExportPage />} />
      </Route>

      {/* Host Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["host"]}><HostLayout /></ProtectedRoute>}>
        <Route path="/host/dashboard" element={<HostDashboard />} />
      </Route>

      {/* Security Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["security"]}><SecurityLayout /></ProtectedRoute>}>
        <Route path="/security/dashboard" element={<SecurityDashboard />} />
      </Route>

      {/* SuperAdmin Protected Routes */}
      <Route path="/superadmin/dashboard" element={
        <ProtectedRoute allowedRoles={["superadmin"]}>
          <SuperAdminDashboard />
        </ProtectedRoute>
      } />

      {/* General Authenticated Routes */}
      <Route path="/dashboards" element={
        <ProtectedRoute>
          <DashboardSelection />
        </ProtectedRoute>
      } />

      {/* Public Routes */}
      <Route path="/home/landingpage" element={<VisitorManagementLanding />} />
      <Route path="/visitor/register" element={<VisitorRegistration />} />
    </Routes>
  );
}
