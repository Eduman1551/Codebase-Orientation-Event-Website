"use client";

import { useState, useEffect, useRef } from "react";
import Starfield from "../../components/Starfield";
import Navbar from "../../components/Navbar";

export default function ControlRoom() {
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
        
        {/* Room Header */}
        <div className="mb-6 shrink-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[4px_4px_0px_#000]">
            CONTROL ROOM
          </h1>
          <p className="text-crewCyan font-bold uppercase tracking-widest mt-1 text-xs sm:text-sm md:text-base px-2">
            Monitor the ship&apos;s systems for clues
          </p>
        </div>

        {/* Scattered Room Container */}
        <div className="relative w-full grow min-h-[55vh] bg-spacePanel/80 border-4 border-black rounded-3xl shadow-comicLg backdrop-blur-md overflow-hidden">
          
          {/* Subtle grid pattern to look like a control floor or radar map */}
          <div className="absolute inset-0 pointer-events-none border-12 md:border-16 border-black/10 rounded-3xl" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(56,254,220,0.05)_0,transparent_100%)]" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-crewCyan/10" />
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-crewCyan/10" />

          {/* Object 1: Security Cameras (Positioned Top Right) */}
          <div className="absolute top-[10%] right-[10%] md:top-[15%] md:right-[20%] transform transition-transform hover:scale-105 z-10">
            <button 
              onClick={() => handleObjectClick("CLUE 4: The cameras show someone walking towards the Medical bay.")}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-900 border-4 border-black rounded-xl shadow-comic flex items-center justify-center relative group-hover:bg-gray-800 transition-colors">
                {/* Red recording dot */}
                <div className="absolute top-2 right-2 w-3 h-3 bg-crewRed rounded-full animate-pulse shadow-[0_0_8px_#c51111]" />
                <span className="text-2xl sm:text-3xl md:text-4xl relative z-10">📹</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-white mt-2 bg-black px-2 py-1 border-2 border-white rounded shadow-comic">
                Security
              </span>
            </button>
          </div>

          {/* Object 2: Navigation Console (Positioned Center Left) */}
          <div className="absolute top-[45%] left-[5%] md:top-[40%] md:left-[15%] transform transition-transform hover:scale-105 z-10">
            <button 
              onClick={() => handleObjectClick("CLUE 5: The ship is off course by 45 degrees.")}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-crewCyan/20 border-4 border-black rounded-full shadow-comic flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 relative">
                {/* Radar sweep line */}
                <div className="absolute inset-0 border-4 border-crewCyan rounded-full border-t-transparent animate-spin opacity-50" />
                <span className="text-3xl sm:text-4xl md:text-5xl relative z-10">🗺️</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase mt-2 bg-black px-2 py-1 border-2 border-crewCyan rounded shadow-comic text-crewCyan">
                Navigation
              </span>
            </button>
          </div>

          {/* Object 3: Comms Radio (Positioned Bottom Right) */}
          <div className="absolute bottom-[10%] right-[20%] md:bottom-[15%] md:right-[30%] transform transition-transform hover:scale-105 z-10">
            <button 
              onClick={() => handleObjectClick("CLUE 6: A garbled transmission repeats the word 'Oxygen'.")}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-crewYellow border-4 border-black rounded-lg shadow-comic flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-200">
                <span className="text-2xl sm:text-3xl md:text-4xl group-hover:animate-bounce">📻</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-black mt-2 bg-crewYellow px-2 py-1 border-2 border-black rounded shadow-comic">
                Comms
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Clue Popup Overlay */}
      {activeClue && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveClue(null)} 
        >
          <div className="bg-white text-black border-4 border-black rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-[8px_8px_0px_#000] scale-in-center border-t-8 border-t-crewCyan">
            <h2 className="text-crewCyan font-black text-xl md:text-2xl uppercase tracking-widest mb-4 drop-shadow-sm">
              📡 CLUE DECRYPTED 📡
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