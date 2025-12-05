import React, { useState } from "react";
import { Menu, LogOut, BookMarked } from "lucide-react";
import { useAuth } from "../context/useAuth";
import ConversationsList from "../components/ConversationsList";

const MainLayout = ({ children, onSelectConversation, selectedConversationId, sidebarRefreshKey, onOpenVocabulary }) => {
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

          <ConversationsList
            onSelectConversation={(c) => {
              onSelectConversation && onSelectConversation(c);
              setSidebarOpen(false);
            }}
            selectedId={selectedConversationId}
            refreshKey={sidebarRefreshKey}
          />

          <div className="pt-4 border-t border-white/10 mt-2">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-8 h-8 bg-[#00BDB6] rounded-full flex items-center justify-center text-white text-xs font-bold">
                {((user?.email || 'U')[0] || 'U').toUpperCase()}
              </div>
              <span className="text-sm truncate flex-1 opacity-90">
                {user?.displayName || user?.email}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-red-300 hover:text-red-200 p-2 text-sm w-full transition-colors"
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

            <div className="flex items-baseline gap-3">
              <img src="images/logo-light.svg" alt="" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenVocabulary}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-[#1D2957] hover:bg-gray-100 shadow-sm"
              title="Open Vocabulary"
            >
              <BookMarked size={18} />
              <span className="hidden sm:inline">Vocabulary</span>
            </button>
            {user?.role === 'admin' && (
              <a href="/admin" className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-[#1D2957] hover:bg-gray-100 shadow-sm">
                Admin
              </a>
            )}
          </div>
        </header>

        {children}
      </div>
    </div>
  );
};

export default MainLayout;
