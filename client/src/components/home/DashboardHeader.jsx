import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBell,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaTimes
} from "react-icons/fa";

export default function DashboardHeader({
  user,
  notifications,
  activeTab,
  setActiveTab,
  isLight,
  onJoinNotification,
  onDismissNotification,
  onLogout,
  onOpenSettings,
  onOpenEditProfile
}) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

  // Theme variable configurations
  const navbarThemeClass = isLight
    ? "border-b border-zinc-200 bg-white/80"
    : "border-b border-zinc-800 bg-[#111118]/80";
  const activeTabClass = isLight
    ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
    : "bg-zinc-800 text-white shadow-md";
  const inactiveTabClass = isLight
    ? "text-zinc-500 hover:text-zinc-900"
    : "text-zinc-400 hover:text-white";
  const textMutedClass = isLight ? "text-zinc-500" : "text-zinc-400";
  const modalThemeClass = isLight
    ? "bg-white border border-zinc-200"
    : "bg-[#18181b] border border-zinc-800";

  // Close menus when clicking outside
  useEffect(() => {
    const handleCloseMenus = (e) => {
      if (!e.target.closest(".nav-dropdown-trigger")) {
        setIsNotificationOpen(false);
        setIsAvatarMenuOpen(false);
      }
    };
    document.addEventListener("click", handleCloseMenus);
    return () => document.removeEventListener("click", handleCloseMenus);
  }, []);

  return (
    <nav className={`${navbarThemeClass} backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/home"
            className="text-2xl sm:text-3xl font-black tracking-tight"
          >
            <span className="text-red-500">Stream</span>Mate
          </Link>

          {/* Navigation tabs */}
          <div
            className={`flex items-center gap-1 ${isLight ? "bg-zinc-200/50 border border-zinc-300/60" : "bg-zinc-900/60 border border-zinc-800"} p-1 rounded-xl`}
          >
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition duration-200 cursor-pointer ${
                activeTab === "dashboard" ? activeTabClass : inactiveTabClass
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition duration-200 cursor-pointer ${
                activeTab === "profile" ? activeTabClass : inactiveTabClass
              }`}
            >
              Profile
            </button>
          </div>

          {/* Right side notification & avatar action group */}
          <div className="flex items-center gap-4 relative">
            {/* Notification Bell */}
            <div className="relative nav-dropdown-trigger">
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsAvatarMenuOpen(false);
                }}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer relative ${
                  isLight
                    ? "text-zinc-650 border-zinc-300 hover:bg-zinc-100"
                    : "text-zinc-400 border-zinc-800 hover:bg-zinc-900/60"
                }`}
              >
                <FaBell size={16} />
                {notifications.length > 0 && (
                  <span className="absolute top-[-3px] right-[-3px] w-4.5 h-4.5 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-[#0f0f13] shadow-md animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {isNotificationOpen && (
                <div
                  className={`absolute right-0 mt-3 w-80 rounded-2xl p-4 shadow-2xl z-50 border ${modalThemeClass} animate-fadeIn`}
                >
                  <div className="flex items-center justify-between border-b pb-2 mb-3 border-zinc-800/10">
                    <span className="text-xs font-black uppercase tracking-wider">
                      Notifications
                    </span>
                    <span className="text-[10px] text-red-500 font-bold">
                      {notifications.length} New
                    </span>
                  </div>

                  {notifications.length === 0 ? (
                    <div
                      className={`text-center py-6 text-xs ${textMutedClass}`}
                    >
                      No new notifications.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl border flex flex-col gap-2 transition duration-200 ${
                            isLight
                              ? "bg-zinc-50 border-zinc-200"
                              : "bg-zinc-900/30 border-zinc-850"
                          }`}
                        >
                          <div className="text-xs text-left">
                            <span className="font-bold text-red-500 block">
                              {n.sender}
                            </span>
                            <span
                              className={
                                isLight ? "text-zinc-650" : "text-zinc-300"
                              }
                            >
                              {n.text}
                            </span>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => {
                                  onJoinNotification(n.room, n.id);
                                  setIsNotificationOpen(false);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold transition flex-1 cursor-pointer"
                              >
                                Join
                              </button>
                              <button
                                onClick={() => onDismissNotification(n.id)}
                                className={`text-[10px] px-3 py-1.5 rounded-lg border transition flex-1 cursor-pointer ${
                                  isLight
                                    ? "bg-zinc-150 hover:bg-zinc-200 border-zinc-300 text-zinc-700"
                                    : "bg-zinc-800 hover:bg-zinc-750 border-zinc-700 text-zinc-300"
                                }`}
                              >
                                Dismiss
                              </button>
                            </div>{" "}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Avatar Circle & Menu Dropdown */}
            <div className="relative nav-dropdown-trigger">
              <button
                onClick={() => {
                  setIsAvatarMenuOpen(!isAvatarMenuOpen);
                  setIsNotificationOpen(false);
                }}
                className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700 hover:border-red-500 transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center bg-zinc-900"
              >
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-red-600/10 text-red-500 flex items-center justify-center font-black text-sm">
                    {user.name ? user.name.charAt(0) : "U"}
                  </div>
                )}
              </button>

              {/* Profile Dropdown Panel */}
              {isAvatarMenuOpen && (
                <div
                  className={`absolute right-0 mt-3 w-56 rounded-2xl p-4 shadow-2xl z-50 border ${modalThemeClass} animate-fadeIn`}
                >
                  <div className="border-b pb-3 mb-2 border-zinc-800/10 text-left">
                    <span className="text-xs font-extrabold block truncate">
                      {user.name}
                    </span>
                    <span
                      className={`text-[10px] block truncate ${textMutedClass}`}
                    >
                      {user.email}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab("profile");
                        setIsAvatarMenuOpen(false);
                      }}
                      className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition duration-200 cursor-pointer ${
                        isLight
                          ? "hover:bg-zinc-100 text-zinc-800"
                          : "hover:bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      <FaUser size={12} className="text-red-500" /> Go to
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        onOpenSettings();
                        setIsAvatarMenuOpen(false);
                      }}
                      className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition duration-200 cursor-pointer ${
                        isLight
                          ? "hover:bg-zinc-100 text-zinc-800"
                          : "hover:bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      <FaCog size={12} className="text-red-500" /> Open
                      Settings
                    </button>
                    <hr
                      className={`${isLight ? "border-zinc-200" : "border-zinc-800/30"} my-2`}
                    />
                    <button
                      onClick={() => {
                        onLogout();
                        setIsAvatarMenuOpen(false);
                      }}
                      className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition duration-200 text-red-500 cursor-pointer ${
                        isLight ? "hover:bg-red-50/50" : "hover:bg-red-500/10"
                      }`}
                    >
                      <FaSignOutAlt size={12} /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
