"use client";

import { useState, useEffect, useRef } from "react";
import Starfield from "../../components/Starfield";
import Navbar from "../../components/Navbar";

export default function ElectricalRoom() {
  const [activeClue, setActiveClue] = useState(null);
  const timeoutRef = useRef(null);

  const handleObjectClick = (e, clueText) => {
    e.stopPropagation();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveClue(clueText);
    timeoutRef.current = setTimeout(() => { setActiveClue(null); }, 3000);
  };

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  return (
    <main className="min-h-screen relative flex flex-col items-center p-4 pt-48 md:pt-32 pb-10">
      <Starfield />
      <Navbar />

      <div className="relative z-10 w-full max-w-4xl flex flex-col grow text-center">
        <div className="mb-6 shrink-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[4px_4px_0px_#000]">
            ELECTRICAL ROOM
          </h1>
          <p className="text-crewYellow font-bold uppercase tracking-widest mt-1 text-xs sm:text-sm md:text-base px-2">
            Watch your back and fix the wiring
          </p>
        </div>

        <div className="relative w-full grow min-h-[55vh] bg-spacePanel/95 border-4 border-black rounded-3xl shadow-comicLg backdrop-blur-md overflow-hidden">
          
          {/* --- BACKGROUND SCENERY --- */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Danger Tape Borders */}
            <div className="absolute top-0 left-0 w-full h-4 bg-[repeating-linear-gradient(45deg,#f5f557,#f5f557_10px,#000_10px,#000_20px)] opacity-60" />
            <div className="absolute bottom-0 left-0 w-full h-4 bg-[repeating-linear-gradient(45deg,#f5f557,#f5f557_10px,#000_10px,#000_20px)] opacity-60" />
            
            {/* Giant Electrical Cabinet */}
            <div className="absolute top-[15%] left-[5%] w-[40%] h-[70%] bg-gray-800 border-4 border-black rounded-xl opacity-70 flex flex-col items-center py-6 gap-4">
              <div className="w-[80%] h-8 bg-gray-900 border-2 border-black flex gap-2 p-1">
                 <div className="w-1/3 h-full bg-crewRed opacity-50" />
                 <div className="w-1/3 h-full bg-crewCyan opacity-50" />
              </div>
              <div className="w-[80%] h-[40%] bg-gray-700 border-2 border-black grid grid-cols-2 gap-2 p-2">
                 <div className="bg-gray-900" /><div className="bg-gray-900" />
                 <div className="bg-gray-900" /><div className="bg-gray-900" />
              </div>
            </div>

            {/* Huge dangling background wire */}
            <div className="absolute top-0 right-[15%] w-8 h-[50%] bg-crewYellow border-x-4 border-b-4 border-black rounded-b-full opacity-40 shadow-inner" />
          </div>
          {/* --------------------------- */}

          {/* Fuse Box */}
          <div className="absolute top-[10%] right-[10%] md:top-[15%] md:right-[20%] transform transition-transform hover:scale-105 z-10">
            <button 
              onClick={(e) => handleObjectClick(e, "CLUE 7: The lights were sabotaged exactly 42 seconds after the mission started.")}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-700 border-4 border-black rounded-sm shadow-comic flex items-center justify-center relative group-hover:bg-gray-600 transition-colors">
                <div className="absolute top-0 right-0 w-4 h-4 bg-crewYellow rounded-full animate-ping opacity-75" />
                <span className="text-2xl sm:text-3xl md:text-4xl relative z-10">⚡</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-black mt-2 bg-crewYellow px-2 py-1 border-2 border-black rounded shadow-comic">
                Fuse Box
              </span>
            </button>
          </div>

          {/* Vent */}
          <div className="absolute top-[40%] left-[10%] md:top-[45%] md:left-[25%] transform transition-transform hover:scale-105 z-10">
            <button 
              onClick={(e) => handleObjectClick(e, "CLUE 8: There are footprints leading from the vent to the Engine room.")}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div className="w-20 h-12 sm:w-24 sm:h-16 md:w-32 md:h-20 bg-gray-800 border-4 border-black shadow-comic flex flex-col justify-evenly p-2 group-hover:-translate-y-1 transition-transform duration-300 relative">
                <div className="w-full h-1 md:h-2 bg-black rounded-full" />
                <div className="w-full h-1 md:h-2 bg-black rounded-full" />
                <div className="w-full h-1 md:h-2 bg-black rounded-full" />
                <span className="absolute inset-0 flex items-center justify-center text-xl md:text-2xl opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_8px_red]">👀</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-white mt-2 bg-black px-2 py-1 border-2 border-white rounded shadow-comic">Vent</span>
            </button>
          </div>

          {/* Wiring */}
          <div className="absolute bottom-[15%] right-[25%] md:bottom-[20%] md:right-[40%] transform transition-transform hover:scale-105 z-10">
            <button 
              onClick={(e) => handleObjectClick(e, "CLUE 9: The RED wire was cut first. But the BLUE wire caused the outage.")}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-900 border-4 border-black rounded-xl shadow-comic flex flex-col justify-center gap-1 p-2 group-hover:rotate-12 transition-transform duration-200 overflow-hidden">
                <div className="w-[120%] h-2 bg-crewRed -ml-2 transform rotate-12 border-y border-black" />
                <div className="w-[120%] h-2 bg-crewCyan -ml-2 transform -rotate-6 border-y border-black" />
                <div className="w-[120%] h-2 bg-crewLime -ml-2 transform rotate-6 border-y border-black" />
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-white mt-2 bg-black px-2 py-1 border-2 border-white rounded shadow-comic">Wiring</span>
            </button>
          </div>
        </div>
      </div>

      {activeClue && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveClue(null)} 
        >
          <div className="bg-white text-black border-4 border-black rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-[8px_8px_0px_#000] scale-in-center border-t-8 border-t-crewYellow">
            <h2 className="text-crewYellow font-black text-xl md:text-2xl uppercase tracking-widest mb-4 drop-shadow-sm">⚠️ LOG RECOVERED ⚠️</h2>
            <p className="text-lg md:text-xl font-bold leading-relaxed">{activeClue}</p>
          </div>
        </div>
      )}
    </main>
  );
}