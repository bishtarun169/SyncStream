
import { Link } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#18181b] p-8 rounded-3xl border border-zinc-800">

        <h1 className="text-4xl font-bold text-red-500 text-center">
          StreamMate
        </h1>

        <p className="text-center text-zinc-400 mt-2">
          Create your account
        </p>

        <form className="mt-8 space-y-5">

          <input
            type="text"
            placeholder="Full Name"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 pr-12 text-white outline-none focus:border-red-500"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              placeholder="Confirm Password"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 pr-12 text-white outline-none focus:border-red-500"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              {showConfirmPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>
          </div>

          <button
            className="w-full bg-red-600 py-3 rounded-xl font-semibold text-white hover:bg-red-700 transition"
          >
            Create Account
          </button>

        </form>

        <p className="text-center text-zinc-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-red-400 hover:text-red-300"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

