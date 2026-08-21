"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Starfield from "../../../components/Starfield";

const ROUND_DURATION = 300; // 5 minutes in seconds
const BETWEEN_DURATION = 30; // 30 seconds between rounds
const TOTAL_ROUNDS = 5;
const POLL_INTERVAL = 2000;

export default function AdminPanel() {
  const router = useRouter();
  const [passkey, setPasskey] = useState("");
  const [status, setStatus] = useState(null); // round status from API
  const [teams, setTeams] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState({});
  const [message, setMessage] = useState("");
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [betweenCountdown, setBetweenCountdown] = useState(0);
  const autoRef = useRef(false);
  const betweenTimerRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const baseElapsedRef = useRef(0);
  const receivedAtRef = useRef(null);
  const lockTriggeredRef = useRef(false);

  // Load passkey from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("admin_passkey");
    if (!stored) {
      router.push("/admin");
      return;
    }
    setPasskey(stored);
  }, [router]);

  const apiCall = useCallback(async (url, method = "POST", body = {}) => {
    const stored = sessionStorage.getItem("admin_passkey");
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-passkey": stored || passkey,
      },
      body: method !== "GET" ? JSON.stringify({ ...body, passkey: stored || passkey }) : undefined,
    });
    return res.json();
  }, [passkey]);

  // Poll round status and teams
  const refreshStatus = useCallback(async () => {
    try {
      const statusData = await apiCall("/api/round/status", "GET");
      setStatus(statusData);
      if (statusData.active && typeof statusData.elapsedSeconds === "number") {
        baseElapsedRef.current = statusData.elapsedSeconds;
        receivedAtRef.current = Date.now();
        setElapsed(statusData.elapsedSeconds);
      } else {
        baseElapsedRef.current = 0;
        receivedAtRef.current = null;
        setElapsed(0);
      }

      const teamsData = await apiCall("/api/admin/teams", "GET");
      if (teamsData.success) setTeams(teamsData.teams || []);
    } catch (err) {
      console.error("Refresh error:", err);
    }
  }, [apiCall]);

  // Initial load + polling
  useEffect(() => {
    if (!passkey) return;
    refreshStatus();
    const interval = setInterval(refreshStatus, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [passkey, refreshStatus]);

  // Elapsed timer (ticks every second when round is active)
  useEffect(() => {
    clearInterval(elapsedTimerRef.current);
    if (status?.active && receivedAtRef.current !== null) {
      const tick = () => {
        const localPassed = Math.floor((Date.now() - receivedAtRef.current) / 1000);
        setElapsed(baseElapsedRef.current + Math.max(0, localPassed));
      };
      tick();
      elapsedTimerRef.current = setInterval(tick, 1000);
    } else {
      setElapsed(0);
      lockTriggeredRef.current = false; // Reset lock trigger when not active
    }
    return () => clearInterval(elapsedTimerRef.current);
  }, [status?.active]);

  // Auto-advance logic
  useEffect(() => {
    autoRef.current = autoAdvance;
  }, [autoAdvance]);

  // Watch elapsed — auto-lock at 5 min
  useEffect(() => {
    if (!autoRef.current || !status?.active || lockTriggeredRef.current) return;
    if (elapsed >= ROUND_DURATION) {
      lockTriggeredRef.current = true;
      handleLockRound(true);
    }
  }, [elapsed, status?.active]);

  const showMessage = (msg, isError = false) => {
    setMessage(isError ? `❌ ${msg}` : `✅ ${msg}`);
    setTimeout(() => setMessage(""), 4000);
  };

  const setLoad = (key, val) => setLoading(l => ({ ...l, [key]: val }));

  const handleUnlockTeam = async (teamId) => {
    if (!confirm("Unlock this team so they can submit again?")) return;
    setLoad(`unlock-${teamId}`, true);
    try {
      const data = await apiCall("/api/admin/unlock-team", "POST", { team_id: teamId });
      if (data.success) {
        showMessage(`Team unlocked!`);
        await refreshStatus();
      } else {
        showMessage(data.error || "Failed to unlock team", true);
      }
    } finally {
      setLoad(`unlock-${teamId}`, false);
    }
  };

  const handleEditTime = async (teamId, currentTime) => {
    const newTime = prompt("Enter new time taken in seconds (e.g., add penalty):", currentTime || 0);
    if (newTime === null) return;
    const timeNum = parseInt(newTime, 10);
    if (isNaN(timeNum)) return showMessage("Invalid time", true);
    
    setLoad(`edit-${teamId}`, true);
    try {
      const data = await apiCall("/api/admin/edit-time", "POST", { team_id: teamId, new_time: timeNum });
      if (data.success) {
        showMessage(`Team time updated!`);
        await refreshStatus();
      } else {
        showMessage(data.error || "Failed to edit time", true);
      }
    } finally {
      setLoad(`edit-${teamId}`, false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this team? This action cannot be undone.")) return;
    setLoad(`delete-${teamId}`, true);
    try {
      const data = await apiCall("/api/admin/delete-team", "POST", { team_id: teamId });
      if (data.success) {
        showMessage(`Team deleted!`);
        await refreshStatus();
      } else {
        showMessage(data.error || "Failed to delete team", true);
      }
    } finally {
      setLoad(`delete-${teamId}`, false);
    }
  };

  const handleStartRound = async (roundNum) => {
    setLoad("start", true);
    try {
      const data = await apiCall("/api/admin/start-round", "POST", { round_number: roundNum });
      if (data.success) {
        showMessage(`Round ${roundNum} started!`);
        await refreshStatus();
        if (autoRef.current && roundNum < TOTAL_ROUNDS) {
          // Auto-lock timer already set up via elapsed watcher
        }
      } else {
        showMessage(data.error || "Failed to start round", true);
      }
    } finally {
      setLoad("start", false);
    }
  };

  const handleLockRound = async (isAuto = false) => {
    if (loading.lock) return; // Prevent multiple clicks/triggers
    if (!status?.round?.id && !isAuto) return;
    setLoad("lock", true);
    try {
      const round_id = status?.round?.id;
      const data = await apiCall("/api/admin/lock-round", "POST", { round_id });
      if (data.success) {
        showMessage("Round locked/paused.");
        await refreshStatus();

        if (autoRef.current) {
          const currentNum = status?.round?.round_number || 1;
          if (currentNum < TOTAL_ROUNDS) {
            // Start 30s between-rounds countdown
            let remaining = BETWEEN_DURATION;
            setBetweenCountdown(remaining);
            clearInterval(betweenTimerRef.current);
            betweenTimerRef.current = setInterval(async () => {
              remaining -= 1;
              setBetweenCountdown(remaining);
              if (remaining <= 0) {
                clearInterval(betweenTimerRef.current);
                setBetweenCountdown(0);
                if (autoRef.current) {
                  await handleStartRound(currentNum + 1);
                }
              }
            }, 1000);
          } else {
            showMessage("All 5 rounds complete! Game over.");
          }
        }
      } else {
        showMessage(data.error || "Failed to lock round", true);
        lockTriggeredRef.current = false; // Reset on failure
      }
    } finally {
      setLoad("lock", false);
    }
  };

  const handleResetToLobby = async () => {
    if (!confirm("Reset system to lobby? This clears all submissions for the current round.")) return;
    setLoad("reset", true);
    clearInterval(betweenTimerRef.current);
    setBetweenCountdown(0);
    setAutoAdvance(false);
    try {
      const round_id = status?.round?.id;
      const data = await apiCall("/api/admin/reset-to-lobby", "POST", { round_id });
      if (data.success) {
        showMessage("System reset to lobby!");
        await refreshStatus();
      } else {
        showMessage(data.error || "Failed to reset", true);
      }
    } finally {
      setLoad("reset", false);
    }
  };

  const formatTime = (s) => {
    const safe = Math.max(0, s);
    return `${Math.floor(safe / 60).toString().padStart(2, "0")}:${(safe % 60).toString().padStart(2, "0")}`;
  };

  const currentRoundNum = status?.round?.round_number || 0;
  const isRunning = status?.active === true;
  const isGameOver = status?.gameState === "game_over";
  const isBetween = status?.gameState === "between_rounds";
  const remainingTime = Math.max(0, ROUND_DURATION - elapsed);

  return (
    <main className="min-h-screen relative flex flex-col items-center p-4 py-8">
      <Starfield />
      <div className="relative z-10 w-full max-w-5xl space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="inline-block bg-crewRed text-black border-4 border-black px-6 py-2 rounded-full font-black text-xl tracking-wider uppercase shadow-comic mb-2">
            🔒 Admin Command Center
          </div>
          <h1 className="text-4xl font-extrabold text-white drop-shadow-[2px_2px_0px_#000]">
            ROUND CONTROL PANEL
          </h1>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`text-center font-black text-lg py-3 px-6 rounded-2xl border-4 border-black ${message.startsWith("❌") ? "bg-crewRed/20 text-red-300" : "bg-crewLime/20 text-green-300"}`}>
            {message}
          </div>
        )}

        {/* Status Panel */}
        <div className="bg-spacePanel/95 border-4 border-black rounded-3xl p-6 shadow-comicLg">
          <h2 className="text-crewCyan font-black text-xl uppercase tracking-widest mb-4">📡 Current Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 border-2 border-black rounded-2xl p-4 text-center">
              <p className="text-gray-400 text-xs uppercase font-bold mb-1">Game State</p>
              <p className={`font-black text-lg ${isRunning ? "text-crewLime" : isGameOver ? "text-crewRed" : isBetween ? "text-crewYellow" : "text-gray-300"}`}>
                {isRunning ? "🟢 RUNNING" : isGameOver ? "🏁 GAME OVER" : isBetween ? "⏳ BETWEEN" : "⏸ WAITING"}
              </p>
            </div>
            <div className="bg-gray-800 border-2 border-black rounded-2xl p-4 text-center">
              <p className="text-gray-400 text-xs uppercase font-bold mb-1">Round</p>
              <p className="font-black text-lg text-white">
                {isRunning ? `${currentRoundNum} / ${TOTAL_ROUNDS}` : isBetween ? `${status?.currentRoundNumber} → ${status?.nextRoundNumber}` : "—"}
              </p>
            </div>
            <div className="bg-gray-800 border-2 border-black rounded-2xl p-4 text-center">
              <p className="text-gray-400 text-xs uppercase font-bold mb-1">Elapsed</p>
              <p className={`font-mono font-black text-xl ${elapsed > 240 ? "text-crewRed animate-pulse" : "text-crewCyan"}`}>
                {isRunning ? formatTime(elapsed) : "—"}
              </p>
            </div>
            <div className="bg-gray-800 border-2 border-black rounded-2xl p-4 text-center">
              <p className="text-gray-400 text-xs uppercase font-bold mb-1">Time Left</p>
              <p className={`font-mono font-black text-xl ${remainingTime < 30 ? "text-crewRed animate-pulse" : "text-crewYellow"}`}>
                {isRunning ? formatTime(remainingTime) : betweenCountdown > 0 ? `${betweenCountdown}s` : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-spacePanel/95 border-4 border-black rounded-3xl p-6 shadow-comicLg">
          <h2 className="text-crewYellow font-black text-xl uppercase tracking-widest mb-4">⚡ Actions</h2>

          {/* Round Selector + Start */}
          <div className="mb-4">
            <p className="text-gray-400 text-sm font-bold uppercase mb-2">Start a Specific Round:</p>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => handleStartRound(n)}
                  disabled={loading.start || isRunning}
                  className="px-4 py-2 bg-crewLime hover:bg-green-400 text-black font-black rounded-xl border-4 border-black shadow-comic transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase"
                >
                  {loading.start ? "..." : `▶ Round ${n}`}
                </button>
              ))}
            </div>
          </div>

          {/* Main Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleLockRound(false)}
              disabled={!isRunning || loading.lock}
              className="py-4 bg-crewYellow hover:bg-yellow-400 text-black font-black rounded-2xl border-4 border-black shadow-comic transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wide"
            >
              {loading.lock ? "⏳ Locking..." : "⏸ Pause / Lock Round"}
            </button>

            <button
              onClick={handleResetToLobby}
              disabled={loading.reset}
              className="py-4 bg-crewRed hover:bg-red-500 text-black font-black rounded-2xl border-4 border-black shadow-comic transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wide"
            >
              {loading.reset ? "⏳ Resetting..." : "🔄 Reset to Lobby"}
            </button>
          </div>

          {/* Auto-advance toggle */}
          <div className="mt-4 flex items-center gap-4 bg-gray-800 border-2 border-black rounded-2xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setAutoAdvance(a => !a)}
                className={`w-14 h-7 rounded-full border-2 border-black transition-colors relative cursor-pointer ${autoAdvance ? "bg-crewLime" : "bg-gray-600"}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white border-2 border-black rounded-full transition-transform ${autoAdvance ? "translate-x-7" : "translate-x-0.5"}`} />
              </div>
              <span className="text-white font-black uppercase tracking-wider">
                Auto-Advance {autoAdvance ? "ON" : "OFF"}
              </span>
            </label>
            {autoAdvance && (
              <span className="text-crewYellow text-sm font-bold">
                {betweenCountdown > 0
                  ? `Next round in ${betweenCountdown}s...`
                  : isRunning
                  ? `Auto-locks at 5:00`
                  : "Waiting for round start"}
              </span>
            )}
          </div>
        </div>

        {/* Teams Table */}
        <div className="bg-spacePanel/95 border-4 border-black rounded-3xl p-6 shadow-comicLg">
          <h2 className="text-crewCyan font-black text-xl uppercase tracking-widest mb-4">👥 Teams ({teams.length})</h2>
          {teams.length === 0 ? (
            <p className="text-gray-500 font-bold text-center py-4">No teams registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 uppercase tracking-widest text-xs border-b-2 border-black">
                    <th className="text-left pb-2 pr-4">Team</th>
                    <th className="text-center pb-2 pr-4">Members</th>
                    <th className="text-center pb-2 pr-4">Status</th>
                    <th className="text-right pb-2 pr-4">Time</th>
                    <th className="text-center pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {teams.map(team => (
                    <tr key={team.id} className="py-2">
                      <td className="py-2 pr-4 font-bold text-white">{team.team_name}</td>
                      <td className="py-2 pr-4 text-gray-400 text-center">{(team.member_names || []).length}</td>
                      <td className="py-2 pr-4 text-center">
                        {team.is_completed
                          ? <span className="text-crewLime font-bold">✅ Done</span>
                          : isRunning
                          ? <span className="text-crewYellow font-bold">⏳ Playing</span>
                          : <span className="text-gray-500">—</span>}
                      </td>
                      <td className="py-2 pr-4 text-right font-mono text-crewCyan">
                        {team.time_taken != null ? formatTime(team.time_taken) : "—"}
                      </td>
                      <td className="py-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleUnlockTeam(team.id)}
                            disabled={loading[`unlock-${team.id}`] || (!team.is_completed && !isGameOver)}
                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded border border-gray-600 disabled:opacity-50"
                          >
                            {loading[`unlock-${team.id}`] ? "..." : "Unlock"}
                          </button>
                          <button
                            onClick={() => handleEditTime(team.id, team.time_taken)}
                            disabled={loading[`edit-${team.id}`]}
                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded border border-gray-600 disabled:opacity-50"
                          >
                            {loading[`edit-${team.id}`] ? "..." : "Edit Time"}
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(team.id)}
                            disabled={loading[`delete-${team.id}`]}
                            className="px-2 py-1 bg-red-900 hover:bg-red-800 text-white text-xs font-bold rounded border border-red-700 disabled:opacity-50"
                          >
                            {loading[`delete-${team.id}`] ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Game Over Banner */}
        {isGameOver && (
          <div className="bg-crewYellow/20 border-4 border-crewYellow rounded-3xl p-8 text-center shadow-comicLg">
            <p className="text-crewYellow font-black text-4xl uppercase tracking-widest animate-pulse">
              🏆 GAME OVER 🏆
            </p>
            <p className="text-gray-300 font-bold mt-2">All 5 rounds completed. Check the leaderboard!</p>
          </div>
        )}

        {/* Leaderboard Link */}
        <div className="text-center">
          <a href="/leaderboard" target="_blank" className="inline-block bg-crewCyan text-black font-black uppercase px-6 py-3 rounded-2xl border-4 border-black shadow-comic hover:bg-cyan-400 transition-all">
            📊 Open Leaderboard
          </a>
        </div>
      </div>
    </main>
  );
}
