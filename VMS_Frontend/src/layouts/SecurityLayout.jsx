import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <>
      <h1>Security Panel</h1>
      <Outlet />
    </>
  );
}
