import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Footer from "../components/Common/Footer";
import { io } from "socket.io-client";
import { API_BASE } from "../config/api";
import {
  FaUser,
  FaPlus,
  FaSignInAlt,
  FaSignOutAlt,
  FaClock,
  FaTv,
  FaHistory,
  FaCog,
  FaCalendarAlt,
  FaUsers,
  FaTrash,
  FaEdit,
  FaUserPlus,
  FaTimes,
  FaCamera,
  FaMoon,
  FaSun,
  FaDesktop,
  FaGlobe,
  FaLock,
  FaBell,
} from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" or "profile"

  // Toast state
  const [toast, setToast] = useState({ message: "", type: "" });
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  useEffect(() => {
    if (location.state && location.state.infoMessage) {
      showToast(location.state.infoMessage, "info");
      // Clear location state to prevent toast showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // User profile state
  const [user, setUser] = useState({
    name: "Loading...",
    userId: "",
    email: "Loading...",
    profilePic: "",
    createdAt: "",
    settings: {
      theme: "light",
      allowJoinRequests: "everyone",
    },
  });

  // Friends state
  const [friends, setFriends] = useState([]);
  const [newFriendName, setNewFriendName] = useState("");

  // Dropdown states
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Edit details states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editProfilePic, setEditProfilePic] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editBirthday, setEditBirthday] = useState("");
  const [editOtp, setEditOtp] = useState("");
  const [isPasswordOtpSent, setIsPasswordOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Settings states
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsTheme, setSettingsTheme] = useState("light"); // "dark" | "light" | "system"
  const [settingsAllowJoinRequests, setSettingsAllowJoinRequests] =
    useState("everyone"); // "everyone" | "friends"
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  // System theme listener for "system" default option
  const [systemTheme, setSystemTheme] = useState("dark");
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () =>
      setSystemTheme(media.matches ? "dark" : "light");
    updateSystemTheme();
    media.addEventListener("change", updateSystemTheme);
    return () => media.removeEventListener("change", updateSystemTheme);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleCloseMenus = (e) => {
      if (!e.target.closest(".nav-dropdown-trigger")) {
        setIsNotificationOpen(false);
        setIsAvatarMenuOpen(false);
      }
    };
    document.addEventListener("click", handleCloseMenus);
    return () => document.removeEventListener("click", handleCloseMenus);
  }, []);

  // Compute actual active theme
  const currentTheme = settingsTheme === "system" ? systemTheme : settingsTheme;

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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

  // Load user data on mount
  useEffect(() => {
    fetchProfile();
    fetchRecentRooms();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.user) {
        setUser(data.user);
        setEditName(data.user.name);
        setEditProfilePic(data.user.profilePic || "");
        setEditGender(data.user.gender || "");
        setEditBio(data.user.bio || "");
        setEditLocation(data.user.location || "");
        setEditBirthday(data.user.birthday || "");
        if (data.user.friends) {
          setFriends(
            data.user.friends.map((f) => ({
              _id: f._id,
              name: f.name,
              userId: f.userId,
              status: "offline",
              avatar: f.name ? f.name.charAt(0).toUpperCase() : "U",
            })),
          );
        }
        if (data.user.notifications) {
          setNotifications(data.user.notifications);
        }
        if (data.user.settings) {
          const loadedTheme = data.user.settings.theme || "light";
          setSettingsTheme(loadedTheme);
          setSettingsAllowJoinRequests(
            data.user.settings.allowJoinRequests || "everyone",
          );
          localStorage.setItem("theme", loadedTheme);
        }
      } else {
        console.error("Failed to fetch user:", data.message);
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (err) {
      console.error("Connection error while fetching profile:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Profile image reader (Converts selected file to base64)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setEditError("Image must be smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfilePic(reader.result); // Base64 encoding string
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit profile details updates
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");

    if (editPassword) {
      if (editPassword.length < 8) {
        setEditError("Password must be at least 8 characters");
        return;
      }
      if (!/[0-9]/.test(editPassword) || !/[^a-zA-Z0-9]/.test(editPassword)) {
        setEditError(
          "Password must contain at least one number and one special character",
        );
        return;
      }
      if (!editOtp) {
        setEditError("OTP code is required to change password");
        return;
      }
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/auth/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          profilePic: editProfilePic,
          password: editPassword || undefined,
          gender: editGender,
          bio: editBio,
          location: editLocation,
          birthday: editBirthday,
          otp: editPassword ? editOtp : undefined,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setEditSuccess("Profile updated successfully!");
        setUser(data.user);
        setEditPassword(""); // Reset password field
        setEditOtp(""); // Reset OTP field
        setIsPasswordOtpSent(false); // Reset OTP status
        setOtpSuccessMessage("");
        setTimeout(() => {
          setIsEditModalOpen(false);
          setEditSuccess("");
        }, 1500);
      } else {
        setEditError(data.message || "Failed to update profile");
      }
    } catch (err) {
      setEditError("Unable to connect to server");
      console.error(err);
    }
  };

  const handleRequestPasswordOTP = async () => {
    setEditError("");
    setOtpSuccessMessage("");
    setOtpLoading(true);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/auth/request-password-otp`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (response.ok) {
        setIsPasswordOtpSent(true);
        setOtpSuccessMessage("Verification code sent!");
      } else {
        setEditError(data.message || "Failed to send code");
      }
    } catch (err) {
      setEditError("Unable to connect to server");
      console.error(err);
    } finally {
      setOtpLoading(false);
    }
  };

  // Submit settings updates
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsError("");
    setSettingsSuccess("");

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/auth/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          settings: {
            theme: settingsTheme,
            allowJoinRequests: settingsAllowJoinRequests,
          },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSettingsSuccess("Settings saved successfully!");
        setUser(data.user);
        if (data.user?.settings?.theme) {
          localStorage.setItem("theme", data.user.settings.theme);
        }
        setTimeout(() => {
          setIsSettingsModalOpen(false);
          setSettingsSuccess("");
        }, 1505);
      } else {
        setSettingsError(data.message || "Failed to save settings");
      }
    } catch (err) {
      setSettingsError("Unable to connect to server");
      console.error(err);
    }
  };

  // Delete user account handler
  const handleDeleteAccount = async () => {
    setDeleteError("");
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/auth/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.removeItem("token");
        navigate("/");
      } else {
        setDeleteError(data.message || "Failed to delete account");
      }
    } catch (err) {
      setDeleteError("Unable to connect to server");
      console.error(err);
    }
  };

  // Add friend handler (database-backed)
  const handleAddFriend = async (e) => {
    e.preventDefault();
    const targetUserId = newFriendName.trim();
    if (!targetUserId) return;

    // Check if friend already exists in list (by userId)
    if (
      friends.some(
        (f) =>
          f.userId && f.userId.toLowerCase() === targetUserId.toLowerCase(),
      )
    ) {
      showToast("This user is already in your friend list.", "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/auth/friends/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friendUserId: targetUserId }),
      });

      const data = await response.json();
      if (response.ok && data.friend) {
        const newFriend = {
          _id: data.friend._id,
          name: data.friend.name,
          userId: data.friend.userId,
          status: "offline",
          avatar: data.friend.name
            ? data.friend.name.charAt(0).toUpperCase()
            : "U",
        };
        setFriends([...friends, newFriend]);
        setNewFriendName("");
        showToast("Friend added successfully!", "success");
      } else {
        showToast(data.message || "Could not add friend.", "error");
      }
    } catch (err) {
      console.error("Error adding friend:", err);
      showToast("Failed to connect to server to add friend.", "error");
    }
  };

  // Remove friend handler
  const handleRemoveFriend = async (friendId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!window.confirm("Are you sure you want to remove this friend?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/friends/${friendId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setFriends((prev) => prev.filter((f) => f._id !== friendId));
        showToast("Friend removed successfully.", "success");
      } else {
        showToast(data.message || "Failed to remove friend.", "error");
      }
    } catch (err) {
      console.error("Error removing friend:", err);
      showToast("Failed to connect to server to remove friend.", "error");
    }
  };

  // Extract online count
  const onlineCount = friends.filter((f) => f.status === "online").length;

  // Format creation date
  const formatJoinedDate = (isoString) => {
    if (!isoString) return "June 2026";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const [recentRooms, setRecentRooms] = useState([]);

  const fetchRecentRooms = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/api/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        const mapped = data.map((room) => ({
          id: room.roomCode,
          name: room.roomName,
          movie: room.videoURL,
          date: room.updatedAt
            ? new Date(room.updatedAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })
            : "Just now",
          participants: `${room.participants ? room.participants.length : 0} ${room.participants && room.participants.length === 1 ? "person" : "people"}`,
        }));
        setRecentRooms(mapped);
      }
    } catch (err) {
      console.error("Error fetching recent rooms:", err);
    }
  };

  const handleJoinNotification = async (roomCode, notificationId) => {
    navigate(`/join-room?code=${roomCode}`);
    setIsNotificationOpen(false);
    if (notificationId) {
      await handleDismissNotification(notificationId);
    }
  };

  const handleDismissNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${API_BASE}/api/auth/notifications/dismiss`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch (err) {
      console.error("Failed to dismiss notification on server:", err);
    }
  };

  const isEditLengthMet = editPassword.length >= 8;
  const isEditNumberMet = /[0-9]/.test(editPassword);
  const isEditSpecialMet = /[^a-zA-Z0-9]/.test(editPassword);

  // Theme variable configurations
  const isLight = currentTheme === "light";
  const bgThemeClass = isLight
    ? "bg-zinc-50 text-zinc-900"
    : "bg-[#0f0f13] text-white";
  const cardThemeClass = isLight
    ? "bg-white border-zinc-200 text-zinc-900"
    : "bg-[#18181b]/50 border-zinc-800 text-white";
  const cardNestedThemeClass = isLight
    ? "bg-zinc-100/50 border-zinc-200"
    : "bg-[#18181b]/30 border-zinc-800/60";
  const inputThemeClass = isLight
    ? "bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:ring-red-500/20"
    : "bg-zinc-900/60 border-zinc-700 text-white focus:border-red-500";
  const navbarThemeClass = isLight
    ? "border-b border-zinc-200 bg-white/80"
    : "border-b border-zinc-800 bg-[#111118]/80";
  const textMutedClass = isLight ? "text-zinc-500" : "text-zinc-400";
  const textSubtleClass = isLight ? "text-zinc-650" : "text-zinc-355";
  const borderSubtleClass = isLight ? "border-zinc-200" : "border-zinc-850";
  const activeTabClass = isLight
    ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
    : "bg-zinc-800 text-white shadow-md";
  const inactiveTabClass = isLight
    ? "text-zinc-500 hover:text-zinc-900"
    : "text-zinc-400 hover:text-white";
  const modalThemeClass = isLight
    ? "bg-white border border-zinc-200"
    : "bg-[#18181b] border border-zinc-800";
  const outlineBtnClass = isLight
    ? "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800"
    : "bg-zinc-850 hover:bg-zinc-800 border-zinc-700 hover:border-zinc-600 text-white";

  return (
    <div
      className={`min-h-screen ${bgThemeClass} flex flex-col relative overflow-hidden transition-colors duration-300`}
    >
      {/* Decorative BG Blur */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] bg-red-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] bg-red-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Navbar */}
      <nav
        className={`${navbarThemeClass} backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-20 flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/home"
              className="text-2xl sm:text-3xl font-black tracking-tight"
            >
              <span className="text-red-500">Stream</span>Mate
            </Link>

            {/* Navigation tabs */}
            <div
              className={`flex items-center gap-1 ${isLight ? "bg-zinc-200/50 border border-zinc-300/60" : "bg-zinc-900/60 border border-zinc-800"} p-1 rounded-xl`}
            >
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition duration-200 ${
                  activeTab === "dashboard" ? activeTabClass : inactiveTabClass
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition duration-200 ${
                  activeTab === "profile" ? activeTabClass : inactiveTabClass
                }`}
              >
                Profile
              </button>
            </div>

            {/* Right side notification & avatar action group */}
            <div className="flex items-center gap-4 relative">
              {/* Notification Bell */}
              <div className="relative nav-dropdown-trigger">
                <button
                  onClick={() => {
                    setIsNotificationOpen(!isNotificationOpen);
                    setIsAvatarMenuOpen(false);
                  }}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer relative ${
                    isLight
                      ? "text-zinc-650 border-zinc-300 hover:bg-zinc-100"
                      : "text-zinc-400 border-zinc-800 hover:bg-zinc-900/60"
                  }`}
                >
                  <FaBell size={16} />
                  {notifications.length > 0 && (
                    <span className="absolute top-[-3px] right-[-3px] w-4.5 h-4.5 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-[#0f0f13] shadow-md animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {isNotificationOpen && (
                  <div
                    className={`absolute right-0 mt-3 w-80 rounded-2xl p-4 shadow-2xl z-50 border ${modalThemeClass} animate-fadeIn`}
                  >
                    <div className="flex items-center justify-between border-b pb-2 mb-3 border-zinc-800/10">
                      <span className="text-xs font-black uppercase tracking-wider">
                        Notifications
                      </span>
                      <span className="text-[10px] text-red-500 font-bold">
                        {notifications.length} New
                      </span>
                    </div>

                    {notifications.length === 0 ? (
                      <div
                        className={`text-center py-6 text-xs ${textMutedClass}`}
                      >
                        No new notifications.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 rounded-xl border flex flex-col gap-2 transition duration-200 ${
                              isLight
                                ? "bg-zinc-50 border-zinc-200"
                                : "bg-zinc-905/30 border-zinc-850"
                            }`}
                          >
                            <div className="text-xs">
                              <span className="font-bold text-red-500 block">
                                {n.sender}
                              </span>
                              <span
                                className={
                                  isLight ? "text-zinc-600" : "text-zinc-300"
                                }
                              >
                                {n.text}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleJoinNotification(n.room, n.id)
                                  }
                                  className="bg-red-600 hover:bg-red-700 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold transition flex-1 cursor-pointer"
                                >
                                  Join
                                </button>
                                <button
                                  onClick={() =>
                                    handleDismissNotification(n.id)
                                  }
                                  className={`text-[10px] px-3 py-1.5 rounded-lg border transition flex-1 cursor-pointer ${
                                    isLight
                                      ? "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700"
                                      : "bg-zinc-800 hover:bg-zinc-750 border-zinc-700 text-zinc-300"
                                  }`}
                                >
                                  Dismiss
                                </button>
                              </div>{" "}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Avatar Circle & Menu Dropdown */}
              <div className="relative nav-dropdown-trigger">
                <button
                  onClick={() => {
                    setIsAvatarMenuOpen(!isAvatarMenuOpen);
                    setIsNotificationOpen(false);
                  }}
                  className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700 hover:border-red-500 transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center bg-zinc-900"
                >
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-red-600/10 text-red-500 flex items-center justify-center font-black text-sm">
                      {user.name ? user.name.charAt(0) : "U"}
                    </div>
                  )}
                </button>

                {/* Profile Dropdown Panel */}
                {isAvatarMenuOpen && (
                  <div
                    className={`absolute right-0 mt-3 w-56 rounded-2xl p-4 shadow-2xl z-50 border ${modalThemeClass} animate-fadeIn`}
                  >
                    <div className="border-b pb-3 mb-2 border-zinc-800/10">
                      <span className="text-xs font-extrabold block truncate">
                        {user.name}
                      </span>
                      <span
                        className={`text-[10px] block truncate ${textMutedClass}`}
                      >
                        {user.email}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab("profile");
                          setIsAvatarMenuOpen(false);
                        }}
                        className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition duration-200 ${
                          isLight
                            ? "hover:bg-zinc-100 text-zinc-800"
                            : "hover:bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        <FaUser size={12} className="text-red-500" /> Go to
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          setIsSettingsModalOpen(true);
                          setIsAvatarMenuOpen(false);
                        }}
                        className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition duration-200 ${
                          isLight
                            ? "hover:bg-zinc-100 text-zinc-800"
                            : "hover:bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        <FaCog size={12} className="text-red-500" /> Open
                        Settings
                      </button>
                      <hr
                        className={`${isLight ? "border-zinc-200" : "border-zinc-800/30"} my-2`}
                      />
                      <button
                        onClick={handleLogout}
                        className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition duration-200 text-red-500 ${
                          isLight ? "hover:bg-red-50/50" : "hover:bg-red-500/10"
                        }`}
                      >
                        <FaSignOutAlt size={12} /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 relative z-10">
        {activeTab === "dashboard" ? (
          /* =================== DASHBOARD TAB =================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Content Area: Welcome + Actions + History (Lg: 8 cols) */}
            <div className="lg:col-span-8 space-y-10">
              {/* User welcome banner */}
              <div
                className={`border p-8 rounded-3xl relative overflow-hidden shadow-xl ${
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

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Create Room Card */}
                <div
                  className={`${cardThemeClass} p-6 rounded-3xl hover:border-zinc-500/40 transition duration-300 flex flex-col justify-between space-y-5 group shadow-lg`}
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20">
                      <FaPlus size={16} />
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-red-500 transition duration-200">
                      Create Watch Room
                    </h3>
                    <p
                      className={`${textMutedClass} text-xs sm:text-sm leading-relaxed`}
                    >
                      Start a brand new watch party. Choose your room name,
                      paste the movie stream link, and invite friends.
                    </p>
                  </div>
                  <Link
                    to="/create-room"
                    className="bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold text-center text-sm text-white transition duration-200 shadow-md cursor-pointer"
                  >
                    Create Room
                  </Link>
                </div>

                {/* Join Room Card */}
                <div
                  className={`${cardThemeClass} p-6 rounded-3xl hover:border-zinc-500/40 transition duration-300 flex flex-col justify-between space-y-5 group shadow-lg`}
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20">
                      <FaSignInAlt size={16} />
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-red-500 transition duration-200">
                      Join Watch Room
                    </h3>
                    <p
                      className={`${textMutedClass} text-xs sm:text-sm leading-relaxed`}
                    >
                      Have a code from a friend? Enter it here to hop directly
                      into their synchronized watch room.
                    </p>
                  </div>
                  <Link
                    to="/join-room"
                    className={`${outlineBtnClass} py-3 rounded-xl font-semibold text-center text-sm transition duration-200 shadow-md cursor-pointer`}
                  >
                    Join Room
                  </Link>
                </div>
              </div>

              {/* History list */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FaHistory className="text-red-500" size={16} />
                  Recent Watch Parties
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recentRooms.length === 0 ? (
                    <div
                      className={`col-span-2 text-center py-10 border border-dashed rounded-3xl ${isLight ? "border-zinc-300 bg-zinc-50/50" : "border-zinc-800/60 bg-[#141418]/20"}`}
                    >
                      <p className={`${textMutedClass} text-xs font-bold`}>
                        No recent watch parties found.
                      </p>
                      <p
                        className={`${isLight ? "text-zinc-400" : "text-zinc-500"} text-[10px] mt-1`}
                      >
                        Create a new room or join a friend's room to get
                        started!
                      </p>
                    </div>
                  ) : (
                    recentRooms.map((room) => (
                      <div
                        key={room.id}
                        className={`${cardNestedThemeClass} p-5 rounded-2xl flex items-center justify-between border ${isLight ? "border-zinc-200" : "border-zinc-800/40"}`}
                      >
                        <div className="space-y-1 max-w-[70%]">
                          <h4 className="font-bold text-sm truncate">
                            {room.name}
                          </h4>
                          <p
                            className={`${textMutedClass} text-[11px] truncate`}
                          >
                            Playing: {room.movie}
                          </p>
                          <p
                            className={`${isLight ? "text-zinc-400" : "text-zinc-500"} text-[10px] flex items-center gap-1.5 mt-2`}
                          >
                            <FaClock size={8} /> {room.date} •{" "}
                            {room.participants}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg ${isLight ? "bg-zinc-200 text-zinc-700" : "bg-zinc-800 text-zinc-300"}`}
                        >
                          {room.id}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Side Column: Friends List Dashboard Panel (Lg: 4 cols) */}
            <div
              className={`lg:col-span-4 ${cardThemeClass} p-6 rounded-3xl space-y-6 shadow-xl w-full`}
            >
              <div
                className={`flex items-center justify-between border-b ${borderSubtleClass} pb-4`}
              >
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FaUsers className="text-red-500" size={18} /> Friends List
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                  {onlineCount} Online
                </span>
              </div>

              {/* Search Add Friend Form */}
              <form onSubmit={handleAddFriend} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter username..."
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  className={`flex-grow rounded-xl px-3 py-2 text-xs outline-none transition border ${inputThemeClass}`}
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5 font-bold"
                >
                  <FaUserPlus size={12} /> Add
                </button>
              </form>

              {/* Friends items scroll list */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {friends.length === 0 ? (
                  <p className={`${textMutedClass} text-xs text-center py-6`}>
                    No friends added yet.
                  </p>
                ) : (
                  friends.map((friend, idx) => (
                    <div
                      key={friend._id || idx}
                      className={`flex items-center justify-between p-3 rounded-xl border transition duration-200 ${
                        isLight
                          ? "bg-zinc-50 border-zinc-100 hover:bg-zinc-100"
                          : "bg-zinc-900/30 border-zinc-800/40 hover:bg-zinc-900/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-extrabold flex items-center justify-center">
                          {friend.avatar}
                        </div>
                        <div>
                          <span className="text-xs font-bold block">
                            {friend.name}{" "}
                            {friend.userId && (
                              <span className="text-[10px] font-normal text-zinc-500 font-mono ml-1">
                                @{friend.userId}
                              </span>
                            )}
                          </span>
                          <span
                            className={`${textMutedClass} text-[10px] flex items-center gap-1`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                friend.status === "online"
                                  ? "bg-green-500"
                                  : "bg-zinc-500"
                              }`}
                            ></span>
                            {friend.status === "online" ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFriend(friend._id)}
                        className="text-zinc-500 hover:text-red-500 p-1.5 transition rounded-lg hover:bg-red-500/10 cursor-pointer"
                        title="Remove Friend"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* =================== PROFILE TAB =================== */
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight">
                  Your Profile
                </h2>
                <p className={`${textMutedClass} text-sm mt-1`}>
                  Manage your account information and preferences.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border transition cursor-pointer ${
                  isLight
                    ? "bg-white hover:bg-zinc-100 border-zinc-300 text-zinc-855"
                    : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white"
                }`}
              >
                <FaEdit size={14} /> Edit Details
              </button>
            </div>

            {/* Profile Detail Card */}
            <div
              className={`${cardThemeClass} p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col sm:flex-row gap-8 items-center sm:items-start relative overflow-hidden`}
            >
              {/* Profile Avatar Grid */}
              <div className="relative group">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.name}
                    className="w-24 h-24 rounded-3xl object-cover border border-zinc-300 shadow-inner"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center text-4xl font-extrabold shadow-inner">
                    {user.name ? user.name.charAt(0) : "U"}
                  </div>
                )}
              </div>

              <div className="flex-grow space-y-6 text-center sm:text-left">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{user.name}</h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold">
                      Premium Member
                    </span>
                    <span
                      className={`text-xs ${isLight ? "text-zinc-400" : "text-zinc-505"} flex items-center gap-1`}
                    >
                      <FaCalendarAlt size={10} /> Joined{" "}
                      {formatJoinedDate(user.createdAt)}
                    </span>
                  </div>
                </div>

                {user.bio && (
                  <p
                    className={`text-sm ${textMutedClass} italic leading-relaxed border-l-2 border-red-500 pl-4 py-1 mt-4 text-left`}
                  >
                    "{user.bio}"
                  </p>
                )}

                {/* Form fields displays */}
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 border-t ${isLight ? "border-zinc-200" : "border-zinc-800/80"} pt-6 text-left`}
                >
                  <div>
                    <span
                      className={`text-xs ${isLight ? "text-zinc-400" : "text-zinc-505"} uppercase tracking-wider block`}
                    >
                      User ID
                    </span>
                    <span
                      className={`${textSubtleClass} text-sm sm:text-base font-medium truncate block`}
                    >
                      @{user.userId || "unassigned"}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`text-xs ${isLight ? "text-zinc-400" : "text-zinc-505"} uppercase tracking-wider block`}
                    >
                      Email Address
                    </span>
                    <span
                      className={`${textSubtleClass} text-sm sm:text-base font-medium truncate block`}
                    >
                      {user.email}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`text-xs ${isLight ? "text-zinc-400" : "text-zinc-505"} uppercase tracking-wider block`}
                    >
                      Gender
                    </span>
                    <span
                      className={`${textSubtleClass} text-sm sm:text-base font-medium capitalize block`}
                    >
                      {user.gender || "Unspecified"}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`text-xs ${isLight ? "text-zinc-400" : "text-zinc-505"} uppercase tracking-wider block`}
                    >
                      Location
                    </span>
                    <span
                      className={`${textSubtleClass} text-sm sm:text-base font-medium block`}
                    >
                      {user.location || "Earth 🌍"}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`text-xs ${isLight ? "text-zinc-400" : "text-zinc-505"} uppercase tracking-wider block`}
                    >
                      Birthday
                    </span>
                    <span
                      className={`${textSubtleClass} text-sm sm:text-base font-medium block`}
                    >
                      {user.birthday || "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`text-xs ${isLight ? "text-zinc-400" : "text-zinc-505"} uppercase tracking-wider block`}
                    >
                      Status Code
                    </span>
                    <span
                      className={`${textSubtleClass} text-sm sm:text-base font-medium block`}
                    >
                      Active Streamer 🍿
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Watch History Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div
                className={`${cardNestedThemeClass} p-6 rounded-2xl text-center space-y-1 border ${isLight ? "border-zinc-200" : "border-zinc-800/20"}`}
              >
                <div className="text-red-500 flex justify-center">
                  <FaTv size={18} />
                </div>
                <h4 className="text-xl sm:text-2xl font-extrabold">
                  {user.roomsCreated || 0}
                </h4>
                <p
                  className={`${isLight ? "text-zinc-400" : "text-zinc-505"} text-xs uppercase tracking-wider`}
                >
                  Rooms Created
                </p>
              </div>

              <div
                className={`${cardNestedThemeClass} p-6 rounded-2xl text-center space-y-1 border ${isLight ? "border-zinc-200" : "border-zinc-800/20"}`}
              >
                <div className="text-red-500 flex justify-center">
                  <FaSignInAlt size={18} />
                </div>
                <h4 className="text-xl sm:text-2xl font-extrabold">
                  {user.roomsJoined || 0}
                </h4>
                <p
                  className={`${isLight ? "text-zinc-400" : "text-zinc-505"} text-xs uppercase tracking-wider`}
                >
                  Rooms Joined
                </p>
              </div>

              <div
                className={`${cardNestedThemeClass} p-6 rounded-2xl text-center space-y-1 border ${isLight ? "border-zinc-200" : "border-zinc-800/20"}`}
              >
                <div className="text-red-500 flex justify-center">
                  <FaClock size={18} />
                </div>
                <h4 className="text-xl sm:text-2xl font-extrabold">
                  {((user.totalWatchMinutes || 0) / 60).toFixed(1)}h
                </h4>
                <p
                  className={`${isLight ? "text-zinc-400" : "text-zinc-505"} text-xs uppercase tracking-wider`}
                >
                  Hours Watched
                </p>
              </div>
            </div>

            {/* Profile Action Settings */}
            <div className="flex gap-4">
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className={`flex-1 py-3.5 rounded-xl border font-semibold text-center text-sm transition duration-200 flex items-center justify-center gap-2 ${outlineBtnClass}`}
              >
                <FaCog /> Settings
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex-1 border border-red-500/20 hover:border-red-500 hover:bg-red-500/10 py-3.5 rounded-xl font-semibold text-center text-sm text-red-400 hover:text-white transition cursor-pointer flex items-center justify-center gap-2"
              >
                <FaTrash /> Delete Account
              </button>
            </div>
          </div>
        )}
      </main>

      {/* =================== EDIT PROFILE MODAL =================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl relative ${modalThemeClass}`}
          >
            <button
              onClick={() => setIsEditModalOpen(false)}
              className={`absolute right-4 top-4 ${textMutedClass} hover:text-red-500`}
            >
              <FaTimes size={16} />
            </button>

            <h3 className="text-xl font-bold">Edit Profile Details</h3>
            <p className={`${textMutedClass} text-xs sm:text-sm mt-1`}>
              Customize your profile details. Password changes require OTP
              verification.
            </p>

            <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
              {/* Profile Avatar Upload preview & input */}
              <div className="flex items-center gap-4">
                <div
                  className={`relative group w-14 h-14 rounded-2xl overflow-hidden border flex items-center justify-center flex-shrink-0 ${isLight ? "bg-zinc-100 border-zinc-300" : "bg-zinc-900/60 border-zinc-700"}`}
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
                  className={`p-4 rounded-2xl border space-y-3 text-left ${isLight ? "bg-zinc-50 border-zinc-200" : "bg-zinc-900/40 border-zinc-800"}`}
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
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-2.5 text-xs">
                  {editError}
                </div>
              )}
              {editSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-2.5 text-xs">
                  {editSuccess}
                </div>
              )}

              {/* CTA Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
      )}

      {/* =================== USER SETTINGS MODAL =================== */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl relative ${modalThemeClass}`}
          >
            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className={`absolute right-4 top-4 ${textMutedClass} hover:text-red-500`}
            >
              <FaTimes size={16} />
            </button>

            <h3 className="text-2xl font-bold">Preferences Settings</h3>
            <p className={`${textMutedClass} text-xs sm:text-sm mt-1`}>
              Personalize your theme and room visibility options.
            </p>

            <form onSubmit={handleSaveSettings} className="mt-6 space-y-6">
              {/* Theme Settings Selection */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider block text-zinc-500">
                  Theme Preference
                </label>
                <div
                  className={`grid grid-cols-3 gap-2 border p-1 rounded-xl ${isLight ? "bg-zinc-100 border-zinc-250" : "bg-zinc-900/60 border-zinc-800"}`}
                >
                  <button
                    type="button"
                    onClick={() => setSettingsTheme("dark")}
                    className={`py-2 rounded-lg text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition duration-200 ${
                      settingsTheme === "dark"
                        ? "bg-red-600 text-white shadow-md font-bold"
                        : isLight
                          ? "text-zinc-555 hover:text-zinc-900"
                          : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <FaMoon size={11} /> Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsTheme("light")}
                    className={`py-2 rounded-lg text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition duration-200 ${
                      settingsTheme === "light"
                        ? "bg-red-600 text-white shadow-md font-bold"
                        : isLight
                          ? "text-zinc-555 hover:text-zinc-900"
                          : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <FaSun size={11} /> Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsTheme("system")}
                    className={`py-2 rounded-lg text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition duration-200 ${
                      settingsTheme === "system"
                        ? "bg-red-600 text-white shadow-md font-bold"
                        : isLight
                          ? "text-zinc-555 hover:text-zinc-900"
                          : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <FaDesktop size={10} /> System
                  </button>
                </div>
              </div>

              {/* Join Requests Privacy Preferences */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider block text-zinc-500">
                  Allow Join Requests From
                </label>
                <div
                  className={`grid grid-cols-2 gap-2 border p-1 rounded-xl ${isLight ? "bg-zinc-100 border-zinc-250" : "bg-zinc-900/60 border-zinc-800"}`}
                >
                  <button
                    type="button"
                    onClick={() => setSettingsAllowJoinRequests("everyone")}
                    className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition duration-200 ${
                      settingsAllowJoinRequests === "everyone"
                        ? "bg-red-600 text-white shadow-md font-bold"
                        : isLight
                          ? "text-zinc-555 hover:text-zinc-900"
                          : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <FaGlobe size={12} /> Everyone
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsAllowJoinRequests("friends")}
                    className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition duration-200 ${
                      settingsAllowJoinRequests === "friends"
                        ? "bg-red-600 text-white shadow-md font-bold"
                        : isLight
                          ? "text-zinc-555 hover:text-zinc-900"
                          : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <FaLock size={11} /> Friends Only
                  </button>
                </div>
              </div>

              {/* Alerts */}
              {settingsError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-2.5 text-xs">
                  {settingsError}
                </div>
              )}
              {settingsSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-2.5 text-xs">
                  {settingsSuccess}
                </div>
              )}

              {/* CTA Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
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
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================== DELETE ACCOUNT CONFIRMATION MODAL =================== */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl relative ${modalThemeClass}`}
          >
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <FaTrash className="text-red-500" size={20} /> Delete Account?
            </h3>

            <p className={`${textMutedClass} text-sm mt-3 leading-relaxed`}>
              Are you absolutely sure you want to delete your StreamMate
              account? This action is permanent and cannot be undone. All your
              room listings and user settings will be completely wiped.
            </p>

            {deleteError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-xs mt-4">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
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
      )}

      <Footer theme={currentTheme} />
      {/* Toast Alert Banner */}
      {toast.message && (
        <div className="fixed bottom-5 right-5 z-[100] animate-fadeIn">
          <div
            className={`backdrop-blur-md px-6 py-4 rounded-2xl border flex items-center gap-3 shadow-2xl max-w-sm ${
              toast.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : toast.type === "error"
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-zinc-800/90 border-zinc-700 text-white"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                toast.type === "success"
                  ? "bg-green-500 animate-pulse"
                  : toast.type === "error"
                    ? "bg-red-500 animate-pulse"
                    : "bg-white animate-pulse"
              }`}
            />
            <span className="text-xs font-bold leading-normal">
              {toast.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
