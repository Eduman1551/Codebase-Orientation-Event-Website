"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Starfield from "../../../components/Starfield";

export default function AdminPanel() {
  const router = useRouter();
  
  // Game states: 'waiting', 'running', 'paused'
  const [gameState, setGameState] = useState("waiting");
  const [loading, setLoading] = useState(false);

  // =======================================================================
  // 🟢 BACKEND DEVELOPER ZONE 🟢
  // =======================================================================
  useEffect(() => {
    /*
      TODO: Fetch current game state on mount.
      Listen to the 'game_settings' table in Supabase.
      Update local 'gameState' variable so the UI reflects the real DB state.
    */
  }, []);

  const updateGameState = async (newState) => {
    setLoading(true);
    try {
      /*
        TODO: Push the 'newState' to Supabase.
        await supabase.from('game_settings').update({ status: newState }).eq('id', 1);
        
        Once updated, all clients sitting on the /rules page listening to this row 
        should automatically trigger router.push('/engine') when state === 'running'.
      */
      
      // Simulated frontend update for testing
      setTimeout(() => {
        setGameState(newState);
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error("Failed to update game state:", error);
      setLoading(false);
    }
  };
  // =======================================================================

  const handleLogout = () => {
    router.push("/admin");
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center p-4 pt-12 pb-10">
      <Starfield />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-8 bg-gray-900 border-4 border-black p-4 rounded-2xl shadow-comic">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-crewRed border-2 border-black rounded-full flex items-center justify-center text-xl shadow-inner">
              👑
            </div>
            <h1 className="text-xl md:text-3xl font-black text-white tracking-widest uppercase">
              Admin Console
            </h1>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] active:translate-y-1 active:shadow-none transition-all text-sm uppercase"
          >
            Logout
          </button>
        </div>

        {/* Live Status Card */}
        <div className="w-full bg-spacePanel/95 border-4 border-black rounded-3xl p-6 sm:p-8 shadow-comicLg backdrop-blur-sm mb-6 text-center">
          <h2 className="text-gray-400 font-bold uppercase tracking-widest mb-2 text-sm">
            Current Mission Status
          </h2>
          
          <div className="flex items-center justify-center gap-4">
            {/* Dynamic Status Indicator */}
            <div className="relative flex h-6 w-6">
              {gameState === "running" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crewLime opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-6 w-6 border-2 border-black ${
                gameState === "waiting" ? "bg-crewYellow" :
                gameState === "running" ? "bg-crewLime" :
                "bg-crewOrange"
              }`}></span>
            </div>

            <span className={`text-4xl md:text-5xl font-black tracking-tighter uppercase drop-shadow-[2px_2px_0px_#000] ${
              gameState === "waiting" ? "text-crewYellow" :
              gameState === "running" ? "text-crewLime" :
              "text-crewOrange"
            }`}>
              {gameState === "waiting" ? "WAITING IN LOBBY" :
               gameState === "running" ? "MISSION ACTIVE" :
               "SYSTEM PAUSED"}
            </span>
          </div>
        </div>

        {/* Control Buttons Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Start / Resume Button */}
          <button
            onClick={() => updateGameState("running")}
            disabled={loading || gameState === "running"}
            className="group relative w-full bg-crewLime hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-500 active:translate-x-[2px] active:translate-y-[2px] active:shadow-comicHover text-black font-black text-xl py-6 rounded-2xl border-4 border-black shadow-comic transition-all uppercase tracking-wider overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
             {gameState === "paused" ? "RESUME MISSION" : "START MISSION"}
          </button>

          {/* Pause Button */}
          <button
            onClick={() => updateGameState("paused")}
            disabled={loading || gameState === "paused" || gameState === "waiting"}
            className="w-full bg-crewOrange hover:bg-orange-400 disabled:bg-gray-700 disabled:text-gray-500 active:translate-x-[2px] active:translate-y-[2px] active:shadow-comicHover text-black font-black text-xl py-6 rounded-2xl border-4 border-black shadow-comic transition-all uppercase tracking-wider"
          >
             PAUSE TIMERS
          </button>

          {/* Reset System (Spans both columns) */}
          <button
            onClick={() => {
              if(confirm("DANGER: This will reset the game state back to 'Waiting'. Are you sure?")) {
                updateGameState("waiting");
              }
            }}
            disabled={loading || gameState === "waiting"}
            className="md:col-span-2 w-full bg-crewRed hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-600 active:translate-x-[2px] active:translate-y-[2px] active:shadow-comicHover text-black font-black text-xl py-4 rounded-2xl border-4 border-black shadow-comic transition-all uppercase tracking-wider flex items-center justify-center gap-2 mt-4"
          >
             RESET SYSTEM TO LOBBY
          </button>
        </div>

      </div>
    </main>
  );
}