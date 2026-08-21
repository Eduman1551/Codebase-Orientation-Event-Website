"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [seconds, setSeconds] = useState(0);
  const [roundNum, setRoundNum] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const baseElapsedRef = useRef(0);
  const receivedAtRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const syncServerTime = async () => {
      try {
        const teamId = typeof window !== "undefined" ? localStorage.getItem("team_id") : null;
        const url = teamId ? `/api/round/status?team_id=${teamId}` : "/api/round/status";
        const res = await fetch(url);
        const data = await res.json();

        if (!isMounted) return;

        if (data.success && data.active && data.gameState === "running") {
          const serverElapsed = typeof data.elapsedSeconds === "number" ? data.elapsedSeconds : 0;
          baseElapsedRef.current = serverElapsed;
          receivedAtRef.current = Date.now();
          setSeconds(serverElapsed);
          setRoundNum(data.round?.round_number || null);
          setIsLocked(false);
        } else {
          baseElapsedRef.current = 0;
          receivedAtRef.current = null;
          setSeconds(0);
          setIsLocked(data.gameState !== "running");
          if (data.round?.round_number) setRoundNum(data.round.round_number);
        }
      } catch (err) {
        console.error("Failed to sync timer with server:", err);
      }
    };

    syncServerTime();
    const syncInterval = setInterval(syncServerTime, 3000); // re-sync every 3s

    const updateTimer = () => {
      if (receivedAtRef.current !== null) {
        const localPassed = Math.floor((Date.now() - receivedAtRef.current) / 1000);
        setSeconds(baseElapsedRef.current + Math.max(0, localPassed));
      }
    };

    const tickInterval = setInterval(updateTimer, 1000);

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
      clearInterval(tickInterval);
    };
  }, []);

  const formatTime = (totalSeconds) => {
    const safe = Math.max(0, totalSeconds);
    const m = Math.floor(safe / 60).toString().padStart(2, "0");
    const s = (safe % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const navLinks = [
    { name: "Engine", path: "/engine" },
    { name: "Electrical", path: "/electrical" },
    { name: "MedBay", path: "/medbay" },
    { name: "Control", path: "/control" },
    { name: "SUBMIT", path: "/submit" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-spacePanel border-b-4 border-black shadow-comic min-h-20 flex items-center py-3">
      <div className="max-w-7xl mx-auto w-full px-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">

        {/* Timer + Round Info */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-black border-4 border-crewRed rounded-xl px-4 py-2 shadow-[0_0_15px_rgba(197,17,17,0.5)]">
            <span className={`text-crewRed font-black text-2xl font-mono tracking-widest ${isLocked ? "opacity-50" : ""}`}>
              {isLocked ? "⏸ --:--" : formatTime(seconds)}
            </span>
          </div>
          {roundNum && (
            <div className="bg-gray-800 border-2 border-crewCyan rounded-xl px-3 py-1.5">
              <span className="text-crewCyan font-black text-sm uppercase tracking-widest">
                Round {roundNum}/5
              </span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full md:w-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            const isSubmit = link.name === "SUBMIT";

            return (
              <Link key={link.name} href={link.path}>
                <div
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm md:text-base border-4 border-black rounded-xl font-bold uppercase tracking-wide transition-transform active:scale-95 text-center ${
                    isActive
                      ? "bg-crewCyan text-black shadow-comicHover translate-y-0.5"
                      : isSubmit
                      ? "bg-crewYellow text-black shadow-comic hover:bg-yellow-300"
                      : "bg-gray-800 text-white shadow-comic hover:bg-gray-700"
                  }`}
                >
                  {link.name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
