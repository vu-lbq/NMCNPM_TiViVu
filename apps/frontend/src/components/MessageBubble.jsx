import React from "react";
import { Volume2, User, Bot } from "lucide-react";

const MessageBubble = ({ text, role, onWordClick, onSpeak }) => {
  const isUser = role === "user";
  const words = text.split(" ");

  return (
    <div
      className={`flex w-full mb-6 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`
          w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm text-white
          ${isUser ? "bg-[#00BDB6]" : "bg-[#1D2957]"}
        `}
        >
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <div
            className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm transition-colors
            ${
              isUser
                ? "bg-[#00BDB6]/10 text-[#1D2957] border border-[#00BDB6]/20 rounded-tr-sm"
                : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
            }
          `}
          >
            {words.map((word, index) => (
              <span
                key={index}
                onClick={() =>
                  onWordClick(word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ""))
                }
                className={`cursor-pointer rounded px-0.5 transition-colors ${
                  isUser ? "hover:bg-[#00BDB6]/20" : "hover:bg-yellow-100"
                }`}
              >
                {word}{" "}
              </span>
            ))}
          </div>

          {!isUser && (
            <button
              onClick={() => onSpeak(text)}
              className="mt-1 ml-1 text-gray-400 hover:text-[#00BDB6] self-start transition-colors p-1"
            >
              <Volume2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
