import React from "react";
import { FaPaperPlane } from "react-icons/fa";

export default function ChatPanel({
  messages,
  participants,
  currentUser,
  myName,
  hostName,
  chatDisabled,
  newMessage,
  setNewMessage,
  onSendMessage
}) {
  const chatContainerRef = React.useRef(null);

  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex-grow flex flex-col min-h-0">
      {/* Scrolling message feed */}
      <div ref={chatContainerRef} className="flex-grow p-2.5 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4 custom-scrollbar min-h-0">
        {messages.map((m) => {
          const isSenderMuted = (() => {
            if (m.isSystem) return false;
            if (m.senderId) {
              const participant = participants.find(p => {
                const pId = p.user?._id || p.user;
                return pId?.toString() === m.senderId.toString();
              });
              return !!participant?.isMuted;
            }
            const participant = participants.find(p => {
              const pName = p.user?.name || p.user?.username;
              return pName === m.sender;
            });
            return !!participant?.isMuted;
          })();

          const isSenderOfMsg = m.senderId
            ? (currentUser?._id?.toString() === m.senderId.toString())
            : (m.sender === myName);

          if (isSenderMuted && !isSenderOfMsg) {
            return null;
          }

          return (
            <div key={m.id} className="animate-fadeIn">
              {m.isSystem ? (
                <div className="text-[10px] text-zinc-555 text-center uppercase tracking-wider font-semibold py-1 bg-zinc-900/10 rounded-lg border border-zinc-850/50">
                  {m.text}
                </div>
              ) : (
                <div className={`flex gap-2 sm:gap-3 items-start p-1.5 sm:p-2.5 rounded-xl hover:bg-zinc-900/40 transition group relative ${
                  isSenderOfMsg ? "flex-row-reverse" : ""
                }`}>
                  {/* Left/Right: User Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 select-none ${m.sender === myName
                    ? "bg-red-500/15 text-red-400 border border-red-500/20"
                    : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                    }`}>
                    {m.sender.charAt(0).toUpperCase()}
                  </div>

                  {/* Right/Left: Message Content */}
                  <div className={`flex-grow min-w-0 ${isSenderOfMsg ? "text-right" : ""}`}>
                    <div className="space-y-0.5">
                      <div className={`flex items-baseline gap-2 ${isSenderOfMsg ? "justify-end flex-row-reverse" : ""}`}>
                        <span className={`text-xs font-black ${m.sender === myName ? "text-red-500" : "text-zinc-200"}`}>
                          {m.sender}
                        </span>
                        {m.sender === hostName && (
                          <span className="text-[9px] bg-red-600/10 text-red-400 border border-red-500/20 px-1.5 py-0.25 rounded font-black uppercase tracking-wider">
                            Host
                          </span>
                        )}
                        <span className="text-[9px] text-zinc-555 font-mono">{m.time}</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed break-words">{m.text}</p>
                    </div>
                  </div>

                  {/* Hover action overlay */}
                  <div className={`absolute ${isSenderOfMsg ? "left-2" : "right-2"} top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-[#18181f] border border-zinc-800 rounded-lg p-0.5 shadow-lg gap-0.5`}>
                    <button type="button" className="w-5 h-5 flex items-center justify-center text-[10px] text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer" title="Thumbs Up">👍</button>
                    <button type="button" className="w-5 h-5 flex items-center justify-center text-[10px] text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer" title="Heart">❤️</button>
                    <button type="button" className="w-5 h-5 flex items-center justify-center text-[10px] text-zinc-400 hover:text-white rounded hover:bg-zinc-800 cursor-pointer" title="Fire">🔥</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input action drawer */}
      <form onSubmit={onSendMessage} className="p-2 sm:p-3 border-t border-zinc-800 bg-zinc-950/20 flex-shrink-0">
        <div className="bg-[#141418] border border-zinc-800 focus-within:border-red-500/50 rounded-2xl p-2 sm:p-2.5 transition duration-200 flex flex-col gap-2">

          <input
            type="text"
            disabled={chatDisabled}
            placeholder={
              chatDisabled
                ? "Chat has been disabled by host"
                : "Message #watch-party..."
            }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full bg-transparent text-xs text-white outline-none placeholder-zinc-500 disabled:opacity-50"
          />

          <div className="flex items-center justify-between mt-1 flex-shrink-0 border-t border-zinc-850 pt-2">
            {/* Left: formatting shortcuts placeholders */}
            <div className="flex items-center gap-1.5 text-zinc-500">
              <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 hover:text-zinc-300 transition text-[11px] font-bold cursor-pointer">B</button>
              <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 hover:text-zinc-300 transition text-[11px] italic cursor-pointer">I</button>
              <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 hover:text-zinc-300 transition text-[11px] font-mono cursor-pointer">&lt;&gt;</button>
              <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 hover:text-zinc-300 transition text-xs cursor-pointer">😊</button>
            </div>

            {/* Right: Send button */}
            <button
              type="submit"
              disabled={chatDisabled || !newMessage.trim()}
              className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-850 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition duration-155 flex items-center justify-center gap-1.5 disabled:opacity-55 cursor-pointer shadow"
            >
              Send <FaPaperPlane size={8} />
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
