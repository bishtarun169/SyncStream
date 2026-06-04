
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="min-h-screen bg-[#0f0f13] text-white flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32">
        <div className="max-w-3xl">

          {/* Badge */}
          <span className="inline-block px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
            🎬 Watch Together Platform
          </span>

          {/* Heading */}
          <h1 className="mt-6 text-4xl sm:text-6xl md:text-8xl font-black leading-tight">
            Watch Movies
            <br />
            Together.
          </h1>

          {/* Description */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-300 leading-relaxed max-w-2xl">
            Create rooms, invite friends,
            sync playback instantly and enjoy
            movies together from anywhere in the world.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10">

            <Link
              to="/create-room"
              className="bg-red-600 px-8 py-4 rounded-2xl text-center text-base sm:text-lg font-semibold hover:bg-red-700 transition"
            >
              Create Room
            </Link>

            <Link
              to="/join-room"
              className="bg-zinc-800 px-8 py-4 rounded-2xl text-center text-base sm:text-lg font-semibold hover:bg-zinc-700 transition"
            >
              Join Room
            </Link>

          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-14 sm:mt-16">

            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-red-500">
                Sync
              </h3>
              <p className="text-sm sm:text-base text-zinc-400">
                Playback
              </p>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-red-500">
                Live
              </h3>
              <p className="text-sm sm:text-base text-zinc-400">
                Chat
              </p>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-red-500">
                Easy
              </h3>
              <p className="text-sm sm:text-base text-zinc-400">
                Invites
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

