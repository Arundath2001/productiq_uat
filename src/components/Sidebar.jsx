import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import ConfirmAlert from "./ConfirmAlert";
import { createPortal } from "react-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import {
  PlaneTakeoff,
  CheckCircle,
  Truck,
  QrCode,
  Users,
  UserPlus,
  FileText,
  LayoutDashboard,
  Building2,
  ShipIcon,
  User,
  Package,
  Route,
  Ship,
  File,
  PackageCheck,
  Images,
  Activity,
  BarChart,
} from "lucide-react";

const Sidebar = ({ isCollapsed }) => {
  const { authUser, logout, activeRole } = useAuthStore();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isDubaiBranch = authUser?.branchName?.toLowerCase() === "dubai";

  const menu = {
    superadmin: [
      // { path: "analytics", label: "Analytics", icon: BarChart },
      { path: "branches", label: "Branches", icon: LayoutDashboard },
      { path: "administrators", label: "Administrators", icon: Users },
      { path: "clients", label: "Clients", icon: Building2 },
      { path: "customercode", label: "Customer Code", icon: UserPlus },
      { path: "app-images", label: "App Images", icon: Images },
      { path: "user-activities", label: "User Activity", icon: Activity },
    ],
    air_cargo_admin: [
      // { path: "analytics", label: "Analytics", icon: BarChart },
      { path: "voyage", label: "Air Voyages", icon: PlaneTakeoff },
      { path: "completed", label: "Completed Voyages", icon: CheckCircle },
      { path: "trackproduct", label: "Track Product", icon: Truck },
      { path: "allproduct", label: "All Product QR", icon: QrCode },
      { path: "employee", label: "Employee List", icon: Users },
      ...(isDubaiBranch
        ? [{ path: "clients", label: "Clients", icon: Building2 }]
        : []),

      { path: "customercode", label: "Customer Code", icon: UserPlus },
      // { path: "allbill", label: "Bill of Lading(BOL)", icon: FileText },
      { path: "packages", label: "Packing List", icon: Package },
      { path: "airlines", label: "Airlines", icon: PlaneTakeoff },
      { path: "airports", label: "Airports", icon: PlaneTakeoff },
    ],
    ship_cargo_admin: [
      // { path: "analytics", label: "Analytics", icon: BarChart },
      { path: "sea-voyage", label: "Sea Voyages", icon: ShipIcon },
      {
        path: "completed-sea-voyage",
        label: "Completed Voyages",
        icon: CheckCircle,
      },
      { path: "lines", label: "Shipping Line", icon: Route },
      { path: "received-data", label: "Received Data", icon: File },
      { path: "product-type", label: "Product Type", icon: PackageCheck },
      { path: "allbill", label: "Bill of Lading (BL)", icon: FileText },
    ],
    approve: [
      { path: "clients", label: "Clients", icon: Building2 },
      { path: "customercode", label: "Customer Code", icon: UserPlus },
    ],
  };

  const userRole = activeRole || (Array.isArray(authUser?.adminRoles) && authUser.adminRoles.length > 0 
    ? authUser.adminRoles[0] 
    : (authUser?.adminRoles || authUser?.role));

  return (
    <div
      className={`h-full border-r border-gray-200 bg-[rgba(255,255,255,0.7)] backdrop-blur-lg flex flex-col justify-between transition-all duration-300 z-10 ${
        isCollapsed ? "w-20 px-3 py-6" : "w-64 p-5"
      }`}
    >
      <div>
        <nav className="flex flex-col gap-2">
          {menu[userRole]?.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : ""}
                className={({ isActive }) =>
                  `flex items-center rounded-xl cursor-pointer transition-all duration-200 ${
                    isCollapsed ? "justify-center py-3 px-0" : "px-4 py-3 gap-3"
                  } ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                <Icon className={`flex-shrink-0 ${isCollapsed ? "w-6 h-6" : "w-5 h-5"}`} />
                {!isCollapsed && (
                  <span className="font-medium whitespace-nowrap overflow-hidden text-sm">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className={`bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center ${isCollapsed ? 'p-2' : 'p-3'}`}>
          <div className="flex items-center gap-3 w-full justify-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shadow-sm flex-shrink-0" title={authUser?.username}>
              {authUser?.username ? authUser.username.substring(0, 2).toUpperCase() : "US"}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {authUser?.username || "User"}
                </p>
                <p className="text-xs text-gray-500 capitalize truncate">
                  {/* {userRole?.replace(/_/g, " ")}{" "} */}
                  {authUser?.branchName || "Main Branch"}
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          title={isCollapsed ? "Logout" : ""}
          className={`flex items-center justify-center cursor-pointer transition-all rounded-xl text-red-600 border border-red-200 bg-white hover:bg-red-50 hover:border-red-300 shadow-sm ${
            isCollapsed 
              ? "w-full py-3" 
              : "w-full py-2.5 font-medium gap-2"
          }`}
        >
          <FaSignOutAlt className={isCollapsed ? "w-5 h-5" : ""} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {isLogoutModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <ConfirmAlert
            alertInfo="Are you sure you want to log out of your account?"
            handleClose={() => setIsLogoutModalOpen(false)}
            handleSubmit={() => {
              setIsLogoutModalOpen(false);
              logout();
            }}
            title="Confirm Logout"
            confirmText="Log out"
            cancelText="Cancel"
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export default Sidebar;
