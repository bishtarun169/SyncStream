import React from "react";
import { FaCalendarAlt, FaTv, FaSignInAlt, FaClock } from "react-icons/fa";

export default function ProfileSummary({ user, isLight }) {
  const cardThemeClass = isLight
    ? "bg-white border-zinc-200 text-zinc-900"
    : "bg-[#18181b]/50 border-zinc-800 text-white";
  const textMutedClass = isLight ? "text-zinc-555" : "text-zinc-400";
  const textSubtleClass = isLight ? "text-zinc-650" : "text-zinc-355";

  const formatJoinedDate = (isoString) => {
    if (!isoString) return "June 2026";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div
      className={`${cardThemeClass} p-8 sm:p-10 rounded-3xl border shadow-xl flex flex-col sm:flex-row gap-8 items-center sm:items-start relative overflow-hidden`}
    >
      {/* Profile Avatar Grid */}
      <div className="relative group flex-shrink-0">
        {user.profilePic ? (
          <img
            src={user.profilePic}
            alt={user.name}
            className="w-24 h-24 rounded-3xl object-cover border border-zinc-300 shadow-inner"
          />
        ) : (
          <div className="w-24 h-24 rounded-3xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center text-4xl font-extrabold shadow-inner">
            {user.name ? user.name.charAt(0) : "U"}
          </div>
        )}
      </div>

      <div className="flex-grow space-y-6 text-center sm:text-left min-w-0 w-full">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold truncate">{user.name}</h3>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold">
              Premium Member
            </span>
            <span
              className={`text-xs ${isLight ? "text-zinc-400" : "text-zinc-505"} flex items-center gap-1`}
            >
              <FaCalendarAlt size={10} /> Joined{" "}
              {formatJoinedDate(user.createdAt)}
            </span>
          </div>
        </div>

        {user.bio && (
          <p
            className={`text-sm ${textMutedClass} italic leading-relaxed border-l-2 border-red-500 pl-4 py-1 mt-4 text-left break-words`}
          >
            "{user.bio}"
          </p>
        )}

        {/* Form fields displays */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 border-t ${
            isLight ? "border-zinc-200" : "border-zinc-800/80"
          } pt-6 text-left`}
        >
          <div className="min-w-0">
            <span
              className={`text-xs ${isLight ? "text-zinc-400" : "text-zinc-505"} uppercase tracking-wider block font-semibold`}
            >
              User ID
            </span>
            <span
              className={`${textSubtleClass} text-sm sm:text-base font-medium truncate block font-mono`}
            >
              @{user.userId || "unassigned"}
            </span>
          </div>
          <div className="min-w-0">
            <span
              className={`text-xs ${isLight ? "text-zinc-400" : "text-zinc-505"} uppercase tracking-wider block font-semibold`}
            >
              Email Address
            </span>
            <span
              className={`${textSubtleClass} text-sm sm:text-base font-medium truncate block`}
            >
              {user.email}
            </span>
          </div>
          <div className="min-w-0">
            <span
              className={`text-xs ${isLight ? "text-zinc-400" : "text-zinc-505"} uppercase tracking-wider block font-semibold`}
            >
              Gender
            </span>
            <span
              className={`${textSubtleClass} text-sm sm:text-base font-medium capitalize block`}
            >
              {user.gender || "Unspecified"}
            </span>
          </div>
          <div className="min-w-0">
            <span
              className={`text-xs ${isLight ? "text-zinc-400" : "text-zinc-505"} uppercase tracking-wider block font-semibold`}
            >
              Location
            </span>
            <span
              className={`${textSubtleClass} text-sm sm:text-base font-medium block truncate`}
            >
              {user.location || "Earth 🌍"}
            </span>
          </div>
          <div className="min-w-0">
            <span
              className={`text-xs ${isLight ? "text-zinc-400" : "text-zinc-505"} uppercase tracking-wider block font-semibold`}
            >
              Birthday
            </span>
            <span
              className={`${textSubtleClass} text-sm sm:text-base font-medium block`}
            >
              {user.birthday || "Not specified"}
            </span>
          </div>
          <div className="min-w-0">
            <span
              className={`text-xs ${isLight ? "text-zinc-400" : "text-zinc-505"} uppercase tracking-wider block font-semibold`}
            >
              Status Code
            </span>
            <span
              className={`${textSubtleClass} text-sm sm:text-base font-medium block`}
            >
              Active Streamer 🍿
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
