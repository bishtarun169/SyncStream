import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaEnvelope, FaKey, FaLock } from "react-icons/fa";
import { API_BASE } from "../config/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Send Email, 2: Enter Code & Password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "Reset code sent! Check your console/email.");
        // Transition to Step 2
        setTimeout(() => {
          setStep(2);
          setMessage("");
        }, 1500);
      } else {
        setError(data.message || "Email address not found.");
      }
    } catch (err) {
      setError("Unable to connect to server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "Password updated successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Reset failed. Check recovery code.");
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
        
        {/* Back Link */}
        <button
          onClick={() => {
            if (step === 2) {
              setStep(1);
              setError("");
              setMessage("");
            } else {
              navigate("/login");
            }
          }}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm transition duration-200 cursor-pointer bg-transparent border-none"
        >
          <FaChevronLeft size={12} /> {step === 2 ? "Back to Step 1" : "Back to Login"}
        </button>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Forgot <span className="text-red-500">Password</span>
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">
          {step === 1 
            ? "Enter your email to receive a 6-digit recovery code. Check your backend console."
            : "Enter the 6-digit reset code and type your new password."
          }
        </p>

        {step === 1 ? (
          /* =================== STEP 1: REQUEST CODE =================== */
          <form onSubmit={handleRequestCode} className="mt-8 space-y-5">
            
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 py-3.5 rounded-xl font-semibold text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 transition duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>

          </form>
        ) : (
          /* =================== STEP 2: RESET PASSWORD =================== */
          <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
            
            {/* Read-only Email display */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <FaEnvelope className="text-red-500" size={12} /> Email Address
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500 outline-none select-none"
              />
            </div>

            {/* Recovery Code */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <FaKey className="text-red-500" size={12} /> Reset Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="6-digit reset code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3 text-center tracking-widest font-mono text-lg text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition duration-200"
              />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <FaLock className="text-red-500" size={12} /> New Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition duration-200"
              />
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <FaLock className="text-red-500" size={12} /> Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition duration-200"
              />
            </div>

            {/* Alerts */}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 py-3.5 rounded-xl font-semibold text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 transition duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
