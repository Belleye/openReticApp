import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Schedule", path: "/schedule" },
  { label: "Settings", path: "/settings" },
];

const NavBar = () => {
  const location = useLocation();
  return (
    <nav className="flex gap-8 items-center px-8 py-4 bg-gray-50 border-b border-gray-200">
      <span className="font-bold text-xl text-blue-800 mr-8">openRetic</span>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`text-lg px-2 py-1 rounded hover:bg-blue-100 transition-colors ${
            location.pathname === item.path ? "font-semibold text-blue-700 bg-blue-100" : "text-gray-700"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default NavBar;
