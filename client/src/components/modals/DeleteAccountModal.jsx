import React from "react";
import { FaTrash } from "react-icons/fa";

export default function DeleteAccountModal({
  isOpen,
  onClose,
  isLight,
  deleteError,
  handleDeleteAccount
}) {
  if (!isOpen) return null;

  const textMutedClass = isLight ? "text-zinc-555" : "text-zinc-400";
  const modalThemeClass = isLight
    ? "bg-white border border-zinc-200"
    : "bg-[#18181b] border border-zinc-800";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl relative ${modalThemeClass}`}
      >
        <h3 className="text-2xl font-bold flex items-center gap-2 text-left">
          <FaTrash className="text-red-500" size={20} /> Delete Account?
        </h3>

        <p className={`${textMutedClass} text-sm mt-3 leading-relaxed text-left`}>
          Are you absolutely sure you want to delete your StreamMate
          account? This action is permanent and cannot be undone. All your
          room listings and user settings will be completely wiped.
        </p>

        {deleteError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-xs mt-4 text-left">
            {deleteError}
          </div>
        )}

        <div className="flex gap-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className={`flex-grow py-3 rounded-xl text-sm font-semibold border transition cursor-pointer ${
              isLight
                ? "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700"
                : "bg-zinc-800 hover:bg-zinc-750 border-zinc-700 text-zinc-300"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteAccount}
            className="flex-grow bg-red-600 hover:bg-red-700 py-3 rounded-xl text-sm font-semibold transition cursor-pointer shadow-md shadow-red-500/10 text-white"
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
}
