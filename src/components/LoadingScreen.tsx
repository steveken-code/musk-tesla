import { useEffect, useState } from 'react';
import teslaLogo from '@/assets/tesla-loading-logo.png';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Optimized 1.8s display + 0.5s fade for snappier feel
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 500);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-opacity duration-500 ease-out ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Logo Container with 3-Layer Premium Glow */}
      <div className="relative flex items-center justify-center">
        {/* Ultra Outer Glow - Slowest, largest breathing ring */}
        <div className="absolute w-40 h-40 sm:w-52 sm:h-52 lg:w-64 lg:h-64 rounded-full animate-logo-glow-ultra" />
        
        {/* Outer Glow Layer - Slower, larger pulse */}
        <div className="absolute w-32 h-32 sm:w-44 sm:h-44 lg:w-52 lg:h-52 rounded-full animate-logo-glow-outer" />
        
        {/* Inner Glow Layer - Faster, tighter pulse */}
        <div className="absolute w-24 h-24 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-full animate-logo-glow-inner" />
        
        {/* Tesla Logo - Premium sizing */}
        <img 
          src={teslaLogo} 
          alt="Tesla" 
          className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain animate-logo-pulse drop-shadow-[0_0_20px_rgba(232,33,39,0.4)]"
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
