import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaYoutube, FaInstagram } from "react-icons/fa";

export default function Footer({ theme = "dark" }) {
  const isLight = theme === "light";

  const bgClass = isLight ? "bg-zinc-100 text-zinc-800 border-t border-zinc-200" : "bg-[#09090b] text-[#f4f4f5] border-t border-zinc-900";
  const borderClass = isLight ? "border-zinc-200" : "border-zinc-900";
  const headingClass = isLight ? "text-zinc-900" : "text-white";
  const textMutedClass = isLight ? "text-zinc-500" : "text-zinc-400";
  const inputClass = isLight ? "bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-red-500/50" : "bg-[#141418] border border-zinc-800/80 focus:border-red-500/50 text-white placeholder-zinc-550";
  const buttonClass = isLight ? "bg-zinc-200 hover:bg-zinc-250 border border-zinc-300 text-zinc-800" : "bg-[#1e1e24] hover:bg-[#272730] border border-zinc-800 text-white";
  const linkClass = isLight ? "text-zinc-500 hover:text-zinc-900" : "text-zinc-400 hover:text-white";
  const logoClass = isLight ? "text-zinc-900" : "text-white";
  const hiringBadgeClass = isLight ? "bg-green-100 text-green-800 border border-green-200/50" : "bg-[#102a1e] text-[#4ade80] border border-[#1b4332]/50";

  return (
    <footer className={`${bgClass} w-full mt-auto`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Main Grid: Newsletter Form Left, Columns Right */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b ${borderClass}`}>
          
          {/* Left: Logo & Newsletter */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Cubical isometric logo */}
            <div className="flex items-center gap-3">
              <svg className={`w-9 h-9 ${logoClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 L22 7 v10 L12 22 L2 17 V7 Z" />
                <path d="M12 12 V22" />
                <path d="M12 12 L2 7" />
                <path d="M12 12 L22 7" />
              </svg>
            </div>

            <h3 className={`text-lg font-bold tracking-wide ${headingClass}`}>
              Join our newsletter for regular updates.
            </h3>

            {/* Newsletter input form */}
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <input 
                type="email" 
                placeholder="example@email.com" 
                className={`rounded-xl px-4 py-3 text-sm outline-none flex-grow border ${inputClass}`} 
                required 
              />
              <button 
                type="submit" 
                className={`font-semibold px-6 py-3 rounded-xl text-sm transition duration-200 cursor-pointer shadow-md ${buttonClass}`}
              >
                Subscribe
              </button>
            </form>

          </div>

          {/* Right: Columns */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            {/* Features Column */}
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${headingClass}`}>
                Features
              </h4>
              <ul className="space-y-3.5 text-sm">
                <li>
                  <Link to="/home" className={`${linkClass} transition duration-150`}>
                    Synchronized Playback
                  </Link>
                </li>
                <li>
                  <Link to="/home" className={`${linkClass} transition duration-150`}>
                    Live Chat Rooms
                  </Link>
                </li>
                <li>
                  <Link to="/home" className={`${linkClass} transition duration-150`}>
                    Friends List
                  </Link>
                </li>
                <li>
                  <Link to="/home" className={`${linkClass} transition duration-150`}>
                    Multi-Source Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Explore Column */}
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${headingClass}`}>
                Explore
              </h4>
              <ul className="space-y-3.5 text-sm">
                <li>
                  <Link to="/join-room" className={`${linkClass} transition duration-150`}>
                    Public Rooms
                  </Link>
                </li>
                <li>
                  <Link to="/create-room" className={`${linkClass} transition duration-150`}>
                    Create Watch Party
                  </Link>
                </li>
                <li>
                  <Link to="/home" className={`${linkClass} transition duration-150`}>
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/home" className={`${linkClass} transition duration-150`}>
                    Help & FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${headingClass}`}>
                Company
              </h4>
              <ul className="space-y-3.5 text-sm">
                <li>
                  <Link to="/home" className={`${linkClass} transition duration-150`}>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/home" className={`${linkClass} transition duration-150 flex items-center gap-2`}>
                    Careers 
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${hiringBadgeClass}`}>
                      Hiring
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/home" className={`${linkClass} transition duration-150`}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/home" className={`${linkClass} transition duration-150`}>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/home" className={`${linkClass} transition duration-150`}>
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <p className={`text-xs ${textMutedClass}`}>
            © 2026 StreamMate Design
          </p>

          <div className={`flex items-center gap-5 ${linkClass}`}>
            
            {/* Twitter/X SVG logo */}
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={`transition duration-150 ${linkClass}`}>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={`transition duration-150 ${linkClass}`}>
              <FaGithub size={16} />
            </a>

            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={`transition duration-150 ${linkClass}`}>
              <FaLinkedin size={16} />
            </a>

            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={`transition duration-150 ${linkClass}`}>
              <FaYoutube size={16} />
            </a>

            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={`transition duration-150 ${linkClass}`}>
              <FaInstagram size={16} />
            </a>

          </div>

        </div>

      </div>
    </footer>
  );
}