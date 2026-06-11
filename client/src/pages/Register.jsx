import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash, FaChevronLeft } from "react-icons/fa";
import { API_BASE } from "../config/api";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");

  const [userId, setUserId] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const isLengthMet = password.length >= 8;
  const isNumberMet = /[0-9]/.test(password);
  const isSpecialMet = /[^a-zA-Z0-9]/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // Client-side validation
    const userIdRegex = /^[a-zA-Z0-9_.]+$/;
    if (!userIdRegex.test(userId)) {
      setError("User ID can only contain letters, numbers, underscores, and periods");
      return;
    }

    if (userId.length < 3 || userId.length > 20) {
      setError("User ID must be between 3 and 20 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isLengthMet) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!isNumberMet || !isSpecialMet) {
      setError("Password must contain at least one number and one special character");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          userId,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Registration successful!");

        // Save email in localStorage for verification pre-fill fallback
        localStorage.setItem("verify_email", email);

        setTimeout(() => {
          navigate("/verify-email", { state: { email } });
        }, 1500);
      } else {
        setError(data.message || "Something went wrong");
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

        <p className="text-center text-zinc-400 mt-2">Create your account</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Full Name */}
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition"
            required
          />

          {/* User ID */}
          <input
            type="text"
            placeholder="User ID (unique handle, e.g. john_doe)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition"
            required
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

          {/* Password Strength Checklist */}
          <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800 text-xs space-y-1.5">
            <p className="text-zinc-400 font-semibold">Password Requirements:</p>
            <ul className="space-y-1">
              <li className={`flex items-center gap-2 transition-colors duration-205 ${isLengthMet ? "text-green-400 font-medium" : "text-zinc-500"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLengthMet ? "bg-green-450" : "bg-zinc-600"}`}></span>
                At least 8 characters
              </li>
              <li className={`flex items-center gap-2 transition-colors duration-205 ${isNumberMet ? "text-green-400 font-medium" : "text-zinc-500"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isNumberMet ? "bg-green-450" : "bg-zinc-600"}`}></span>
                At least one number
              </li>
              <li className={`flex items-center gap-2 transition-colors duration-205 ${isSpecialMet ? "text-green-400 font-medium" : "text-zinc-500"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSpecialMet ? "bg-green-450" : "bg-zinc-600"}`}></span>
                At least one special character
              </li>
            </ul>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3 pr-12 text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition"
              required
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="bg-green-500/10 border border-green-500 text-green-400 rounded-xl px-4 py-3 text-sm">
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 py-3 rounded-xl font-semibold text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-zinc-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-red-400 hover:text-red-300">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
