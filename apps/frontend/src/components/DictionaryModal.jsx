import React, { useState, useEffect } from "react";
import { X, BookOpen, Globe, BookmarkPlus, Volume2 } from "lucide-react";
import { vocabService, dictionaryService } from "../services/api";
import { useTextToSpeech } from "../hooks/useSpeech";
// đây là component hiển thị modal từ điển khi người dùng chọn một từ
// nó cung cấp các liên kết đến các nguồn từ điển và dịch thuật phổ biến
// hàm để phát hiện ngôn ngữ của từ đã chọn
// và xây dựng các liên kết tương ứng
// có thể chọn từ tiếng Anh hoặc tiếng Việt
function detectLang(text) {
  if (!text) return "en";
  const s = text.normalize("NFC");
  const viChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;
  if (viChars.test(s)) return "vi";
  // If contains only ASCII letters/spaces/punct, default to English
  return "en";
}

function buildLinks(text) {
  const q = encodeURIComponent(text);
  const lang = detectLang(text);
  // Only ever show Google Translate link per requirement
  if (lang === 'en') {
    return [{ href: `https://translate.google.com/?sl=en&tl=vi&text=${q}&op=translate`, label: 'Google Translate (EN→VI)', color: 'blue', icon: Globe }];
  }
  return [{ href: `https://translate.google.com/?sl=vi&tl=en&text=${q}&op=translate`, label: 'Google Translate (VI→EN)', color: 'blue', icon: Globe }];
}

const DictionaryModal = ({ word, onClose }) => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  const [viMeanings, setViMeanings] = useState([]);
  const [enMeanings, setEnMeanings] = useState([]);
  const { speak } = useTextToSpeech();
  // Reset saving state whenever selected word changes
  useEffect(() => {
    setSaving(false);
  }, [word]);
  useEffect(() => {
    if (!word) return;
    const lang = detectLang(word);
    if (lang !== 'en') {
      setEntries([]);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const res = await dictionaryService.lookup(String(word).trim(), 'en');
        setEntries(res?.entries || []);
        setViMeanings(res?.viMeanings || []);
        setEnMeanings(res?.enMeanings || []);
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [word]);

  if (!word) return null;
  const links = buildLinks(word);
  const tokens = String(word || "").trim().split(/\s+/).filter(Boolean);
  const isSingleWord = tokens.length === 1;
  const lang = detectLang(word);
  const showSave = lang === 'en' && isSingleWord;

  return (
    <div key={word} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <X size={20} />
        </button>

        <h3 className="text-2xl font-bold text-blue-600 mb-2 capitalize">
          {word}
        </h3>
        {loading ? (
          <p className="text-gray-600 mb-6 text-sm">Loading definitions...</p>
        ) : entries.length > 0 ? (
          <div className="mb-4 space-y-2">
            {entries.slice(0,1).map((e, idx) => (
              <div key={idx}>
                {e.phonetic && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span>/{e.phonetic}/</span>
                    <button
                      onClick={() => speak(e.word || word)}
                      className="p-1 rounded text-gray-600 hover:text-[#00BDB6] active:scale-95 transition-transform"
                      title="Play pronunciation"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                )}
                {viMeanings.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Nghĩa tiếng Việt (ngắn gọn):</div>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {viMeanings.slice(0,2).map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {enMeanings.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">English (short):</div>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {enMeanings.slice(0,2).map((m, i) => (
                        <li key={i}>
                          <span className="uppercase text-gray-500 mr-1">{m.partOfSpeech}</span>
                          <span>{m.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 mb-6 text-sm">Select a dictionary source:</p>
        )}

        <div className="space-y-3">
          {links.map((l, idx) => (
            <a
              key={idx}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-3 rounded-lg hover:opacity-90 transition ${
                l.color === "blue" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
              }`}
            >
              <l.icon size={18} /> {l.label}
            </a>
          ))}
        </div>
        {showSave && (
          <button
            onClick={async () => {
              if (saving) return;
              const cleaned = String(word).trim().replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '');
              if (!cleaned) return;
              setSaving(true);
              try {
                // attempt to extract a short vi meaning from first entry's definitions via AI is already in backend when missing
                // we pass phonetics when available
                const first = entries[0] || {};
                const phonetics = first.phonetic || (first.phonetics?.[0]?.text) || undefined;
                const meaningVi = viMeanings && viMeanings.length ? viMeanings.slice(0,2).join(', ') : undefined;
                await vocabService.add({ word: cleaned, lang: 'en', source: 'dictionary', phonetics, meaningVi });
                // Close after success to indicate completion
                onClose?.();
              } catch {
                // keep modal open, allow retry
              } finally {
                // In case modal stays open (error), re-enable button
                setSaving(false);
              }
            }}
            disabled={saving}
            className={`mt-4 w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${saving ? 'bg-gray-200 text-gray-400' : 'bg-[#00BDB6] text-white hover:bg-[#00a8a2]'}`}
          >
            <BookmarkPlus size={16} /> {saving ? 'Saving...' : 'Save to Vocabulary'}
          </button>
        )}
      </div>
    </div>
  );
};

export default DictionaryModal;
