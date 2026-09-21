import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { Menu, Bell, ChevronDown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TopNavbar = ({ isCollapsed, setIsCollapsed }) => {
  const { authUser, activeRole, setActiveRole, setSwitchingToRole, switchBranch } = useAuthStore();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const sampleNotifications = [
    { id: 1, title: "New Voyage Created", message: "Voyage #1024 to Dubai has been created.", time: "5m ago", isRead: false },
    { id: 2, title: "Client Approved", message: "Client 'Alpha Logistics' was approved.", time: "1h ago", isRead: false },
    { id: 3, title: "System Update", message: "Server maintenance scheduled for midnight.", time: "2h ago", isRead: true },
    { id: 4, title: "Cargo Loaded", message: "Cargo for Voyage #1021 has been successfully loaded at the port.", time: "4h ago", isRead: true },
    { id: 5, title: "Payment Received", message: "Payment of $4,500 received from Beta Corp.", time: "1d ago", isRead: true },
    { id: 6, title: "New Branch Added", message: "A new branch 'Abu Dhabi HQ' has been registered.", time: "2d ago", isRead: true },
  ];

  const userRoles = Array.isArray(authUser?.adminRoles) && authUser.adminRoles.length > 0
    ? authUser.adminRoles
    : [authUser?.adminRoles || authUser?.role].filter(Boolean);
    
  const branchName = authUser?.branchName || "Main Branch";
  
  // Format role name nicely (e.g., "air_cargo_admin" -> "Air Cargo Admin")
  const formatRole = (role) => {
    if (!role) return "User";
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleRoleChange = (newRole) => {
    setIsDropdownOpen(false);
    if (newRole === activeRole) return;
    
    // Trigger animation
    setSwitchingToRole(newRole);
    
    setTimeout(() => {
      setActiveRole(newRole);
      if (newRole === "superadmin") {
        navigate("/dashboard/branches");
      } else if (newRole === "air_cargo_admin") {
        navigate("/dashboard/voyage");
      } else if (newRole === "ship_cargo_admin") {
        navigate("/dashboard/sea-voyage");
      } else if (newRole === "approve") {
        navigate("/dashboard/clients");
      } else {
        navigate("/dashboard/voyage");
      }
      
      setTimeout(() => {
        setSwitchingToRole(null);
      }, 500);
    }, 1200);
  };

  const handleBranchChange = (newBranchId) => {
    setIsBranchDropdownOpen(false);
    if (newBranchId === authUser?.branchId) return;
    switchBranch(newBranchId);
  };

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
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#6FB5FF] via-[#FFC79C] to-[#C39EF2] text-transparent bg-clip-text">{import.meta.env.VITE_APP_NAME || "Aswaq Forwarder"}</h1>
      </div>

      {/* Right side: Branch, Profile, Notifications */}
      <div className="flex items-center gap-6">
        {/* User Info */}
        <div className="hidden md:block text-left relative">
          <p className="text-sm text-gray-800">
            {getGreeting()}, <span className="font-bold text-black">{authUser?.username || "User"}</span>
          </p>
          {userRoles.length > 1 ? (
            <div className="relative inline-block mt-0.5">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors border border-blue-100 cursor-pointer"
              >
                {formatRole(activeRole || userRoles[0])}
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDropdownOpen(false)}
                  ></div>
                  <div className="absolute left-0 mt-1.5 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-in fade-in duration-200">
                    {userRoles.map((role) => {
                      const isActive = role === (activeRole || userRoles[0]);
                      return (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(role)}
                          className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            isActive 
                              ? "bg-blue-50/50 text-blue-700" 
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {formatRole(role)}
                          {isActive && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md inline-block mt-0.5 border border-gray-100">
              {formatRole(activeRole || userRoles[0])}
            </p>
          )}

          {/* Branch Switcher */}
          {authUser?.accessibleBranches?.length > 1 && (
            <div className="relative inline-block mt-0.5 ml-2">
              <button 
                onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-md hover:bg-purple-100 transition-colors border border-purple-100 cursor-pointer"
              >
                {branchName}
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isBranchDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isBranchDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsBranchDropdownOpen(false)}
                  ></div>
                  <div className="absolute left-0 mt-1.5 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-in fade-in duration-200">
                    {authUser.accessibleBranches.map((branch) => {
                      const isActive = branch._id === authUser.branchId;
                      return (
                        <button
                          key={branch._id}
                          onClick={() => handleBranchChange(branch._id)}
                          className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            isActive 
                              ? "bg-purple-50/50 text-purple-700" 
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {branch.branchName}
                          {isActive && <Check className="w-3.5 h-3.5 text-purple-600" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Icons & Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            </button>
            
            {isNotifOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsNotifOpen(false)}
                ></div>
                <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                  {/* Tooltip Arrow pointing up */}
                  <div className="absolute -top-2 right-3 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45 z-0"></div>
                  
                  {/* Content Container */}
                  <div className="relative z-10 bg-white rounded-xl overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {sampleNotifications.filter(n => !n.isRead).length} new
                        </span>
                      </div>
                      <button className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {sampleNotifications.map(notif => (
                        <div key={notif.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${notif.isRead ? 'opacity-70' : 'bg-blue-50/30'}`}>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm ${notif.isRead ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'}`}>{notif.title}</h4>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notif.time}</span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t border-gray-100 text-center bg-white">
                      <button className="text-xs font-medium text-blue-600 hover:text-blue-800 w-full py-1.5 cursor-pointer">View All Notifications</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm shadow-sm">
            {authUser?.username ? authUser.username.substring(0, 2).toUpperCase() : "US"}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
