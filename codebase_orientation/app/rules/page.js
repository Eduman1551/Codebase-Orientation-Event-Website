"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Starfield from "../../components/Starfield";

export default function RulesPage() {
  const router = useRouter();
  const [dots, setDots] = useState("");

  // Simple loading dots animation for the "Waiting" text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Backend Handoff Note:
  // Hook up Supabase realtime subscription here.
  // When 'game_status' changes to 'start', fire: router.push("/engine")

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 py-12 md:py-8">
      <Starfield />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header Badge */}
        <div className="text-center mb-6">
          <div className="inline-block bg-crewYellow text-black border-4 border-black px-6 py-2 rounded-full font-black text-lg md:text-xl tracking-wider uppercase shadow-comic mb-2">
            📋 Mission Briefing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-[4px_4px_0px_#000]">
            READ CAREFULLY
          </h1>
        </div>

        {/* Main Panel Box */}
        <div className="bg-spacePanel/95 border-4 border-black rounded-3xl p-4 sm:p-8 shadow-comicLg backdrop-blur-sm flex flex-col gap-6">
          
          {/* Rules Grid - Stacked cleanly for mobile spacing */}
          <div className="grid grid-cols-1 gap-4">
            
            {/* Rule 1 Card */}
            <div className="bg-gray-800 border-4 border-black p-4 md:p-5 rounded-2xl shadow-comic transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-5 md:w-6 md:h-6 shrink-0 bg-crewRed border-2 border-black rounded-full shadow-inner" />
                <h3 className="text-crewRed font-black text-base md:text-lg uppercase tracking-wide drop-shadow-sm">
                  Navigation is Key
                </h3>
              </div>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                You will be given a series of clues. Solve the current clue to unlock the path to the next sector.
              </p>
            </div>

            {/* Rule 2 Card */}
            <div className="bg-gray-800 border-4 border-black p-4 md:p-5 rounded-2xl shadow-comic transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-5 md:w-6 md:h-6 shrink-0 bg-crewCyan border-2 border-black rounded-full shadow-inner" />
                <h3 className="text-crewCyan font-black text-base md:text-lg uppercase tracking-wide drop-shadow-sm">
                  Beat the Clock
                </h3>
              </div>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                The timer starts the moment the host begins the game. Your total completion time determines your rank.
              </p>
            </div>

            {/* Rule 3 Card */}
            <div className="bg-gray-800 border-4 border-black p-4 md:p-5 rounded-2xl shadow-comic transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-5 md:w-6 md:h-6 shrink-0 bg-crewLime border-2 border-black rounded-full shadow-inner" />
                <h3 className="text-crewLime font-black text-base md:text-lg uppercase tracking-wide drop-shadow-sm">
                  One Submission
                </h3>
              </div>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                Discuss answers with your crew. Only one person needs to submit the final answer for the whole team.
              </p>
            </div>

            {/* Rule 4 Card */}
            <div className="bg-gray-800 border-4 border-black p-4 md:p-5 rounded-2xl shadow-comic transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-5 md:w-6 md:h-6 shrink-0 bg-crewOrange border-2 border-black rounded-full shadow-inner" />
                <h3 className="text-crewOrange font-black text-base md:text-lg uppercase tracking-wide drop-shadow-sm">
                  No Sabotage
                </h3>
              </div>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                Keep answers secure. Helping other crews will result in immediate ejection into the vacuum of space.
              </p>
            </div>

          </div>

          <hr className="border-t-4 border-black border-dashed opacity-50" />

          {/* Waiting Status Container */}
          <div className="bg-gray-900 border-4 border-black rounded-2xl p-5 text-center shadow-inner">
            <h2 className="text-xl md:text-2xl font-black tracking-widest text-crewCyan animate-pulse uppercase">
              Waiting to Start{dots}
            </h2>
            <p className="text-gray-500 text-xs md:text-sm mt-2 font-bold uppercase tracking-wider">
              Do not refresh. The mission will begin automatically.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}