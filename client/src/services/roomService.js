import { API_BASE } from "../config/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const fetchRoom = async (roomId) => {
  const response = await fetch(`${API_BASE}/api/rooms/code/${roomId}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to load room");
  }
  return response.json();
};

export const fetchFriends = async () => {
  const response = await fetch(`${API_BASE}/api/friends/list`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch friends");
  }
  return response.json();
};

export const joinRoomApi = async (roomCode) => {
  const response = await fetch(`${API_BASE}/api/rooms/join-room`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ roomCode }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to join room in backend");
  }
  return response.json();
};

export const fetchParticipants = async (roomDbId) => {
  const response = await fetch(`${API_BASE}/api/rooms/${roomDbId}/participants`, {
    headers: getHeaders(),
  });
  if (response.status === 404) {
    throw new Error("ROOM_ENDED");
  }
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch participants");
  }
  return response.json();
};

export const inviteFriend = async (friendId, roomId, roomName) => {
  const response = await fetch(`${API_BASE}/api/friends/invite`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ friendId, roomId, roomName }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to invite friend");
  }
  return response.json();
};

export const sendMessage = async (roomDbId, content) => {
  const response = await fetch(`${API_BASE}/api/chat/${roomDbId}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to send message");
  }
  return response.json();
};

export const fetchChatMessages = async (roomDbId) => {
  const response = await fetch(`${API_BASE}/api/chat/${roomDbId}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch chat messages");
  }
  return response.json();
};

export const leaveRoom = async (roomDbId) => {
  const response = await fetch(`${API_BASE}/api/rooms/${roomDbId}/leave`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to leave room");
  }
  return response.json();
};

export const kickParticipant = async (roomDbId, targetUserId) => {
  const response = await fetch(`${API_BASE}/api/rooms/${roomDbId}/kick`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ targetUserId }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to kick participant");
  }
  return response.json();
};

export const toggleMuteParticipant = async (roomDbId, targetUserId) => {
  const response = await fetch(`${API_BASE}/api/rooms/${roomDbId}/mute`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ targetUserId }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to toggle mute");
  }
  return response.json();
};

export const updateRoomSetting = async (roomDbId, settingName, newValue) => {
  const response = await fetch(`${API_BASE}/api/rooms/${roomDbId}/settings`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ [settingName]: newValue }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update settings");
  }
  return response.json();
};

export const fetchCurrentUserProfile = async () => {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch user");
  }
  return response.json();
};
