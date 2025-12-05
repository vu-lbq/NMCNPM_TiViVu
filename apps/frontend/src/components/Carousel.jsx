import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Carousel({ imagePaths = [], width = 1280, height = 640, autoMs = 4000 }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % imagePaths.length), autoMs);
    return () => clearInterval(t);
  }, [imagePaths.length, autoMs]);
  if (!imagePaths.length) return null;
  return (
    <div className="my-8">
      <div className="relative rounded-xl overflow-hidden border border-gray-200">
        <img
          src={imagePaths[idx]}
          alt={"slide-" + idx}
          width={width}
          height={height}
          className="w-full h-auto block"
        />
        <button onClick={() => setIdx((idx - 1 + imagePaths.length) % imagePaths.length)} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full border border-gray-200">
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => setIdx((idx + 1) % imagePaths.length)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full border border-gray-200">
          <ChevronRight size={18} />
        </button>
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
          {imagePaths.map((_, i) => (
            <span key={i} className={`h-2 w-2 rounded-full ${i === idx ? 'bg-[#00BDB6]' : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
