import React from "react";
import { X, BookOpen, Globe } from "lucide-react";

const DictionaryModal = ({ word, onClose }) => {
  if (!word) return null;

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
          <a
            href={`https://translate.google.com/?sl=en&tl=vi&text=${word}&op=translate`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-blue-700 hover:bg-blue-100 transition"
          >
            <Globe size={18} /> Google Translate
          </a>
          <a
            href={`https://dictionary.cambridge.org/dictionary/english/${word}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg text-orange-700 hover:bg-orange-100 transition"
          >
            <BookOpen size={18} /> Cambridge Dictionary
          </a>
        </div>
      </div>
    </div>
  );
};

export default DictionaryModal;
