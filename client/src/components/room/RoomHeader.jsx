import React from "react";
import { Link } from "react-router-dom";
import { FaCheck, FaRegCopy, FaLink } from "react-icons/fa";
import SettingsDropdown from "./SettingsDropdown";

export default function RoomHeader({
  roomName,
  roomId,
  copied,
  onCopyRoomCode,
  copiedLink,
  onCopyInviteLink,
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
    <header className="border-b border-zinc-800 bg-[#111118]/80 backdrop-blur-xl h-20 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 w-full relative z-20">
      <div className="flex items-center gap-4 h-full">
        <Link to="/home" className="text-3xl font-black tracking-tight hover:opacity-90 transition leading-none flex items-center h-full">
          <span className="text-red-500">Stream</span>Mate
        </Link>
        <div className="hidden sm:flex items-center gap-3 border-l border-zinc-800 pl-4 h-8">
          <span className="text-sm text-zinc-500 font-semibold uppercase tracking-wider leading-none">Room:</span>
          <span className="text-sm font-bold text-zinc-300 truncate max-w-[200px] leading-none">{roomName}</span>
        </div>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-4 relative h-full">

        {/* Room Code Badge */}
        <div className="flex items-center bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 select-none shadow h-11">
          <span className="text-sm font-bold text-zinc-400 mr-3 tracking-wide font-mono leading-none">Code: {roomId}</span>
          <button
            onClick={onCopyRoomCode}
            title="Copy Room Code"
            className="text-zinc-400 hover:text-white transition duration-150 cursor-pointer flex items-center justify-center leading-none"
          >
            {copied ? <FaCheck className="text-green-500" size={13} /> : <FaRegCopy size={13} />}
          </button>
        </div>

        {/* Invite Link Badge */}
        <div className="flex items-center bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 select-none shadow h-11">
          <span className="text-xs font-bold text-zinc-400 mr-3 tracking-wide uppercase leading-none">Invite Link</span>
          <button
            onClick={onCopyInviteLink}
            title="Copy Shareable Invite Link"
            className="text-zinc-400 hover:text-white transition duration-150 cursor-pointer flex items-center justify-center leading-none"
          >
            {copiedLink ? <FaCheck className="text-green-500" size={13} /> : <FaLink size={13} />}
          </button>
        </div>

        {/* Settings Dropdown */}
        <SettingsDropdown
          isCreator={isCreator}
          chatDisabled={chatDisabled}
          muteAll={muteAll}
          roomLocked={roomLocked}
          onToggleSetting={onToggleSetting}
          onLeaveRoom={onLeaveRoom}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
        />
      </div>
    </header>
  );
}
