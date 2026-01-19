import { useState, useEffect } from 'react';
import logo from '@/assets/logo.png';

interface SplashScreenProps {
  onFinish: () => void;
  minDuration?: number;
}

export const SplashScreen = ({ onFinish, minDuration = 2000 }: SplashScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onFinish, 500); // Wait for exit animation
    }, minDuration);

    return () => clearTimeout(timer);
  }, [onFinish, minDuration]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Animated Logo */}
      <div className="relative">
        {/* Glow ring */}
        <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-30 blur-2xl animate-spin-slow" />
        
        {/* Logo container with animations */}
        <div className="relative animate-fade-in">
          <img
            src={logo}
            alt="Orlando Fast Pass Planejador"
            className="w-64 sm:w-80 h-auto animate-float drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Loading indicator */}
      <div className="mt-12 flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        {/* Animated dots */}
        <div className="flex gap-2">
          <span className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        
        {/* Loading text */}
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Preparando sua magia...
        </p>
      </div>

      {/* Sparkle particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-secondary rounded-full animate-sparkle"
            style={{
              left: `${10 + (i * 7)}%`,
              top: `${20 + Math.sin(i) * 30}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2 + Math.random()}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};