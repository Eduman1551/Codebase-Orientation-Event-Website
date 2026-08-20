"use client";

import { useState, useEffect, useRef } from "react";
import Starfield from "../../components/Starfield";
import Navbar from "../../components/Navbar";

export default function EngineRoom() {
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
    // INCREASED pt-48 for mobile so it clears the taller wrapping navbar, md:pt-32 for desktop
    <main className="min-h-screen relative flex flex-col items-center p-4 pt-48 md:pt-32 pb-10">
      <Starfield />
      <Navbar />

      <div className="relative z-10 w-full max-w-4xl flex flex-col grow text-center">
        
        {/* Room Header - Adjusted text sizes for smaller screens */}
        <div className="mb-6 shrink-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[4px_4px_0px_#000]">
            ENGINE ROOM
          </h1>
          <p className="text-crewYellow font-bold uppercase tracking-widest mt-1 text-xs sm:text-sm md:text-base px-2">
            Search the room for clues
          </p>
        </div>

        {/* Scattered Room Container */}
        <div className="relative w-full grow min-h-[55vh] bg-spacePanel/80 border-4 border-black rounded-3xl shadow-comicLg backdrop-blur-md overflow-hidden">
          
          {/* Subtle floor markings */}
          <div className="absolute inset-0 pointer-events-none border-12 md:border-16 border-black/10 rounded-3xl" />
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-black/10" />
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-black/10" />

          {/* Object 1: Reactor Core (Positioned Top Left) */}
          <div className="absolute top-[5%] left-[5%] md:top-[15%] md:left-[15%] transform transition-transform hover:scale-105 z-10">
            <button 
              onClick={() => handleObjectClick("CLUE 1: The first digit of the password is the number of crewmates.")}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-800 border-4 border-black rounded-full shadow-comic flex items-center justify-center relative">
                <div className="absolute inset-2 bg-crewCyan rounded-full opacity-80 group-hover:animate-ping" />
                <span className="text-2xl sm:text-3xl md:text-4xl relative z-10">☢️</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-white mt-2 bg-black px-2 py-1 border-2 border-white rounded shadow-comic">
                Reactor
              </span>
            </button>
          </div>

          {/* Object 2: Fuel Valve (Positioned Middle Right) */}
          <div className="absolute top-[40%] right-[5%] md:top-[35%] md:right-[15%] transform transition-transform hover:scale-105 z-10">
            <button 
              onClick={() => handleObjectClick("CLUE 2: The saboteur was last seen in Electrical.")}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-800 border-4 border-black rounded-full shadow-comic flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                <span className="text-2xl sm:text-3xl md:text-4xl">⚙️</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-white mt-2 bg-black px-2 py-1 border-2 border-white rounded shadow-comic">
                Valve
              </span>
            </button>
          </div>

          {/* Object 3: Toolbox (Positioned Bottom Left/Center) */}
          <div className="absolute bottom-[10%] left-[25%] md:bottom-[15%] md:left-[45%] transform transition-transform hover:scale-105 z-10">
            <button 
              onClick={() => handleObjectClick("CLUE 3: A wrench is missing from the lower deck.")}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-crewRed border-4 border-black rounded-xl shadow-comic flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-200">
                <span className="text-2xl sm:text-3xl md:text-4xl">🧰</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-white mt-2 bg-black px-2 py-1 border-2 border-white rounded shadow-comic">
                Toolbox
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Clue Popup Overlay */}
      {activeClue && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveClue(null)} 
        >
          <div className="bg-white text-black border-4 border-black rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-[8px_8px_0px_#000] scale-in-center">
            <h2 className="text-crewRed font-black text-xl md:text-2xl uppercase tracking-widest mb-4">
              🚨 CLUE DISCOVERED 🚨
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