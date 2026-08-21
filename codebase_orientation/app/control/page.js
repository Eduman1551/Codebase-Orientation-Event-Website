"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Starfield from "../../components/Starfield";
import Navbar from "../../components/Navbar";

export default function ControlRoom() {
  const router = useRouter();
  const [activeClue, setActiveClue] = useState(null);
  const [clues, setClues] = useState([]);
  const [roundLocked, setRoundLocked] = useState(false);
  const timeoutRef = useRef(null);

  const ROOM_NAME = "control";

  useEffect(() => {
    let isMounted = true;
    const fetchClues = async () => {
      try {
        const res = await fetch(`/api/round/clues?room=${encodeURIComponent(ROOM_NAME)}`);
        const data = await res.json();
        if (isMounted && data.success && data.clues?.length > 0) {
          setClues(data.clues.map(c => c.clue_content || c.clue_text || c.text || ""));
        }
      } catch (err) { console.error("Failed to fetch clues:", err); }
    };
    fetchClues();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/round/status");
        const data = await res.json();
        if (!isMounted) return;
        if (!data.active || data.gameState !== "running") {
          setRoundLocked(true);
          setTimeout(() => { if (isMounted) router.push("/rules"); }, 2000);
        } else { setRoundLocked(false); }
      } catch {}
    };
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [router]);

  const handleObjectClick = (e, clueText) => {
    if (roundLocked) return;
    e.stopPropagation();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveClue(clueText);
    timeoutRef.current = setTimeout(() => { setActiveClue(null); }, 4000);
  };

  useEffect(() => { return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }; }, []);

  const getClue = (index) => clues[index] || `[Clue ${index + 1} loading...]`;

  return (
    <main className="min-h-screen relative flex flex-col items-center p-4 pt-48 md:pt-32 pb-10">
      <Starfield />
      <Navbar />

      {roundLocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-spacePanel border-4 border-crewRed rounded-3xl p-8 text-center shadow-comicLg">
            <h2 className="text-crewRed font-black text-3xl uppercase tracking-widest animate-pulse mb-2">⏸ Round Ended</h2>
            <p className="text-gray-300 font-bold">Returning to lobby...</p>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-4xl flex flex-col grow text-center">
        <div className="mb-6 shrink-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[4px_4px_0px_#000]">CONTROL ROOM</h1>
          <p className="text-crewCyan font-bold uppercase tracking-widest mt-1 text-xs sm:text-sm md:text-base px-2">Monitor the ship&apos;s systems for clues</p>
        </div>

        <div className="relative w-full grow min-h-[55vh] bg-gray-900 border-4 border-black rounded-3xl shadow-comicLg overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-0 flex flex-col">
            <div className="w-full h-[45%] bg-gray-800 border-b-8 border-black flex items-center justify-center relative shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-10">
              <div className="w-[60%] h-[70%] bg-black border-4 border-gray-600 rounded-xl relative overflow-hidden flex flex-col justify-end p-2">
                <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(56,254,220,0.4)_1px,transparent_1px)] bg-size-[100%_4px]" />
                <div className="w-[80%] h-2 bg-crewCyan/50 rounded-full mb-2 animate-pulse" />
                <div className="w-[50%] h-2 bg-crewCyan/50 rounded-full animate-pulse delay-75" />
              </div>
              <div className="absolute left-[5%] top-[20%] w-[10%] h-[60%] bg-black border-2 border-gray-700 rounded-md flex flex-col justify-evenly items-center py-2">
                <div className="w-3 h-3 bg-crewRed rounded-full animate-pulse" />
                <div className="w-3 h-3 bg-crewLime rounded-full" />
                <div className="w-3 h-3 bg-crewCyan rounded-full animate-ping" />
              </div>
              <div className="absolute right-[5%] top-[20%] w-[10%] h-[60%] bg-black border-2 border-gray-700 rounded-md flex flex-col justify-evenly items-center py-2">
                <div className="w-3 h-3 bg-crewYellow rounded-full" />
                <div className="w-3 h-3 bg-crewRed rounded-full animate-pulse" />
                <div className="w-3 h-3 bg-crewLime rounded-full" />
              </div>
            </div>
            <div className="w-full h-[55%] relative overflow-hidden bg-black">
              <div className="absolute inset-x-[-50%] top-0 h-[200%] bg-black origin-top shadow-inner" style={{ transform: "perspective(500px) rotateX(60deg)" }}>
                <div className="absolute inset-0 border-crewCyan/20 bg-[linear-gradient(rgba(56,254,220,0.2)_2px,transparent_2px),linear-gradient(90deg,rgba(56,254,220,0.2)_2px,transparent_2px)] bg-size-[50px_50px]" />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="absolute top-[12%] left-[10%] md:top-[15%] md:left-[15%] transform transition-transform hover:scale-105 z-10">
            <button onClick={(e) => handleObjectClick(e, getClue(0))} className="group flex flex-col items-center focus:outline-none">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-900 border-4 border-black rounded-xl shadow-comic flex items-center justify-center relative group-hover:bg-gray-800 transition-colors">
                <div className="absolute top-2 right-2 w-3 h-3 bg-crewRed rounded-full animate-pulse shadow-[0_0_8px_#c51111]" />
                <span className="text-2xl sm:text-3xl md:text-4xl relative z-10">📹</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-white mt-2 bg-black px-2 py-1 border-2 border-white rounded shadow-comic">Security</span>
            </button>
          </div>

          {/* Navigation */}
          <div className="absolute bottom-[15%] left-[50%] -translate-x-1/2 transform transition-transform hover:scale-105 z-10">
            <button onClick={(e) => handleObjectClick(e, getClue(1))} className="group flex flex-col items-center focus:outline-none">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-crewCyan/20 border-4 border-black rounded-full shadow-comic flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform duration-300 relative">
                <div className="absolute inset-0 border-4 border-crewCyan rounded-full border-t-transparent animate-spin opacity-80" />
                <span className="text-3xl sm:text-4xl md:text-5xl relative z-10">🗺️</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase mt-2 bg-black px-2 py-1 border-2 border-crewCyan rounded shadow-comic text-crewCyan">Nav</span>
            </button>
          </div>

          {/* Comms */}
          <div className="absolute top-[12%] right-[10%] md:top-[15%] md:right-[15%] transform transition-transform hover:scale-105 z-10">
            <button onClick={(e) => handleObjectClick(e, getClue(2))} className="group flex flex-col items-center focus:outline-none">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-crewYellow border-4 border-black rounded-lg shadow-comic flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-200">
                <span className="text-2xl sm:text-3xl md:text-4xl group-hover:animate-bounce">📻</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-black mt-2 bg-crewYellow px-2 py-1 border-2 border-black rounded shadow-comic">Comms</span>
            </button>
          </div>
        </div>
      </div>

      {activeClue && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setActiveClue(null)}>
          <div className="bg-white text-black border-4 border-black rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-[8px_8px_0px_#000] scale-in-center border-t-8 border-t-crewCyan">
            <h2 className="text-crewCyan font-black text-xl md:text-2xl uppercase tracking-widest mb-4 drop-shadow-sm">📡 CLUE DECRYPTED 📡</h2>
            <p className="text-lg md:text-xl font-bold leading-relaxed">{activeClue}</p>
          </div>
        </div>
      )}
    </main>
  );
}

