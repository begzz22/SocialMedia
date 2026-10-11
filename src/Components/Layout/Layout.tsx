import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";

const Layout = () => (
  <div className="min-h-screen bg-[#f0f2f5]" style={{ fontFamily: "Cairo, sans-serif" }}>
    <Navbar />
    <main className="mx-auto max-w-7xl px-2 py-4 sm:px-3">
      <Outlet />
    </main>
  </div>
);

export default Layout;