"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Starfield from "../../components/Starfield";

// 🎨 AMONG US COLOR PALETTE 
// 🎨 EXPANDED AMONG US COLOR PALETTE (24 Colors)
const CREWMATE_COLORS = [
  "bg-crewRed", "bg-crewCyan", "bg-crewYellow", "bg-crewLime", 
  "bg-orange-500", "bg-purple-500", "bg-pink-500", "bg-blue-600",
  "bg-green-600", "bg-gray-400", "bg-yellow-700", "bg-teal-400",
  "bg-indigo-500", "bg-rose-500", "bg-fuchsia-500", "bg-emerald-400",
  "bg-amber-400", "bg-cyan-700", "bg-red-800", "bg-violet-600",
  "bg-lime-600", "bg-sky-500", "bg-zinc-300", "bg-stone-600"
];

// 🧠 HASH FUNCTION: Turns a team name into a consistent color index
const getTeamColor = (teamName) => {
  if (!teamName) return "bg-gray-500";
  let hash = 0;
  for (let i = 0; i < teamName.length; i++) {
    hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CREWMATE_COLORS.length;
  return CREWMATE_COLORS[index];
};

export default function LeaderboardPage() {
  // Notice: The backend doesn't need to send 'color' anymore!
  const [teams, setTeams] = useState([
    { id: "loading", name: "Awaiting Transmissions...", time: 0 }
  ]);

  // =======================================================================
  // 🟢 BACKEND DEVELOPER ZONE 🟢
  // =======================================================================
  useEffect(() => {
    let isMounted = true;

    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.leaderboard)) {
          if (data.leaderboard.length > 0) {
            setTeams(data.leaderboard);
          } else {
            setTeams([{ id: "empty", name: "No team records yet", time: 0 }]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);
  // =======================================================================

  const formatTime = (totalSeconds) => {
    if (totalSeconds === 0) return "--:--";
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4 py-10 overflow-hidden">
      <Starfield />

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center">
        
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="inline-block bg-crewYellow text-black border-4 border-black px-6 py-2 rounded-full font-black text-lg md:text-xl tracking-wider uppercase shadow-comic mb-4"
          >
            🏆 Live Rankings
          </motion.div>
          <motion.h1 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[4px_4px_0px_#000]"
          >
            GLOBAL LEADERBOARD
          </motion.h1>
        </div>

        {/* Leaderboard Table Header */}
        <div className="w-full max-w-4xl grid grid-cols-12 gap-4 px-6 py-3 mb-4 bg-gray-900 border-4 border-black rounded-2xl shadow-comic font-black text-gray-400 uppercase tracking-widest text-sm md:text-base">
          <div className="col-span-2 md:col-span-2 text-center">Rank</div>
          <div className="col-span-6 md:col-span-7 text-left">Crew Name</div>
          <div className="col-span-4 md:col-span-3 text-right">Clear Time</div>
        </div>

        {/* Leaderboard Rows List */}
        <div className="w-full max-w-4xl flex flex-col gap-3">
          <AnimatePresence>
            {teams.map((team, index) => {
              const isTop3 = index < 3;
              let rankStyle = "bg-gray-800 border-black text-white"; 
              let rankBadge = "bg-gray-700 text-white";
              
              // Automatically get the team's unique color based on their name!
              const autoColor = getTeamColor(team.name);

              // Special styling for the Top 3 podium finishers
              if (index === 0 && team.time > 0) {
                rankStyle = "bg-yellow-900/40 border-crewYellow shadow-[0_0_20px_rgba(245,245,87,0.3)] text-white";
                rankBadge = "bg-crewYellow text-black";
              } else if (index === 1 && team.time > 0) {
                rankStyle = "bg-gray-300/20 border-gray-300 shadow-[0_0_15px_rgba(209,213,219,0.2)] text-white";
                rankBadge = "bg-gray-300 text-black";
              } else if (index === 2 && team.time > 0) {
                rankStyle = "bg-orange-900/30 border-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.2)] text-white";
                rankBadge = "bg-orange-400 text-black";
              }

              return (
                <motion.div
                  key={team.id}
                  layout 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    mass: 0.8,
                  }}
                  className={`grid grid-cols-12 gap-4 items-center px-4 py-3 md:py-4 rounded-2xl border-4 ${rankStyle} backdrop-blur-sm`}
                >
                  
                  {/* Rank Column */}
                  <div className="col-span-2 md:col-span-2 flex justify-center">
                    <div className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border-2 border-black font-black text-lg shadow-inner ${rankBadge}`}>
                      {team.time === 0 ? "-" : index + 1}
                    </div>
                  </div>

                  {/* Team Name Column */}
                  <div className="col-span-6 md:col-span-7 flex items-center gap-3 md:gap-4 overflow-hidden">
                    {/* The dynamically assigned autoColor is applied here! */}
                    <div className={`w-4 h-5 md:w-5 md:h-6 ${autoColor} border-2 border-black rounded-full relative shrink-0 shadow-[2px_2px_0px_#000]`}>
                       <div className="absolute top-[20%] left-[20%] w-[60%] h-[40%] bg-blue-200 border border-black rounded-full" />
                    </div>
                    <span className="font-bold text-base md:text-xl truncate tracking-wide">
                      {team.name}
                    </span>
                  </div>

                  {/* Clear Time Column */}
                  <div className="col-span-4 md:col-span-3 text-right">
                    <span className={`font-mono font-black text-lg md:text-2xl tracking-widest ${isTop3 && team.time > 0 ? "text-white" : "text-crewCyan"}`}>
                      {formatTime(team.time)}
                    </span>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>
    </main>
  );
}