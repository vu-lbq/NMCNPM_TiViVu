import React from "react";
import { X, BookOpen, Globe } from "lucide-react";
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
  const tokens = String(text || "").trim().split(/\s+/).filter(Boolean);
  const isSingleWord = tokens.length === 1;
  const links = [];
  if (lang === "en") {
    links.push({
      href: `https://translate.google.com/?sl=en&tl=vi&text=${q}&op=translate`,
      label: "Google Translate (EN→VI)",
      color: "blue",
      icon: Globe,
    });
    if (isSingleWord) {
      links.push({
        href: `https://dictionary.cambridge.org/dictionary/english-vietnamese/${q}`,
        label: "Cambridge EN→VI",
        color: "orange",
        icon: BookOpen,
      });
    }
  } else {
    links.push({
      href: `https://translate.google.com/?sl=vi&tl=en&text=${q}&op=translate`,
      label: "Google Translate (VI→EN)",
      color: "blue",
      icon: Globe,
    });
    // Cambridge focuses on English headwords; skip for VI source
  }
  return links;
}

const DictionaryModal = ({ word, onClose }) => {
  if (!word) return null;
  const links = buildLinks(word);
  const tokens = String(word || "").trim().split(/\s+/).filter(Boolean);
  const isSingleWord = tokens.length === 1;
  const lang = detectLang(word);
  const showCambridgeHint = lang === "en" && !isSingleWord;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
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
        <p className="text-gray-600 mb-6 text-sm">
          Select a dictionary source:
        </p>

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
        {showCambridgeHint && (
          <p className="text-xs text-gray-400 mt-2">Cambridge only supports single English words.</p>
        )}
      </div>
    </div>
  );
};

export default DictionaryModal;
