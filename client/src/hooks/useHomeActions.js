import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as homeService from "../services/homeService";

export default function useHomeActions(homeData) {
  const navigate = useNavigate();
  const {
    user,
    setUser,
    friends,
    setFriends,
    settingsTheme,
    setSettingsTheme,
    settingsAllowJoinRequests,
    setSettingsAllowJoinRequests,
    showToast,
    dismissNotification
  } = homeData;

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Friends actions state
  const [newFriendName, setNewFriendName] = useState("");

  // Profile fields state
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

  // Settings fields state
  const [settingsThemeState, setSettingsThemeState] = useState(() => localStorage.getItem("theme") || "light");
  const [settingsAllowJoinRequestsState, setSettingsAllowJoinRequestsState] = useState("everyone");
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  // Delete fields state
  const [deleteError, setDeleteError] = useState("");

  // Sync profile details when user data is fetched or modal opens
  useEffect(() => {
    if (user && user._id && user.name !== "Loading...") {
      setEditName(user.name);
      setEditProfilePic(user.profilePic || "");
      setEditGender(user.gender || "");
      setEditBio(user.bio || "");
      setEditLocation(user.location || "");
      setEditBirthday(user.birthday || "");
    }
  }, [user, isEditModalOpen]);

  // Sync settings when preferences are loaded or settings modal opens
  useEffect(() => {
    setSettingsThemeState(settingsTheme);
    setSettingsAllowJoinRequestsState(settingsAllowJoinRequests);
  }, [settingsTheme, settingsAllowJoinRequests, isSettingsModalOpen]);

  // Image upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setEditError("Image must be smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Add friend handler
  const handleAddFriend = async (e) => {
    e.preventDefault();
    const targetUserId = newFriendName.trim();
    if (!targetUserId) return;

    if (friends.some(f => f.userId && f.userId.toLowerCase() === targetUserId.toLowerCase())) {
      showToast("This user is already in your friend list.", "error");
      return;
    }

    try {
      const data = await homeService.addFriend(targetUserId);
      if (data && data.friend) {
        const newFriend = {
          _id: data.friend._id,
          name: data.friend.name,
          userId: data.friend.userId,
          status: "offline",
          avatar: data.friend.name ? data.friend.name.charAt(0).toUpperCase() : "U"
        };
        setFriends((prev) => [...prev, newFriend]);
        setNewFriendName("");
        showToast("Friend added successfully!", "success");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Could not add friend.", "error");
    }
  };

  // Remove friend handler
  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm("Are you sure you want to remove this friend?")) {
      return;
    }

    try {
      await homeService.removeFriend(friendId);
      setFriends((prev) => prev.filter(f => f._id !== friendId));
      showToast("Friend removed successfully.", "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to remove friend.", "error");
    }
  };

  // Request OTP code
  const handleRequestPasswordOTP = async () => {
    setEditError("");
    setOtpSuccessMessage("");
    setOtpLoading(true);

    try {
      await homeService.requestPasswordOTP();
      setIsPasswordOtpSent(true);
      setOtpSuccessMessage("Verification code sent!");
    } catch (err) {
      console.error(err);
      setEditError(err.message || "Failed to send code");
    } finally {
      setOtpLoading(false);
    }
  };

  // Update profile
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
        setEditError("Password must contain at least one number and one special character");
        return;
      }
      if (!editOtp) {
        setEditError("OTP code is required to change password");
        return;
      }
    }

    try {
      const data = await homeService.updateProfile({
        name: editName,
        profilePic: editProfilePic,
        password: editPassword || undefined,
        gender: editGender,
        bio: editBio,
        location: editLocation,
        birthday: editBirthday,
        otp: editPassword ? editOtp : undefined,
      });

      if (data && data.user) {
        setEditSuccess("Profile updated successfully!");
        setUser(data.user);
        setEditPassword("");
        setEditOtp("");
        setIsPasswordOtpSent(false);
        setOtpSuccessMessage("");
        setTimeout(() => {
          setIsEditModalOpen(false);
          setEditSuccess("");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setEditError(err.message || "Failed to update profile");
    }
  };

  // Save Settings preferences
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsError("");
    setSettingsSuccess("");

    try {
      const data = await homeService.updateProfile({
        settings: {
          theme: settingsThemeState,
          allowJoinRequests: settingsAllowJoinRequestsState,
        }
      });

      if (data && data.user) {
        setSettingsSuccess("Settings saved successfully!");
        setUser(data.user);
        if (data.user.settings?.theme) {
          setSettingsTheme(data.user.settings.theme);
          localStorage.setItem("theme", data.user.settings.theme);
        }
        if (data.user.settings?.allowJoinRequests) {
          setSettingsAllowJoinRequests(data.user.settings.allowJoinRequests);
        }
        setTimeout(() => {
          setIsSettingsModalOpen(false);
          setSettingsSuccess("");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setSettingsError(err.message || "Failed to save settings");
    }
  };

  // Delete account forever
  const handleDeleteAccount = async () => {
    setDeleteError("");
    try {
      await homeService.deleteAccount();
      localStorage.removeItem("token");
      navigate("/");
    } catch (err) {
      console.error(err);
      setDeleteError(err.message || "Failed to delete account");
    }
  };

  // Join a room via notification
  const handleJoinNotification = async (roomCode, notificationId) => {
    navigate(`/join-room?code=${roomCode}`);
    if (notificationId) {
      await dismissNotification(notificationId);
    }
  };

  return {
    isEditModalOpen,
    setIsEditModalOpen,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    newFriendName,
    setNewFriendName,
    editName,
    setEditName,
    editProfilePic,
    setEditProfilePic,
    editPassword,
    setEditPassword,
    editGender,
    setEditGender,
    editBio,
    setEditBio,
    editLocation,
    setEditLocation,
    editBirthday,
    setEditBirthday,
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
    settingsThemeState,
    setSettingsThemeState,
    settingsAllowJoinRequestsState,
    setSettingsAllowJoinRequestsState,
    settingsError,
    settingsSuccess,
    deleteError,
    handleImageUpload,
    handleLogout,
    handleAddFriend,
    handleRemoveFriend,
    handleRequestPasswordOTP,
    handleUpdateProfile,
    handleSaveSettings,
    handleDeleteAccount,
    handleJoinNotification
  };
}
