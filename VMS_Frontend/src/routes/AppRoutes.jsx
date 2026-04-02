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

export default function AppRoutes() {
  return (
<Routes>
  <Route path="/" element={<AuthPage />} />

  <Route path="/export" element={<ExportPage />} />

  {/* Layout Routes */}
  <Route element={<AdminLayout />}>
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
  </Route>

  <Route element={<HostLayout />}>
    <Route path="/host/dashboard" element={<HostDashboard />} />
  </Route>

  <Route element={<SecurityLayout />}>
    <Route path="/security/dashboard" element={<SecurityDashboard />} />
  </Route>

  {/* Normal Routes */}
  <Route path="/home/landingpage" element={<VisitorManagementLanding />} />
  <Route path="/dashboards" element={<DashboardSelection />} />
  <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
</Routes>
  );
}
