import React, { useState, useEffect, useRef } from "react";
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
  FaUserPlus,
  FaUserSlash,
  FaMicrophoneSlash,
  FaBackward,
  FaForward,
} from "react-icons/fa";
import { io } from "socket.io-client";
import ReactPlayer from "react-player";
import { API_BASE } from "../config/api";

// Resolve Vite ReactPlayer default export compatibility
const Player = React.forwardRef((props, ref) => {
  const PlayerComponent = ReactPlayer.default || ReactPlayer;
  return <PlayerComponent ref={ref} {...props} />;
});

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve state parameters passed from creation or join
  const passedState = location.state || {};
  const initialNickname = passedState.nickname || "Host";
  const initialRoomName = passedState.roomName || "Watch Party Room";

  // Current User state
  const [currentUser, setCurrentUser] = useState(null);

  // Room states
  const [room, setRoom] = useState(null);
  const [roomName, setRoomName] = useState("Loading...");
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [friends, setFriends] = useState([]);
  const [invitedFriends, setInvitedFriends] = useState({});
  const [activeTab, setActiveTab] = useState("chat"); // "chat" or "participants"
  const [showSettings, setShowSettings] = useState(false);

  // Toast notifications state
  const [toast, setToast] = useState({ message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); 
  const isHost = room?.host?._id?.toString() && currentUser?._id?.toString()
    ? room.host._id.toString() === currentUser._id.toString()
    : false;
  const isCreator = isHost;
  const [isMuted, setIsMuted] = useState(true);

  // Fetch logged-in user profile
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.user) {
        setCurrentUser(data.user);
      } else {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  // Load room details
  const fetchRoom = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/api/rooms/code/${roomId}`,
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

      // Load settings from room details
      setChatDisabled(!!data.chatDisabled);
      setMuteAll(!!data.muteAll);
      setRoomLocked(!!data.roomLocked);

      // Load video info from DB
      setMediaSource(data.mediaSource);
      setActiveVideo(data.videoURL);

      // Fetch chat history
      fetchChatMessages(data._id);

    } catch (error) {
      console.error("Failed to load room:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/auth/friends`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.friends) {
        setFriends(data.friends);
      }
    } catch (error) {
      console.error("Failed to fetch friends:", error);
    }
  };

  const joinRoomApi = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await fetch(`${API_BASE}/api/rooms/join-room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ roomCode: roomId })
      });
      fetchParticipants();
    } catch (error) {
      console.error("Failed to join room in backend:", error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchRoom();
    fetchFriends();
  }, [roomId]);

  useEffect(() => {
    if (currentUser && room) {
      const isUserHost = room.host?._id?.toString() === currentUser._id?.toString();
      setIsMuted(!isUserHost);
      if (!isUserHost) {
        joinRoomApi();
      }
    }
  }, [currentUser, room]);

  // Chat message states
  const [messages, setMessages] = useState([
    { id: 3, sender: "System", text: `${initialNickname} joined the room.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isSystem: true },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef(null);

  // Update welcome system message once currentUser is loaded
  useEffect(() => {
    if (currentUser) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === 3 && msg.isSystem && msg.text.includes("Host joined the room.")
            ? { ...msg, text: `${currentUser.name || currentUser.username || "Guest"} joined the room.` }
            : msg
        )
      );
    }
  }, [currentUser]);

  // Participants states
  const [participants, setParticipants] = useState([]);

  const myName = currentUser?.name || currentUser?.username || initialNickname;
  const hostParticipant = participants.find(p => p.role === "host");
  const hostName = hostParticipant?.user?.name || hostParticipant?.user?.username || (isCreator ? myName : "Host");

  // Video player and socket synchronization states
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null);
  const socketRef = useRef(null);
  const lastHeartbeatRef = useRef(null);

  // Time formatter helper
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // URL resolver helper to support both raw IDs and full URLs
  const getPlayerUrl = () => {
    if (!activeVideo) return "";
    
    // Check if it's already a full URL
    if (activeVideo.startsWith("http://") || activeVideo.startsWith("https://")) {
      return activeVideo;
    }
    
    // Otherwise construct it based on mediaSource
    if (mediaSource === "youtube") {
      return `https://www.youtube.com/watch?v=${activeVideo}`;
    }
    if (mediaSource === "twitch") {
      return `https://www.twitch.tv/${activeVideo}`;
    }
    
    return activeVideo;
  };

  // Socket connection and event handlers
  useEffect(() => {
    if (!currentUser || !room) return;

    // Connect to Socket.io server
    const socket = io(API_BASE);
    socketRef.current = socket;

    socket.emit("join-room", {
      roomId,
      userId: currentUser._id,
      role: isCreator ? "host" : "guest"
    });

    if (!isCreator) {
      // Guest requests current position/status on join
      socket.emit("request-host-sync", { roomId });
    }

    socket.on("media-play", ({ currentTime }) => {
      console.log("Socket: media-play received", currentTime);
      setIsPlaying(true);
      if (playerRef.current && currentTime !== undefined) {
        playerRef.current.seekTo(currentTime, "seconds");
        setPlayedSeconds(currentTime);
      }
    });

    socket.on("media-pause", () => {
      console.log("Socket: media-pause received");
      setIsPlaying(false);
    });

    socket.on("media-seek", ({ currentTime }) => {
      console.log("Socket: media-seek received", currentTime);
      if (playerRef.current && currentTime !== undefined) {
        playerRef.current.seekTo(currentTime, "seconds");
        setPlayedSeconds(currentTime);
      }
    });

    socket.on("media-heartbeat", ({ currentTime, isPlaying: hostIsPlaying }) => {
      if (playerRef.current && currentTime !== undefined) {
        const localTime = playerRef.current.getCurrentTime() || 0;
        const drift = Math.abs(localTime - currentTime);
        // Sync if guest drifts by more than 2 seconds
        if (drift > 2.0) {
          console.log(`Socket: Drift detected (${drift.toFixed(2)}s). Resyncing...`);
          playerRef.current.seekTo(currentTime, "seconds");
          setPlayedSeconds(currentTime);
        }
      }
      setIsPlaying(hostIsPlaying);
    });

    socket.on("media-load", ({ mediaSource: newSource, videoURL: newURL }) => {
      console.log("Socket: media-load received", { newSource, newURL });
      setMediaSource(newSource);
      setActiveVideo(newURL);
      setIsPlaying(true);
      setProgress(0);
      setPlayedSeconds(0);
    });

    socket.on("need-host-sync", ({ requesterId }) => {
      if (isCreator && playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime() || 0;
        socket.emit("host-sync-response", {
          requesterId,
          currentTime,
          isPlaying
        });
      }
    });

    socket.on("receive-host-sync", ({ currentTime, isPlaying: hostIsPlaying }) => {
      console.log("Socket: receive-host-sync received", { currentTime, hostIsPlaying });
      if (playerRef.current && currentTime !== undefined) {
        playerRef.current.seekTo(currentTime, "seconds");
        setPlayedSeconds(currentTime);
      }
      setIsPlaying(hostIsPlaying);
    });

    socket.on("receive-chat-message", ({ message }) => {
      console.log("Socket: receive-chat-message received", message);
      setMessages((prev) => [...prev, message]);
    });

    // Real-time participant joined
    socket.on("participant-joined", ({ user: newUser, role: newRole, isMuted: pMuted, joinedAt }) => {
      setParticipants((prev) => {
        const exists = prev.some(p => (p.user?._id || p.user)?.toString() === newUser._id.toString());
        if (exists) return prev;
        return [...prev, { user: newUser, role: newRole, isMuted: pMuted, joinedAt }];
      });
    });

    // Real-time participant left
    socket.on("participant-left", ({ userId }) => {
      setParticipants((prev) => prev.filter(p => (p.user?._id || p.user)?.toString() !== userId.toString()));
    });

    // Real-time user kicked listener
    socket.on("user-kicked", ({ targetUserId }) => {
      if (currentUser && currentUser._id?.toString() === targetUserId?.toString()) {
        navigate("/home", { state: { infoMessage: "You have been kicked from the room by the host." } });
      } else {
        setParticipants((prev) => prev.filter(p => (p.user?._id || p.user)?.toString() !== targetUserId.toString()));
      }
    });

    // Real-time user mute listener
    socket.on("user-mute-toggled", ({ targetUserId, isMuted: newMuteState }) => {
      setParticipants((prev) =>
        prev.map(p => {
          const pId = p.user?._id || p.user;
          if (pId?.toString() === targetUserId.toString()) {
            return { ...p, isMuted: newMuteState };
          }
          return p;
        })
      );
    });

    // Real-time room settings changed listener
    socket.on("room-settings-changed", (settings) => {
      if (settings.chatDisabled !== undefined) setChatDisabled(settings.chatDisabled);
      if (settings.muteAll !== undefined) setMuteAll(settings.muteAll);
      if (settings.roomLocked !== undefined) setRoomLocked(settings.roomLocked);
    });

    socket.on("room-ended", () => {
      navigate("/home", { state: { infoMessage: "The host has left. The watch party has ended." } });
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser, roomId, room]);

  // Fetch chat messages from DB
  const fetchChatMessages = async (roomDbId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/chat/${roomDbId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        const mapped = data.map(msg => ({
          id: msg._id,
          sender: msg.sender?.name || msg.sender?.username || "Unknown User",
          senderId: msg.sender?._id || msg.sender,
          text: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: false
        }));
        setMessages([
          { id: 3, sender: "System", text: `${myName} joined the room.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isSystem: true },
          ...mapped
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch chat messages:", err);
    }
  };

  // Video progress callback
  const handleProgress = (state) => {
    setPlayedSeconds(state.playedSeconds);
    setProgress(state.played * 100);

    // Host periodically emits sync heartbeats (every 3 seconds)
    if (isCreator && socketRef.current) {
      const now = Date.now();
      if (!lastHeartbeatRef.current || now - lastHeartbeatRef.current > 3000) {
        socketRef.current.emit("host-heartbeat", {
          roomId,
          currentTime: state.playedSeconds,
          isPlaying
        });
        lastHeartbeatRef.current = now;
      }
    }
  };

  // Video actions for host
  const handlePlayPause = () => {
    if (!isCreator) return;
    setIsPlaying(!isPlaying);
  };

  const handlePlay = () => {
    if (!isCreator) return;
    setIsPlaying(true);
    if (socketRef.current) {
      const currentTime = playerRef.current ? playerRef.current.getCurrentTime() : 0;
      socketRef.current.emit("host-play", { roomId, currentTime });
    }
  };

  const handlePause = () => {
    if (!isCreator) return;
    setIsPlaying(false);
    if (socketRef.current) {
      socketRef.current.emit("host-pause", { roomId });
    }
  };

  const handleSkipForward = () => {
    if (!isCreator || !playerRef.current) return;
    const currentTime = playerRef.current.getCurrentTime() || 0;
    const newTime = Math.min(currentTime + 10, duration);
    playerRef.current.seekTo(newTime, "seconds");
    setPlayedSeconds(newTime);
    setProgress((newTime / duration) * 100);

    if (socketRef.current) {
      socketRef.current.emit("host-seek", { roomId, currentTime: newTime });
    }
  };

  const handleSkipBackward = () => {
    if (!isCreator || !playerRef.current) return;
    const currentTime = playerRef.current.getCurrentTime() || 0;
    const newTime = Math.max(currentTime - 10, 0);
    playerRef.current.seekTo(newTime, "seconds");
    setPlayedSeconds(newTime);
    setProgress((newTime / duration) * 100);

    if (socketRef.current) {
      socketRef.current.emit("host-seek", { roomId, currentTime: newTime });
    }
  };

  const handleSeekChange = (e) => {
    if (!isCreator || !playerRef.current) return;
    const newPercent = parseFloat(e.target.value);
    const newTime = (newPercent / 100) * duration;
    
    playerRef.current.seekTo(newTime, "seconds");
    setPlayedSeconds(newTime);
    setProgress(newPercent);

    if (socketRef.current) {
      socketRef.current.emit("host-seek", { roomId, currentTime: newTime });
    }
  };
  const fetchParticipants = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/api/rooms/${room._id}/participants`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 404) {
        navigate("/home", { state: { infoMessage: "This room has been ended by the host." } });
        return;
      }

      const data = await response.json();
      if (response.ok) {
        console.log("PARTICIPANTS:", data);
        setParticipants(data.participants);

        // Check if current user is still in the room (i.e. not kicked)
        if (currentUser && !isCreator) {
          const isStillInRoom = data.participants.some(p => {
            const pId = p.user?._id || p.user;
            return pId?.toString() === currentUser._id?.toString();
          });
          if (!isStillInRoom) {
            navigate("/home", { state: { infoMessage: "You have been kicked from the room by the host." } });
            return;
          }
        }
      } else {
        console.error("Error fetching participants:", data.message);
      }
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

  // Native video progress is handled by react-player onProgress

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

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join-room?code=${roomId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleInviteFriend = async (friendId) => {
    setInvitedFriends((prev) => ({ ...prev, [friendId]: "sending" }));
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/auth/friends/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          friendId,
          roomId,
          roomName: roomName || "Watch Room"
        })
      });

      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Request failed with status ${response.status}`);
      }

      if (response.ok) {
        setInvitedFriends((prev) => ({ ...prev, [friendId]: "invited" }));
        showToast("Invitation sent successfully!", "success");
      } else {
        showToast(data.message || "Failed to invite friend", "error");
        setInvitedFriends((prev) => ({ ...prev, [friendId]: "failed" }));
      }
    } catch (error) {
      console.error("Error inviting friend:", error);
      showToast("Error inviting friend: " + error.message, "error");
      setInvitedFriends((prev) => ({ ...prev, [friendId]: "failed" }));
    }
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
    setPlayedSeconds(0);

    if (socketRef.current) {
      socketRef.current.emit("host-load-media", {
        roomId,
        mediaSource,
        videoURL: targetValue
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || chatDisabled) return;

    const textToSend = newMessage.trim();
    setNewMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/chat/${room._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: textToSend })
      });

      const data = await response.json();
      if (response.ok) {
        const createdMsg = data.data;
        const msg = {
          id: createdMsg._id,
          sender: myName,
          senderId: currentUser?._id,
          text: createdMsg.content,
          time: new Date(createdMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: false,
        };

        // Append locally
        setMessages((prev) => [...prev, msg]);

        // Emit to socket room for real-time delivery
        if (socketRef.current) {
          socketRef.current.emit("send-chat-message", { roomId, message: msg });
        }
      } else {
        showToast(data.message || "Failed to send message", "error");
      }
    } catch (err) {
      console.error("Error sending chat message:", err);
    }
  };

  const handleLeaveRoom = async () => {
    if (window.confirm(isCreator ? "Are you sure you want to end this room for all participants?" : "Are you sure you want to leave this watch party?")) {
      try {
        const token = localStorage.getItem("token");
        if (token && room?._id) {
          await fetch(`${API_BASE}/api/rooms/${room._id}/leave`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        }
      } catch (error) {
        console.error("Failed to leave room in backend:", error);
      }
      navigate("/home");
    }
  };

  const handleKick = async (targetUserId) => {
    if (!window.confirm("Are you sure you want to kick this participant from the room?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/rooms/${room._id}/kick`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId })
      });

      const data = await response.json();
      if (response.ok) {
        // Emit direct socket event
        if (socketRef.current) {
          socketRef.current.emit("kick-user", { roomId, targetUserId });
        }
        // Update local state instantly
        setParticipants((prev) => prev.filter(p => (p.user?._id || p.user)?.toString() !== targetUserId.toString()));
      } else {
        showToast(data.message || "Failed to kick participant", "error");
      }
    } catch (error) {
      console.error("Error kicking participant:", error);
      showToast("Error kicking participant: " + error.message, "error");
    }
  };

  const handleToggleMute = async (targetUserId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/rooms/${room._id}/mute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId })
      });

      const data = await response.json();
      if (response.ok) {
        // Emit direct socket event
        if (socketRef.current) {
          socketRef.current.emit("mute-user", { roomId, targetUserId, isMuted: data.isMuted });
        }
        // Update local state instantly
        setParticipants((prev) =>
          prev.map(p => {
            const pId = p.user?._id || p.user;
            if (pId?.toString() === targetUserId.toString()) {
              return { ...p, isMuted: data.isMuted };
            }
            return p;
          })
        );
      } else {
        showToast(data.message || "Failed to toggle mute", "error");
      }
    } catch (error) {
      console.error("Error toggling mute:", error);
      showToast("Error toggling mute: " + error.message, "error");
    }
  };

  // Persist settings toggles to database and broadcast to room
  const handleToggleSetting = async (settingName, currentValue) => {
    const newValue = !currentValue;

    if (settingName === "chatDisabled") setChatDisabled(newValue);
    if (settingName === "muteAll") setMuteAll(newValue);
    if (settingName === "roomLocked") setRoomLocked(newValue);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/rooms/${room._id}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          [settingName]: newValue
        })
      });

      const data = await response.json();
      if (response.ok) {
        if (socketRef.current) {
          socketRef.current.emit("room-settings-update", {
            roomId,
            settings: { [settingName]: newValue }
          });
        }
      } else {
        console.error("Failed to update settings in backend:", data.message);
        if (settingName === "chatDisabled") setChatDisabled(currentValue);
        if (settingName === "muteAll") setMuteAll(currentValue);
        if (settingName === "roomLocked") setRoomLocked(currentValue);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      if (settingName === "chatDisabled") setChatDisabled(currentValue);
      if (settingName === "muteAll") setMuteAll(currentValue);
      if (settingName === "roomLocked") setRoomLocked(currentValue);
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
              onClick={copyInviteLink}
              title="Copy Shareable Invite Link"
              className="text-zinc-400 hover:text-white transition duration-150 cursor-pointer flex items-center justify-center leading-none"
            >
              {copiedLink ? <FaCheck className="text-green-500" size={13} /> : <FaLink size={13} />}
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
                          onClick={() => handleToggleSetting("chatDisabled", chatDisabled)}
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
                          onClick={() => handleToggleSetting("muteAll", muteAll)}
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
                          onClick={() => handleToggleSetting("roomLocked", roomLocked)}
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
                {activeVideo ? (
                  <>
                    <Player
                      key={getPlayerUrl()}
                      ref={playerRef}
                      url={getPlayerUrl()}
                      playing={isPlaying}
                      muted={isMuted}
                      playsinline={true}
                      volume={0.8}
                      width="100%"
                      height="100%"
                      controls={false}
                      onProgress={handleProgress}
                      onDuration={(d) => setDuration(d)}
                      onPlay={handlePlay}
                      onPause={handlePause}
                      config={{
                        youtube: {
                          playerVars: {
                            disablekb: 1,
                            fs: 0,
                            modestbranding: 1,
                            rel: 0
                          }
                        }
                      }}
                    />
                    {!isCreator && (
                      <div className="absolute inset-0 z-10 bg-transparent cursor-default"></div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                    <FaTv size={48} className="text-zinc-650 mb-3 animate-pulse" />
                    <span className="text-sm font-bold text-zinc-300">Waiting for Host</span>
                    <span className="text-xs text-zinc-500 mt-1 max-w-sm">No watch source has been loaded yet.</span>
                  </div>
                )}

                {/* Dark Overlay controls on hover */}
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/10 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
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
                  <div className="space-y-3 pointer-events-auto w-full">
                    {/* Progress slider bar */}
                    <div className="w-full flex items-center">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step="any"
                        value={progress}
                        onChange={handleSeekChange}
                        disabled={!isCreator}
                        className={`w-full accent-red-500 h-1 bg-zinc-700 rounded-full cursor-pointer outline-none ${!isCreator ? "pointer-events-none opacity-80" : ""}`}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isCreator ? (
                          <>
                            <button
                              onClick={handleSkipBackward}
                              className="text-white hover:text-red-500 transition cursor-pointer"
                              title="Skip Backward 10s"
                            >
                              <FaBackward size={12} />
                            </button>
                            <button
                              onClick={handlePlayPause}
                              className="text-white hover:text-red-500 transition cursor-pointer"
                              title={isPlaying ? "Pause" : "Play"}
                            >
                              {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
                            </button>
                            <button
                              onClick={handleSkipForward}
                              className="text-white hover:text-red-500 transition cursor-pointer"
                              title="Skip Forward 10s"
                            >
                              <FaForward size={12} />
                            </button>
                          </>
                        ) : (
                          <div className="text-zinc-400 text-[10px] font-bold bg-zinc-900/60 border border-zinc-800 px-3 py-1 rounded-full uppercase tracking-wider select-none">
                            {isPlaying ? "Playing (Synced)" : "Paused (Synced)"}
                          </div>
                        )}
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="text-white hover:text-red-500 transition cursor-pointer ml-2"
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
                        {formatTime(playedSeconds)} / {formatTime(duration)}
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
                  {messages.map((m) => {
                    const isSenderMuted = (() => {
                      if (m.isSystem) return false;
                      if (m.senderId) {
                        const participant = participants.find(p => {
                          const pId = p.user?._id || p.user;
                          return pId?.toString() === m.senderId.toString();
                        });
                        return !!participant?.isMuted;
                      }
                      const participant = participants.find(p => {
                        const pName = p.user?.name || p.user?.username;
                        return pName === m.sender;
                      });
                      return !!participant?.isMuted;
                    })();

                    const isSenderOfMsg = m.senderId 
                      ? (currentUser?._id?.toString() === m.senderId.toString())
                      : (m.sender === myName);

                    if (isSenderMuted && !isSenderOfMsg) {
                      return null;
                    }

                    return (
                      <div key={m.id} className="animate-fadeIn">
                        {m.isSystem ? (
                          <div className="text-[10px] text-zinc-550 text-center uppercase tracking-wider font-semibold py-1 bg-zinc-900/10 rounded-lg border border-zinc-850/50">
                            {m.text}
                          </div>
                        ) : (
                          <div className={`flex gap-2 sm:gap-3 items-start p-1.5 sm:p-2.5 rounded-xl hover:bg-zinc-900/40 transition group relative ${
                            isSenderOfMsg ? "flex-row-reverse" : ""
                          }`}>
                            {/* Left/Right: User Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 select-none ${m.sender === myName
                              ? "bg-red-500/15 text-red-400 border border-red-500/20"
                              : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                              }`}>
                              {m.sender.charAt(0).toUpperCase()}
                            </div>

                            {/* Right/Left: Message Content */}
                            <div className={`flex-grow min-w-0 ${isSenderOfMsg ? "text-right" : ""}`}>
                              <div className="space-y-0.5">
                                <div className={`flex items-baseline gap-2 ${isSenderOfMsg ? "justify-end flex-row-reverse" : ""}`}>
                                  <span className={`text-xs font-black ${m.sender === myName ? "text-red-500" : "text-zinc-200"}`}>
                                    {m.sender}
                                  </span>
                                  {m.sender === hostName && (
                                    <span className="text-[9px] bg-red-600/10 text-red-400 border border-red-500/20 px-1.5 py-0.25 rounded font-black uppercase tracking-wider">
                                      Host
                                    </span>
                                  )}
                                  <span className="text-[9px] text-zinc-550 font-mono">{m.time}</span>
                                </div>
                                <p className="text-xs text-zinc-300 leading-relaxed break-words">{m.text}</p>
                              </div>
                            </div>

                            {/* Hover action overlay */}
                            <div className={`absolute ${isSenderOfMsg ? "left-2" : "right-2"} top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-[#18181f] border border-zinc-800 rounded-lg p-0.5 shadow-lg gap-0.5`}>
                              <button type="button" className="w-5 h-5 flex items-center justify-center text-[10px] text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer" title="Thumbs Up">👍</button>
                              <button type="button" className="w-5 h-5 flex items-center justify-center text-[10px] text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer" title="Heart">❤️</button>
                              <button type="button" className="w-5 h-5 flex items-center justify-center text-[10px] text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer" title="Fire">🔥</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Input action drawer */}
                <form onSubmit={handleSendMessage} className="p-2 sm:p-3 border-t border-zinc-800 bg-zinc-950/20 flex-shrink-0">
                  <div className="bg-[#141418] border border-zinc-800 focus-within:border-red-500/50 rounded-2xl p-2 sm:p-2.5 transition duration-200 flex flex-col gap-2">

                    <input
                      type="text"
                      disabled={chatDisabled}
                      placeholder={
                        chatDisabled 
                          ? "Chat has been disabled by host" 
                          : "Message #watch-party..."
                      }
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
                            <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-black flex items-center justify-center overflow-hidden">
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
                                  onClick={() => handleToggleMute(p.user?._id || p.user)}
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
                                  onClick={() => handleKick(p.user?._id || p.user)}
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
                      
                      {(() => {
                        const invitableFriends = friends.filter(friend => 
                          !participants.some(p => {
                            const pId = p.user?._id || p.user;
                            return pId?.toString() === friend._id?.toString();
                          })
                        );

                        if (friends.length === 0) {
                          return (
                            <div className="text-center py-6 border border-dashed border-zinc-800 rounded-2xl">
                              <p className="text-zinc-500 text-xs">No friends found.</p>
                              <p className="text-zinc-650 text-[10px] mt-1">Add friends from the Dashboard first.</p>
                            </div>
                          );
                        }

                        if (invitableFriends.length === 0) {
                          return (
                            <div className="text-center py-6 border border-dashed border-zinc-800 rounded-2xl">
                              <p className="text-zinc-500 text-xs">All friends are in the room.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-2">
                            {invitableFriends.map((friend) => {
                              const inviteStatus = invitedFriends[friend._id];
                              
                              return (
                                <div
                                  key={friend._id}
                                  className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition duration-200"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-black flex items-center justify-center overflow-hidden">
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
                                      onClick={() => handleInviteFriend(friend._id)}
                                      className="bg-red-600 hover:bg-red-700 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
                                    >
                                      Invite
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>

        </aside>

      </main>

      {/* Toast Alert Banner */}
      {toast.message && (
        <div className="fixed bottom-5 right-5 z-[100] animate-fadeIn">
          <div className={`backdrop-blur-md px-6 py-4 rounded-2xl border flex items-center gap-3 shadow-2xl max-w-sm ${
            toast.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : toast.type === "error"
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-zinc-800/90 border-zinc-700 text-white"
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              toast.type === "success" ? "bg-green-500 animate-pulse" : toast.type === "error" ? "bg-red-500 animate-pulse" : "bg-white animate-pulse"
            }`} />
            <span className="text-xs font-bold leading-normal">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
