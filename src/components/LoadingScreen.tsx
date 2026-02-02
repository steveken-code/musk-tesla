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
    
    // Exit after 2s display
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 500);
    }, 2000);

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
      {/* Ambient Red Glow Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full bg-[radial-gradient(circle,rgba(232,33,39,0.15)_0%,transparent_70%)] blur-2xl animate-logo-glow-ultra" />
      </div>
      
      {/* Tesla Logo + Wordmark - LARGE */}
      <img 
        src={teslaPreloader} 
        alt="Tesla" 
        className={`relative z-10 w-48 sm:w-64 lg:w-80 object-contain drop-shadow-[0_0_80px_rgba(232,33,39,0.4)] transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      />
    </div>
  );
};

export default LoadingScreen;
