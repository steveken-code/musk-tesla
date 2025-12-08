import { useEffect, useState } from 'react';
import teslaLogo from '@/assets/tesla-logo.png';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsExiting(true);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center transition-all duration-500 ${
        isExiting ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-tesla-red/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-electric-blue/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-tesla-red/10 to-electric-blue/10 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }} />
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-8">
        <div className="relative">
          <img 
            src={teslaLogo} 
            alt="Tesla Invest" 
            className={`h-24 w-auto transition-all duration-500 ${
              progress < 50 ? 'animate-pulse' : 'animate-bounce'
            }`}
          />
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-tesla-red/30 blur-2xl -z-10 animate-pulse" />
        </div>
      </div>

      {/* Brand Name */}
      <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-tesla-red via-foreground to-electric-blue bg-clip-text text-transparent animate-pulse">
        Tesla Invest
      </h1>

      {/* Progress Bar */}
      <div className="w-64 md:w-80 h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-tesla-red to-electric-blue transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Loading Text */}
      <p className="text-muted-foreground text-sm animate-pulse">
        {progress < 30 && 'Initializing...'}
        {progress >= 30 && progress < 60 && 'Loading assets...'}
        {progress >= 60 && progress < 90 && 'Preparing your experience...'}
        {progress >= 90 && 'Ready!'}
      </p>

      {/* Percentage */}
      <p className="text-2xl font-bold mt-4 text-tesla-red">
        {progress}%
      </p>

      {/* Decorative Lines */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="w-8 h-1 bg-gradient-to-r from-tesla-red to-electric-blue rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
