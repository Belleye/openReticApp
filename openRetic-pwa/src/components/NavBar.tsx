import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppState } from "@/context/AppStateContext";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Schedule", path: "/schedule" },
  { label: "Settings", path: "/settings" },
];

const NavBar = () => {
  const location = useLocation();
  const { connectionState } = useAppState();

  return (
    <nav className="flex flex-col sm:flex-row sm:gap-8 gap-2 sm:items-center items-start px-4 sm:px-8 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
      <span className="font-bold text-xl text-blue-800 mb-2 sm:mb-0 sm:mr-8">
        openRetic{connectionState === 'demo' ? ' (Disconnected - Demo Mode)' : ''}
      </span>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 w-full sm:w-auto"> 
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`text-lg px-2 py-1 rounded hover:bg-blue-100 transition-colors w-full sm:w-auto text-center ${
              location.pathname === item.path ? "font-semibold text-blue-700 bg-blue-100" : "text-gray-700"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default NavBar;
