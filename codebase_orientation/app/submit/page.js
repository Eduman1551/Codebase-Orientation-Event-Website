"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Starfield from "../../components/Starfield";
import Navbar from "../../components/Navbar";

export default function SubmitPage() {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'error' | 'success'
  const [finalTime, setFinalTime] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [roundLocked, setRoundLocked] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Poll round status to lock/unlock input
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/round/status");
        const data = await res.json();
        if (!isMounted) return;
        if (data.gameState === "game_over") {
          setGameOver(true);
          setRoundLocked(true);
        } else if (!data.active || data.gameState !== "running") {
          setRoundLocked(true);
          // If round isn't active and team hasn't submitted, go back to rules
          if (status !== "success") {
            setTimeout(() => { if (isMounted) router.push("/rules"); }, 2500);
          }
        } else {
          setRoundLocked(false);
        }
      } catch {}
    };
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [router, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || status === "success" || status === "loading" || roundLocked) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const teamId = typeof window !== "undefined" ? localStorage.getItem("team_id") : null;
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answer.trim(), team_id: teamId }),
      });

      const data = await res.json();

      if (res.ok && data.correct) {
        setFinalTime(data.timeString || "Recorded");
        setStatus("success");
      } else if (data.alreadySubmitted) {
        setFinalTime(data.timeString || "Recorded");
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(data.error || data.message || "ACCESS DENIED. TRY AGAIN.");
        setAnswer("");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center p-4 pt-48 md:pt-32 pb-10">
      <Starfield />
      <Navbar />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center mt-4 md:mt-12">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-block bg-crewYellow text-black border-4 border-black px-6 py-2 rounded-full font-black text-lg md:text-xl tracking-wider uppercase shadow-comic mb-4">
            🔑 Override Console
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[4px_4px_0px_#000]">
            ENTER MASTER CODE
          </h1>
        </div>

        {/* Console Box */}
        <div className={`w-full bg-spacePanel/95 border-4 rounded-3xl p-6 sm:p-10 shadow-comicLg backdrop-blur-md transition-colors duration-300 ${
          status === "success" ? "border-crewLime shadow-[0_0_30px_rgba(80,239,57,0.4)]" :
          status === "error" ? "border-crewRed animate-[shake_0.5s_ease-in-out]" :
          roundLocked ? "border-crewYellow" : "border-black"
        }`}>

          {/* Round Locked Banner */}
          {roundLocked && status !== "success" && (
            <div className="mb-4 bg-crewYellow/20 border-4 border-crewYellow rounded-2xl p-4 text-center">
              <p className="text-crewYellow font-black text-lg uppercase tracking-widest animate-pulse">
                {gameOver ? "🏁 GAME OVER — All rounds complete!" : "⏸ ROUND ENDED — Returning to lobby..."}
              </p>
            </div>
          )}

          {/* Status Message Area */}
          <div className="h-16 mb-4 flex items-center justify-center">
            {status === "idle" && !roundLocked && (
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm md:text-base">
                Awaiting input...
              </p>
            )}
            {status === "loading" && (
              <p className="text-crewCyan font-bold uppercase tracking-widest text-sm md:text-base animate-pulse">
                Verifying Code...
              </p>
            )}
            {status === "error" && (
              <p className="text-crewRed font-black uppercase tracking-widest text-lg md:text-xl drop-shadow-[0_0_8px_rgba(197,17,17,0.8)]">
                {errorMessage || "❌ ACCESS DENIED. TRY AGAIN."}
              </p>
            )}
            {status === "success" && (
              <p className="text-crewLime font-black uppercase tracking-widest text-xl md:text-2xl drop-shadow-[0_0_10px_rgba(80,239,57,0.8)]">
                ✅ OVERRIDE ACCEPTED
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={status === "success" || status === "loading" || roundLocked}
                placeholder={roundLocked ? "ROUND LOCKED" : "TYPE CODE HERE"}
                className={`w-full text-center font-black text-2xl md:text-4xl px-6 py-6 rounded-2xl border-4 transition-all duration-300 uppercase tracking-widest placeholder-gray-600 focus:outline-none ${
                  status === "success"
                    ? "bg-green-900/50 text-crewLime border-crewLime shadow-[inset_0_0_20px_rgba(80,239,57,0.3)] disabled:opacity-100"
                    : status === "error"
                    ? "bg-red-900/30 text-white border-crewRed focus:border-crewRed"
                    : roundLocked
                    ? "bg-gray-900/50 text-gray-500 border-crewYellow cursor-not-allowed"
                    : "bg-gray-900 text-white border-black shadow-inner focus:border-crewCyan focus:shadow-[0_0_15px_rgba(56,254,220,0.5)]"
                }`}
              />
            </div>

            {status !== "success" && !roundLocked && (
              <button
                type="submit"
                disabled={status === "loading" || !answer.trim() || roundLocked}
                className="w-full bg-crewRed hover:bg-red-500 active:translate-y-0.5 active:shadow-comicHover text-black font-black text-2xl py-5 rounded-2xl border-4 border-black shadow-comic transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {status === "loading" ? "PROCESSING..." : "SUBMIT CODE"}
              </button>
            )}
          </form>

          {/* Success Summary */}
          {status === "success" && (
            <div className="mt-8 p-6 bg-black border-4 border-crewLime rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
              <h2 className="text-white font-extrabold text-2xl md:text-3xl uppercase tracking-tight mb-2">
                MISSION ACCOMPLISHED!
              </h2>
              <p className="text-gray-400 font-bold uppercase mb-4 text-sm md:text-base">
                Your completion time has been recorded
              </p>
              <div className="inline-block bg-spacePanel border-4 border-black rounded-xl px-8 py-4 shadow-inner">
                <span className="text-crewLime font-mono font-black text-4xl md:text-5xl tracking-widest drop-shadow-[0_0_12px_rgba(80,239,57,0.6)]">
                  {finalTime}
                </span>
              </div>
              <p className="text-crewCyan font-bold uppercase mt-6 text-sm md:text-base animate-pulse">
                Wait for the next round to begin automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
