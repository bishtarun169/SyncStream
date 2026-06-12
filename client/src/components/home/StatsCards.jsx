import React from "react";
import { FaTv, FaSignInAlt, FaClock } from "react-icons/fa";

export default function StatsCards({ user, isLight }) {
  const cardNestedThemeClass = isLight
    ? "bg-zinc-100/50 border-zinc-200"
    : "bg-[#18181b]/30 border-zinc-800/60";

  return (
    <div className="grid grid-cols-3 gap-4 text-center">
      <div
        className={`${cardNestedThemeClass} p-6 rounded-2xl text-center space-y-1 border ${
          isLight ? "border-zinc-200" : "border-zinc-800/20"
        }`}
      >
        <div className="text-red-500 flex justify-center">
          <FaTv size={18} />
        </div>
        <h4 className="text-xl sm:text-2xl font-extrabold">
          {user.roomsCreated || 0}
        </h4>
        <p
          className={`${isLight ? "text-zinc-400" : "text-zinc-505"} text-[9px] sm:text-xs uppercase tracking-wider font-semibold`}
        >
          Rooms Created
        </p>
      </div>

      <div
        className={`${cardNestedThemeClass} p-6 rounded-2xl text-center space-y-1 border ${
          isLight ? "border-zinc-200" : "border-zinc-800/20"
        }`}
      >
        <div className="text-red-500 flex justify-center">
          <FaSignInAlt size={18} />
        </div>
        <h4 className="text-xl sm:text-2xl font-extrabold">
          {user.roomsJoined || 0}
        </h4>
        <p
          className={`${isLight ? "text-zinc-400" : "text-zinc-505"} text-[9px] sm:text-xs uppercase tracking-wider font-semibold`}
        >
          Rooms Joined
        </p>
      </div>

      <div
        className={`${cardNestedThemeClass} p-6 rounded-2xl text-center space-y-1 border ${
          isLight ? "border-zinc-200" : "border-zinc-800/20"
        }`}
      >
        <div className="text-red-500 flex justify-center">
          <FaClock size={18} />
        </div>
        <h4 className="text-xl sm:text-2xl font-extrabold">
          {((user.totalWatchMinutes || 0) / 60).toFixed(1)}h
        </h4>
        <p
          className={`${isLight ? "text-zinc-400" : "text-zinc-505"} text-[9px] sm:text-xs uppercase tracking-wider font-semibold`}
        >
          Hours Watched
        </p>
      </div>
    </div>
  );
}
