import { useState, useCallback } from "react";
import * as roomService from "../services/roomService";

export default function useRoomActions({
  roomId,
  roomName,
  room,
  currentUser,
  myName,
  setParticipants,
  setMessages,
  setChatDisabled,
  setMuteAll,
  setRoomLocked,
  showToast
}) {
  const [invitedFriends, setInvitedFriends] = useState({});
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const copyRoomCode = useCallback(() => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [roomId]);

  const copyInviteLink = useCallback(() => {
    const inviteLink = `${window.location.origin}/join-room?code=${roomId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }, [roomId]);

  const handleInviteFriend = useCallback(async (friendId) => {
    setInvitedFriends((prev) => ({ ...prev, [friendId]: "sending" }));
    try {
      await roomService.inviteFriend(friendId, roomId, roomName || "Watch Room");
      setInvitedFriends((prev) => ({ ...prev, [friendId]: "invited" }));
      showToast("Invitation sent successfully!", "success");
    } catch (error) {
      console.error("Error inviting friend:", error);
      showToast("Error inviting friend: " + error.message, "error");
      setInvitedFriends((prev) => ({ ...prev, [friendId]: "failed" }));
    }
  }, [roomId, roomName, showToast]);

  const handleSendMessage = useCallback(async (e, emitSendChatMessage, chatDisabled) => {
    e.preventDefault();
    if (!newMessage.trim() || chatDisabled) return;

    const textToSend = newMessage.trim();
    setNewMessage("");

    try {
      const data = await roomService.sendMessage(room._id, textToSend);
      const createdMsg = data.data;
      const msg = {
        id: createdMsg._id,
        sender: myName,
        senderId: currentUser?._id,
        text: createdMsg.content,
        time: new Date(createdMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: false,
      };

      setMessages((prev) => [...prev, msg]);
      emitSendChatMessage?.(msg);
    } catch (err) {
      console.error("Error sending chat message:", err);
      showToast(err.message || "Failed to send message", "error");
    }
  }, [room?._id, myName, currentUser?._id, newMessage, setMessages, showToast]);

  const handleLeaveRoom = useCallback(async (isCreator, navigate) => {
    const confirmMsg = isCreator
      ? "Are you sure you want to end this room for all participants?"
      : "Are you sure you want to leave this watch party?";

    if (window.confirm(confirmMsg)) {
      try {
        if (room?._id) {
          await roomService.leaveRoom(room._id);
        }
      } catch (error) {
        console.error("Failed to leave room in backend:", error);
      }
      navigate("/home");
    }
  }, [room?._id]);

  const handleKick = useCallback(async (targetUserId, emitKickUser) => {
    if (!window.confirm("Are you sure you want to kick this participant from the room?")) return;
    try {
      await roomService.kickParticipant(room._id, targetUserId);
      emitKickUser?.(targetUserId);
      setParticipants((prev) => prev.filter(p => (p.user?._id || p.user)?.toString() !== targetUserId.toString()));
    } catch (error) {
      console.error("Error kicking participant:", error);
      showToast(error.message || "Failed to kick participant", "error");
    }
  }, [room?._id, setParticipants, showToast]);

  const handleToggleMute = useCallback(async (targetUserId, emitMuteUser) => {
    try {
      const data = await roomService.toggleMuteParticipant(room._id, targetUserId);
      emitMuteUser?.(targetUserId, data.isMuted);
      setParticipants((prev) =>
        prev.map(p => {
          const pId = p.user?._id || p.user;
          if (pId?.toString() === targetUserId.toString()) {
            return { ...p, isMuted: data.isMuted };
          }
          return p;
        })
      );
    } catch (error) {
      console.error("Error toggling mute:", error);
      showToast(error.message || "Failed to toggle mute", "error");
    }
  }, [room?._id, setParticipants, showToast]);

  const handleToggleSetting = useCallback(async (settingName, currentValue, emitRoomSettingsUpdate) => {
    const newValue = !currentValue;

    if (settingName === "chatDisabled") setChatDisabled(newValue);
    if (settingName === "muteAll") setMuteAll(newValue);
    if (settingName === "roomLocked") setRoomLocked(newValue);

    try {
      await roomService.updateRoomSetting(room._id, settingName, newValue);
      emitRoomSettingsUpdate?.({ [settingName]: newValue });
    } catch (error) {
      console.error("Error updating settings:", error);
      if (settingName === "chatDisabled") setChatDisabled(currentValue);
      if (settingName === "muteAll") setMuteAll(currentValue);
      if (settingName === "roomLocked") setRoomLocked(currentValue);
    }
  }, [room?._id, setChatDisabled, setMuteAll, setRoomLocked]);

  return {
    invitedFriends,
    copied,
    copiedLink,
    newMessage,
    setNewMessage,
    copyRoomCode,
    copyInviteLink,
    handleInviteFriend,
    handleSendMessage,
    handleLeaveRoom,
    handleKick,
    handleToggleMute,
    handleToggleSetting
  };
}
