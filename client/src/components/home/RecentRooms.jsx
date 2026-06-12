import React from "react";
import { FaHistory, FaClock } from "react-icons/fa";

export default function RecentRooms({ recentRooms, isLight }) {
  const cardNestedThemeClass = isLight
    ? "bg-zinc-100/50 border-zinc-200"
    : "bg-[#18181b]/30 border-zinc-800/60";
  const textMutedClass = isLight ? "text-zinc-555" : "text-zinc-400";

  return (
    <div className="space-y-4 text-left">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <FaHistory className="text-red-500" size={16} />
        Recent Watch Parties
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recentRooms.length === 0 ? (
          <div
            className={`col-span-2 text-center py-10 border border-dashed rounded-3xl ${
              isLight
                ? "border-zinc-300 bg-zinc-50/50"
                : "border-zinc-800/60 bg-[#141418]/20"
            }`}
          >
            <p className={`${textMutedClass} text-xs font-bold`}>
              No recent watch parties found.
            </p>
            <p
              className={`${isLight ? "text-zinc-400" : "text-zinc-500"} text-[10px] mt-1`}
            >
              Create a new room or join a friend's room to get
              started!
            </p>
          </div>
        ) : (
          recentRooms.map((room) => (
            <div
              key={room.id}
              className={`${cardNestedThemeClass} p-5 rounded-2xl flex items-center justify-between border ${
                isLight ? "border-zinc-200" : "border-zinc-800/40"
              }`}
            >
              <div className="space-y-1 max-w-[70%]">
                <h4 className="font-bold text-sm truncate">
                  {room.name}
                </h4>
                <p
                  className={`${textMutedClass} text-[11px] truncate`}
                >
                  Playing: {room.movie}
                </p>
                <p
                  className={`${isLight ? "text-zinc-400" : "text-zinc-500"} text-[10px] flex items-center gap-1.5 mt-2`}
                >
                  <FaClock size={8} /> {room.date} •{" "}
                  {room.participants}
                </p>
              </div>
              <span
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg ${
                  isLight ? "bg-zinc-200 text-zinc-700" : "bg-zinc-800 text-zinc-300"
                }`}
              >
                {room.id}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
