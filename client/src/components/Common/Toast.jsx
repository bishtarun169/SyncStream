import React from "react";

export default function Toast({ toast }) {
  if (!toast || !toast.message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] animate-fadeIn">
      <div className={`backdrop-blur-md px-6 py-4 rounded-2xl border flex items-center gap-3 shadow-2xl max-w-sm ${
        toast.type === "success"
          ? "bg-green-500/10 border-green-500/30 text-green-400"
          : toast.type === "error"
          ? "bg-red-500/10 border-red-500/30 text-red-400"
          : "bg-zinc-800/90 border-zinc-700 text-white"
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          toast.type === "success"
            ? "bg-green-500 animate-pulse"
            : toast.type === "error"
            ? "bg-red-500 animate-pulse"
            : "bg-white animate-pulse"
        }`} />
        <span className="text-xs font-bold leading-normal">{toast.message}</span>
      </div>
    </div>
  );
}
