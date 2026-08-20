"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Starfield from "../../components/Starfield";
import Navbar from "../../components/Navbar";
import {
  submitAnswerAction,
  checkRoundStatusAction,
  finalizeTimeoutAction,
  getRoundTimeRemainingAction,
} from "../actions/useraction";

const NEXT_ROUND_WAIT = 0;

export default function SubmitPage() {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error | success | waiting | gameover
  const [finalTime, setFinalTime] = useState("");
  const [finalScore, setFinalScore] = useState(0);
  const [errorMsg, setErrorMsg] = useState("ACCESS DENIED. TRY AGAIN.");
  const [countdown, setCountdown] = useState(NEXT_ROUND_WAIT);
  const [waitMsg, setWaitMsg] = useState("");

  const pollForNextRound = useCallback(async () => {
    setStatus("waiting");
    setWaitMsg("Scanning for next mission...");

    // Poll up to 60 times (every 3s = 3 min max wait)
    let attempts = 0;
    const MAX_ATTEMPTS = 60;

    const poll = async () => {
      attempts++;
      try {
        const roundStatus = await checkRoundStatusAction();

        if (roundStatus.active && roundStatus.roundStartTime) {
          const currentRoundId = localStorage.getItem("roundId");
          // Only navigate if it's a NEW round (different ID)
          if (roundStatus.roundId !== currentRoundId) {
            // Sync new round start time and ID
            localStorage.setItem(
              "gameStartTime",
              new Date(roundStatus.roundStartTime).getTime().toString()
            );
            localStorage.setItem("roundId", roundStatus.roundId);
            router.push("/engine");
            return;
          }
        }

        if (attempts >= MAX_ATTEMPTS) {
          setStatus("gameover");
          setWaitMsg("The host has ended the game. Check the leaderboard!");
          return;
        }

        // Keep polling
        setTimeout(poll, 3000);
      } catch {
        setTimeout(poll, 5000);
      }
    };

    poll();
  }, [router]);

  // After a correct answer, wait for the admin to start the next round.
  useEffect(() => {
    if (status !== "success") return;

    if (NEXT_ROUND_WAIT === 0) {
      const timeout = setTimeout(pollForNextRound, 0);
      return () => clearTimeout(timeout);
    }

    let secondsLeft = NEXT_ROUND_WAIT;
    setCountdown(secondsLeft);
    setWaitMsg("Get ready for the next mission...");

    const interval = setInterval(() => {
      secondsLeft -= 1;
      setCountdown(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(interval);
        pollForNextRound();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pollForNextRound, status]);

  useEffect(() => {
    const teamId = localStorage.getItem("teamId");
    const roundId = localStorage.getItem("roundId");
    if (!teamId || !roundId) return;

    getRoundTimeRemainingAction()
      .then((roundStatus) => {
        if (roundStatus.active && roundStatus.roundId === roundId && roundStatus.secondsLeft <= 0) {
          return finalizeTimeoutAction(teamId, roundId);
        }
        return null;
      })
      .catch((error) => console.error("Timeout finalization error:", error));
  }, []);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!answer.trim() || status === "success" || status === "waiting") return;

    setStatus("loading");

    try {
      const teamId = localStorage.getItem("teamId");
      const roundId = localStorage.getItem("roundId");
      const clientStartTime = parseInt(localStorage.getItem("gameStartTime") || "0", 10);

      const result = await submitAnswerAction(teamId, roundId, answer.trim(), clientStartTime);

      if (result.correct) {
        setFinalTime(result.timeString || "??:??");
        setFinalScore(result.score || 0);
        setStatus("success");
      } else if (result.timedOut) {
        setFinalTime(result.timeString || "05:00");
        setFinalScore(0);
        setStatus("gameover");
      } else {
        setErrorMsg(result.message || "ACCESS DENIED. TRY AGAIN.");
        setStatus("error");
        setAnswer("");
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Try again.");
      setStatus("error");
    }
  };

  const isSubmittable = !["success", "loading", "waiting", "gameover"].includes(status);

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
        <div
          className={`w-full bg-spacePanel/95 border-4 rounded-3xl p-6 sm:p-10 shadow-comicLg backdrop-blur-md transition-colors duration-300 ${
            status === "success" || status === "waiting"
              ? "border-crewLime shadow-[0_0_30px_rgba(80,239,57,0.4)]"
              : status === "error"
              ? "border-crewRed"
              : status === "gameover"
              ? "border-crewYellow"
              : "border-black"
          }`}
        >
          {/* Status Banner */}
          <div className="h-16 mb-4 flex items-center justify-center">
            {status === "idle" && (
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
                ❌ {errorMsg}
              </p>
            )}
            {status === "success" && (
              <p className="text-crewLime font-black uppercase tracking-widest text-xl md:text-2xl drop-shadow-[0_0_10px_rgba(80,239,57,0.8)]">
                ✅ OVERRIDE ACCEPTED
              </p>
            )}
            {status === "waiting" && (
              <p className="text-crewCyan font-black uppercase tracking-widest text-base animate-pulse">
                🔍 {waitMsg}
              </p>
            )}
            {status === "gameover" && (
              <p className="text-crewYellow font-black uppercase tracking-widest text-xl">
                🏁 MISSION COMPLETE — GAME OVER
              </p>
            )}
          </div>

          {/* Input + Button (only while submittable) */}
          {isSubmittable && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={!isSubmittable}
                  placeholder="TYPE CODE HERE"
                  className={`w-full text-center font-black text-2xl md:text-4xl px-6 py-6 rounded-2xl border-4 transition-all duration-300 uppercase tracking-widest placeholder-gray-600 focus:outline-none ${
                    status === "error"
                      ? "bg-red-900/30 text-white border-crewRed"
                      : "bg-gray-900 text-white border-black shadow-inner focus:border-crewCyan focus:shadow-[0_0_15px_rgba(56,254,220,0.5)]"
                  }`}
                />
              </div>
              <button
                type="submit"
                disabled={!answer.trim()}
                className="w-full bg-crewRed hover:bg-red-500 active:translate-y-0.5 text-black font-black text-2xl py-5 rounded-2xl border-4 border-black shadow-comic transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                SUBMIT CODE
              </button>
            </form>
          )}

          {/* Success Summary */}
          {(status === "success" || status === "waiting") && (
            <div className="mt-6 p-6 bg-black border-4 border-crewLime rounded-2xl animate-in fade-in duration-500 space-y-4">
              <h2 className="text-white font-extrabold text-2xl md:text-3xl uppercase tracking-tight">
                MISSION ACCOMPLISHED!
              </h2>
              <div className="flex justify-center gap-6 flex-wrap">
                <div className="text-center">
                  <p className="text-gray-400 text-xs uppercase font-bold mb-1">Time</p>
                  <span className="text-crewLime font-mono font-black text-4xl tracking-widest">
                    {finalTime}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs uppercase font-bold mb-1">Score</p>
                  <span className="text-crewYellow font-mono font-black text-4xl tracking-widest">
                    {finalScore}
                  </span>
                </div>
              </div>

              {status === "success" && (
                <div className="bg-gray-900 border-2 border-crewCyan rounded-xl p-4">
                  <p className="text-crewCyan font-black uppercase text-lg animate-pulse">
                    Next mission in {countdown}s...
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Stay on this page</p>
                </div>
              )}
              {status === "waiting" && (
                <div className="bg-gray-900 border-2 border-crewCyan rounded-xl p-4">
                  <p className="text-crewCyan font-black uppercase text-sm animate-pulse">
                    🔍 {waitMsg}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Game Over */}
          {status === "gameover" && (
            <div className="mt-6 p-6 bg-black border-4 border-crewYellow rounded-2xl animate-in fade-in duration-500 text-center space-y-3">
              <p className="text-4xl">🏆</p>
              <h2 className="text-crewYellow font-extrabold text-2xl uppercase tracking-tight">
                All Missions Complete!
              </h2>
              <p className="text-gray-400 text-sm font-bold uppercase">
                The host will announce final results. Well played, crew!
              </p>
              <div className="flex justify-center gap-4 pt-2 flex-wrap text-center">
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold mb-1">Your Final Time</p>
                  <span className="text-crewLime font-mono font-black text-3xl">{finalTime}</span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase font-bold mb-1">Your Score</p>
                  <span className="text-crewYellow font-mono font-black text-3xl">{finalScore}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}