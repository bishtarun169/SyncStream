export const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === null) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const extractTwitchChannel = (url) => {
  if (!url) return null;
  const parts = url.split("twitch.tv/");
  return parts.length > 1 ? parts[1].split(/[?#]/)[0] : null;
};

export const getPlayerUrl = (mediaSource, activeVideo) => {
  if (!activeVideo) return "";
  
  // Check if it's already a full URL
  if (activeVideo.startsWith("http://") || activeVideo.startsWith("https://")) {
    return activeVideo;
  }
  
  // Otherwise construct it based on mediaSource
  if (mediaSource === "youtube") {
    return `https://www.youtube.com/watch?v=${activeVideo}`;
  }
  if (mediaSource === "twitch") {
    return `https://www.twitch.tv/${activeVideo}`;
  }
  
  return activeVideo;
};
