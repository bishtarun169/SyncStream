import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-3 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="h-16 sm:h-20 px-4 sm:px-8 rounded-2xl sm:rounded-3xl bg-[#111118]/60 backdrop-blur-xl border border-zinc-800 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl sm:text-3xl font-black tracking-tight text-white"
          >
            <span className="text-red-500">Stream</span>Mate
          </Link>

          {/* Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">

            <Link
              to="/login"
              className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-zinc-700 text-white text-sm sm:text-base hover:bg-zinc-800 transition-all duration-200"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-red-600 text-white text-sm sm:text-base font-semibold hover:bg-red-700 transition-all duration-200"
            >
              Sign Up
            </Link>

          </div>

        </div>

      </div>
    </nav>
  );
}