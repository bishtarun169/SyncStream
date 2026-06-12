import React from "react";
import {
  FaCog,
  FaTimes,
  FaCommentSlash,
  FaVolumeMute,
  FaLock,
  FaSignOutAlt
} from "react-icons/fa";

export default function SettingsDropdown({
  isCreator,
  chatDisabled,
  muteAll,
  roomLocked,
  onToggleSetting,
  onLeaveRoom,
  showSettings,
  setShowSettings
}) {
  return (
    <div className="relative flex items-center h-full">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={`w-11 h-11 rounded-xl border flex items-center justify-center transition cursor-pointer ${
          showSettings
            ? "bg-zinc-800 border-zinc-700 text-white"
            : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
        }`}
      >
        <FaCog size={18} />
      </button>

      {/* Settings Dropdown Overlay */}
      {showSettings && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#16161a] border border-zinc-800 p-5 rounded-2xl shadow-2xl z-50 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Settings</span>
            <button
              onClick={() => setShowSettings(false)}
              className="text-zinc-500 hover:text-white transition cursor-pointer"
            >
              <FaTimes size={12} />
            </button>
          </div>

          {/* Settings Toggles (Only visible to Creator/Host) */}
          {isCreator ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-semibold flex items-center gap-2">
                    <FaCommentSlash className="text-red-500" size={12} /> Disable Chat
                  </span>
                  <button
                    onClick={() => onToggleSetting("chatDisabled", chatDisabled)}
                    className={`w-8 h-4 rounded-full transition duration-200 relative ${
                      chatDisabled ? "bg-red-600" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.25 transition-all duration-200 ${
                        chatDisabled ? "left-4" : "left-0.5"
                      }`}
                    ></span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-semibold flex items-center gap-2">
                    <FaVolumeMute className="text-red-500" size={12} /> Mute Everyone
                  </span>
                  <button
                    onClick={() => onToggleSetting("muteAll", muteAll)}
                    className={`w-8 h-4 rounded-full transition duration-200 relative ${
                      muteAll ? "bg-red-600" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.25 transition-all duration-200 ${
                        muteAll ? "left-4" : "left-0.5"
                      }`}
                    ></span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-semibold flex items-center gap-2">
                    <FaLock className="text-red-500" size={11} /> Lock Room
                  </span>
                  <button
                    onClick={() => onToggleSetting("roomLocked", roomLocked)}
                    className={`w-8 h-4 rounded-full transition duration-200 relative ${
                      roomLocked ? "bg-red-600" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.25 transition-all duration-200 ${
                        roomLocked ? "left-4" : "left-0.5"
                      }`}
                    ></span>
                  </button>
                </div>
              </div>

              <hr className="border-zinc-800" />
            </>
          ) : (
            <div className="text-zinc-500 text-xs text-center py-2">
              Room settings are managed by the host.
            </div>
          )}

          {/* End / Leave Room Buttons */}
          {isCreator ? (
            <button
              onClick={onLeaveRoom}
              className="w-full bg-red-600 hover:bg-red-700 py-2.5 rounded-xl text-xs font-bold text-white transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaSignOutAlt /> End Room
            </button>
          ) : (
            <button
              onClick={onLeaveRoom}
              className="w-full bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-zinc-700 py-2.5 rounded-xl text-xs font-bold text-white transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaSignOutAlt /> Leave Room
            </button>
          )}
        </div>
      )}
    </div>
  );
}
