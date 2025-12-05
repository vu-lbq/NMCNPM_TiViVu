import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="px-4 py-10">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-4xl font-bold text-[#1D2957] tracking-tight">
            Speak English with Confidence
          </h1>
          <p className="mt-4 text-[#1D2957]/80 text-lg">
            Practice pronunciation, real conversations, and build vocabulary — all in one place.
          </p>
          <Link to="/login" className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-[#00BDB6] text-white hover:bg-[#00a8a2]">
            Start Learning <ArrowRight size={18} />
          </Link>
        </div>
        <div className="flex items-center justify-center">
          <div className="rounded-2xl border border-gray-200 p-6 w-full max-w-md text-center">
            <h2 className="text-4xl font-bold text-[#1D2957]">Ti<span className="text-[#00BDB6]">Vi</span>Vu</h2>
            <p className="mt-2 text-sm text-gray-600">Your AI-powered English practice companion</p>
          </div>
        </div>
      </div>
    </section>
  );
}
