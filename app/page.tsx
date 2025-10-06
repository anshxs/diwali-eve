'use client';

import { useState } from 'react';
import RegistrationForm from '@/components/RegistrationForm';
import MyTickets from '@/components/MyTickets';
import SplashScreen from '@/components/SplashScreen';
import { Ticket, UserPlus } from 'lucide-react';

export default function Home() {
  // Check if user has seen splash before (optional - can be removed if you want splash every time)
  const [showSplash, setShowSplash] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentView, setCurrentView] = useState<'register' | 'tickets'>('register');

  const handleSplashComplete = () => {
    setIsTransitioning(true);
    // Add a small delay for the transition animation
    setTimeout(() => {
      setShowSplash(false);
      setIsTransitioning(false);
    }, 100);
    // Mark splash as seen (optional)
    // if (typeof window !== 'undefined') {
    //   localStorage.setItem('splash-seen', 'true');
    // }
  };

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} isTransitioning={isTransitioning} />;
  }

  return (
    <div className="min-h-screen animate-fadeIn">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 animate-slideInDown">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
              <span className="hidden sm:inline">Diwali Night 2025</span>
              <span className="sm:hidden">Diwali 2025</span>
            </h1>
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={() => setCurrentView('register')}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'register'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100 bg-secondary'
                }`}
              >
                <UserPlus className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="text-sm sm:text-base">Register</span>
              </button>
              <button
                onClick={() => setCurrentView('tickets')}
                className={`flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'tickets'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100 bg-secondary'
                }`}
                title="My Tickets"
              >
                <Ticket className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline sm:ml-2 text-sm sm:text-base">My Tickets</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="animate-slideInUp">
        {currentView === 'register' ? <RegistrationForm /> : <MyTickets />}
      </div>
    </div>
  );
}
