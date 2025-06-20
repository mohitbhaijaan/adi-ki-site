import { useEffect, useState } from "react";
import logoImage from "@assets/1750412782565_1750413169594.png";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-500 ${
      isComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-900/20"></div>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center">
        {/* Logo with animations */}
        <div className="relative mb-8">
          <div className="relative w-32 h-32 mx-auto mb-6">
            {/* Rotating rings */}
            <div className="absolute inset-0 border-4 border-red-500/30 rounded-full animate-ring-pulse"></div>
            <div className="absolute inset-2 border-2 border-red-400/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
            <div className="absolute inset-4 border border-red-300/30 rounded-full animate-ping"></div>
            
            {/* Main logo */}
            <div className="absolute inset-4 flex items-center justify-center">
              <img 
                src={logoImage} 
                alt="ADI CHEATS Logo" 
                className="w-20 h-20 object-contain filter drop-shadow-2xl animate-logo-spin"
              />
            </div>

            {/* Glowing effect */}
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute inset-2 bg-red-600/10 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>

          {/* Brand name with glitch effect */}
          <h1 className="text-5xl font-bold font-mono text-white mb-2 animate-glitch">
            ADI CHEATS
          </h1>
          <p className="text-red-400 text-lg font-medium tracking-wider">
            GAMING SOLUTIONS
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-80 mx-auto mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Loading...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden border border-red-500/30">
            <div 
              className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full transition-all duration-300 ease-out relative animate-progress-glow"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-gray-400 text-sm">
          <div className="flex items-center justify-center space-x-1">
            <span>Initializing gaming environment</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}