import React, { useEffect, useMemo, useState } from 'react';
import { X, Trash2, ExternalLink } from 'lucide-react';
import { vocabService } from '../services/api';

function groupByDate(items) {
  const map = new Map();
  for (const it of items) {
    const d = new Date(it.createdAt);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(it);
  }
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1)); // newest date first
}

function cambridgeLink(word) {
  return `https://dictionary.cambridge.org/dictionary/english-vietnamese/${encodeURIComponent(word)}`;
}

function googleLink(word, lang = 'en') {
  const sl = lang === 'vi' ? 'vi' : 'en';
  const tl = sl === 'en' ? 'vi' : 'en';
  return `https://translate.google.com/?sl=${sl}&tl=${tl}&text=${encodeURIComponent(word)}&op=translate`;
}

export default function VocabularyModal({ isOpen, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setLoading(true);
        const res = await vocabService.list();
        setItems(res?.items || []);
      } catch (e) {
        // noop
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen]);

  const grouped = useMemo(() => groupByDate(items), [items]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Saved Vocabulary</h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-black"><X size={18} /></button>
        </div>
        <div className="p-4 overflow-auto">
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : grouped.length === 0 ? (
            <div className="text-sm text-gray-500">No saved words yet.</div>
          ) : (
            grouped.map(([date, arr]) => (
              <div key={date} className="mb-6">
                <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">{date}</div>
                <div className="space-y-2">
                  {arr.map((it) => (
                    <div key={it.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <a href={cambridgeLink(it.word)} target="_blank" rel="noreferrer" className="underline text-blue-700 hover:text-blue-900">
                            {it.word}
                          </a>
                          <a href={googleLink(it.word, it.lang)} target="_blank" rel="noreferrer" title="Open in Google Translate" className="text-gray-500 hover:text-black">
                            <ExternalLink size={14} />
                          </a>
                        </div>
                        {it.meaningVi && (
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">{it.meaningVi}</div>
                        )}
                        {it.notes && (
                          <div className="text-xs text-gray-500 mt-1">{it.notes}</div>
                        )}
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await vocabService.remove(it.id);
                            setItems((prev) => prev.filter((x) => x.id !== it.id));
                          } catch {}
                        }}
                        className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-md"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
