import { Outlet } from "react-router-dom";
import Navbar from "./navBar/NavBar";
import Sidebar from "./sideBar/SideBar";

/**
 * Layout Component
 * Wraps protected routes with shared Navbar and Sidebar.
 * This prevents unnecessary re-mounting and preserves UI state (like scroll position).
 */
const Layout = () => {
  return (
    <>
      <Navbar />
      <Sidebar />
      {/* The Outlet component will render the child routes (e.g. Dashboard, Settings, etc.) */}
      <Outlet />
    </>
  );
};

export default Layout;
