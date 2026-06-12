import React from "react";
import { FaUsers, FaUserPlus, FaTimes } from "react-icons/fa";

export default function FriendsPanel({
  friends,
  onlineCount,
  newFriendName,
  setNewFriendName,
  onAddFriend,
  onRemoveFriend,
  isLight
}) {
  const cardThemeClass = isLight
    ? "bg-white border-zinc-200 text-zinc-900"
    : "bg-[#18181b]/50 border-zinc-800 text-white";
  const borderSubtleClass = isLight ? "border-zinc-200" : "border-zinc-850";
  const inputThemeClass = isLight
    ? "bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:ring-red-500/20"
    : "bg-zinc-900/60 border-zinc-700 text-white focus:border-red-500";
  const textMutedClass = isLight ? "text-zinc-555" : "text-zinc-400";

  return (
    <div
      className={`lg:col-span-4 ${cardThemeClass} p-6 rounded-3xl space-y-6 border shadow-xl w-full text-left`}
    >
      <div
        className={`flex items-center justify-between border-b ${borderSubtleClass} pb-4`}
      >
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FaUsers className="text-red-500" size={18} /> Friends List
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
          {onlineCount} Online
        </span>
      </div>

      {/* Search Add Friend Form */}
      <form onSubmit={onAddFriend} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter username..."
          value={newFriendName}
          onChange={(e) => setNewFriendName(e.target.value)}
          className={`flex-grow rounded-xl px-3 py-2 text-xs outline-none transition border ${inputThemeClass}`}
        />
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5 font-bold flex-shrink-0"
        >
          <FaUserPlus size={12} /> Add
        </button>
      </form>

      {/* Friends items scroll list */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
        {friends.length === 0 ? (
          <p className={`${textMutedClass} text-xs text-center py-6`}>
            No friends added yet.
          </p>
        ) : (
          friends.map((friend, idx) => (
            <div
              key={friend._id || idx}
              className={`flex items-center justify-between p-3 rounded-xl border transition duration-200 ${
                isLight
                  ? "bg-zinc-50 border-zinc-100 hover:bg-zinc-100"
                  : "bg-zinc-900/30 border-zinc-800/40 hover:bg-zinc-900/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-extrabold flex items-center justify-center flex-shrink-0">
                  {friend.avatar}
                </div>
                <div>
                  <span className="text-xs font-bold block">
                    {friend.name}{" "}
                    {friend.userId && (
                      <span className="text-[10px] font-normal text-zinc-500 font-mono ml-1">
                        @{friend.userId}
                      </span>
                    )}
                  </span>
                  <span
                    className={`${textMutedClass} text-[10px] flex items-center gap-1`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        friend.status === "online"
                          ? "bg-green-500"
                          : "bg-zinc-500"
                      }`}
                    ></span>
                    {friend.status === "online" ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onRemoveFriend(friend._id)}
                className="text-zinc-500 hover:text-red-500 p-1.5 transition rounded-lg hover:bg-red-500/10 cursor-pointer flex items-center justify-center"
                title="Remove Friend"
              >
                <FaTimes size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
