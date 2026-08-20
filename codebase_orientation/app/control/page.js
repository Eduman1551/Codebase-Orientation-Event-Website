"use client";

import { useState, useEffect, useRef } from "react";
import Starfield from "../../components/Starfield";
import Navbar from "../../components/Navbar";

export default function ControlRoom() {
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
            CONTROL ROOM
          </h1>
          <p className="text-crewCyan font-bold uppercase tracking-widest mt-1 text-xs sm:text-sm md:text-base px-2">
            Monitor the ship&apos;s systems for clues
          </p>
        </div>

        <div className="relative w-full grow min-h-[55vh] bg-gray-900 border-4 border-black rounded-3xl shadow-comicLg overflow-hidden">
          
          {/* --- NEW 3D BACKGROUND SCENERY --- */}
          <div className="absolute inset-0 pointer-events-none z-0 flex flex-col">
            
            {/* The Command Wall (Top Half) */}
            <div className="w-full h-[45%] bg-gray-800 border-b-8 border-black flex items-center justify-center relative shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-10">
               <div className="w-[60%] h-[70%] bg-black border-4 border-gray-600 rounded-xl relative overflow-hidden flex flex-col justify-end p-2">
                  <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(56,254,220,0.4)_1px,transparent_1px)] bg-size-[100%_4px]" />
                  <div className="w-[80%] h-2 bg-crewCyan/50 rounded-full mb-2 animate-pulse" />
                  <div className="w-[50%] h-2 bg-crewCyan/50 rounded-full animate-pulse delay-75" />
               </div>
               
               {/* Side Server Blinky Lights */}
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

            {/* The 3D Radar Floor (Bottom Half) */}
            <div className="w-full h-[55%] relative overflow-hidden bg-black perspective-container">
               <div className="absolute inset-x-[-50%] top-0 h-[200%] bg-black origin-top shadow-inner" style={{ transform: "perspective(500px) rotateX(60deg)" }}>
                  <div className="absolute inset-0 border-crewCyan/20 bg-[linear-gradient(rgba(56,254,220,0.2)_2px,transparent_2px),linear-gradient(90deg,rgba(56,254,220,0.2)_2px,transparent_2px)] bg-size-[50px_50px]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 border-10 border-crewCyan/30 rounded-full shadow-[0_0_50px_rgba(56,254,220,0.2)]" />
               </div>
            </div>
          </div>
          {/* ----------------------------------- */}

          {/* Security */}
          <div className="absolute top-[12%] left-[10%] md:top-[15%] md:left-[15%] transform transition-transform hover:scale-105 z-10">
            <button 
              onClick={(e) => handleObjectClick(e, "CLUE 4: The cameras show someone walking towards the Medical bay.")}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-900 border-4 border-black rounded-xl shadow-comic flex items-center justify-center relative group-hover:bg-gray-800 transition-colors">
                <div className="absolute top-2 right-2 w-3 h-3 bg-crewRed rounded-full animate-pulse shadow-[0_0_8px_#c51111]" />
                <span className="text-2xl sm:text-3xl md:text-4xl relative z-10">📹</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-white mt-2 bg-black px-2 py-1 border-2 border-white rounded shadow-comic">Security</span>
            </button>
          </div>

          {/* Navigation */}
          <div className="absolute bottom-[15%] left-[50%] -translate-x-1/2 transform transition-transform hover:scale-105 z-10">
            <button 
              onClick={(e) => handleObjectClick(e, "CLUE 5: The ship is off course by 45 degrees.")}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-crewCyan/20 border-4 border-black rounded-full shadow-comic flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform duration-300 relative">
                <div className="absolute inset-0 border-4 border-crewCyan rounded-full border-t-transparent animate-spin opacity-80" />
                <span className="text-3xl sm:text-4xl md:text-5xl relative z-10">🗺️</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase mt-2 bg-black px-2 py-1 border-2 border-crewCyan rounded shadow-comic text-crewCyan">Nav</span>
            </button>
          </div>

          {/* Comms */}
          <div className="absolute top-[12%] right-[10%] md:top-[15%] md:right-[15%] transform transition-transform hover:scale-105 z-10">
            <button 
              onClick={(e) => handleObjectClick(e, "CLUE 6: A garbled transmission repeats the word 'Oxygen'.")}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-crewYellow border-4 border-black rounded-lg shadow-comic flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-200">
                <span className="text-2xl sm:text-3xl md:text-4xl group-hover:animate-bounce">📻</span>
              </div>
              <span className="font-black text-[10px] sm:text-xs md:text-sm uppercase text-black mt-2 bg-crewYellow px-2 py-1 border-2 border-black rounded shadow-comic">Comms</span>
            </button>
          </div>
        </div>
      </div>

      {activeClue && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveClue(null)} 
        >
          <div className="bg-white text-black border-4 border-black rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-[8px_8px_0px_#000] scale-in-center border-t-8 border-t-crewCyan">
            <h2 className="text-crewCyan font-black text-xl md:text-2xl uppercase tracking-widest mb-4 drop-shadow-sm">📡 CLUE DECRYPTED 📡</h2>
            <p className="text-lg md:text-xl font-bold leading-relaxed">{activeClue}</p>
          </div>
        </div>
      )}
    </main>
  );
}