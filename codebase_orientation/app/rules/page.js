"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Starfield from "../../components/Starfield";

export default function RulesPage() {
  const router = useRouter();
  const [dots, setDots] = useState("");
  const [gameState, setGameState] = useState("waiting"); // "waiting" | "between_rounds" | "running"
  const [nextRoundIn, setNextRoundIn] = useState(0);
  const [nextRoundNum, setNextRoundNum] = useState(null);
  const [countdownRef] = useState({ interval: null });

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/round/status");
      const data = await res.json();

      if (!data.success) return;

      if (data.gameState === "running") {
        router.push("/engine");
        return;
      }

      if (data.gameState === "between_rounds") {
        setGameState("between_rounds");
        setNextRoundNum(data.nextRoundNumber);

        // Use server-provided nextRoundIn as the countdown seed
        if (data.nextRoundIn != null) {
          setNextRoundIn(data.nextRoundIn);
        }
      } else if (data.gameState === "game_over") {
        setGameState("game_over");
      } else {
        setGameState("waiting");
      }
    } catch (err) {
      console.error("Failed to check round status:", err);
    }
  }, [router]);

  // Poll every 2s
  useEffect(() => {
    let isMounted = true;
    const wrappedCheck = async () => { if (isMounted) await checkStatus(); };
    wrappedCheck();
    const interval = setInterval(wrappedCheck, 2000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [checkStatus]);

  // Local countdown tick for between_rounds
  useEffect(() => {
    clearInterval(countdownRef.interval);
    if (gameState === "between_rounds" && nextRoundIn > 0) {
      countdownRef.interval = setInterval(() => {
        setNextRoundIn((n) => {
          if (n <= 1) {
            clearInterval(countdownRef.interval);
            return 0;
          }
          return n - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownRef.interval);
  }, [gameState, nextRoundIn]);

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

          {/* Rules Grid */}
          <div className="grid grid-cols-1 gap-4">
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

            <div className="bg-gray-800 border-4 border-black p-4 md:p-5 rounded-2xl shadow-comic transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-5 md:w-6 md:h-6 shrink-0 bg-crewCyan border-2 border-black rounded-full shadow-inner" />
                <h3 className="text-crewCyan font-black text-base md:text-lg uppercase tracking-wide drop-shadow-sm">
                  Beat the Clock
                </h3>
              </div>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                The timer starts the moment the host begins each round. Your total completion time across all rounds determines your rank.
              </p>
            </div>

            <div className="bg-gray-800 border-4 border-black p-4 md:p-5 rounded-2xl shadow-comic transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-5 md:w-6 md:h-6 shrink-0 bg-crewLime border-2 border-black rounded-full shadow-inner" />
                <h3 className="text-crewLime font-black text-base md:text-lg uppercase tracking-wide drop-shadow-sm">
                  One Submission Per Round
                </h3>
              </div>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                Discuss answers with your crew. Only one person needs to submit the final answer for the whole team per round.
              </p>
            </div>

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

          {/* Status Container */}
          <div className="bg-gray-900 border-4 border-black rounded-2xl p-5 text-center shadow-inner">
            {gameState === "running" && (
              <>
                <h2 className="text-xl md:text-2xl font-black tracking-widest text-crewLime animate-pulse uppercase">
                  🚀 Round Starting...
                </h2>
                <p className="text-gray-500 text-xs md:text-sm mt-2 font-bold uppercase tracking-wider">
                  Redirecting to mission...
                </p>
              </>
            )}

            {gameState === "between_rounds" && (
              <>
                <h2 className="text-xl md:text-2xl font-black tracking-widest text-crewYellow uppercase">
                  ⏳ Round {nextRoundNum ? nextRoundNum - 1 : "?"} Complete!
                </h2>
                <p className="text-gray-300 text-sm md:text-base mt-2 font-bold">
                  Round {nextRoundNum} starts in:
                </p>
                <div className="text-5xl md:text-6xl font-mono font-black text-crewYellow drop-shadow-[0_0_15px_rgba(245,245,87,0.6)] mt-3 animate-pulse">
                  {nextRoundIn}s
                </div>
                <p className="text-gray-500 text-xs mt-3 font-bold uppercase tracking-wider">
                  Stand by — next round loads automatically
                </p>
              </>
            )}

            {gameState === "game_over" && (
              <>
                <h2 className="text-xl md:text-2xl font-black tracking-widest text-crewRed uppercase animate-pulse">
                  🏁 Game Over!
                </h2>
                <p className="text-gray-400 text-sm mt-2 font-bold">
                  All rounds complete. Check the leaderboard for final rankings.
                </p>
              </>
            )}

            {gameState === "waiting" && (
              <>
                <h2 className="text-xl md:text-2xl font-black tracking-widest text-crewCyan animate-pulse uppercase">
                  Waiting to Start{dots}
                </h2>
                <p className="text-gray-500 text-xs md:text-sm mt-2 font-bold uppercase tracking-wider">
                  Do not refresh. The mission will begin automatically.
                </p>
              </>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
