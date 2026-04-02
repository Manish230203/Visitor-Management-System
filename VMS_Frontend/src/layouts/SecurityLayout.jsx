import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";

export default function SecurityLayout() {
  return (
    <div>
      <Navbar role="security" userName="Guard" />
      <Outlet />
    </div>
  );
}