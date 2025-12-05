import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import FeatureTrio from '../components/FeatureTrio';
import Carousel from '../components/Carousel';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4">
        <h1 className="text-sm font-medium">
          <Link to="/login" className="text-[#1D2957] hover:underline">Sign in</Link>
          <span className="mx-2 text-gray-300">•</span>
          <Link to="/login" className="text-[#00BDB6] hover:underline">Sign up</Link>
        </h1>
      </header>

      <main className="flex-1">
        <div className="px-4">
          <h1 className="text-xl font-bold text-[#1D2957] tracking-tight max-w-6xl mx-auto mb-2">
            <Link to="/" title="TiviVu">
              Ti
              <span className="text-[#00BDB6]">Vi</span>
              Vu
            </Link>
          </h1>
        </div>
        <Hero />
        <div className="max-w-6xl mx-auto px-4">
          <Carousel imagePaths={[
            '/landing/slide1.jpg',
            '/landing/slide2.jpg',
            '/landing/slide3.jpg',
          ]} width={1280} height={640} />
          <FeatureTrio />
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-gray-500 leading-snug">
        <div>@2025 Tín, Việt and Vũ</div>
        <div>24880061, 24880074 and 24880077</div>
      </footer>
    </div>
  );
}
