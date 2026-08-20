"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Starfield from "./Starfield";
import Navbar from "./Navbar";
import { useRoundTimer } from "./useRoundTimer";
import { getRoomCluesAction } from "../app/actions/useraction";

const DEFAULT_ICONS = ["☢️", "⚙️", "🧰"];
const DEFAULT_POSITIONS = [
  { top: "12%", left: "12%" },
  { top: "42%", left: "54%" },
  { top: "70%", left: "28%" },
];

function parseClue(clue, index) {
  const [label, ...textParts] = (clue.object_name || "").split("|");
  return {
    label: label || `Clue ${index + 1}`,
    text: textParts.join("|") || clue.object_name || "Clue unavailable",
  };
}

export default function DynamicClueRoom({
  roomName,
  title,
  subtitle,
  icons = DEFAULT_ICONS,
  iconMap = {},
  positions = DEFAULT_POSITIONS,
  accentClass = "text-crewCyan",
}) {
  const router = useRouter();
  const [clues, setClues] = useState([]);
  const [activeClue, setActiveClue] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);

  const handleExpire = useCallback(() => router.push("/submit"), [router]);
  const { urgent, formatted } = useRoundTimer({ onExpire: handleExpire });

  useEffect(() => {
    let cancelled = false;

    async function loadClues() {
      try {
        const result = await getRoomCluesAction(roomName);
        if (!cancelled) setClues(result.clues || []);
      } catch (error) {
        console.error("Unable to load clues:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadClues();
    return () => {
      cancelled = true;
    };
  }, [roomName]);

  const handleObjectClick = (clue) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveClue(clue);
    timeoutRef.current = setTimeout(() => setActiveClue(null), 4000);
  };

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return (
    <main className="min-h-screen relative flex flex-col items-center p-4 pt-48 md:pt-32 pb-10">
      <Starfield />
      <Navbar />

      <div className="relative z-10 w-full max-w-4xl flex flex-col grow text-center">
        <div className="mb-6 shrink-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[4px_4px_0px_#000]">
            {title}
          </h1>
          <p className={`${accentClass} font-bold uppercase tracking-widest mt-1 text-xs sm:text-sm md:text-base px-2`}>
            {subtitle}
          </p>
          <div className={`mt-3 inline-block border-4 border-black rounded-xl px-4 py-1 font-mono font-black text-lg ${urgent ? "bg-crewRed text-white animate-pulse" : "bg-gray-800 text-crewCyan"}`}>
            ⏱ {formatted} remaining
          </div>
        </div>

        <div className="relative w-full grow min-h-[55vh] bg-spacePanel/80 border-4 border-black rounded-3xl shadow-comicLg backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 pointer-events-none border-12 md:border-16 border-black/10 rounded-3xl" />
          {loading && <p className="relative z-10 pt-24 text-crewCyan font-black uppercase tracking-widest animate-pulse">Loading clues...</p>}
          {!loading && clues.length === 0 && <p className="relative z-10 pt-24 text-gray-400 font-bold uppercase tracking-widest">No clues available for this round.</p>}

          {clues.map((rawClue, index) => {
            const clue = parseClue(rawClue, index);
            const position = positions[index % positions.length];
            const icon = iconMap[clue.label] || icons[index % icons.length];
            return (
              <div key={rawClue.id || `${rawClue.object_name}-${index}`} className="absolute z-10" style={position}>
                <button onClick={() => handleObjectClick(clue)} className="group flex flex-col items-center focus:outline-none">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-800 border-4 border-black rounded-xl shadow-comic flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-2xl sm:text-3xl md:text-4xl">{icon}</span>
                  </div>
                  <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-white mt-2 bg-black px-2 py-1 border-2 border-white rounded shadow-comic">
                    {clue.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {activeClue && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setActiveClue(null)}>
          <div className="bg-white text-black border-4 border-black rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-[8px_8px_0px_#000]">
            <h2 className={`${accentClass} font-black text-xl md:text-2xl uppercase tracking-widest mb-4`}>Clue Decrypted</h2>
            <p className="text-lg md:text-xl font-bold leading-relaxed">{activeClue.text}</p>
          </div>
        </div>
      )}
    </main>
  );
}
