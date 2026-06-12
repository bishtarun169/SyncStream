import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { API_BASE } from "../config/api";
import * as homeService from "../services/homeService";

export default function useHomeData() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState({ message: "", type: "" });
  
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  }, []);

  useEffect(() => {
    if (location.state && location.state.infoMessage) {
      showToast(location.state.infoMessage, "info");
      window.history.replaceState({}, document.title);
    }
  }, [location, showToast]);

  const [user, setUser] = useState({
    name: "Loading...",
    userId: "",
    email: "Loading...",
    profilePic: "",
    createdAt: "",
    settings: {
      theme: "light",
      allowJoinRequests: "everyone",
    }
  });

  const [friends, setFriends] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentRooms, setRecentRooms] = useState([]);
  const [settingsTheme, setSettingsTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [settingsAllowJoinRequests, setSettingsAllowJoinRequests] = useState("everyone");

  // System theme listener for "system" default option
  const [systemTheme, setSystemTheme] = useState("dark");
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => setSystemTheme(media.matches ? "dark" : "light");
    updateSystemTheme();
    media.addEventListener("change", updateSystemTheme);
    return () => media.removeEventListener("change", updateSystemTheme);
  }, []);

  const currentTheme = useMemo(() => {
    return settingsTheme === "system" ? systemTheme : settingsTheme;
  }, [settingsTheme, systemTheme]);

  const isLight = useMemo(() => currentTheme === "light", [currentTheme]);
  const onlineCount = useMemo(() => friends.filter(f => f.status === "online").length, [friends]);

  // Reactive Socket.io connection
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const newSocket = io(API_BASE);
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && user && user._id && user._id !== "Loading...") {
      socket.emit("join-home", { userId: user._id });

      socket.on("new-notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      return () => {
        socket.off("new-notification");
      };
    }
  }, [socket, user]);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const data = await homeService.fetchProfile();
      if (data && data.user) {
        setUser(data.user);
        if (data.user.friends) {
          setFriends(data.user.friends.map(f => ({
            _id: f._id,
            name: f.name,
            userId: f.userId,
            status: "offline",
            avatar: f.name ? f.name.charAt(0).toUpperCase() : "U"
          })));
        }
        if (data.user.notifications) {
          setNotifications(data.user.notifications);
        }
        if (data.user.settings) {
          const loadedTheme = data.user.settings.theme || "light";
          setSettingsTheme(loadedTheme);
          setSettingsAllowJoinRequests(data.user.settings.allowJoinRequests || "everyone");
          localStorage.setItem("theme", loadedTheme);
        }
      }
    } catch (err) {
      console.error("Connection error while fetching profile:", err);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const fetchRecentRooms = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const data = await homeService.fetchRecentRooms();
      const mapped = data.map(room => ({
        id: room.roomCode,
        name: room.roomName,
        movie: room.videoURL,
        date: room.updatedAt ? new Date(room.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "Just now",
        participants: `${room.participants ? room.participants.length : 0} ${room.participants && room.participants.length === 1 ? 'person' : 'people'}`
      }));
      setRecentRooms(mapped);
    } catch (err) {
      console.error("Error fetching recent rooms:", err);
    }
  }, []);

  const dismissNotification = useCallback(async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await homeService.dismissNotification(id);
    } catch (err) {
      console.error("Failed to dismiss notification on server:", err);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchRecentRooms();
  }, [fetchProfile, fetchRecentRooms]);

  return {
    activeTab,
    setActiveTab,
    toast,
    setToast,
    showToast,
    user,
    setUser,
    friends,
    setFriends,
    notifications,
    setNotifications,
    recentRooms,
    setRecentRooms,
    settingsTheme,
    setSettingsTheme,
    settingsAllowJoinRequests,
    setSettingsAllowJoinRequests,
    systemTheme,
    currentTheme,
    isLight,
    onlineCount,
    socket,
    fetchProfile,
    fetchRecentRooms,
    dismissNotification
  };
}
