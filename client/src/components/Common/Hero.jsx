import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaPlay, FaUsers, FaComments, FaArrowRight } from "react-icons/fa";

export default function Hero() {
  const [targetPath, setTargetPath] = useState("/register");

  useEffect(() => {
    if (localStorage.getItem("token")) {
      setTargetPath("/home");
    }
  }, []);

  return (
    <section className="min-h-screen bg-[#0f0f13] text-white flex items-center relative overflow-hidden">
      {/* Background Decorative Gradient */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 w-full relative z-10">
        
        {/* Main Grid: Info Left, Premium Live Demo Mockup Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Column Left: Heading & Call to Action (7 cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Badge */}
            <span className="inline-block px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-semibold tracking-wide">
              🎬 Watch Together Platform
            </span>

            {/* Heading */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black leading-tight tracking-tight">
              Watch Movies
              <br />
              <span className="text-red-500">Together.</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl text-zinc-300 leading-relaxed max-w-xl">
              Create watch rooms in seconds, sync video playback perfectly for everyone, and talk or chat in real-time with friends.
            </p>

            {/* CTA Button */}
            <div>
              <Link
                to={targetPath}
                className="inline-flex items-center gap-3 bg-red-600 px-8 py-4.5 rounded-2xl text-base sm:text-lg font-bold hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                Get Started Now <FaArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Column Right: Premium Visual Frame (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="bg-[#18181b]/60 border border-zinc-800 p-4 sm:p-5 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-zinc-700 transition duration-300">
              
              {/* Mock Player Screen */}
              <div className="bg-black rounded-2xl aspect-video relative flex items-center justify-center overflow-hidden">
                {/* Background image mockup for video player */}
                <img 
                  src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop" 
                  alt="Cinema Mockup" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                
                {/* Overlay Player Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-4 z-10">
                  <span className="self-start bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> LIVE
                  </span>

                  {/* Play Bar */}
                  <div className="space-y-1.5 w-full">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-semibold">
                      <span>01:14:32</span>
                      <span>02:30:00</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full w-[45%] rounded-full relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow border border-red-500"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-14 h-14 bg-red-600/90 text-white rounded-full flex items-center justify-center shadow-lg relative z-20 cursor-pointer hover:scale-110 hover:bg-red-500 transition duration-200">
                  <FaPlay size={18} className="ml-1" />
                </div>
              </div>

              {/* Chat & Active Users Showcase */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-xs font-bold text-zinc-300">Live Watch Chat</span>
                  <span className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                    <FaUsers size={12} /> 4 online
                  </span>
                </div>
                
                {/* Chat items */}
                <div className="space-y-2">
                  <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/50 flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold flex items-center justify-center flex-shrink-0">A</div>
                    <div className="text-xs">
                      <span className="font-bold text-zinc-200 block">Alok</span>
                      <span className="text-zinc-400">Syncing movie playback now!</span>
                    </div>
                  </div>
                  <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/50 flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold flex items-center justify-center flex-shrink-0">S</div>
                    <div className="text-xs">
                      <span className="font-bold text-zinc-200 block">Sarah</span>
                      <span className="text-zinc-400">Perfectly synced up!🍿</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Feature Grid Section (Added according to customized landing page) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 mt-24 border-t border-zinc-800/80 pt-16">
          <div className="bg-[#18181b]/30 border border-zinc-800/60 p-6 sm:p-8 rounded-3xl space-y-4 hover:border-zinc-850 transition duration-200">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl flex items-center justify-center shadow-md">
              <FaPlay size={18} />
            </div>
            <h3 className="text-xl font-bold text-white">Instant Sync</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Video state is shared in real-time. Pause, play, or skip, and everyone's screens follow instantly.
            </p>
          </div>

          <div className="bg-[#18181b]/30 border border-zinc-800/60 p-6 sm:p-8 rounded-3xl space-y-4 hover:border-zinc-850 transition duration-200">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl flex items-center justify-center shadow-md">
              <FaComments size={18} />
            </div>
            <h3 className="text-xl font-bold text-white">Live Conversation</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Interactive chat panels keep conversations lively. Share thoughts, reactions, and emojis in real-time.
            </p>
          </div>

          <div className="bg-[#18181b]/30 border border-zinc-800/60 p-6 sm:p-8 rounded-3xl space-y-4 hover:border-zinc-850 transition duration-200">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl flex items-center justify-center shadow-md">
              <FaUsers size={18} />
            </div>
            <h3 className="text-xl font-bold text-white">Multiplayer Rooms</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Create secure, private spaces with custom passwords or public rooms for community streaming events.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
