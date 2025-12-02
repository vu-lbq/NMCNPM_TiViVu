import React, { useEffect, useState } from "react";
import { MessageSquare, Plus, Trash2, ChevronsUp, ChevronsDown } from "lucide-react";
import { chatService } from "../services/api";

export default function ConversationsList({ onSelectConversation, selectedId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await chatService.listConversations();
      const convos = data?.conversations || data || [];
      setItems(convos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createNew = async () => {
    const convo = await chatService.createConversation("New Chat");
    await load();
    if (onSelectConversation) onSelectConversation(convo);
  };

  const onDelete = async (id) => {
    try {
      await chatService.deleteConversation(id);
      // Fetch fresh list synchronously to decide next selection
      const data = await chatService.listConversations();
      const convos = data?.conversations || data || [];
      setItems(convos);
      if (selectedId === id && onSelectConversation) {
        const first = convos[0];
        if (first) onSelectConversation(first);
      }
    } catch (e) {
      // optionally show a toast; for now, console
      console.error('Delete failed', e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={createNew}
        className="flex items-center gap-2 bg-[#00BDB6] text-white px-4 py-3 rounded-lg hover:bg-[#00a8a2] transition mb-6 shadow-lg shadow-[#00BDB6]/20 font-medium"
      >
        <Plus size={20} /> <span>New Chat</span>
      </button>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
        {loading ? "Loading conversations..." : "Conversations"}
      </p>
      <div id="sidebar-convos" className="flex-1 overflow-y-auto space-y-1">
        {items.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelectConversation && onSelectConversation(c)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              selectedId === c.id ? "bg-white/20" : "hover:bg-white/10"
            }`}
          >
            <MessageSquare size={16} className="text-[#00BDB6]" />
            <span className="truncate text-sm">{c.title || "Untitled"}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
              title="Delete conversation"
              className="ml-auto p-1 rounded hover:bg-white/20"
            >
              <Trash2 size={16} className="text-red-300" />
            </button>
          </div>
        ))}
        {items.length === 0 && !loading && (
          <div className="px-3 py-2 text-xs text-gray-300">No conversations yet</div>
        )}
      </div>
      <div className="flex items-center justify-between mt-3 px-2">
        <button className="p-2 rounded hover:bg-white/10" title="Scroll to top" onClick={() => {
          const container = document.querySelector('#sidebar-convos');
          if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
        }}>
          <ChevronsUp size={16} />
        </button>
        <button className="p-2 rounded hover:bg-white/10" title="Scroll to bottom" onClick={() => {
          const container = document.querySelector('#sidebar-convos');
          if (container) container.scrollTo({ top: 999999, behavior: 'smooth' });
        }}>
          <ChevronsDown size={16} />
        </button>
      </div>
    </div>
  );
}