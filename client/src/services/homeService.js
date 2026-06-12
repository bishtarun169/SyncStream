import { API_BASE } from "../config/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const fetchProfile = async () => {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch profile");
  }
  return response.json();
};

export const fetchRecentRooms = async () => {
  const response = await fetch(`${API_BASE}/api/rooms`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch recent rooms");
  }
  return response.json();
};

export const addFriend = async (friendUserId) => {
  const response = await fetch(`${API_BASE}/api/friends/add`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ friendUserId }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add friend");
  }
  return response.json();
};

export const removeFriend = async (friendId) => {
  const response = await fetch(`${API_BASE}/api/friends/${friendId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to remove friend");
  }
  return response.json();
};

export const updateProfile = async (profileData) => {
  const response = await fetch(`${API_BASE}/api/auth/update`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update profile");
  }
  return response.json();
};

export const requestPasswordOTP = async () => {
  const response = await fetch(`${API_BASE}/api/auth/request-password-otp`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to request password OTP");
  }
  return response.json();
};

export const deleteAccount = async () => {
  const response = await fetch(`${API_BASE}/api/auth/delete`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete account");
  }
  return response.json();
};

export const dismissNotification = async (notificationId) => {
  const response = await fetch(`${API_BASE}/api/auth/notifications/dismiss`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ notificationId }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to dismiss notification");
  }
  return response.json();
};
