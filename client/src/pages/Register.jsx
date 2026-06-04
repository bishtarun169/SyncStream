import { Link } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash, FaChevronLeft } from "react-icons/fa";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Registration successful!");

        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setError(data.message || "Something went wrong");
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
            className="w-full bg-red-600 py-3 rounded-xl font-semibold text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200 cursor-pointer"
          >
            Create Account
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
