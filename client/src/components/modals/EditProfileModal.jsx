import React from "react";
import { FaTimes, FaUser, FaCamera } from "react-icons/fa";

export default function EditProfileModal({
  isOpen,
  onClose,
  isLight,
  editName,
  setEditName,
  editLocation,
  setEditLocation,
  editGender,
  setEditGender,
  editBirthday,
  setEditBirthday,
  editBio,
  setEditBio,
  editPassword,
  setEditPassword,
  editOtp,
  setEditOtp,
  isPasswordOtpSent,
  setIsPasswordOtpSent,
  otpLoading,
  otpSuccessMessage,
  setOtpSuccessMessage,
  editError,
  setEditError,
  editSuccess,
  setEditSuccess,
  editProfilePic,
  handleImageUpload,
  handleRequestPasswordOTP,
  handleUpdateProfile
}) {
  if (!isOpen) return null;

  const isEditLengthMet = editPassword.length >= 8;
  const isEditNumberMet = /[0-9]/.test(editPassword);
  const isEditSpecialMet = /[^a-zA-Z0-9]/.test(editPassword);

  const textMutedClass = isLight ? "text-zinc-555" : "text-zinc-400";
  const modalThemeClass = isLight
    ? "bg-white border border-zinc-200"
    : "bg-[#18181b] border border-zinc-800";
  const inputThemeClass = isLight
    ? "bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:ring-red-500/20"
    : "bg-zinc-900/60 border-zinc-700 text-white focus:border-red-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl relative ${modalThemeClass}`}
      >
        <button
          onClick={onClose}
          className={`absolute right-4 top-4 ${textMutedClass} hover:text-red-500 cursor-pointer`}
        >
          <FaTimes size={16} />
        </button>

        <h3 className="text-xl font-bold text-left">Edit Profile Details</h3>
        <p className={`${textMutedClass} text-xs sm:text-sm mt-1 text-left`}>
          Customize your profile details. Password changes require OTP
          verification.
        </p>

        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
          {/* Profile Avatar Upload preview & input */}
          <div className="flex items-center gap-4 text-left">
            <div
              className={`relative group w-14 h-14 rounded-2xl overflow-hidden border flex items-center justify-center flex-shrink-0 ${
                isLight ? "bg-zinc-100 border-zinc-300" : "bg-zinc-900/60 border-zinc-700"
              }`}
            >
              {editProfilePic ? (
                <img
                  src={editProfilePic}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-zinc-500" size={20} />
              )}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition duration-200">
                <FaCamera size={12} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-[11px]">
              <span className="font-bold block">Avatar Picture</span>
              <span className={textMutedClass}>
                Max size: 2MB. Click preview box to upload.
              </span>
            </div>
          </div>

          {/* Row 1: Name and Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label
                className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
              >
                Display Name
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs outline-none transition border ${inputThemeClass}`}
              />
            </div>
            <div className="space-y-1.5 text-left">
              <label
                className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
              >
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. New York, USA"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs outline-none transition border ${inputThemeClass}`}
              />
            </div>
          </div>

          {/* Row 2: Gender and Birthday */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label
                className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
              >
                Gender
              </label>
              <select
                value={editGender}
                onChange={(e) => setEditGender(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs outline-none transition border ${inputThemeClass}`}
              >
                <option value="">Unspecified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
            <div className="space-y-1.5 text-left">
              <label
                className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
              >
                Birthday
              </label>
              <input
                type="date"
                value={editBirthday}
                onChange={(e) => setEditBirthday(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs outline-none transition border ${inputThemeClass}`}
              />
            </div>
          </div>

          {/* Row 3: Bio */}
          <div className="space-y-1.5 text-left">
            <label
              className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
            >
              Short Bio
            </label>
            <textarea
              placeholder="Tell us about yourself..."
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={2}
              className={`w-full rounded-xl px-3 py-2 text-xs outline-none transition border resize-none ${inputThemeClass}`}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5 text-left">
            <label
              className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}
            >
              New Password (Optional)
            </label>
            <input
              type="password"
              placeholder="Enter new password to change"
              value={editPassword}
              onChange={(e) => {
                setEditPassword(e.target.value);
                if (!e.target.value) {
                  setIsPasswordOtpSent(false);
                  setEditOtp("");
                  setOtpSuccessMessage("");
                }
              }}
              className={`w-full rounded-xl px-3.5 py-2.5 text-xs outline-none transition border ${inputThemeClass}`}
            />
          </div>

          {/* Edit Password Strength Checklist */}
          {editPassword && (
            <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800 text-xs space-y-1.5 text-left">
              <p className="text-zinc-400 font-semibold">
                Password Requirements:
              </p>
              <ul className="space-y-1">
                <li
                  className={`flex items-center gap-2 transition-colors duration-205 ${isEditLengthMet ? "text-green-400 font-medium" : "text-zinc-500"}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isEditLengthMet ? "bg-green-450" : "bg-zinc-600"}`}
                  ></span>
                  At least 8 characters
                </li>
                <li
                  className={`flex items-center gap-2 transition-colors duration-205 ${isEditNumberMet ? "text-green-400 font-medium" : "text-zinc-500"}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isEditNumberMet ? "bg-green-450" : "bg-zinc-600"}`}
                  ></span>
                  At least one number
                </li>
                <li
                  className={`flex items-center gap-2 transition-colors duration-205 ${isEditSpecialMet ? "text-green-400 font-medium" : "text-zinc-500"}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isEditSpecialMet ? "bg-green-450" : "bg-zinc-600"}`}
                  ></span>
                  At least one special character
                </li>
              </ul>
            </div>
          )}

          {editPassword && (
            <div
              className={`p-4 rounded-2xl border space-y-3 text-left ${
                isLight ? "bg-zinc-50 border-zinc-200" : "bg-zinc-900/40 border-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">
                  OTP Verification Required
                </span>
                <button
                  type="button"
                  disabled={otpLoading}
                  onClick={handleRequestPasswordOTP}
                  className="text-xs text-red-400 hover:text-red-300 font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  {otpLoading
                    ? "Sending..."
                    : isPasswordOtpSent
                      ? "Resend OTP"
                      : "Request OTP"}
                </button>
              </div>
              <p className={`text-[10px] ${textMutedClass}`}>
                To update your password, you must verify your identity.
              </p>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit OTP code"
                value={editOtp}
                onChange={(e) => setEditOtp(e.target.value)}
                className={`w-full text-center tracking-widest font-mono text-sm rounded-xl px-3 py-2 outline-none transition border ${inputThemeClass}`}
                required={!!editPassword}
              />
              {otpSuccessMessage && (
                <div className="text-[10px] text-green-400 font-semibold leading-normal">
                  {otpSuccessMessage}
                </div>
              )}
            </div>
          )}

          {/* Alerts */}
          {editError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-2.5 text-xs text-left">
              {editError}
            </div>
          )}
          {editSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-2.5 text-xs text-left">
              {editSuccess}
            </div>
          )}

          {/* CTA Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition cursor-pointer ${
                isLight
                  ? "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700"
                  : "bg-zinc-800 hover:bg-zinc-750 border-zinc-700 text-zinc-300"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl text-sm font-semibold transition cursor-pointer shadow-md shadow-red-500/10 text-white"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
