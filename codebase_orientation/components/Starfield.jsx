export default function Starfield() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-spaceDark overflow-hidden">
      
      {/* Layer 1: Slow distant stars */}
      <div className="absolute inset-0 stars-bg opacity-40" />
      
      {/* Layer 2: Faster foreground stars (Creates 3D depth) */}
      <div className="absolute inset-0 stars-fg opacity-70" />
      
      {/* Distant space nebula glow - stationary */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-150 h-150   bg-crewCyan/10 blur-[140px] rounded-full pointer-events-none mix-blend-screen" />
      
      {/* Secondary accent glow */}
      <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-crewRed/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
    </div>
  );
}