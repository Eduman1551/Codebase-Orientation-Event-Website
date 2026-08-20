export default function Starfield() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0 stars opacity-70 animate-pulse" />
      {/* Distant space glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-150 h-150 bg-crewCyan/10 blur-[140px] rounded-full pointer-events-none" />
    </div>
  );
}