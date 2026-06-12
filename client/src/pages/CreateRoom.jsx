import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGlobe, FaLock, FaUsers, FaHeading, FaChevronLeft, FaYoutube, FaTwitch, FaInstagram, FaLink, FaSignInAlt, FaInfoCircle } from "react-icons/fa";
import { API_BASE } from "../config/api";

export default function CreateRoom() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [roomName, setRoomName] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("10");
  const [mediaSource, setMediaSource] = useState(null); // 'youtube' | 'twitch' | 'instagram' | 'custom'
  const [mediaUrl, setMediaUrl] = useState("");
  const [privacy, setPrivacy] = useState("public"); // "public" or "private"
  const [password, setPassword] = useState("");

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const extractTwitchChannel = (url) => {
    const parts = url.split("twitch.tv/");
    return parts.length > 1 ? parts[1].split(/[?#]/)[0] : null;
  };

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create room using backend API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      // Normalize URL before sending
      let resolvedUrl = mediaUrl.trim();
      const token = localStorage.getItem("token");

      // Call backend create room API
      const response = await fetch(
        `${API_BASE}/api/rooms/create-room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roomName,
            videoURL: resolvedUrl,
            privacy,
            password,
            maxParticipants,
            mediaSource,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create room");
      }

      console.log("Room created:", data);

      // Backend generated room code
      const roomCode = data.room.roomCode;

      // Redirect to actual room
      navigate(`/room/${roomCode}`);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isLight = theme === "light";
  const bgThemeClass = isLight ? "bg-zinc-50 text-zinc-900" : "bg-[#0f0f13] text-white";
  const textMutedClass = isLight ? "text-zinc-500" : "text-zinc-400";
  const cardThemeClass = isLight ? "bg-white border-zinc-200 text-zinc-900 shadow-lg" : "bg-[#18181b]/80 border-zinc-800 text-white shadow-2xl";
  const inputThemeClass = isLight ? "bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:ring-red-500/20" : "bg-zinc-900/60 border-zinc-700 text-white focus:border-red-500";
  const nestedCardThemeClass = isLight ? "bg-zinc-100/50 border border-zinc-200" : "bg-[#18181b]/50 border border-zinc-800";

  return (
    <div className={`min-h-screen ${bgThemeClass} py-12 px-4 relative overflow-hidden flex flex-col items-center transition-colors duration-300`}>
      {/* Decorative Blur Elements */}
      <div className="absolute top-[20%] left-[-15%] w-[60%] h-[60%] bg-red-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-15%] w-[60%] h-[60%] bg-red-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-6xl w-full relative z-10 flex flex-col gap-12">

        {/* Navigation & Header */}
        <div className="self-start">
          <Link
            to="/home"
            className={`inline-flex items-center gap-2 mb-4 text-sm transition duration-200 ${isLight ? 'text-zinc-600 hover:text-zinc-900' : 'text-zinc-400 hover:text-white'}`}
          >
            <FaChevronLeft size={12} /> Back to Home
          </Link>
          <h1 className={`text-3xl sm:text-5xl font-black tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            Create a <span className="text-red-500">Room</span>
          </h1>
          <p className={`${textMutedClass} mt-2 text-sm sm:text-base max-w-xl`}>
            Set up a live synchronized room to chat, react, and watch movies together with your friends.
          </p>
        </div>

        {/* Main Grid: Form Left, Hosting Guidelines Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Form Card (Lg: 7 Cols) */}
          <div className={`lg:col-span-7 ${cardThemeClass} backdrop-blur-md p-8 sm:p-10 rounded-3xl border`}>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Room Name */}
              <div className="space-y-2">
                <label className={`text-sm font-semibold flex items-center gap-2 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  <FaHeading className="text-red-500" size={14} /> Room Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Action Movie Night 🍿"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className={`w-full rounded-xl px-4 py-3.5 outline-none transition duration-200 border ${inputThemeClass}`}
                />
              </div>

              {/* Max Participants */}
              <div className="space-y-2">
                <label className={`text-sm font-semibold flex items-center gap-2 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  <FaUsers className="text-red-500" size={14} /> Max Participants
                </label>
                <input
                  type="number"
                  required
                  min="2"
                  max="100"
                  placeholder="e.g. 10"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className={`w-full rounded-xl px-4 py-3.5 outline-none transition duration-200 border ${inputThemeClass}`}
                />
              </div>

              {/* Select Watch Source Grid */}
              <div className="space-y-3">
                <label className={`text-sm font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  Select Watch Source
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                  {/* YouTube Button */}
                  <button
                    type="button"
                    onClick={() => { setMediaSource("youtube"); setMediaUrl(""); }}
                    className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all duration-300 group cursor-pointer border ${
                      mediaSource === "youtube"
                        ? "border-red-500 bg-red-500/[0.04] shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                        : isLight ? "bg-white border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300" : "bg-zinc-900/60 border-zinc-850 hover:border-zinc-700"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                      mediaSource === "youtube"
                        ? "bg-red-600/20 text-red-500 border-red-500/30 scale-110"
                        : isLight ? "bg-red-500/10 text-red-500 border-red-500/10 group-hover:scale-105" : "bg-red-650/10 text-red-500/80 border-red-500/10 group-hover:scale-105"
                      }`}>
                      <FaYoutube size={20} />
                    </div>
                    <span className={`text-[11px] font-bold transition duration-200 ${
                      mediaSource === "youtube" ? (isLight ? "text-zinc-800" : "text-white") : (isLight ? "text-zinc-500 group-hover:text-zinc-700" : "text-zinc-400 group-hover:text-zinc-300")
                      }`}>YouTube</span>
                  </button>

                  {/* Twitch Button */}
                  <button
                    type="button"
                    onClick={() => { setMediaSource("twitch"); setMediaUrl(""); }}
                    className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all duration-300 group cursor-pointer border ${
                      mediaSource === "twitch"
                        ? "border-purple-500 bg-purple-500/[0.04] shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                        : isLight ? "bg-white border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300" : "bg-zinc-900/60 border-zinc-850 hover:border-zinc-700"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                      mediaSource === "twitch"
                        ? "bg-purple-650/20 text-purple-400 border-purple-500/30 scale-110"
                        : isLight ? "bg-purple-500/10 text-purple-500 border-purple-500/10 group-hover:scale-105" : "bg-purple-650/10 text-purple-400/85 border-purple-500/10 group-hover:scale-105"
                      }`}>
                      <FaTwitch size={18} />
                    </div>
                    <span className={`text-[11px] font-bold transition duration-200 ${
                      mediaSource === "twitch" ? (isLight ? "text-zinc-800" : "text-white") : (isLight ? "text-zinc-500 group-hover:text-zinc-700" : "text-zinc-400 group-hover:text-zinc-300")
                      }`}>Twitch</span>
                  </button>

                  {/* Instagram Button */}
                  <button
                    type="button"
                    onClick={() => { setMediaSource("instagram"); setMediaUrl(""); }}
                    className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all duration-300 group cursor-pointer border ${
                      mediaSource === "instagram"
                        ? "border-pink-500 bg-pink-500/[0.04] shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                        : isLight ? "bg-white border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300" : "bg-zinc-900/60 border-zinc-850 hover:border-zinc-700"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                      mediaSource === "instagram"
                        ? "bg-pink-600/20 text-pink-455 border-pink-500/30 scale-110"
                        : isLight ? "bg-pink-500/10 text-pink-500 border-pink-500/10 group-hover:scale-105" : "bg-pink-650/10 text-pink-455/80 border-pink-500/10 group-hover:scale-105"
                      }`}>
                      <FaInstagram size={18} />
                    </div>
                    <span className={`text-[11px] font-bold transition duration-200 ${
                      mediaSource === "instagram" ? (isLight ? "text-zinc-800" : "text-white") : (isLight ? "text-zinc-500 group-hover:text-zinc-700" : "text-zinc-400 group-hover:text-zinc-300")
                      }`}>Instagram</span>
                  </button>

                  {/* Custom Link Button */}
                  <button
                    type="button"
                    onClick={() => { setMediaSource("custom"); setMediaUrl(""); }}
                    className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all duration-300 group cursor-pointer border ${
                      mediaSource === "custom"
                        ? "border-red-500 bg-red-500/[0.04] shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                        : isLight ? "bg-white border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300" : "bg-zinc-900/60 border-zinc-850 hover:border-zinc-700"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                      mediaSource === "custom"
                        ? "bg-red-650/20 text-red-500 border-red-500/30 scale-110"
                        : isLight ? "bg-red-500/10 text-red-500 border-red-500/10 group-hover:scale-105" : "bg-red-650/10 text-red-500/80 border-red-500/10 group-hover:scale-105"
                      }`}>
                      <FaLink size={15} />
                    </div>
                    <span className={`text-[11px] font-bold transition duration-200 ${
                      mediaSource === "custom" ? (isLight ? "text-zinc-800" : "text-white") : (isLight ? "text-zinc-500 group-hover:text-zinc-700" : "text-zinc-400 group-hover:text-zinc-300")
                      }`}>Custom Link</span>
                  </button>

                </div>
              </div>

              {/* Conditional Media URL Input */}
              <div
                className={`transition-all duration-300 origin-top ${mediaSource
                  ? "max-h-28 opacity-100 scale-y-100"
                  : "max-h-0 opacity-0 scale-y-0 overflow-hidden pointer-events-none"
                  }`}
              >
                {mediaSource && (
                  <div className="space-y-2">
                    <label className={`text-sm font-semibold flex items-center gap-2 ${isLight ? 'text-zinc-750' : 'text-zinc-300'}`}>
                      {mediaSource === "youtube" && <FaYoutube className="text-red-500" size={16} />}
                      {mediaSource === "twitch" && <FaTwitch className="text-purple-500" size={14} />}
                      {mediaSource === "instagram" && <FaInstagram className="text-pink-500" size={14} />}
                      {mediaSource === "custom" && <FaLink className="text-red-500" size={12} />}
                      Enter {mediaSource === "youtube" ? "YouTube URL or Video ID" : mediaSource === "twitch" ? "Twitch Channel Name" : mediaSource === "instagram" ? "Instagram Video URL" : "Custom Video Stream URL"}
                    </label>
                    <input
                      type="text"
                      required={!!mediaSource}
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder={
                        mediaSource === "youtube"
                          ? "e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ"
                          : mediaSource === "twitch"
                            ? "e.g. lofi_girl"
                            : mediaSource === "instagram"
                              ? "Paste Instagram Video URL"
                              : "Paste custom mp4/webm URL"
                      }
                      className={`w-full rounded-xl px-4 py-3.5 outline-none transition duration-200 border ${inputThemeClass}`}
                    />
                  </div>
                )}
              </div>

              {/* Privacy (Public / Private) */}
              <div className="space-y-2">
                <label className={`text-sm font-semibold ${isLight ? 'text-zinc-750' : 'text-zinc-300'}`}>
                  Room Privacy
                </label>
                <div className={`grid grid-cols-2 gap-3 p-1.5 rounded-xl border ${isLight ? 'bg-zinc-105 border-zinc-200' : 'bg-zinc-900/60 border-zinc-700'}`}>
                  <button
                    type="button"
                    onClick={() => setPrivacy("public")}
                    className={`py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition duration-200 ${privacy === "public"
                      ? "bg-red-600 text-white shadow-md font-bold"
                      : isLight ? "text-zinc-600 hover:text-zinc-900" : "text-zinc-400 hover:text-white"
                      }`}
                  >
                    <FaGlobe size={14} /> Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrivacy("private")}
                    className={`py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition duration-200 ${privacy === "private"
                      ? "bg-red-600 text-white shadow-md font-bold"
                      : isLight ? "text-zinc-600 hover:text-zinc-900" : "text-zinc-400 hover:text-white"
                      }`}
                  >
                    <FaLock size={14} /> Private
                  </button>
                </div>
              </div>

              {/* Conditional Password Field */}
              <div
                className={`transition-all duration-300 origin-top ${privacy === "private"
                  ? "max-h-24 opacity-100 scale-y-100"
                  : "max-h-0 opacity-0 scale-y-0 overflow-hidden pointer-events-none"
                  }`}
              >
                <div className="space-y-2">
                  <label className={`text-sm font-semibold flex items-center gap-2 ${isLight ? 'text-zinc-755' : 'text-zinc-300'}`}>
                    <FaLock className="text-red-500" size={14} /> Optional Room Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter room password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-xl px-4 py-3.5 outline-none transition duration-200 border ${inputThemeClass}`}
                  />
                </div>
              </div>

              {/* Submit Button */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-xs leading-normal">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 active:scale-[0.98] transition-all duration-200 mt-4 cursor-pointer"
              >
                <FaSignInAlt /> 
                {loading ? "Creating Room..." : "Enter Room"}
              </button>

            </form>
          </div>

          {/* Hosting Guidelines / Tips Card (Lg: 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className={`${nestedCardThemeClass} p-8 rounded-3xl space-y-6 shadow-md`}>
              <h3 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                <FaInfoCircle className="text-red-500" size={18} /> Room Hosting Tips
              </h3>
              <ul className={`space-y-5 text-sm ${textMutedClass}`}>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center bg-red-500/10 text-red-500 w-6 h-6 rounded-full flex-shrink-0 text-xs font-bold">1</span>
                  <span>Give your watch room a unique name so your friends know what you're streaming.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center bg-red-500/10 text-red-500 w-6 h-6 rounded-full flex-shrink-0 text-xs font-bold">2</span>
                  <span>Choose a watch source and paste a link (YouTube, Twitch, Instagram, or a custom video).</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center bg-red-500/10 text-red-500 w-6 h-6 rounded-full flex-shrink-0 text-xs font-bold">3</span>
                  <span>Select public so anyone can discover your stream, or secure it with private and a password.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center bg-red-500/10 text-red-500 w-6 h-6 rounded-full flex-shrink-0 text-xs font-bold">4</span>
                  <span>Once inside, copy the invite code at the top to bring friends directly into your room.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
