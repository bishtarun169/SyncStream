
import { FaGithub } from "react-icons/fa";

export default function Footer({ theme = "dark" }) {
  const isLight = theme === "light";

  const bgClass = isLight
    ? "bg-zinc-100 text-zinc-800 border-t border-zinc-200"
    : "bg-[#09090b] text-[#f4f4f5] border-t border-zinc-900";

  const headingClass = isLight ? "text-zinc-900" : "text-white";

  const textMutedClass = isLight
    ? "text-zinc-500"
    : "text-zinc-400";

  const linkClass = isLight
    ? "text-zinc-500 hover:text-zinc-900"
    : "text-zinc-400 hover:text-white";

  const logoClass = isLight ? "text-zinc-900" : "text-white";

  return (
    <footer className={`${bgClass} w-full mt-auto`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center space-y-5">
          
          {/* Logo + Project Name */}
          <div className="flex items-center gap-3">
            <svg
              className={`w-9 h-9 ${logoClass}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2 L22 7 v10 L12 22 L2 17 V7 Z" />
              <path d="M12 12 V22" />
              <path d="M12 12 L2 7" />
              <path d="M12 12 L22 7" />
            </svg>

            <h2 className={`text-2xl font-bold ${headingClass}`}>
              StreamMate
            </h2>
          </div>

          {/* Description */}
          <p className={`max-w-xl text-sm leading-6 ${textMutedClass}`}>
            StreamMate lets you watch videos together with friends in
            synchronized rooms, chat in real-time, and enjoy a seamless
            watch-party experience from anywhere.
          </p>

          {/* GitHub */}
          <a
            href="https://github.com/bishtarun169/StreamMate"
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkClass} transition duration-150`}
            aria-label="GitHub Repository"
          >
            <FaGithub size={22} />
          </a>

          {/* Copyright */}
          <p className={`text-xs pt-2 ${textMutedClass}`}>
            © 2026 StreamMate • Built by students
          </p>
        </div>
      </div>
    </footer>
  );
}

