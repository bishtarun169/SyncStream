import React from "react";

export default function WelcomeBanner({ user, isLight }) {
  const textMutedClass = isLight ? "text-zinc-555" : "text-zinc-400";

  return (
    <div
      className={`border p-8 rounded-3xl relative overflow-hidden shadow-xl text-left ${
        isLight
          ? "bg-gradient-to-r from-red-500/5 to-zinc-100 border-zinc-200"
          : "bg-gradient-to-r from-red-950/20 to-zinc-900 border-zinc-800/80"
      }`}
    >
      <div className="relative z-10 max-w-xl space-y-2">
        <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold">
          🍿 Active Streamer
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Welcome back,{" "}
          <span className="text-red-500">{user.name}</span>!
        </h2>
        <p
          className={`${textMutedClass} text-sm sm:text-base leading-relaxed`}
        >
          Ready to watch some movies? Create a room and invite your
          friends, or join an active room with a code.
        </p>
      </div>
      <div className="absolute right-[-5%] bottom-[-20%] text-red-500/[0.03] text-[200px] font-black select-none pointer-events-none hidden lg:block">
        STREAM
      </div>
    </div>
  );
}
