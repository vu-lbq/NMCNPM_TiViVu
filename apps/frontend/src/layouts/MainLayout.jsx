import React, { useState } from "react";
import { Menu, LogOut, Plus, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const MainLayout = ({ children, onNewChat }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <div
        className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#1D2957] text-white transform transition-transform duration-300 ease-in-out
        ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 flex flex-col
      `}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="md:hidden font-bold text-xl mb-4 text-[#00BDB6]">
            TiViVu AI
          </div>

          <button
            onClick={() => {
              onNewChat();
              setSidebarOpen(false);
            }}
            className="flex items-center gap-2 bg-[#00BDB6] text-white px-4 py-3 rounded-lg hover:bg-[#00a8a2] transition mb-6 shadow-lg shadow-[#00BDB6]/20 font-medium"
          >
            <Plus size={20} /> <span>New Chat</span>
          </button>

          <div className="flex-1 overflow-y-auto space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
              Recent
            </p>
            <div className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
              <MessageSquare size={16} className="text-[#00BDB6]" />{" "}
              <span className="truncate text-sm">English Practice 1</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
              <MessageSquare size={16} className="text-[#00BDB6]" />{" "}
              <span className="truncate text-sm">Vocabulary Test</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 mt-2">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-8 h-8 bg-[#00BDB6] rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0].toUpperCase()}
              </div>
              <span className="text-sm truncate flex-1 opacity-90">
                {user?.email}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-red-300 hover:text-red-200 px-2 text-sm w-full transition-colors"
            >
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#1D2957]/80 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col w-full h-full relative bg-gray-50">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-[#1D2957] md:hidden hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>

            <h1 className="text-xl font-bold text-[#1D2957] tracking-tight">
              Ti<span className="text-[#00BDB6]">Vi</span>Vu
            </h1>
          </div>

          <div className="text-sm text-gray-500 hidden sm:block">
            English Learning Platform
          </div>
        </header>

        {children}
      </div>
    </div>
  );
};

export default MainLayout;
