import { Routes, Route } from "react-router-dom";
import AuthPage from "../auth/Auth";

import AdminLayout from "../layouts/AdminLayout";
import HostLayout from "../layouts/HostLayout";
import SecurityLayout from "../layouts/SecurityLayout";

import AdminDashboard from "../pages/admin/AdminDashboard";
import HostDashboard from "../pages/host/HostDashboard";
import SecurityDashboard from "../pages/SecurtiyDashboard/SecurityDashboard";
import SuperAdminDashboard from "../pages/SuperAdmin/SuperAdminDashboard";

import VisitorManagementLanding from "../pages/LandingPage/LandingPage";
import DashboardSelection from "../pages/DashboardSelection/DashboardSelection";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />

      <Route element={<AdminDashboard />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route element={<VisitorManagementLanding />}>
        <Route path="/home/landingpage" element={<VisitorManagementLanding />} />
      </Route>

      <Route element={<DashboardSelection />}>
        <Route path="/dashboards" element={<DashboardSelection />} />
      </Route>

      <Route element={<HostDashboard />}>
        <Route path="/host/dashboard" element={<HostDashboard />} />
      </Route>

      <Route element={<SuperAdminDashboard />}>
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
      </Route>

      <Route element={<SecurityDashboard />}>
        <Route path="/security/dashboard" element={<SecurityDashboard />} />
      </Route>
    </Routes>
  );
}
