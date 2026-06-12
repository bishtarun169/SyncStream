import { useState, useRef, useEffect } from "react";

export default function useVideoSync() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mediaSource, setMediaSource] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const lastHeartbeatRef = useRef(null);

  const handleProgress = (state, isCreator, emitHeartbeat) => {
    setPlayedSeconds(state.playedSeconds);
    setProgress(state.played * 100);

    if (isCreator && emitHeartbeat) {
      const now = Date.now();
      if (!lastHeartbeatRef.current || now - lastHeartbeatRef.current > 3000) {
        emitHeartbeat(state.playedSeconds, isPlaying);
        lastHeartbeatRef.current = now;
      }
    }
  };

  const handlePlayPause = (isCreator, emitPlay, emitPause) => {
    if (!isCreator) return;
    const nextPlayState = !isPlaying;
    setIsPlaying(nextPlayState);
    if (nextPlayState) {
      const currentTime = playerRef.current ? playerRef.current.getCurrentTime() : 0;
      emitPlay?.(currentTime);
    } else {
      emitPause?.();
    }
  };

  const handlePlay = (isCreator, emitPlay) => {
    if (!isCreator) return;
    setIsPlaying(true);
    const currentTime = playerRef.current ? playerRef.current.getCurrentTime() : 0;
    emitPlay?.(currentTime);
  };

  const handlePause = (isCreator, emitPause) => {
    if (!isCreator) return;
    setIsPlaying(false);
    emitPause?.();
  };

  const handleSkipForward = (isCreator, emitSeek) => {
    if (!isCreator || !playerRef.current) return;
    const currentTime = playerRef.current.getCurrentTime() || 0;
    const newTime = Math.min(currentTime + 10, duration);
    playerRef.current.seekTo(newTime, "seconds");
    setPlayedSeconds(newTime);
    setProgress((newTime / duration) * 100);
    emitSeek?.(newTime);
  };

  const handleSkipBackward = (isCreator, emitSeek) => {
    if (!isCreator || !playerRef.current) return;
    const currentTime = playerRef.current.getCurrentTime() || 0;
    const newTime = Math.max(currentTime - 10, 0);
    playerRef.current.seekTo(newTime, "seconds");
    setPlayedSeconds(newTime);
    setProgress((newTime / duration) * 100);
    emitSeek?.(newTime);
  };

  const handleSeekChange = (e, isCreator, emitSeek) => {
    if (!isCreator || !playerRef.current) return;
    const newPercent = parseFloat(e.target.value);
    const newTime = (newPercent / 100) * duration;
    playerRef.current.seekTo(newTime, "seconds");
    setPlayedSeconds(newTime);
    setProgress(newPercent);
    emitSeek?.(newTime);
  };

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

  return {
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
    setIsFullscreen,
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
  };
}
