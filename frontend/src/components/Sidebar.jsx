import React from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
    { name: "Food Scanner", path: "/food-scanner", icon: "photo_camera" },
    { name: "Diet Plan", path: "/diet-plan", icon: "restaurant_menu" },
    { name: "Health Analytics", path: "/health-analytics", icon: "monitoring" },
    { name: "Medication", path: "/medication", icon: "medication" },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 flex-none md:flex min-h-screen">
      <div className="p-6 flex items-center gap-3">
        <div>
          <h1 className="font-bold text-xl tracking-tight">FitPulse</h1>
          <p className="text-xs text-slate-500 font-medium">
            Wellness Assistant
          </p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-10">
          <p className="px-4 text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">
            Account
          </p>
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              location.pathname === "/settings"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm">Settings</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
