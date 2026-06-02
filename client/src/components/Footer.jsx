export default function Footer() {
  return (
    <footer className="bg-[#0a0a0f] border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">

        <div className="text-center max-w-2xl mx-auto">

          <h2 className="text-2xl sm:text-3xl font-bold text-red-500">
            StreamMate
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 mt-4 leading-relaxed">
            StreamMate is a watch-together platform that lets users
            create rooms, invite friends, and enjoy synchronized
            movie streaming in real-time from anywhere.
          </p>

        </div>

        <div className="border-t border-zinc-800 mt-8 sm:mt-10 pt-6">
          <p className="text-center text-zinc-500 text-xs sm:text-sm">
            © 2026 StreamMate • Watch Together Platform
          </p>
        </div>

      </div>
    </footer>
  );
}