// src/components/Header.jsx
import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Flower2,
  Users,
  UserCheck,
  Calendar,
  LayoutDashboard,
  LogOut,
  UserCircle,
  ChevronDown,
} from "lucide-react";
import { FirebaseContext } from "../App";

export function Header() {
  const { authUser, userData, logout } = useContext(FirebaseContext);
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // --- Handle outside click + scroll ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // --- Navigation Links ---
  const navItems = [
    { to: "/chat", label: "AI Chat", icon: MessageCircle },
    { to: "/relaxation", label: "Relaxation Hub", icon: Flower2 },
    { to: "/peer", label: "Peer Connect", icon: Users },
    { to: "/counselors", label: "Find Counselor", icon: UserCheck },
    { to: "/appointments", label: "My Appointments", icon: Calendar },
  ];

  if (userData?.role === "doctor" || userData?.role === "admin") {
    navItems.push({
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    });
  }

  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate("/login");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm"
          : "bg-white/30 backdrop-blur-lg"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Left Section - Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-blue-600" />
          <h1
            className={`text-2xl font-semibold ${
              scrolled ? "text-gray-900" : "text-black"
            }`}
          >
            MindCare
          </h1>
        </Link>

        {/* Middle Section - Navigation */}
        <nav className="hidden lg:flex items-center space-x-1 bg-[#0077b6] px-4 py-2 rounded-3xl shadow-md">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-3xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white text-[#0077b6]"
                    : "text-white hover:bg-white/30 hover:text-black"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right Section - Profile / Login */}
        <div className="flex items-center space-x-3">
          {authUser && userData ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 rounded-3xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all focus:outline-none"
              >
                <UserCircle className="h-5 w-5" />
                <span>Profile</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm text-gray-500">Logged in as</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {capitalize(userData.role)}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center space-x-2 px-4 py-2 rounded-3xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <UserCircle className="h-5 w-5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
