'use client';

interface DiyaIconProps {
  size?: number;
  className?: string;
}

export default function DiyaIcon({ size = 128, className = '' }: DiyaIconProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Diya Base */}
      <div 
        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-t from-red-600 to-red-400 rounded-full shadow-lg"
        style={{
          width: size * 0.75,
          height: size * 0.375,
        }}
      ></div>
      
      {/* Diya Middle */}
      <div 
        className="absolute left-1/2 transform -translate-x-1/2 bg-gradient-to-t from-orange-500 to-yellow-400 rounded-full shadow-lg"
        style={{
          bottom: size * 0.375,
          width: size * 0.625,
          height: size * 0.25,
        }}
      ></div>
      
      {/* Flame */}
      <div 
        className="absolute left-1/2 transform -translate-x-1/2 bg-gradient-to-t from-orange-400 via-yellow-300 to-yellow-100 rounded-full animate-flicker shadow-lg"
        style={{
          bottom: size * 0.5,
          width: size * 0.1875,
          height: size * 0.3125,
        }}
      ></div>
      
      {/* Flame Glow */}
      <div 
        className="absolute left-1/2 transform -translate-x-1/2 bg-yellow-200 rounded-full opacity-50 blur-lg animate-pulse"
        style={{
          bottom: size * 0.4375,
          width: size * 0.375,
          height: size * 0.375,
        }}
      ></div>
      
      {/* Decorative Dots */}
      <div 
        className="absolute bg-yellow-300 rounded-full animate-pulse"
        style={{
          bottom: size * 0.3125,
          left: size * 0.1875,
          width: size * 0.0625,
          height: size * 0.0625,
        }}
      ></div>
      <div 
        className="absolute bg-yellow-300 rounded-full animate-pulse animation-delay-500"
        style={{
          bottom: size * 0.3125,
          right: size * 0.1875,
          width: size * 0.0625,
          height: size * 0.0625,
        }}
      ></div>
      <div 
        className="absolute bg-orange-300 rounded-full animate-pulse animation-delay-1000"
        style={{
          bottom: size * 0.1875,
          left: size * 0.25,
          width: size * 0.046875,
          height: size * 0.046875,
        }}
      ></div>
      <div 
        className="absolute bg-orange-300 rounded-full animate-pulse animation-delay-1500"
        style={{
          bottom: size * 0.1875,
          right: size * 0.25,
          width: size * 0.046875,
          height: size * 0.046875,
        }}
      ></div>
    </div>
  );
}