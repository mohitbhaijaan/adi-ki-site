import logoImage from "@assets/1750412782565_1750413169594.png";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <img 
          src={logoImage} 
          alt="ADI CHEATS Logo" 
          className="w-12 h-12 object-contain filter drop-shadow-lg hover:drop-shadow-xl transition-all duration-300"
        />
        <div className="absolute inset-0 w-12 h-12 border-2 border-red-500/30 rounded-lg animate-pulse opacity-50"></div>
      </div>
      <div className="relative">
        <h1 className="text-2xl font-bold font-mono text-glow animate-glitch">
          ADI CHEATS
        </h1>
      </div>
    </div>
  );
}
