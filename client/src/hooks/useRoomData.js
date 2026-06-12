import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as roomService from "../services/roomService";

export default function useRoomData(roomId, initialNickname) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [roomName, setRoomName] = useState("Loading...");
  const [friends, setFriends] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([
    { id: 3, sender: "System", text: `${initialNickname} joined the room.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isSystem: true },
  ]);
  const [chatDisabled, setChatDisabled] = useState(false);
  const [muteAll, setMuteAll] = useState(false);
  const [roomLocked, setRoomLocked] = useState(false);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const data = await roomService.fetchCurrentUserProfile();
      if (data && data.user) {
        setCurrentUser(data.user);
        return data.user;
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const fetchRoom = useCallback(async () => {
    try {
      const data = await roomService.fetchRoom(roomId);
      setRoom(data);
      setRoomName(data.roomName);
      setChatDisabled(!!data.chatDisabled);
      setMuteAll(!!data.muteAll);
      setRoomLocked(!!data.roomLocked);
      return data;
    } catch (error) {
      console.error("Failed to load room:", error);
    }
  }, [roomId]);

  const fetchFriends = useCallback(async () => {
    try {
      const data = await roomService.fetchFriends();
      if (data && data.friends) {
        setFriends(data.friends);
      }
    } catch (error) {
      console.error("Failed to fetch friends:", error);
    }
  }, []);

  const joinRoomApi = useCallback(async () => {
    try {
      await roomService.joinRoomApi(roomId);
    } catch (error) {
      console.error("Failed to join room in backend:", error);
    }
  }, [roomId]);

  const fetchParticipants = useCallback(async (isCreator) => {
    if (!room?._id) return;
    try {
      const data = await roomService.fetchParticipants(room._id);
      if (data && data.participants) {
        setParticipants(data.participants);

        if (currentUser && !isCreator) {
          const isStillInRoom = data.participants.some(p => {
            const pId = p.user?._id || p.user;
            return pId?.toString() === currentUser._id?.toString();
          });
          if (!isStillInRoom) {
            navigate("/home", { state: { infoMessage: "You have been kicked from the room by the host." } });
          }
        }
      }
    } catch (error) {
      if (error.message === "ROOM_ENDED") {
        navigate("/home", { state: { infoMessage: "This room has been ended by the host." } });
      } else {
        console.error("Error fetching participants:", error);
      }
    }
  }, [room?._id, currentUser, navigate]);

  const fetchChatMessages = useCallback(async (roomDbId, currentMyName) => {
    try {
      const data = await roomService.fetchChatMessages(roomDbId);
      const mapped = data.map(msg => ({
        id: msg._id,
        sender: msg.sender?.name || msg.sender?.username || "Unknown User",
        senderId: msg.sender?._id || msg.sender,
        text: msg.content,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: false
      }));
      setMessages([
        { id: 3, sender: "System", text: `${currentMyName} joined the room.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isSystem: true },
        ...mapped
      ]);
    } catch (err) {
      console.error("Failed to fetch chat messages:", err);
    }
  }, []);

  return {
    currentUser,
    setCurrentUser,
    room,
    setRoom,
    roomName,
    setRoomName,
    friends,
    setFriends,
    participants,
    setParticipants,
    messages,
    setMessages,
    chatDisabled,
    setChatDisabled,
    muteAll,
    setMuteAll,
    roomLocked,
    setRoomLocked,
    fetchCurrentUser,
    fetchRoom,
    fetchFriends,
    joinRoomApi,
    fetchParticipants,
    fetchChatMessages
  };
}
