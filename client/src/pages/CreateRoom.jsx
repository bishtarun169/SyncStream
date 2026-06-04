import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGlobe, FaLock, FaVideo, FaHeading, FaChevronLeft } from "react-icons/fa";

export default function CreateRoom() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [movieUrl, setMovieUrl] = useState("");
  const [privacy, setPrivacy] = useState("public"); // "public" or "private"
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, log the room creation details
    console.log("Creating room:", { roomName, movieUrl, privacy, password });
    alert(`Room "${roomName}" created successfully!`);
    // Redirect to home page or active room in future
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Background Blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg bg-[#18181b]/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-zinc-800 shadow-2xl relative z-10">
        
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm transition duration-200"
        >
          <FaChevronLeft size={12} /> Back to Home
        </Link>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Create <span className="text-red-500">Room</span>
        </h1>
        <p className="text-zinc-400 mt-2 text-sm sm:text-base">
          Set up a room to watch movies together in real-time.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          
          {/* Room Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <FaHeading className="text-red-500" size={14} /> Room Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Action Movie Night 🍿"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition duration-200"
            />
          </div>

          {/* Movie URL / Movie ID */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <FaVideo className="text-red-500" size={14} /> Movie URL / Movie ID
            </label>
            <input
              type="text"
              required
              placeholder="e.g. https://www.youtube.com/watch?v=... or YouTube ID"
              value={movieUrl}
              onChange={(e) => setMovieUrl(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition duration-200"
            />
          </div>

          {/* Privacy (Public / Private) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-300">
              Room Privacy
            </label>
            <div className="grid grid-cols-2 gap-3 bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-700">
              <button
                type="button"
                onClick={() => setPrivacy("public")}
                className={`py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition duration-200 ${
                  privacy === "public"
                    ? "bg-red-600 text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FaGlobe size={14} /> Public
              </button>
              <button
                type="button"
                onClick={() => setPrivacy("private")}
                className={`py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition duration-200 ${
                  privacy === "private"
                    ? "bg-red-600 text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FaLock size={14} /> Private
              </button>
            </div>
          </div>

          {/* Conditional Password Field */}
          <div
            className={`transition-all duration-300 origin-top ${
              privacy === "private"
                ? "max-h-24 opacity-100 scale-y-100"
                : "max-h-0 opacity-0 scale-y-0 overflow-hidden pointer-events-none"
            }`}
          >
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <FaLock className="text-red-500" size={14} /> Optional Room Password
              </label>
              <input
                type="password"
                placeholder="Enter room password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition duration-200"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-red-600 py-4 rounded-xl font-semibold text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 active:scale-[0.98] transition-all duration-200 mt-4 cursor-pointer"
          >
            Create Room
          </button>

        </form>
      </div>
    </div>
  );
}
