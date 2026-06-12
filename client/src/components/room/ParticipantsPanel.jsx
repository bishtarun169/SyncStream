import React from "react";
import {
  FaUsers,
  FaVolumeUp,
  FaMicrophoneSlash,
  FaUserSlash,
  FaUserPlus
} from "react-icons/fa";

export default function ParticipantsPanel({
  participants,
  friends,
  invitedFriends,
  isCreator,
  currentUser,
  onToggleMute,
  onKick,
  onInviteFriend
}) {
  const invitableFriends = friends.filter(friend =>
    !participants.some(p => {
      const pId = p.user?._id || p.user;
      return pId?.toString() === friend._id?.toString();
    })
  );

  return (
    <div className="flex-grow flex flex-col min-h-0">
      {/* Scrollable list wrapper */}
      <div className="flex-grow p-4 overflow-y-auto space-y-6 custom-scrollbar min-h-0">

        {/* Current Participants Section */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <FaUsers size={12} className="text-red-500" /> Active in Room ({participants.length})
          </h4>
          <div className="space-y-2">
            {participants.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-black flex items-center justify-center overflow-hidden flex-shrink-0">
                    {p.user?.profilePic ? (
                      <img src={p.user.profilePic} alt={p.user.name} className="w-full h-full object-cover" />
                    ) : (
                      (p.user?.name || "U").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">
                      {p.user?.name || "Unknown User"}
                      {p.user?.userId && <span className="text-[10px] text-zinc-500 ml-1 font-mono">@{p.user.userId}</span>}
                    </span>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Active
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCreator && p.role !== "host" && (
                    <>
                      <button
                        type="button"
                        onClick={() => onToggleMute(p.user?._id || p.user)}
                        title={p.isMuted ? "Unmute Participant" : "Mute Participant"}
                        className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                          p.isMuted
                            ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                            : "bg-zinc-850 border-zinc-750 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        }`}
                      >
                        {p.isMuted ? <FaMicrophoneSlash size={11} /> : <FaVolumeUp size={11} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => onKick(p.user?._id || p.user)}
                        title="Kick Participant"
                        className="p-1.5 rounded-lg bg-zinc-850 border border-zinc-750 text-zinc-400 hover:text-red-500 hover:border-red-500/30 hover:bg-zinc-800 transition cursor-pointer flex items-center justify-center"
                      >
                        <FaUserSlash size={11} />
                      </button>
                    </>
                  )}
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${p.role === "host" ? "bg-red-600/10 text-red-400 border border-red-500/20" : "bg-zinc-800 text-zinc-400"
                    }`}>
                    {p.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite Friends Section */}
        {isCreator && (
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <FaUserPlus size={12} className="text-red-500" /> Invite Friends
            </h4>

            {friends.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-zinc-800 rounded-2xl">
                <p className="text-zinc-555 text-xs">No friends found.</p>
                <p className="text-zinc-650 text-[10px] mt-1">Add friends from the Dashboard first.</p>
              </div>
            ) : invitableFriends.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-zinc-800 rounded-2xl">
                <p className="text-zinc-555 text-xs">All friends are in the room.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invitableFriends.map((friend) => {
                  const inviteStatus = invitedFriends[friend._id];

                  return (
                    <div
                      key={friend._id}
                      className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-black flex items-center justify-center overflow-hidden flex-shrink-0">
                          {friend.profilePic ? (
                            <img src={friend.profilePic} alt={friend.name} className="w-full h-full object-cover" />
                          ) : (
                            (friend.name || "U").charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-zinc-200">
                            {friend.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 block font-mono mt-0.5">
                            @{friend.userId}
                          </span>
                        </div>
                      </div>

                      {inviteStatus === 'invited' ? (
                        <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-lg font-bold">
                          Invited
                        </span>
                      ) : inviteStatus === 'sending' ? (
                        <span className="text-[9px] bg-zinc-800 text-zinc-500 px-2.5 py-1 rounded-lg font-bold animate-pulse">
                          Sending...
                        </span>
                      ) : (
                        <button
                          onClick={() => onInviteFriend(friend._id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
                        >
                          Invite
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
