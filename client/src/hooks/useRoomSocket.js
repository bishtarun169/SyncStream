import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { API_BASE } from "../config/api";

export default function useRoomSocket(roomId, currentUser, isCreator, callbacks) {
  const socketRef = useRef(null);
  const callbacksRef = useRef(callbacks);

  // Keep callbacks ref updated with fresh values
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!currentUser || !roomId) return;

    const socket = io(API_BASE);
    socketRef.current = socket;

    socket.emit("join-room", {
      roomId,
      userId: currentUser._id,
      role: isCreator ? "host" : "guest"
    });

    if (!isCreator) {
      socket.emit("request-host-sync", { roomId });
    }

    // Bind event listeners using the mutable ref to avoid reconnection loops
    socket.on("media-play", ({ currentTime }) => {
      callbacksRef.current.onMediaPlay?.(currentTime);
    });

    socket.on("media-pause", () => {
      callbacksRef.current.onMediaPause?.();
    });

    socket.on("media-seek", ({ currentTime }) => {
      callbacksRef.current.onMediaSeek?.(currentTime);
    });

    socket.on("media-heartbeat", ({ currentTime, isPlaying }) => {
      callbacksRef.current.onMediaHeartbeat?.(currentTime, isPlaying);
    });

    socket.on("media-load", ({ mediaSource, videoURL }) => {
      callbacksRef.current.onMediaLoad?.(mediaSource, videoURL);
    });

    socket.on("need-host-sync", ({ requesterId }) => {
      callbacksRef.current.onNeedHostSync?.(requesterId);
    });

    socket.on("receive-host-sync", ({ currentTime, isPlaying }) => {
      callbacksRef.current.onReceiveHostSync?.(currentTime, isPlaying);
    });

    socket.on("receive-chat-message", ({ message }) => {
      callbacksRef.current.onReceiveChatMessage?.(message);
    });

    socket.on("participant-joined", ({ user, role, isMuted, joinedAt }) => {
      callbacksRef.current.onParticipantJoined?.(user, role, isMuted, joinedAt);
    });

    socket.on("participant-left", ({ userId }) => {
      callbacksRef.current.onParticipantLeft?.(userId);
    });

    socket.on("user-kicked", ({ targetUserId }) => {
      callbacksRef.current.onUserKicked?.(targetUserId);
    });

    socket.on("user-mute-toggled", ({ targetUserId, isMuted }) => {
      callbacksRef.current.onUserMuteToggled?.(targetUserId, isMuted);
    });

    socket.on("room-settings-changed", (settings) => {
      callbacksRef.current.onRoomSettingsChanged?.(settings);
    });

    socket.on("room-ended", () => {
      callbacksRef.current.onRoomEnded?.();
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, currentUser?._id, isCreator]); // Only reconnect if room, user ID, or role changes

  const emitPlay = (currentTime) => {
    socketRef.current?.emit("host-play", { roomId, currentTime });
  };

  const emitPause = () => {
    socketRef.current?.emit("host-pause", { roomId });
  };

  const emitSeek = (currentTime) => {
    socketRef.current?.emit("host-seek", { roomId, currentTime });
  };

  const emitHeartbeat = (currentTime, isPlaying) => {
    socketRef.current?.emit("host-heartbeat", { roomId, currentTime, isPlaying });
  };

  const emitHostSyncResponse = (requesterId, currentTime, isPlaying) => {
    socketRef.current?.emit("host-sync-response", { requesterId, currentTime, isPlaying });
  };

  const emitLoadMedia = (mediaSource, videoURL) => {
    socketRef.current?.emit("host-load-media", { roomId, mediaSource, videoURL });
  };

  const emitSendChatMessage = (message) => {
    socketRef.current?.emit("send-chat-message", { roomId, message });
  };

  const emitKickUser = (targetUserId) => {
    socketRef.current?.emit("kick-user", { roomId, targetUserId });
  };

  const emitMuteUser = (targetUserId, isMuted) => {
    socketRef.current?.emit("mute-user", { roomId, targetUserId, isMuted });
  };

  const emitRoomSettingsUpdate = (settings) => {
    socketRef.current?.emit("room-settings-update", { roomId, settings });
  };

  return {
    emitPlay,
    emitPause,
    emitSeek,
    emitHeartbeat,
    emitHostSyncResponse,
    emitLoadMedia,
    emitSendChatMessage,
    emitKickUser,
    emitMuteUser,
    emitRoomSettingsUpdate
  };
}
