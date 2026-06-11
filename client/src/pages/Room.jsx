import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  FaTv,
  FaUsers,
  FaComments,
  FaCog,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaYoutube,
  FaTwitch,
  FaInstagram,
  FaLink,
  FaTimes,
  FaPaperPlane,
  FaSignOutAlt,
  FaRegCopy,
  FaCheck,
  FaLock,
  FaLockOpen,
  FaCommentSlash,
  FaExpand,
  FaCompress,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve state parameters passed from creation or join
  const passedState = location.state || {};
  const isCreator = passedState.isCreator !== undefined ? passedState.isCreator : true;
  const initialNickname = passedState.nickname || "Host";
  const initialRoomName = passedState.roomName || "Watch Party Room";

  // Room states
  const [room, setRoom] = useState(null);
  const [roomName, setRoomName] = useState("Loading...");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // "chat" or "participants"
  const [showSettings, setShowSettings] = useState(false);

  // Sidebar and Fullscreen states
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerContainerRef = useRef(null);

  // Settings states
  const [chatDisabled, setChatDisabled] = useState(false);
  const [muteAll, setMuteAll] = useState(false);
  const [roomLocked, setRoomLocked] = useState(false);

  // Source selection & Player states
  const [mediaSource, setMediaSource] = useState(null); // 'youtube' | 'twitch' | 'instagram' | 'custom'
  const [activeVideo, setActiveVideo] = useState(null); // The final video URL/ID
  const [inputValue, setInputValue] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(30); // Mock progress percentage
  const [isMuted, setIsMuted] = useState(false);

  // Mock initial load of room details
  const fetchRoom = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/rooms/code/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      console.log("ROOM:", data);

      setRoom(data);
      setRoomName(data.roomName);

      // Load video info from DB
      setMediaSource(data.mediaSource);
      setActiveVideo(data.videoURL);

    } catch (error) {
      console.error("Failed to load room:", error);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  // Chat message states
  const [messages, setMessages] = useState([
    { id: 1, sender: "Sarah Connor", text: "Hey! Glad to join the room. What are we watching? 🍿", time: "12:30 PM", isSystem: false },
    { id: 2, sender: "John Doe", text: "Lofi Beats sound perfect right now.", time: "12:31 PM", isSystem: false },
    { id: 3, sender: "System", text: `${initialNickname} joined the room.`, time: "12:32 PM", isSystem: true },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef(null);

  // Participants states
  const [participants, setParticipants] = useState([]);
  const fetchParticipants = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/rooms/${room._id}/participants`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      console.log("PARTICIPANTS:", data);
      setParticipants(data.participants);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (room?._id) {
      fetchParticipants();
    }
  }, [room]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Auto-play progress increments when isPlaying is true
  useEffect(() => {
    let interval;
    if (isPlaying && activeVideo) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 0.1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeVideo]);

  // Auto-load passed movieUrl if available
  useEffect(() => {
    if (passedState.movieUrl) {
      const url = passedState.movieUrl;
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        setMediaSource("youtube");
        setActiveVideo(extractYouTubeId(url) || url);
      } else if (url.includes("twitch.tv")) {
        setMediaSource("twitch");
        setActiveVideo(extractTwitchChannel(url) || url);
      } else {
        setMediaSource("custom");
        setActiveVideo(url);
      }
    }
  }, [passedState.movieUrl]);

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const extractTwitchChannel = (url) => {
    const parts = url.split("twitch.tv/");
    return parts.length > 1 ? parts[1].split(/[?#]/)[0] : null;
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSourceSelect = (sourceType) => {
    setMediaSource(sourceType);
    setInputValue("");
    setActiveVideo(null);
  };

  const handleLoadMedia = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    let targetValue = inputValue.trim();
    if (mediaSource === "youtube") {
      const ytid = extractYouTubeId(targetValue);
      if (ytid) targetValue = ytid;
    } else if (mediaSource === "twitch") {
      const twch = extractTwitchChannel(targetValue);
      if (twch) targetValue = twch;
    }

    setActiveVideo(targetValue);
    setIsPlaying(true);
    setProgress(0);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || chatDisabled) return;

    const msg = {
      id: Date.now(),
      sender: initialNickname,
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: false,
    };

    setMessages([...messages, msg]);
    setNewMessage("");
  };

  const handleLeaveRoom = () => {
    if (window.confirm(isCreator ? "Are you sure you want to end this room for all participants?" : "Are you sure you want to leave this watch party?")) {
      navigate("/home");
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0f0f13] text-white flex flex-col font-sans transition-colors duration-300 overflow-hidden relative">

      {/* Decorative blurs */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header / Navbar */}
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
              onClick={copyRoomCode}
              title="Copy Invite Link"
              className="text-zinc-400 hover:text-white transition duration-150 cursor-pointer flex items-center justify-center leading-none"
            >
              {copied ? <FaCheck className="text-green-500" size={13} /> : <FaRegCopy size={13} />}
            </button>
          </div>

          {/* Settings Trigger */}
          <div className="relative flex items-center h-full">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`w-11 h-11 rounded-xl border flex items-center justify-center transition cursor-pointer ${showSettings
                ? "bg-zinc-800 border-zinc-700 text-white"
                : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
            >
              <FaCog size={18} />
            </button>

            {/* Settings Dropdown Overlay */}
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#16161a] border border-zinc-800 p-5 rounded-2xl shadow-2xl z-50 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">Settings</span>
                  <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-white transition cursor-pointer">
                    <FaTimes size={12} />
                  </button>
                </div>

                {/* Settings Toggles (Only visible to Creator/Host) */}
                {isCreator ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-semibold flex items-center gap-2">
                          <FaCommentSlash className="text-red-500" size={12} /> Disable Chat
                        </span>
                        <button
                          onClick={() => setChatDisabled(!chatDisabled)}
                          className={`w-8 h-4 rounded-full transition duration-200 relative ${chatDisabled ? "bg-red-600" : "bg-zinc-700"}`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.25 transition-all duration-200 ${chatDisabled ? "left-4" : "left-0.5"}`}></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-semibold flex items-center gap-2">
                          <FaVolumeMute className="text-red-500" size={12} /> Mute Everyone
                        </span>
                        <button
                          onClick={() => setMuteAll(!muteAll)}
                          className={`w-8 h-4 rounded-full transition duration-200 relative ${muteAll ? "bg-red-600" : "bg-zinc-700"}`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.25 transition-all duration-200 ${muteAll ? "left-4" : "left-0.5"}`}></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-semibold flex items-center gap-2">
                          <FaLock className="text-red-500" size={11} /> Lock Room
                        </span>
                        <button
                          onClick={() => setRoomLocked(!roomLocked)}
                          className={`w-8 h-4 rounded-full transition duration-200 relative ${roomLocked ? "bg-red-600" : "bg-zinc-700"}`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.25 transition-all duration-200 ${roomLocked ? "left-4" : "left-0.5"}`}></span>
                        </button>
                      </div>
                    </div>

                    <hr className="border-zinc-800" />
                  </>
                ) : (
                  <div className="text-zinc-500 text-xs text-center py-2">
                    Room settings are managed by the host.
                  </div>
                )}

                {/* End / Leave Room Buttons */}
                {isCreator ? (
                  <button
                    onClick={handleLeaveRoom}
                    className="w-full bg-red-600 hover:bg-red-700 py-2.5 rounded-xl text-xs font-bold text-white transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FaSignOutAlt /> End Room
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveRoom}
                    className="w-full bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-zinc-700 py-2.5 rounded-xl text-xs font-bold text-white transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FaSignOutAlt /> Leave Room
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main workspace layout */}
      <main className="w-full h-[calc(100vh-5rem)] flex flex-col lg:flex-row relative z-10 overflow-hidden">

        {/* Left Side: Video Player Area (75% or flex-grow) */}
        <section className={`w-full flex flex-col lg:border-r lg:border-zinc-850 max-w-full relative overflow-hidden p-2 sm:p-4 lg:p-8 transition-all duration-300 ${isSidebarMinimized ? "h-full flex-grow" : "h-auto lg:h-full flex-grow-0 lg:flex-grow flex-shrink-0 lg:flex-shrink"
          }`}>

          {/* Minimize Sidebar Button (Shown when sidebar is minimized) */}
          {isSidebarMinimized && (
            <button
              onClick={() => setIsSidebarMinimized(false)}
              className="fixed lg:absolute bottom-4 right-4 lg:bottom-auto lg:right-0 lg:top-1/2 lg:-translate-y-1/2 bg-red-600 hover:bg-red-700 lg:bg-zinc-900/80 lg:hover:bg-zinc-850 border border-red-500/30 lg:border-l lg:border-t lg:border-b lg:border-r-0 lg:border-zinc-800 w-12 h-12 lg:w-8 lg:h-16 rounded-full lg:rounded-l-2xl lg:rounded-r-none flex items-center justify-center text-white lg:text-zinc-400 lg:hover:text-white transition shadow-2xl cursor-pointer z-40"
              title="Expand Sidebar"
            >
              <span className="lg:hidden"><FaComments size={18} /></span>
              <span className="hidden lg:inline"><FaChevronLeft size={14} /></span>
            </button>
          )}

          {/* Centered Content Container */}
          <div className="flex-grow flex items-center justify-center w-full min-h-0">

            {/* =================== ACTIVE PLAYER STATE =================== */}
            <div className="w-full flex flex-col gap-2.5 sm:gap-6 animate-fadeIn max-h-full">

              {/* Media player wrapper */}
              <div ref={playerContainerRef} className="w-full max-w-[min(896px,88.8vh)] lg:max-w-[min(896px,97.7vh)] aspect-video bg-black rounded-3xl overflow-hidden border border-zinc-800 relative group shadow-2xl max-h-[50vh] lg:max-h-[55vh] mx-auto">
                {mediaSource === "youtube" && activeVideo && (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&enablejsapi=1&controls=0&mute=${isMuted ? 1 : 0}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                )}

                {mediaSource === "twitch" && activeVideo && (
                  <iframe
                    className="w-full h-full"
                    src={`https://player.twitch.tv/?channel=${activeVideo}&parent=${window.location.hostname}&muted=${isMuted}`}
                    frameBorder="0"
                    allowFullScreen={true}
                    scrolling="no"
                  ></iframe>
                )}

                {((mediaSource === "custom" || mediaSource === "instagram" || !mediaSource || !activeVideo)) && (
                  <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                    <FaTv size={48} className="text-zinc-650 mb-3 animate-pulse" />
                    {activeVideo ? (
                      <>
                        <span className="text-sm font-bold text-zinc-300">Custom Stream Playing</span>
                        <span className="text-xs text-zinc-500 mt-1 max-w-sm truncate">{activeVideo}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-bold text-zinc-300">Waiting for Host</span>
                        <span className="text-xs text-zinc-500 mt-1 max-w-sm">No watch source has been loaded yet.</span>
                      </>
                    )}
                  </div>
                )}

                {/* Dark Overlay controls on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
                  <div className="flex items-center justify-between text-xs text-white">
                    <span className="font-bold flex items-center gap-1.5 uppercase tracking-wide bg-black/60 px-3 py-1.5 rounded-full border border-zinc-800">
                      {mediaSource ? (
                        <>
                          {mediaSource === "youtube" && <FaYoutube className="text-red-500" />}
                          {mediaSource === "twitch" && <FaTwitch className="text-purple-500" />}
                          {mediaSource} Active
                        </>
                      ) : (
                        "No Stream"
                      )}
                    </span>
                  </div>

                  {/* Player timeline & bottom bar */}
                  <div className="space-y-3 pointer-events-auto">
                    {/* Progress slider bar */}
                    <div className="relative w-full h-1 bg-zinc-700 rounded-full cursor-pointer">
                      <div className="absolute top-0 left-0 h-full bg-red-500 rounded-full" style={{ width: `${progress}%` }}></div>
                      <div className="absolute top-[-4px] w-3 h-3 bg-white border border-red-500 rounded-full shadow" style={{ left: `calc(${progress}% - 6px)` }}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="text-white hover:text-red-500 transition cursor-pointer"
                        >
                          {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
                        </button>
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="text-white hover:text-red-500 transition cursor-pointer"
                        >
                          {isMuted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
                        </button>
                        <button
                          onClick={toggleFullscreen}
                          className="text-white hover:text-red-500 transition cursor-pointer"
                          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                          {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
                        </button>
                      </div>

                      <span className="text-[10px] font-mono text-zinc-400">
                        {Math.floor((progress * 120) / 100)}s / 120s
                      </span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Status actions info card */}
              <div className={`p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl gap-3 ${isSidebarMinimized ? "flex" : "hidden lg:flex"
                } items-center`}>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-xs font-semibold text-zinc-300">Synchronized Playback Active</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Chat and Participants Panel (25% or 360px) */}
        <aside className={`border-zinc-800 bg-[#121218] transition-all duration-300 flex flex-col flex-shrink-0 ${isSidebarMinimized
          ? "w-0 h-0 border-t-0 lg:border-l-0 overflow-hidden opacity-0 pointer-events-none lg:w-0 lg:h-full"
          : "w-full h-0 flex-grow border-t lg:border-t-0 lg:border-l lg:w-96 lg:h-full lg:flex-grow-0"
          }`}>

          {/* Panel tabs */}
          <div className="flex border-b border-zinc-800 p-3 bg-zinc-950/20 items-center justify-between gap-2 flex-shrink-0">
            <div className="flex flex-grow bg-zinc-900/40 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition ${activeTab === "chat"
                  ? "bg-red-600 text-white shadow"
                  : "text-zinc-400 hover:text-white"
                  }`}
              >
                <FaComments size={12} /> Live Chat
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("participants")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition ${activeTab === "participants"
                  ? "bg-red-600 text-white shadow"
                  : "text-zinc-400 hover:text-white"
                  }`}
              >
                <FaUsers size={12} /> Participants ({participants.length})
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarMinimized(true)}
              className="w-8 h-8 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 transition flex-shrink-0 cursor-pointer"
              title="Minimize Sidebar"
            >
              <span className="lg:hidden"><FaTimes size={14} /></span>
              <span className="hidden lg:inline"><FaChevronRight size={14} /></span>
            </button>
          </div>

          {/* Panel body */}
          <div className="flex-grow flex flex-col min-h-0">

            {activeTab === "chat" ? (
              /* =================== CHAT TAB =================== */
              <div className="flex-grow flex flex-col min-h-0">
                {/* Scrolling message feed */}
                <div ref={chatContainerRef} className="flex-grow p-2.5 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4 custom-scrollbar min-h-0">
                  {messages.map((m) => (
                    <div key={m.id} className="animate-fadeIn">
                      {m.isSystem ? (
                        <div className="text-[10px] text-zinc-550 text-center uppercase tracking-wider font-semibold py-1 bg-zinc-900/10 rounded-lg border border-zinc-850/50">
                          {m.text}
                        </div>
                      ) : (
                        <div className="flex gap-2 sm:gap-3 items-start p-1.5 sm:p-2.5 rounded-xl hover:bg-zinc-900/40 transition group relative">
                          {/* Left: User Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 select-none ${m.sender === initialNickname
                            ? "bg-red-500/15 text-red-400 border border-red-500/20"
                            : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                            }`}>
                            {m.sender.charAt(0).toUpperCase()}
                          </div>

                          {/* Right: Message Content */}
                          <div className="flex-grow min-w-0">
                            <div className="space-y-0.5">
                              <div className="flex items-baseline gap-2">
                                <span className={`text-xs font-black ${m.sender === initialNickname ? "text-red-500" : "text-zinc-200"}`}>
                                  {m.sender}
                                </span>
                                {m.sender === initialNickname && (
                                  <span className="text-[9px] bg-red-600/10 text-red-400 border border-red-500/20 px-1.5 py-0.25 rounded font-black uppercase tracking-wider">
                                    Host
                                  </span>
                                )}
                                <span className="text-[9px] text-zinc-500 font-mono">{m.time}</span>
                              </div>
                              <p className="text-xs text-zinc-300 leading-relaxed break-words">{m.text}</p>
                            </div>
                          </div>

                          {/* Hover action overlay */}
                          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-[#18181f] border border-zinc-800 rounded-lg p-0.5 shadow-lg gap-0.5">
                            <button type="button" className="w-5 h-5 flex items-center justify-center text-[10px] text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer" title="Thumbs Up">👍</button>
                            <button type="button" className="w-5 h-5 flex items-center justify-center text-[10px] text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer" title="Heart">❤️</button>
                            <button type="button" className="w-5 h-5 flex items-center justify-center text-[10px] text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer" title="Fire">🔥</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Input action drawer */}
                <form onSubmit={handleSendMessage} className="p-2 sm:p-3 border-t border-zinc-800 bg-zinc-950/20 flex-shrink-0">
                  <div className="bg-[#141418] border border-zinc-800 focus-within:border-red-500/50 rounded-2xl p-2 sm:p-2.5 transition duration-200 flex flex-col gap-2">

                    <input
                      type="text"
                      disabled={chatDisabled}
                      placeholder={chatDisabled ? "Chat has been disabled by host" : "Message #watch-party..."}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="w-full bg-transparent text-xs text-white outline-none placeholder-zinc-500 disabled:opacity-50"
                    />

                    <div className="flex items-center justify-between mt-1 flex-shrink-0 border-t border-zinc-850 pt-2">
                      {/* Left: formatting shortcuts placeholders */}
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 hover:text-zinc-300 transition text-[11px] font-bold cursor-pointer">B</button>
                        <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 hover:text-zinc-300 transition text-[11px] italic cursor-pointer">I</button>
                        <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 hover:text-zinc-300 transition text-[11px] font-mono cursor-pointer">&lt;&gt;</button>
                        <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 hover:text-zinc-300 transition text-xs cursor-pointer">😊</button>
                      </div>

                      {/* Right: Send button */}
                      <button
                        type="submit"
                        disabled={chatDisabled || !newMessage.trim()}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-850 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow"
                      >
                        Send <FaPaperPlane size={8} />
                      </button>
                    </div>

                  </div>
                </form>
              </div>
            ) : (
              /* =================== PARTICIPANTS TAB =================== */
              <div className="flex-grow p-4 overflow-y-auto space-y-3 custom-scrollbar">
                {participants.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-black flex items-center justify-center">
                        {p.user?.username?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold block">{p.user?.username}</span>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Active
                        </span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${p.role === "host" ? "bg-red-600/10 text-red-400 border border-red-500/20" : "bg-zinc-800 text-zinc-400"
                      }`}>
                      {p.role}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>

        </aside>

      </main>

    </div>
  );
}
