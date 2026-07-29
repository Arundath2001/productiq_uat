import React from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { Menu, Bell } from "lucide-react";

const TopNavbar = ({ isCollapsed, setIsCollapsed }) => {
  const { authUser } = useAuthStore();

  const userRole = Array.isArray(authUser?.adminRoles)
    ? authUser.adminRoles[0]
    : authUser?.adminRoles;
    
  const branchName = authUser?.branchName || "Main Branch";
  
  // Format role name nicely (e.g., "air_cargo_admin" -> "Air Cargo Admin")
  const formattedRole = userRole
    ? userRole
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "User";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left side: Hamburger and Logo */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 -ml-2 rounded-lg text-blue-500 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#6FB5FF] via-[#FFC79C] to-[#C39EF2] text-transparent bg-clip-text">
          Aswaq Forwarder
        </h1>
      </div>

      {/* Right side: Branch, Profile, Notifications */}
      <div className="flex items-center gap-6">
        {/* User Info */}
        <div className="hidden md:block text-left">
          <p className="text-sm text-gray-800">
            {getGreeting()}, <span className="font-bold text-black">{authUser?.username || "User"}</span>
          </p>
          <p className="text-xs text-gray-500">{formattedRole}</p>
        </div>

        {/* Icons & Avatar */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm shadow-sm">
            {authUser?.username ? authUser.username.substring(0, 2).toUpperCase() : "US"}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
