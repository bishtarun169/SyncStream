import React from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaSignInAlt } from "react-icons/fa";

export default function QuickActions({ isLight }) {
  const cardThemeClass = isLight
    ? "bg-white border-zinc-200 text-zinc-900"
    : "bg-[#18181b]/50 border-zinc-800 text-white";
  const outlineBtnClass = isLight
    ? "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800"
    : "bg-zinc-850 hover:bg-zinc-800 border-zinc-700 hover:border-zinc-600 text-white";
  const textMutedClass = isLight ? "text-zinc-555" : "text-zinc-400";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
      {/* Create Room Card */}
      <div
        className={`${cardThemeClass} p-6 rounded-3xl hover:border-zinc-500/40 transition duration-300 flex flex-col justify-between space-y-5 group border shadow-lg`}
      >
        <div className="space-y-2">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20">
            <FaPlus size={16} />
          </div>
          <h3 className="text-xl font-bold group-hover:text-red-500 transition duration-200">
            Create Watch Room
          </h3>
          <p
            className={`${textMutedClass} text-xs sm:text-sm leading-relaxed`}
          >
            Start a brand new watch party. Choose your room name,
            paste the movie stream link, and invite friends.
          </p>
        </div>
        <Link
          to="/create-room"
          className="bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold text-center text-sm text-white transition duration-200 shadow-md cursor-pointer"
        >
          Create Room
        </Link>
      </div>

      {/* Join Room Card */}
      <div
        className={`${cardThemeClass} p-6 rounded-3xl hover:border-zinc-500/40 transition duration-300 flex flex-col justify-between space-y-5 group border shadow-lg`}
      >
        <div className="space-y-2">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20">
            <FaSignInAlt size={16} />
          </div>
          <h3 className="text-xl font-bold group-hover:text-red-500 transition duration-200">
            Join Watch Room
          </h3>
          <p
            className={`${textMutedClass} text-xs sm:text-sm leading-relaxed`}
          >
            Have a code from a friend? Enter it here to hop directly
            into their synchronized watch room.
          </p>
        </div>
        <Link
          to="/join-room"
          className={`${outlineBtnClass} py-3 rounded-xl font-semibold text-center text-sm transition duration-200 shadow-md cursor-pointer border`}
        >
          Join Room
        </Link>
      </div>
    </div>
  );
}
