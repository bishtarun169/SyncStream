import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash, FaChevronLeft } from "react-icons/fa";
import { API_BASE } from "../config/api";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [identifier, setIdentifier] = useState("");

  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Login successful!");

        // Store JWT token if backend sends one
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // Store user theme preference
        if (data.user && data.user.settings && data.user.settings.theme) {
          localStorage.setItem("theme", data.user.settings.theme);
        } else {
          localStorage.setItem("theme", "light");
        }
        
        // Redirect to /home after 1 second
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else {
        if (data.message && data.message.toLowerCase().includes("verify")) {
          if (data.email) {
            localStorage.setItem("verify_email", data.email);
          } else if (identifier.includes("@")) {
            localStorage.setItem("verify_email", identifier);
          }
        }
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Unable to connect to server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#18181b]/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-zinc-800 shadow-2xl relative z-10">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm transition duration-200"
        >
          <FaChevronLeft size={12} />
          Back to Home
        </Link>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-red-500 text-center">
          StreamMate
        </h1>

        <p className="text-center text-zinc-400 mt-2">Welcome back</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Email or User ID */}
          <input
            type="text"
            placeholder="Email or User ID"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition"
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3 pr-12 text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-red-400 hover:text-red-300 transition hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
              {error.toLowerCase().includes("verify") && (
                <Link to="/verify-email" className="block text-red-300 underline font-bold mt-1.5 hover:text-red-200">
                  Verify your email here
                </Link>
              )}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="bg-green-500/10 border border-green-500 text-green-400 rounded-xl px-4 py-3 text-sm">
              {message}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 py-3 rounded-xl font-semibold text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-zinc-400 mt-6">
          No account?{" "}
          <Link to="/register" className="text-red-400 hover:text-red-300">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
