import { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import RoleSwitchAnimation from "../components/RoleSwitchAnimation";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <TopNavbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div className="flex-1 flex min-h-0">
        <Sidebar isCollapsed={isCollapsed} />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <RoleSwitchAnimation />
    </div>
  );
};

export default DashboardLayout;
