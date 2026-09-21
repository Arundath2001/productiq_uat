import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { PlaneTakeoff, Ship, LayoutDashboard, Building2 } from "lucide-react";

const RoleSwitchAnimation = () => {
  const { switchingToRole } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);
  const [animatingRole, setAnimatingRole] = useState(null);

  useEffect(() => {
    if (switchingToRole) {
      setAnimatingRole(switchingToRole);
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setAnimatingRole(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [switchingToRole]);

  if (!isVisible && !switchingToRole) return null;

  const isAir = animatingRole === "air_cargo_admin";
  const isSea = animatingRole === "ship_cargo_admin";
  const isSuper = animatingRole === "superadmin";

  let bgColor = "bg-indigo-600";
  let Icon = LayoutDashboard;
  let text = "Switching Role...";

  if (isAir) {
    bgColor = "bg-sky-500";
    Icon = PlaneTakeoff;
    text = "Switching to Air Cargo...";
  } else if (isSea) {
    bgColor = "bg-blue-800";
    Icon = Ship;
    text = "Switching to Sea Cargo...";
  } else if (isSuper) {
    bgColor = "bg-purple-600";
    Icon = Building2;
    text = "Switching to Super Admin...";
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${bgColor} transition-opacity duration-500 ${
        switchingToRole ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-24 w-[30rem] h-[30rem] bg-black opacity-10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="animate-bounce bg-white/20 p-6 rounded-full backdrop-blur-sm mb-8 shadow-xl">
          {Icon && <Icon className="text-white w-20 h-20" />}
        </div>
        <h2 className="text-white text-4xl font-bold tracking-wider mb-2 drop-shadow-md">
          {text}
        </h2>
        <div className="w-48 h-1.5 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full animate-[progress_1.5s_ease-in-out_forwards] origin-left"></div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};

export default RoleSwitchAnimation;
