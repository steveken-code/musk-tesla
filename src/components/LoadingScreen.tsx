import { useEffect, useState } from 'react';
import teslaLogo from '@/assets/tesla-loading-logo.png';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 600);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-opacity duration-600 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Logo Container with Glow Layers */}
      <div className="relative flex items-center justify-center">
        {/* Outer Glow Layer - Slower, larger pulse */}
        <div className="absolute w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full animate-logo-glow-outer" />
        
        {/* Inner Glow Layer - Faster, tighter pulse */}
        <div className="absolute w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full animate-logo-glow-inner" />
        
        {/* Tesla Logo */}
        <img 
          src={teslaLogo} 
          alt="Tesla" 
          className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-contain animate-logo-pulse"
        />
      </div>
      
      {/* TESLA Wordmark */}
      <span className="mt-8 text-sm sm:text-base lg:text-lg font-light tracking-[0.3em] sm:tracking-[0.4em] lg:tracking-[0.5em] text-white/80 animate-wordmark-fade">
        TESLA
      </span>
    </div>
  );
};

export default LoadingScreen;
