"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Starfield from "../../components/Starfield";
import { checkRoundStatusAction } from "../actions/useraction";

export default function RulesPage() {
  const router = useRouter();
  const [dots, setDots] = useState("");
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([]);
  const [checking, setChecking] = useState(false);

  // Animated loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Load team info from localStorage
  useEffect(() => {
    setTeamName(localStorage.getItem("teamName") || "");
    try {
      setMembers(JSON.parse(localStorage.getItem("members") || "[]"));
    } catch {
      setMembers([]);
    }
  }, []);

  // Poll Supabase every 3s to see if admin started the round
  const pollRoundStatus = useCallback(async () => {
    if (checking) return;
    setChecking(true);
    try {
      const status = await checkRoundStatusAction();
      if (status.active && status.roundStartTime) {
        // Sync gameStartTime with server round_start_time
        localStorage.setItem(
          "gameStartTime",
          new Date(status.roundStartTime).getTime().toString()
        );
        localStorage.setItem("roundId", status.roundId);
        router.push("/engine");
      }
    } catch (err) {
      console.error("Poll error:", err);
    } finally {
      setChecking(false);
    }
  }, [checking, router]);

  useEffect(() => {
    const interval = setInterval(pollRoundStatus, 3000);
    return () => clearInterval(interval);
  }, [pollRoundStatus]);

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4">
      <Starfield />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header Badge */}
        <div className="text-center mb-6">
          <div className="inline-block bg-crewYellow text-black border-4 border-black px-6 py-2 rounded-full font-black text-xl tracking-wider uppercase shadow-comic mb-2">
            📋 Mission Briefing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-[2px_2px_0px_#000]">
            READ CAREFULLY
          </h1>
        </div>

        {/* Team badge */}
        {teamName && (
          <div className="text-center mb-4">
            <span className="inline-block bg-crewCyan text-black border-2 border-black px-4 py-1 rounded-full font-black text-sm uppercase tracking-wider">
              🚀 Ship: {teamName}
            </span>
            {members.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {members.map((m, i) => (
                  <span key={i} className="bg-gray-800 text-gray-200 border border-gray-600 px-3 py-0.5 rounded-full text-xs font-bold">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Panel Box */}
        <div className="bg-spacePanel/95 border-4 border-black rounded-3xl p-6 sm:p-8 shadow-comicLg backdrop-blur-sm">
          <div className="space-y-6 text-gray-200 font-medium text-lg leading-relaxed">
            {/* Rule 1 */}
            <div className="flex items-start gap-4">
              <div className="mt-1 w-6 h-6 shrink-0 bg-crewRed border-2 border-black rounded-full shadow-comicHover" />
              <p>
                <strong className="text-white">Navigation is Key:</strong> You will be given a series of clues. Solve the current clue to unlock the path to the next sector.
              </p>
            </div>

            {/* Rule 2 */}
            <div className="flex items-start gap-4">
              <div className="mt-1 w-6 h-6 shrink-0 bg-crewCyan border-2 border-black rounded-full shadow-comicHover" />
              <p>
                <strong className="text-white">Beat the Clock:</strong> The timer starts the moment the host begins the game. Your team&apos;s total completion time determines your rank on the leaderboard.
              </p>
            </div>

            {/* Rule 3 */}
            <div className="flex items-start gap-4">
              <div className="mt-1 w-6 h-6 shrink-0 bg-crewLime border-2 border-black rounded-full shadow-comicHover" />
              <p>
                <strong className="text-white">One Submission per Team:</strong> Discuss the answer with your crewmates. Only one person needs to submit the answer for the whole team to progress.
              </p>
            </div>

            {/* Rule 4 */}
            <div className="flex items-start gap-4">
              <div className="mt-1 w-6 h-6 shrink-0 bg-crewYellow border-2 border-black rounded-full shadow-comicHover" />
              <p>
                <strong className="text-white">No Sabotage:</strong> Keep your answers secure. Helping other crews or sharing passcodes will result in immediate ejection into the vacuum of space.
              </p>
            </div>
          </div>

          <hr className="my-8 border-t-4 border-black border-dashed opacity-50" />

          {/* Waiting Status */}
          <div className="bg-gray-900 border-4 border-black rounded-2xl p-6 text-center shadow-inner">
            <h2 className="text-2xl font-black tracking-widest text-crewCyan animate-pulse uppercase">
              Waiting for Host to Start{dots}
            </h2>
            <p className="text-gray-500 text-sm mt-2 font-bold uppercase tracking-wider">
              Do not refresh this page. The mission will begin automatically.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}