'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import DiyaIcon from './DiyaIcon';
import Image from 'next/image';
import { InteractiveHoverButton } from './ui/interactive-hover-button';
import { ShinyButton } from './ui/shiny-button';

interface SplashScreenProps {
  onComplete: () => void;
  isTransitioning?: boolean;
}

export default function SplashScreen({ onComplete, isTransitioning = false }: SplashScreenProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleNextClick = () => {
    setIsPressed(true);
    setShowRipple(true);
    setIsAnimatingOut(true);
    
    // Add animation delay before completing
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <div className={`min-h-[100dvh] bg-[#DFD2CB] flex items-center justify-center relative overflow-hidden transition-all duration-700 ease-in-out px-4 sm:px-6 md:px-8 ${
      isAnimatingOut || isTransitioning 
        ? 'opacity-0 scale-95 translate-y-[-20px]' 
        : 'opacity-100 scale-100 translate-y-0'
    }`}>
      {/* Animated Background Elements */}
      <div className={`absolute inset-0 overflow-hidden transition-all duration-700 ${
        isAnimatingOut || isTransitioning ? 'opacity-0 blur-md' : 'opacity-100'
      }`}>
        <div className="absolute -bottom-8 sm:-bottom-16 md:-top-4 -left-2 sm:-left-4 w-48 sm:w-60 md:w-72 h-48 sm:h-60 md:h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-8 sm:-bottom-16 md:-top-4 -right-2 sm:-right-4 w-48 sm:w-60 md:w-72 h-48 sm:h-60 md:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 sm:-bottom-16 left-10 sm:left-20 w-48 sm:w-60 md:w-72 h-48 sm:h-60 md:h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Sparkles */}
      {/* <div className="absolute inset-0 pointer-events-none">
        <Sparkles className="absolute top-20 left-20 text-yellow-200 w-6 h-6 animate-pulse" />
        <Sparkles className="absolute top-40 right-32 text-orange-200 w-4 h-4 animate-pulse animation-delay-1000" />
        <Sparkles className="absolute bottom-40 left-16 text-pink-200 w-5 h-5 animate-pulse animation-delay-2000" />
        <Sparkles className="absolute bottom-20 right-20 text-yellow-200 w-6 h-6 animate-pulse animation-delay-3000" />
        <Sparkles className="absolute top-1/2 left-8 text-orange-200 w-4 h-4 animate-pulse animation-delay-1500" />
        <Sparkles className="absolute top-1/3 right-8 text-pink-200 w-5 h-5 animate-pulse animation-delay-2500" />
      </div> */}

      {/* Main Content */}
      <div className={`relative z-10 text-center transition-all duration-500 w-full max-w-md sm:max-w-lg md:max-w-2xl ${
        isAnimatingOut ? 'transform translate-y-[-30px] opacity-0' : 'transform translate-y-0 opacity-100'
      }`}>
        {/* Diya/Lamp Image Container */}
        <div className={`mt-6 sm:mt-8 md:mt-12 flex items-center justify-center relative transition-all duration-600 ${
          isAnimatingOut ? 'transform scale-110 rotate-3' : 'transform scale-100 rotate-0'
        }`}>
          {/* <div className="w-48 h-48 mx-auto relative animate-bounce-slow">
            <div className="absolute inset-0 bg-white/20 rounded-full backdrop-blur-sm border border-white/30"></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <DiyaIcon size={128} className="drop-shadow-2xl" />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-yellow-300/30 to-transparent rounded-full animate-pulse"></div>
          </div> */}
          <Image 
            src="/diw.png" 
            alt="Diya Icon" 
            width={960} 
            height={1160} 
            className="h-64 sm:h-80 md:h-96 lg:h-116 w-auto max-w-full object-contain" 
            priority
          />
        </div>

        {/* Welcome Text */}
        <div className={`mb-8 sm:mb-10 md:mb-12 px-2 transition-all duration-500 delay-100 ${
          isAnimatingOut ? 'transform translate-x-[-20px] opacity-0' : 'transform translate-x-0 opacity-100'
        }`}>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-2 sm:mb-3 md:mb-4" style={{ fontFamily: ' serif' }}>
            Welcome to
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#FF6907] mb-1 sm:mb-2 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Diwali Night 2025
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2E7677] mb-3 sm:mb-4" style={{ fontFamily: ' serif' }}>
            Let's Glow Up Together!
          </p>
          <div className="mt-3 sm:mt-4 text-white/80 space-y-1">
            <p className="text-sm sm:text-base md:text-lg font-semibold text-black">🎊 16th October • Shree Garden</p>
            <p className="text-sm sm:text-base md:text-lg font-semibold text-black">🕕 6 PM onwards • DJ Vegra</p>
          </div>
        </div>

        {/* Next Button with Ripple Effect */}
        <div className={`relative transition-all duration-500 delay-200 w-full max-w-xs mx-auto ${
          isAnimatingOut ? 'transform translate-y-[20px] opacity-0 scale-90' : 'transform translate-y-0 opacity-100 scale-100'
        }`}>
          {/* Ripple Effect */}
          {showRipple && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-white/30 rounded-3xl animate-ping"></div>
              <div className="absolute inset-0 bg-orange-400/40 rounded-3xl animate-pulse"></div>
            </div>
          )}
          
          <ShinyButton
            onClick={isPressed ? undefined : handleNextClick}
            className={`w-full py-3 sm:py-4 px-6 sm:px-8 text-sm sm:text-base border-black bg-black rounded-3xl transition-all duration-300 ${
              isPressed ? 'scale-95 bg-orange-600 cursor-not-allowed opacity-80' : 'scale-100 hover:scale-105 cursor-pointer active:scale-95'
            }`}
            style={{ pointerEvents: isPressed ? 'none' : 'auto' }}
          >
            {isPressed ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="text-sm sm:text-base">Loading...</span>
              </div>
            ) : (
              <span className="text-sm sm:text-base font-medium">Get Started</span>
            )}
          </ShinyButton>
        </div>

        {/* Skip Button */}
        {/* <div className="mt-8">
          <button
            onClick={onComplete}
            className="text-white/70 text-sm hover:text-white transition-colors underline"
          >
            Skip intro
          </button>
        </div> */}

        {/* Bottom Decorative Text */}
        {/* <div className="mt-4 text-white/60 text-xs">
          <p>Swipe up for an unforgettable night!</p>
        </div> */}
      </div>


    </div>
  );
}