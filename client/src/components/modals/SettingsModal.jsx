import React from "react";
import { FaTimes, FaMoon, FaSun, FaDesktop, FaGlobe, FaLock } from "react-icons/fa";

export default function SettingsModal({
  isOpen,
  onClose,
  isLight,
  settingsTheme,
  setSettingsTheme,
  settingsAllowJoinRequests,
  setSettingsAllowJoinRequests,
  settingsError,
  settingsSuccess,
  handleSaveSettings
}) {
  if (!isOpen) return null;

  const textMutedClass = isLight ? "text-zinc-555" : "text-zinc-400";
  const modalThemeClass = isLight
    ? "bg-white border border-zinc-200"
    : "bg-[#18181b] border border-zinc-800";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl relative ${modalThemeClass}`}
      >
        <button
          onClick={onClose}
          className={`absolute right-4 top-4 ${textMutedClass} hover:text-red-500 cursor-pointer`}
        >
          <FaTimes size={16} />
        </button>

        <h3 className="text-2xl font-bold text-left">Preferences Settings</h3>
        <p className={`${textMutedClass} text-xs sm:text-sm mt-1 text-left`}>
          Personalize your theme and room visibility options.
        </p>

        <form onSubmit={handleSaveSettings} className="mt-6 space-y-6">
          {/* Theme Settings Selection */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider block text-zinc-500 text-left">
              Theme Preference
            </label>
            <div
              className={`grid grid-cols-3 gap-2 border p-1 rounded-xl ${
                isLight ? "bg-zinc-100 border-zinc-250" : "bg-zinc-900/60 border-zinc-800"
              }`}
            >
              <button
                type="button"
                onClick={() => setSettingsTheme("dark")}
                className={`py-2 rounded-lg text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition duration-200 cursor-pointer ${
                  settingsTheme === "dark"
                    ? "bg-red-600 text-white shadow-md font-bold"
                    : isLight
                      ? "text-zinc-555 hover:text-zinc-900"
                      : "text-zinc-400 hover:text-white"
                }`}
              >
                <FaMoon size={11} /> Dark
              </button>
              <button
                type="button"
                onClick={() => setSettingsTheme("light")}
                className={`py-2 rounded-lg text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition duration-200 cursor-pointer ${
                  settingsTheme === "light"
                    ? "bg-red-600 text-white shadow-md font-bold"
                    : isLight
                      ? "text-zinc-555 hover:text-zinc-900"
                      : "text-zinc-400 hover:text-white"
                }`}
              >
                <FaSun size={11} /> Light
              </button>
              <button
                type="button"
                onClick={() => setSettingsTheme("system")}
                className={`py-2 rounded-lg text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition duration-200 cursor-pointer ${
                  settingsTheme === "system"
                    ? "bg-red-600 text-white shadow-md font-bold"
                    : isLight
                      ? "text-zinc-555 hover:text-zinc-900"
                      : "text-zinc-400 hover:text-white"
                }`}
              >
                <FaDesktop size={10} /> System
              </button>
            </div>
          </div>

          {/* Join Requests Privacy Preferences */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider block text-zinc-500 text-left">
              Allow Join Requests From
            </label>
            <div
              className={`grid grid-cols-2 gap-2 border p-1 rounded-xl ${
                isLight ? "bg-zinc-100 border-zinc-250" : "bg-zinc-900/60 border-zinc-800"
              }`}
            >
              <button
                type="button"
                onClick={() => setSettingsAllowJoinRequests("everyone")}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition duration-200 cursor-pointer ${
                  settingsAllowJoinRequests === "everyone"
                    ? "bg-red-600 text-white shadow-md font-bold"
                    : isLight
                      ? "text-zinc-555 hover:text-zinc-900"
                      : "text-zinc-400 hover:text-white"
                }`}
              >
                <FaGlobe size={12} /> Everyone
              </button>
              <button
                type="button"
                onClick={() => setSettingsAllowJoinRequests("friends")}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition duration-200 cursor-pointer ${
                  settingsAllowJoinRequests === "friends"
                    ? "bg-red-600 text-white shadow-md font-bold"
                    : isLight
                      ? "text-zinc-555 hover:text-zinc-900"
                      : "text-zinc-400 hover:text-white"
                }`}
              >
                <FaLock size={11} /> Friends Only
              </button>
            </div>
          </div>

          {/* Alerts */}
          {settingsError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-2.5 text-xs text-left">
              {settingsError}
            </div>
          )}
          {settingsSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-2.5 text-xs text-left">
              {settingsSuccess}
            </div>
          )}

          {/* CTA Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition cursor-pointer ${
                isLight
                  ? "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700"
                  : "bg-zinc-800 hover:bg-zinc-750 border-zinc-700 text-zinc-300"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl text-sm font-semibold transition cursor-pointer shadow-md shadow-red-500/10 text-white"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
