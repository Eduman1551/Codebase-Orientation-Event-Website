"use client";

import { useState, useEffect, useRef } from "react";
import Starfield from "../../components/Starfield";
import Navbar from "../../components/Navbar";

export default function MedBayRoom() {
  const [activeClue, setActiveClue] = useState(null);
  const timeoutRef = useRef(null);

  const handleObjectClick = (clueText) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveClue(clueText);
    timeoutRef.current = setTimeout(() => {
      setActiveClue(null);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <main className="min-h-screen relative flex flex-col items-center p-4 pt-48 md:pt-32 pb-10">
      <Starfield />
      <Navbar />

      <div className="relative z-10 w-full max-w-4xl flex flex-col grow text-center">
        <div className="mb-6 shrink-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[4px_4px_0px_#000]">
            MEDICAL BAY
          </h1>
          <p className="text-crewLime font-bold uppercase tracking-widest mt-1 text-xs sm:text-sm md:text-base px-2">
            Analyze the biology and check the scanners
          </p>
        </div>

        <div className="relative w-full grow min-h-[55vh] bg-spacePanel/80 border-4 border-black rounded-3xl shadow-comicLg backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 pointer-events-none border-12 md:border-16 border-black/10 rounded-3xl" />
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(80,239,57,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(80,239,57,0.05)_1px,transparent_1px)] bg-size-[40px_40px]" />

          {/* Scanner */}
          <div className="absolute top-[35%] left-[10%] md:top-[40%] md:left-[20%] transform transition-transform hover:scale-105 z-10">
            <button 
              onClick={() => handleObjectClick("CLUE 10: The bioscanner confirms the imposter's height is exactly 5'9\".")}
              onTouchStart={() => handleObjectClick("CLUE 10: The bioscanner confirms the imposter's height is exactly 5'9\".")}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gray-100 border-4 border-black rounded-3xl shadow-comic flex items-center justify-center relative overflow-hidden group-hover:bg-white transition-colors">
                <div className="absolute top-0 left-0 w-full h-2 bg-crewLime shadow-[0_0_15px_#50ef39] animate-[bounce_2s_infinite]" />
                <span className="text-3xl sm:text-4xl md:text-5xl relative z-10">🛏️</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-black mt-2 bg-crewLime px-2 py-1 border-2 border-black rounded shadow-comic">
                Scanner
              </span>
            </button>
          </div>

          {/* Samples */}
          <div className="absolute bottom-[15%] right-[15%] md:bottom-[20%] md:right-[25%] transform transition-transform hover:scale-105 z-10">
            <button 
              onClick={() => handleObjectClick("CLUE 11: The blood sample turned green. It matches an alien DNA signature.")}
              onTouchStart={() => handleObjectClick("CLUE 11: The blood sample turned green. It matches an alien DNA signature.")}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-800 border-4 border-black rounded-xl shadow-comic flex items-center justify-center relative group-hover:rotate-12 transition-transform duration-300">
                <div className="absolute bottom-2 w-3/4 h-1/2 bg-crewCyan rounded-b-lg opacity-40 group-hover:animate-pulse" />
                <span className="text-2xl sm:text-3xl md:text-4xl relative z-10">🧪</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-white mt-2 bg-black px-2 py-1 border-2 border-white rounded shadow-comic">
                Samples
              </span>
            </button>
          </div>

          {/* MedKit */}
          <div className="absolute top-[10%] right-[25%] md:top-[15%] md:right-[35%] transform transition-transform hover:scale-105 z-10">
            <button 
              onClick={() => handleObjectClick("CLUE 12: A scalpel is missing from the emergency kit.")}
              onTouchStart={() => handleObjectClick("CLUE 12: A scalpel is missing from the emergency kit.")}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white border-4 border-black rounded-lg shadow-comic flex items-center justify-center group-hover:scale-110 transition-transform duration-200 relative">
                <div className="absolute w-8 h-3 bg-crewRed rounded-sm" />
                <div className="absolute w-3 h-8 bg-crewRed rounded-sm" />
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-black mt-2 bg-white px-2 py-1 border-2 border-black rounded shadow-comic">
                MedKit
              </span>
            </button>
          </div>
        </div>
      </div>

      {activeClue && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveClue(null)} 
          onTouchStart={() => setActiveClue(null)}
        >
          <div className="bg-white text-black border-4 border-black rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-[8px_8px_0px_#000] scale-in-center border-t-8 border-t-crewLime">
            <h2 className="text-crewLime font-black text-xl md:text-2xl uppercase tracking-widest mb-4 drop-shadow-[1px_1px_0px_rgba(0,0,0,0.8)]">
              🧬 DNA ANALYZED 🧬
            </h2>
            <p className="text-lg md:text-xl font-bold leading-relaxed">
              {activeClue}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}