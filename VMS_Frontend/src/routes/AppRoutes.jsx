import { Routes, Route } from "react-router-dom";
import AuthPage from "../auth/Auth";

import AdminLayout from "../layouts/AdminLayout";
import HostLayout from "../layouts/HostLayout";
import SecurityLayout from "../layouts/SecurityLayout";

import AdminDashboard from "../pages/admin/AdminDashboard";
import HostDashboard from "../pages/host/HostDashboard";
import SecurityDashboard from "../pages/security/SecurityDashboard";

import VisitorManagementLanding from "../pages/LandingPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />

      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route element={<VisitorManagementLanding />}>
        <Route path="/home/landingpage" element={<VisitorManagementLanding />} />
      </Route>

      <Route element={<HostLayout />}>
        <Route path="/host/dashboard" element={<HostDashboard />} />
      </Route>

      <Route element={<SecurityLayout />}>
        <Route path="/security/dashboard" element={<SecurityDashboard />} />
      </Route>
    </Routes>
  );
}
