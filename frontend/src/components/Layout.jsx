import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./navBar/NavBar";
import Sidebar from "./sideBar/SideBar";

/**
 * Layout Component
 * Wraps protected routes with shared Navbar and Sidebar.
 */
const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`main-layout-content ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
