import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaKey, FaSignInAlt, FaChevronLeft, FaUsers, FaPlay } from "react-icons/fa";
import Footer from "../components/Footer";

export default function JoinRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const [roomCode, setRoomCode] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    if (code) {
      setRoomCode(code.toUpperCase());
    }
  }, [location.search]);

  const [publicRooms, setPublicRooms] = useState([]);

  const fetchPublicRooms = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch("http://localhost:5000/api/rooms/public-rooms", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        const mapped = data.map(room => ({
          id: room.roomCode,
          name: room.roomName,
          movie: room.videoURL,
          viewers: room.participants ? room.participants.length : 0,
          host: room.host?.name || room.host?.username || "Unknown",
          thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=300&auto=format&fit=crop"
        }));
        setPublicRooms(mapped);
      }
    } catch (err) {
      console.error("Error fetching public rooms:", err);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    if (code) {
      setRoomCode(code.toUpperCase());
    }
    fetchPublicRooms();
  }, [location.search]);

  const handleJoin = (e) => {
    e.preventDefault();
    console.log("Joining room:", { roomCode, password });
    navigate(`/room/${roomCode.toUpperCase()}`, { state: { isCreator: false } });
  };

  const handleQuickJoin = (room) => {
    navigate(`/room/${room.id}`, { state: { roomName: room.name, isCreator: false } });
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white py-12 px-4 relative overflow-hidden flex flex-col items-center">
      {/* Decorative Blur Elements */}
      <div className="absolute top-[20%] left-[-15%] w-[60%] h-[60%] bg-red-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-15%] w-[60%] h-[60%] bg-red-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-6xl w-full relative z-10 flex flex-col gap-12">
        
        {/* Navigation & Header */}
        <div className="self-start">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4 text-sm transition duration-200"
          >
            <FaChevronLeft size={12} /> Back to Home
          </Link>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Join a <span className="text-red-500">Room</span>
          </h1>
          <p className="text-zinc-400 mt-2 text-sm sm:text-base max-w-xl">
            Enter a code to join an existing watch party, or browse currently active public rooms below.
          </p>
        </div>

        {/* Main Grid: Form Left, Features/Instructions Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Join Form Card (Lg: 7 Cols) */}
          <div className="lg:col-span-7 bg-[#18181b]/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-zinc-800 shadow-2xl">
            <form onSubmit={handleJoin} className="space-y-6">
              
              {/* Room Code */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                  <FaKey className="text-red-500" size={14} /> Room Code / Room ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SM-XXXX-XX"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition duration-200 uppercase"
                />
              </div>

              {/* Room Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                  <FaKey className="text-red-500" size={14} /> Room Password (If Private)
                </label>
                <input
                  type="password"
                  placeholder="Leave empty if not required"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3.5 text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition duration-200"
                />
              </div>

              {/* Join Action Button */}
              <button
                type="submit"
                className="w-full bg-red-600 py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 active:scale-[0.98] transition-all duration-200 mt-4 cursor-pointer"
              >
                <FaSignInAlt /> Join Room
              </button>

            </form>
          </div>

          {/* Guidelines / Tips Card (Lg: 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#18181b]/50 border border-zinc-800 p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-bold text-white">How it works</h3>
              <ul className="space-y-4 text-zinc-400 text-sm">
                <li className="flex gap-3">
                  <span className="flex items-center justify-center bg-red-500/10 text-red-500 w-6 h-6 rounded-full flex-shrink-0 text-xs font-bold">1</span>
                  <span>Get the **Room Code** from the creator of the watch room.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center bg-red-500/10 text-red-500 w-6 h-6 rounded-full flex-shrink-0 text-xs font-bold">2</span>
                  <span>Your profile name will be used so friends inside the room can identify you in live chat.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex items-center justify-center bg-red-500/10 text-red-500 w-6 h-6 rounded-full flex-shrink-0 text-xs font-bold">3</span>
                  <span>If the room is private, make sure you enter the correct **Room Password**.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Dashboard: Public Rooms */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3">
              <FaUsers className="text-red-500" size={24} /> Active Public Rooms
            </h2>
            <span className="text-zinc-500 text-xs sm:text-sm font-semibold bg-zinc-800 px-3 py-1.5 rounded-full">
              Live Now
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publicRooms.length === 0 ? (
              <div className="col-span-3 text-center py-12 border border-dashed border-zinc-850 rounded-3xl bg-[#141418]/40">
                <p className="text-zinc-400 text-sm font-bold">No active public rooms right now.</p>
                <p className="text-zinc-500 text-xs mt-1">Create a new watch room and set its privacy to public!</p>
              </div>
            ) : (
              publicRooms.map((room) => (
                <div 
                  key={room.id} 
                  className="bg-[#18181b]/60 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-700 transition duration-300 flex flex-col group shadow-lg"
                >
                  {/* Room Banner image */}
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={room.thumbnail} 
                      alt={room.movie} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-[#18181b]/40 to-transparent"></div>
                    <span className="absolute top-4 right-4 bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      {room.viewers} watching
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white truncate">{room.name}</h3>
                      <p className="text-zinc-400 text-xs flex items-center gap-1.5">
                        <FaPlay size={10} className="text-red-500" /> Playing: <span className="font-semibold text-zinc-300 truncate max-w-[150px] inline-block align-bottom">{room.movie}</span>
                      </p>
                      <p className="text-zinc-500 text-xs">
                        Hosted by: <span className="text-zinc-400">{room.host}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleQuickJoin(room)}
                      className="w-full bg-zinc-800 hover:bg-red-600 hover:text-white py-2.5 rounded-xl text-sm font-semibold transition duration-200 cursor-pointer flex items-center justify-center gap-2"
                    >
                      Quick Join
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
