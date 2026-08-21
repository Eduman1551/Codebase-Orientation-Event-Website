"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Starfield from "../../components/Starfield";
import Navbar from "../../components/Navbar";

export default function EngineRoom() {
  const router = useRouter();
  const [activeClue, setActiveClue] = useState(null);
  const [clues, setClues] = useState([]);
  const [roundLocked, setRoundLocked] = useState(false);
  const timeoutRef = useRef(null);

  const ROOM_NAME = "engine";
  const OBJECT_LABELS = ["Reactor", "Valve", "Toolbox"];
  const OBJECT_EMOJIS = ["☢️", "⚙️", "🧰"];

  // Fetch clues from DB for current active round
  useEffect(() => {
    let isMounted = true;
    const fetchClues = async () => {
      try {
        const res = await fetch(`/api/round/clues?room=${encodeURIComponent(ROOM_NAME)}`);
        const data = await res.json();
        if (isMounted && data.success && data.clues?.length > 0) {
          setClues(data.clues.map(c => c.clue_content || c.clue_text || c.text || ""));
        }
      } catch (err) {
        console.error("Failed to fetch clues:", err);
      }
    };
    fetchClues();
    return () => { isMounted = false; };
  }, []);

  // Poll round status — redirect to /rules when round ends
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
        } else {
          setRoundLocked(false);
        }
      } catch (err) { /* ignore */ }
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

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[4px_4px_0px_#000]">
            ENGINE ROOM
          </h1>
          <p className="text-crewYellow font-bold uppercase tracking-widest mt-1 text-xs sm:text-sm md:text-base px-2">
            Search the room for clues
          </p>
        </div>

        <div className="relative w-full grow min-h-[55vh] bg-spacePanel/95 border-4 border-black rounded-3xl shadow-comicLg backdrop-blur-md overflow-hidden">

          {/* Background scenery */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute bottom-0 left-0 w-full h-[40%] bg-crewOrange/20 shadow-[inset_0_20px_50px_rgba(239,125,14,0.3)] flex items-center justify-center">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.6)_0%,transparent_70%)] animate-pulse" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.5)_2px,transparent_2px),linear-gradient(90deg,rgba(0,0,0,0.5)_2px,transparent_2px)] bg-size-[20px_20px]" />
            </div>
            <div className="absolute top-[25%] left-0 w-full h-[35%] bg-gray-700 border-y-8 border-black flex flex-col justify-between shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-0">
              <div className="w-full h-3 bg-[repeating-linear-gradient(45deg,#f5f557,#f5f557_10px,#000_10px,#000_20px)] opacity-90" />
              <div className="w-full h-3 bg-[repeating-linear-gradient(45deg,#f5f557,#f5f557_10px,#000_10px,#000_20px)] opacity-90" />
            </div>
            <div className="absolute top-0 right-[10%] w-[25%] h-[25%] bg-gray-800 border-x-8 border-b-8 border-black rounded-b-2xl flex flex-col items-center justify-end pb-3 shadow-inner">
              <div className="w-3/4 h-2 bg-black rounded-full mb-1" />
              <div className="w-3/4 h-2 bg-black rounded-full mb-1" />
              <div className="w-3/4 h-2 bg-black rounded-full" />
            </div>
          </div>

          {/* Reactor */}
          <div className="absolute top-[5%] left-[5%] md:top-[10%] md:left-[15%] transform transition-transform hover:scale-105 z-10">
            <button onClick={(e) => handleObjectClick(e, getClue(0))} className="group flex flex-col items-center focus:outline-none">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-800 border-4 border-black rounded-full shadow-comic flex items-center justify-center relative">
                <div className="absolute inset-2 bg-crewCyan rounded-full opacity-80 group-hover:animate-ping" />
                <span className="text-2xl sm:text-3xl md:text-4xl relative z-10">☢️</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-white mt-2 bg-black px-2 py-1 border-2 border-white rounded shadow-comic">Reactor</span>
            </button>
          </div>

          {/* Valve */}
          <div className="absolute top-[35%] right-[5%] md:top-[30%] md:right-[15%] transform transition-transform hover:scale-105 z-10">
            <button onClick={(e) => handleObjectClick(e, getClue(1))} className="group flex flex-col items-center focus:outline-none">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-800 border-4 border-black rounded-full shadow-comic flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                <span className="text-2xl sm:text-3xl md:text-4xl">⚙️</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-white mt-2 bg-black px-2 py-1 border-2 border-white rounded shadow-comic">Valve</span>
            </button>
          </div>

          {/* Toolbox */}
          <div className="absolute bottom-[10%] left-[25%] md:bottom-[15%] md:left-[45%] transform transition-transform hover:scale-105 z-10">
            <button onClick={(e) => handleObjectClick(e, getClue(2))} className="group flex flex-col items-center focus:outline-none">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-crewRed border-4 border-black rounded-xl shadow-comic flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-200">
                <span className="text-2xl sm:text-3xl md:text-4xl">🧰</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-white mt-2 bg-black px-2 py-1 border-2 border-white rounded shadow-comic">Toolbox</span>
            </button>
          </div>
        </div>
      </div>

      {activeClue && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setActiveClue(null)}>
          <div className="bg-white text-black border-4 border-black rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-[8px_8px_0px_#000] scale-in-center">
            <h2 className="text-crewRed font-black text-xl md:text-2xl uppercase tracking-widest mb-4">🚨 CLUE DISCOVERED 🚨</h2>
            <p className="text-lg md:text-xl font-bold leading-relaxed">{activeClue}</p>
          </div>
        </div>
      )}
    </main>
  );
}

