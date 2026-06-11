import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaChevronLeft, FaKey, FaEnvelope } from "react-icons/fa";
import { API_BASE } from "../config/api";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Retrieve email if passed from Registration page state redirect
  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      const savedEmail = localStorage.getItem("verify_email");
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "Email verified successfully!");
        localStorage.removeItem("verify_email");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Verification failed. Check your OTP.");
      }
    } catch (err) {
      setError("Unable to connect to server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    setError("");
    setResendMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setResendMessage("Verification code resent! Check your terminal console.");
      } else {
        setError(data.message || "Failed to resend code");
      }
    } catch (err) {
      setError("Unable to connect to server");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#18181b]/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-zinc-800 shadow-2xl relative z-10">
        
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm transition duration-200"
        >
          <FaChevronLeft size={12} /> Back to Login
        </Link>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-white">
          Verify <span className="text-red-500">Email</span>
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">
          Please enter the 6-digit OTP code sent to your email. Check your backend node server console logs.
        </p>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          
          {/* Email input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <FaEnvelope className="text-red-500" size={12} /> Email Address
            </label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition duration-200"
            />
          </div>

          {/* OTP Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <FaKey className="text-red-500" size={12} /> OTP Verification Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3 text-center tracking-widest font-mono text-lg text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition duration-200"
            />
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-xs leading-normal">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-3 text-xs leading-normal">
              {message}
            </div>
          )}
          {resendMessage && (
            <div className="bg-zinc-800/80 border border-zinc-700 text-zinc-350 rounded-xl px-4 py-3 text-xs leading-normal">
              {resendMessage}
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 py-3.5 rounded-xl font-semibold text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 transition duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

        </form>

        {/* Resend actions triggers */}
        <div className="mt-6 text-center text-sm text-zinc-400">
          Didn't receive the code?{" "}
          <button
            onClick={handleResend}
            className="text-red-400 hover:text-red-300 font-bold transition bg-transparent border-none cursor-pointer"
          >
            Resend Code
          </button>
        </div>

      </div>
    </div>
  );
}
