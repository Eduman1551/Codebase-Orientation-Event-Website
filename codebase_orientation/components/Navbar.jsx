"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let isMounted = true;

    const syncServerTime = async () => {
      try {
        const res = await fetch("/api/round/status");
        const data = await res.json();
        if (isMounted && data.success && data.round?.round_start_time) {
          startTimestamp = new Date(data.round.round_start_time).getTime();
        }
      } catch (err) {
        console.error("Failed to sync timer with server:", err);
      }
    };

    syncServerTime();

    const updateTimer = () => {
      if (startTimestamp) {
        const now = Date.now();
        const elapsed = Math.max(0, Math.floor((now - startTimestamp) / 1000));
        setSeconds(elapsed);
      } else {
        let stored = localStorage.getItem("gameStartTime");
        if (!stored) {
          stored = Date.now().toString();
          localStorage.setItem("gameStartTime", stored);
        }
        const parsed = parseInt(stored, 10);
        const elapsed = Math.max(0, Math.floor((Date.now() - parsed) / 1000));
        setSeconds(elapsed);
      }
    };

    setTimeout(updateTimer, 0);
    const interval = setInterval(updateTimer, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Format time as MM:SS
  const formatTime = (totalSeconds) => {
    // Prevent negative numbers just in case
    const safeSeconds = Math.max(0, totalSeconds); 
    const m = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
    const s = (safeSeconds % 60).toString().padStart(2, "0");
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
      <div className="max-w-7xl mx-auto w-full px-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        
        {/* Timer Display */}
        <div className="bg-black border-4 border-crewRed rounded-xl px-4 py-2 shadow-[0_0_15px_rgba(197,17,17,0.5)] shrink-0">
          <span className="text-crewRed font-black text-2xl font-mono tracking-widest">
            {formatTime(seconds)}
          </span>
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