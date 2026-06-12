import React from "react";
import ReactPlayer from "react-player";
import {
  FaTv,
  FaYoutube,
  FaTwitch,
  FaBackward,
  FaForward,
  FaPause,
  FaPlay,
  FaVolumeMute,
  FaVolumeUp,
  FaCompress,
  FaExpand,
  FaComments,
  FaChevronLeft
} from "react-icons/fa";
import { formatTime, getPlayerUrl } from "../../utils/mediaUtils";

// Resolve Vite ReactPlayer default export compatibility
const Player = React.forwardRef((props, ref) => {
  const PlayerComponent = ReactPlayer.default || ReactPlayer;
  return <PlayerComponent ref={ref} {...props} />;
});

export default function VideoPlayer({
  activeVideo,
  mediaSource,
  isPlaying,
  isMuted,
  progress,
  playedSeconds,
  duration,
  isCreator,
  isFullscreen,
  playerRef,
  playerContainerRef,
  onProgress,
  onDuration,
  onPlay,
  onPause,
  onSeekChange,
  onSkipBackward,
  onSkipForward,
  onPlayPause,
  onToggleMute,
  onToggleFullscreen,
  isSidebarMinimized,
  onExpandSidebar
}) {
  return (
    <section className={`w-full flex flex-col lg:border-r lg:border-zinc-850 max-w-full relative overflow-hidden p-2 sm:p-4 lg:p-8 transition-all duration-300 ${isSidebarMinimized ? "h-full flex-grow" : "h-auto lg:h-full flex-grow-0 lg:flex-grow flex-shrink-0 lg:flex-shrink"
      }`}>

      {/* Minimize Sidebar Button (Shown when sidebar is minimized) */}
      {isSidebarMinimized && (
        <button
          onClick={onExpandSidebar}
          className="fixed lg:absolute bottom-4 right-4 lg:bottom-auto lg:right-0 lg:top-1/2 lg:-translate-y-1/2 bg-red-600 hover:bg-red-700 lg:bg-zinc-900/80 lg:hover:bg-zinc-850 border border-red-500/30 lg:border-l lg:border-t lg:border-b lg:border-r-0 lg:border-zinc-800 w-12 h-12 lg:w-8 lg:h-16 rounded-full lg:rounded-l-2xl lg:rounded-r-none flex items-center justify-center text-white lg:text-zinc-400 lg:hover:text-white transition shadow-2xl cursor-pointer z-40"
          title="Expand Sidebar"
        >
          <span className="lg:hidden"><FaComments size={18} /></span>
          <span className="hidden lg:inline"><FaChevronLeft size={14} /></span>
        </button>
      )}

      {/* Centered Content Container */}
      <div className="flex-grow flex items-center justify-center w-full min-h-0">

        {/* =================== ACTIVE PLAYER STATE =================== */}
        <div className="w-full flex flex-col gap-2.5 sm:gap-6 animate-fadeIn max-h-full">

          {/* Media player wrapper */}
          <div ref={playerContainerRef} className="w-full max-w-[min(896px,88.8vh)] lg:max-w-[min(896px,97.7vh)] aspect-video bg-black rounded-3xl overflow-hidden border border-zinc-800 relative group shadow-2xl max-h-[50vh] lg:max-h-[55vh] mx-auto">
            {activeVideo ? (
              <>
                <Player
                  key={getPlayerUrl(mediaSource, activeVideo)}
                  ref={playerRef}
                  url={getPlayerUrl(mediaSource, activeVideo)}
                  playing={isPlaying}
                  muted={isMuted}
                  playsinline={true}
                  volume={0.8}
                  width="100%"
                  height="100%"
                  controls={false}
                  onProgress={onProgress}
                  onDuration={onDuration}
                  onPlay={onPlay}
                  onPause={onPause}
                  config={{
                    youtube: {
                      playerVars: {
                        disablekb: 1,
                        fs: 0,
                        modestbranding: 1,
                        rel: 0
                      }
                    }
                  }}
                />
                {!isCreator && (
                  <div className="absolute inset-0 z-10 bg-transparent cursor-default"></div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <FaTv size={48} className="text-zinc-650 mb-3 animate-pulse" />
                <span className="text-sm font-bold text-zinc-300">Waiting for Host</span>
                <span className="text-xs text-zinc-500 mt-1 max-w-sm">No watch source has been loaded yet.</span>
              </div>
            )}

            {/* Dark Overlay controls on hover */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/10 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
              <div className="flex items-center justify-between text-xs text-white">
                <span className="font-bold flex items-center gap-1.5 uppercase tracking-wide bg-black/60 px-3 py-1.5 rounded-full border border-zinc-800">
                  {mediaSource ? (
                    <>
                      {mediaSource === "youtube" && <FaYoutube className="text-red-500" />}
                      {mediaSource === "twitch" && <FaTwitch className="text-purple-500" />}
                      {mediaSource} Active
                    </>
                  ) : (
                    "No Stream"
                  )}
                </span>
              </div>

              {/* Player timeline & bottom bar */}
              <div className="space-y-3 pointer-events-auto w-full">
                {/* Progress slider bar */}
                <div className="w-full flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step="any"
                    value={progress}
                    onChange={onSeekChange}
                    disabled={!isCreator}
                    className={`w-full accent-red-500 h-1 bg-zinc-700 rounded-full cursor-pointer outline-none ${!isCreator ? "pointer-events-none opacity-80" : ""}`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isCreator ? (
                      <>
                        <button
                          onClick={onSkipBackward}
                          className="text-white hover:text-red-500 transition cursor-pointer"
                          title="Skip Backward 10s"
                        >
                          <FaBackward size={12} />
                        </button>
                        <button
                          onClick={onPlayPause}
                          className="text-white hover:text-red-500 transition cursor-pointer"
                          title={isPlaying ? "Pause" : "Play"}
                        >
                          {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
                        </button>
                        <button
                          onClick={onSkipForward}
                          className="text-white hover:text-red-500 transition cursor-pointer"
                          title="Skip Forward 10s"
                        >
                          <FaForward size={12} />
                        </button>
                      </>
                    ) : (
                      <div className="text-zinc-400 text-[10px] font-bold bg-zinc-900/60 border border-zinc-800 px-3 py-1 rounded-full uppercase tracking-wider select-none">
                        {isPlaying ? "Playing (Synced)" : "Paused (Synced)"}
                      </div>
                    )}
                    <button
                      onClick={onToggleMute}
                      className="text-white hover:text-red-500 transition cursor-pointer ml-2"
                    >
                      {isMuted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
                    </button>
                    <button
                      onClick={onToggleFullscreen}
                      className="text-white hover:text-red-500 transition cursor-pointer"
                      title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                      {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-400">
                    {formatTime(playedSeconds)} / {formatTime(duration)}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Status actions info card */}
          <div className={`p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl gap-3 ${isSidebarMinimized ? "flex" : "hidden lg:flex"
            } items-center`}>
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
            <span className="text-xs font-semibold text-zinc-300">Synchronized Playback Active</span>
          </div>
        </div>
      </div>
    </section>
  );
}
