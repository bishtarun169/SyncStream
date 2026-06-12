import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaChevronRight, FaTimes, FaComments, FaUsers } from "react-icons/fa";

import RoomHeader from "../components/room/RoomHeader";
import VideoPlayer from "../components/room/VideoPlayer";
import ChatPanel from "../components/room/ChatPanel";
import ParticipantsPanel from "../components/room/ParticipantsPanel";
import Toast from "../components/Common/Toast";

import useRoomData from "../hooks/useRoomData";
import useVideoSync from "../hooks/useVideoSync";
import useRoomActions from "../hooks/useRoomActions";
import useRoomSocket from "../hooks/useRoomSocket";

import { extractYouTubeId, extractTwitchChannel } from "../utils/mediaUtils";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passedState = location.state || {};
  const initialNickname = passedState.nickname || "Host";

  // 1. Hook for all states and backend queries
  const {
    currentUser,
    room,
    roomName,
    friends,
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
  } = useRoomData(roomId, initialNickname);

  const isCreator = room?.host?._id?.toString() && currentUser?._id?.toString()
    ? room.host._id.toString() === currentUser._id.toString()
    : false;

  const myName = currentUser?.name || currentUser?.username || initialNickname;
  const hostParticipant = participants.find(p => p.role === "host");
  const hostName = hostParticipant?.user?.name || hostParticipant?.user?.username || (isCreator ? myName : "Host");

  // Toast Helper
  const [toast, setToast] = useState({ message: "", type: "" });
  const showToast = React.useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  }, []);

  // 2. Hook for video player state and timeline controls
  const {
    isPlaying,
    setIsPlaying,
    progress,
    setProgress,
    playedSeconds,
    setPlayedSeconds,
    duration,
    setDuration,
    isMuted,
    setIsMuted,
    isFullscreen,
    mediaSource,
    setMediaSource,
    activeVideo,
    setActiveVideo,
    playerRef,
    playerContainerRef,
    handleProgress,
    handlePlayPause,
    handlePlay,
    handlePause,
    handleSkipForward,
    handleSkipBackward,
    handleSeekChange,
    toggleFullscreen
  } = useVideoSync();

  // 3. Hook for user actions, copying, leave, kick, mute settings
  const {
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
  } = useRoomActions({
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
  });

  // 4. Hook for WebSockets
  const {
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
  } = useRoomSocket(roomId, currentUser, isCreator, {
    onMediaPlay: (currentTime) => {
      setIsPlaying(true);
      if (playerRef.current && currentTime !== undefined) {
        playerRef.current.seekTo(currentTime, "seconds");
        setPlayedSeconds(currentTime);
      }
    },
    onMediaPause: () => {
      setIsPlaying(false);
    },
    onMediaSeek: (currentTime) => {
      if (playerRef.current && currentTime !== undefined) {
        playerRef.current.seekTo(currentTime, "seconds");
        setPlayedSeconds(currentTime);
      }
    },
    onMediaHeartbeat: (currentTime, hostIsPlaying) => {
      if (playerRef.current && currentTime !== undefined) {
        const localTime = playerRef.current.getCurrentTime() || 0;
        const drift = Math.abs(localTime - currentTime);
        if (drift > 2.0) {
          playerRef.current.seekTo(currentTime, "seconds");
          setPlayedSeconds(currentTime);
        }
      }
      setIsPlaying(hostIsPlaying);
    },
    onMediaLoad: (newSource, newURL) => {
      setMediaSource(newSource);
      setActiveVideo(newURL);
      setIsPlaying(true);
      setProgress(0);
      setPlayedSeconds(0);
    },
    onNeedHostSync: (requesterId) => {
      if (isCreator && playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime() || 0;
        emitHostSyncResponse(requesterId, currentTime, isPlaying);
      }
    },
    onReceiveHostSync: (currentTime, hostIsPlaying) => {
      if (playerRef.current && currentTime !== undefined) {
        playerRef.current.seekTo(currentTime, "seconds");
        setPlayedSeconds(currentTime);
      }
      setIsPlaying(hostIsPlaying);
    },
    onReceiveChatMessage: (message) => {
      setMessages((prev) => [...prev, message]);
    },
    onParticipantJoined: (newUser, newRole, pMuted, joinedAt) => {
      setParticipants((prev) => {
        const exists = prev.some(p => (p.user?._id || p.user)?.toString() === newUser._id.toString());
        if (exists) return prev;
        return [...prev, { user: newUser, role: newRole, isMuted: pMuted, joinedAt }];
      });
    },
    onParticipantLeft: (userId) => {
      setParticipants((prev) => prev.filter(p => (p.user?._id || p.user)?.toString() !== userId.toString()));
    },
    onUserKicked: (targetUserId) => {
      if (currentUser && currentUser._id?.toString() === targetUserId?.toString()) {
        navigate("/home", { state: { infoMessage: "You have been kicked from the room by the host." } });
      } else {
        setParticipants((prev) => prev.filter(p => (p.user?._id || p.user)?.toString() !== targetUserId.toString()));
      }
    },
    onUserMuteToggled: (targetUserId, isMuted) => {
      setParticipants((prev) =>
        prev.map(p => {
          const pId = p.user?._id || p.user;
          if (pId?.toString() === targetUserId.toString()) {
            return { ...p, isMuted };
          }
          return p;
        })
      );
    },
    onRoomSettingsChanged: (settings) => {
      if (settings.chatDisabled !== undefined) setChatDisabled(settings.chatDisabled);
      if (settings.muteAll !== undefined) setMuteAll(settings.muteAll);
      if (settings.roomLocked !== undefined) setRoomLocked(settings.roomLocked);
    },
    onRoomEnded: () => {
      navigate("/home", { state: { infoMessage: "The host has left. The watch party has ended." } });
    }
  });

  // Fetch initial profile, room configs, and friends list
  useEffect(() => {
    fetchCurrentUser();
    fetchRoom();
    fetchFriends();
  }, [roomId, fetchCurrentUser, fetchRoom, fetchFriends]);

  // Handle guest join backend records
  useEffect(() => {
    if (currentUser && room) {
      const isUserHost = room.host?._id?.toString() === currentUser._id?.toString();
      setIsMuted(!isUserHost);
      if (!isUserHost) {
        joinRoomApi();
      }
    }
  }, [currentUser, room, joinRoomApi, setIsMuted]);

  // Sync loaded room database media source and URL to video sync hook
  useEffect(() => {
    if (room) {
      if (room.mediaSource) setMediaSource(room.mediaSource);
      if (room.videoURL) setActiveVideo(room.videoURL);
    }
  }, [room, setMediaSource, setActiveVideo]);

  // Load participant list
  useEffect(() => {
    if (room?._id) {
      fetchParticipants(isCreator);
    }
  }, [room, fetchParticipants, isCreator]);

  // Update System messages for Nicknames
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
  }, [currentUser, setMessages]);

  // Load movieUrl parameter if passed via routing state
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
  }, [passedState.movieUrl, setMediaSource, setActiveVideo]);

  // UI state layout states
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#0f0f13] text-white flex flex-col font-sans transition-colors duration-300 overflow-hidden relative">
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <RoomHeader
        roomName={roomName}
        roomId={roomId}
        copied={copied}
        onCopyRoomCode={copyRoomCode}
        copiedLink={copiedLink}
        onCopyInviteLink={copyInviteLink}
        isCreator={isCreator}
        chatDisabled={chatDisabled}
        muteAll={muteAll}
        roomLocked={roomLocked}
        onToggleSetting={(settingName, val) => handleToggleSetting(settingName, val, emitRoomSettingsUpdate)}
        onLeaveRoom={() => handleLeaveRoom(isCreator, navigate)}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
      />

      <main className="w-full h-[calc(100vh-5rem)] flex flex-col lg:flex-row relative z-10 overflow-hidden">
        <VideoPlayer
          activeVideo={activeVideo}
          mediaSource={mediaSource}
          isPlaying={isPlaying}
          isMuted={isMuted}
          progress={progress}
          playedSeconds={playedSeconds}
          duration={duration}
          isCreator={isCreator}
          isFullscreen={isFullscreen}
          playerRef={playerRef}
          playerContainerRef={playerContainerRef}
          onProgress={(state) => handleProgress(state, isCreator, emitHeartbeat)}
          onDuration={(d) => setDuration(d)}
          onPlay={() => handlePlay(isCreator, emitPlay)}
          onPause={() => handlePause(isCreator, emitPause)}
          onSeekChange={(e) => handleSeekChange(e, isCreator, emitSeek)}
          onSkipBackward={() => handleSkipBackward(isCreator, emitSeek)}
          onSkipForward={() => handleSkipForward(isCreator, emitSeek)}
          onPlayPause={() => handlePlayPause(isCreator, emitPlay, emitPause)}
          onToggleMute={() => setIsMuted(!isMuted)}
          onToggleFullscreen={toggleFullscreen}
          isSidebarMinimized={isSidebarMinimized}
          onExpandSidebar={() => setIsSidebarMinimized(false)}
        />

        <aside className={`border-zinc-800 bg-[#121218] transition-all duration-300 flex flex-col flex-shrink-0 ${isSidebarMinimized
          ? "w-0 h-0 border-t-0 lg:border-l-0 overflow-hidden opacity-0 pointer-events-none lg:w-0 lg:h-full"
          : "w-full h-0 flex-grow border-t lg:border-t-0 lg:border-l lg:w-96 lg:h-full lg:flex-grow-0"
          }`}>
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

          <div className="flex-grow flex flex-col min-h-0">
            {activeTab === "chat" ? (
              <ChatPanel
                messages={messages}
                participants={participants}
                currentUser={currentUser}
                myName={myName}
                hostName={hostName}
                chatDisabled={chatDisabled}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                onSendMessage={(e) => handleSendMessage(e, emitSendChatMessage, chatDisabled)}
              />
            ) : (
              <ParticipantsPanel
                participants={participants}
                friends={friends}
                invitedFriends={invitedFriends}
                isCreator={isCreator}
                currentUser={currentUser}
                onToggleMute={(targetId) => handleToggleMute(targetId, emitMuteUser)}
                onKick={(targetId) => handleKick(targetId, emitKickUser)}
                onInviteFriend={handleInviteFriend}
              />
            )}
          </div>
        </aside>
      </main>

      <Toast toast={toast} />
    </div>
  );
}
