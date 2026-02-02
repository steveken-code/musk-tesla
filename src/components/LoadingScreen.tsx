import { useEffect, useState } from 'react';
import teslaPreloader from '@/assets/tesla-preloader.png';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in after mount
    const showTimer = setTimeout(() => setIsVisible(true), 50);
    
    // Exit after 2.5s display (slower, more cinematic)
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 500);
    }, 2500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-opacity duration-500 ease-out ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Ambient Red Glow Background - Dual Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {/* Primary Glow - Intense center */}
        <div className="w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] lg:w-[700px] lg:h-[700px] rounded-full bg-[radial-gradient(circle,rgba(232,33,39,0.25)_0%,rgba(232,33,39,0.08)_40%,transparent_60%)] blur-2xl animate-logo-glow-ultra" />
        {/* Secondary Glow - Wider ambient spread */}
        <div className="absolute w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] lg:w-[900px] lg:h-[900px] rounded-full bg-[radial-gradient(circle,rgba(232,33,39,0.1)_0%,transparent_50%)] blur-3xl opacity-60" />
      </div>
      
      {/* Tesla Logo + Wordmark - LARGE */}
      <img 
        src={teslaPreloader} 
        alt="Tesla" 
        className={`relative z-10 w-48 sm:w-64 lg:w-80 object-contain drop-shadow-[0_0_120px_rgba(232,33,39,0.5)] transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      />
    </div>
  );
};

export default LoadingScreen;
