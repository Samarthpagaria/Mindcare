import React, { useState } from "react";
import {
  Menu,
  X,
  User,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Settings,
} from "lucide-react";

const navLinks = [
  { href: "#dashboard", label: "Dashboard", icon: User },
  { href: "#students", label: "Students", icon: Users },
  { href: "#faculty", label: "Faculty", icon: BookOpen },
  { href: "#departments", label: "Departments", icon: BookOpen },
  { href: "#events", label: "Events", icon: Calendar },
  { href: "#reports", label: "Reports", icon: FileText },
  { href: "#settings", label: "Settings", icon: Settings },
];

const CollegeAdminSidebar = () => {
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Toggle Button */}
      <button
        className="fixed z-50 bg-[#090446] text-white rounded-full p-2 shadow-lg focus:outline-none"
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          left: open ? "272px" : "24px", // 272px = 64 (sidebar width) + 24px spacing
          transition: "left 0.3s",
        }}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close sidebar" : "Open sidebar"}
      >
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>
      {/* Sidebar */}
      <aside
        className={`h-[calc(100vh-5rem)] bg-[#090446]/90 backdrop-blur-md text-white flex flex-col p-6 shadow-lg fixed top-20 left-0 z-40 transition-all duration-300 ${
          open ? "w-64" : "w-0 overflow-hidden p-0"
        }`}
        style={{ minWidth: open ? "16rem" : "0" }}
      >
        {open && (
          <>
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <User className="w-7 h-7" /> College Admin
            </h2>
            <nav className="flex flex-col gap-4">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-3 hover:bg-blue-700 rounded-md px-3 py-2 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </a>
              ))}
            </nav>
            <div className="mt-auto pt-8 border-t border-blue-900">
              <p className="text-sm">
                Logged in as <span className="font-semibold">Admin</span>
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default CollegeAdminSidebar;
