import { Shield } from "lucide-react";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <div className="w-12 h-12 border-2 border-red-500 rounded-lg bg-gradient-to-br from-red-500/20 to-red-700/20 flex items-center justify-center">
          <Shield className="text-red-500 w-6 h-6" />
        </div>
        <div className="absolute inset-0 border-2 border-red-500 rounded-lg animate-pulse opacity-50"></div>
      </div>
      <div className="relative">
        <h1 className="text-2xl font-bold font-mono text-glow animate-glitch">
          ADI CHEATS
        </h1>
      </div>
    </div>
  );
}
