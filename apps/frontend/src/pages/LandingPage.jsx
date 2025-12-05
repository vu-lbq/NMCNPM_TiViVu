import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import FeatureTrio from '../components/FeatureTrio';
import Carousel from '../components/Carousel';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="w-full bg-white/50 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-end items-center gap-3">
          <Link 
            to="/login" 
            className="px-5 py-2.5 bg-[#1D2957] text-white text-sm font-semibold rounded-lg hover:bg-[#151f42] transition-all shadow-sm hover:shadow-md"
          >
            Sign in
          </Link>
          
          <Link 
            to="/login?mode=signup" 
            className="px-5 py-2.5 bg-[#00BDB6] text-white text-sm font-semibold rounded-lg hover:bg-[#00a8a2] transition-all shadow-sm hover:shadow-md"
          >
            Sign up
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="px-4">
          <div className="max-w-6xl mx-auto mb-8 mt-6">
            <Link to="/" title="TiviVu" className="flex items-center gap-1">
              <img src="/images/logo-light.svg" alt="" />
            </Link>
          </div>
        </div>
        <Hero />
        <div className="max-w-6xl mx-auto">
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
