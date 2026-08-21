"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Starfield from "../../../components/Starfield";

export default function AdminPanel() {
  const router = useRouter();
  
  // Game states: 'waiting', 'running', 'paused'
  const [gameState, setGameState] = useState("waiting");
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);
  const [message, setMessage] = useState("");

  const getPasskey = () => {
    return typeof window !== "undefined" ? sessionStorage.getItem("admin_passkey") || "" : "";
  };

  const fetchStatusAndTeams = async () => {
    try {
      const passkey = getPasskey();
      const statusRes = await fetch("/api/round/status");
      const statusData = await statusRes.json();
      if (statusData.success) {
        if (statusData.active && statusData.gameState === "running") {
          setGameState("running");
        } else {
          setGameState("waiting");
        }
      }

      const teamsRes = await fetch("/api/admin/teams", {
        headers: { "x-admin-passkey": passkey }
      });
      const teamsData = await teamsRes.json();
      if (teamsData.success && Array.isArray(teamsData.teams)) {
        setTeams(teamsData.teams);
      }
    } catch (err) {
      console.error("Failed to sync admin data:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const syncData = async () => {
      try {
        const passkey = getPasskey();
        const statusRes = await fetch("/api/round/status");
        const statusData = await statusRes.json();
        if (isMounted && statusData.success) {
          if (statusData.active && statusData.gameState === "running") {
            setGameState("running");
          } else {
            setGameState("waiting");
          }
        }

        const teamsRes = await fetch("/api/admin/teams", {
          headers: { "x-admin-passkey": passkey }
        });
        const teamsData = await teamsRes.json();
        if (isMounted && teamsData.success && Array.isArray(teamsData.teams)) {
          setTeams(teamsData.teams);
        }
      } catch (err) {
        console.error("Failed to sync admin data:", err);
      }
    };

    syncData();
    const interval = setInterval(syncData, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const updateGameState = async (newState) => {
    setLoading(true);
    setMessage("");
    try {
      const passkey = getPasskey();
      let res;
      if (newState === "running") {
        res = await fetch("/api/admin/start-round", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-passkey": passkey
          },
          body: JSON.stringify({ expected_answer: "ALIEN" })
        });
      } else {
        res = await fetch("/api/admin/lock-round", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-passkey": passkey
          }
        });
      }

      const data = await res.json();
      if (data.success) {
        setGameState(newState);
        setMessage(`Status updated to ${newState.toUpperCase()}`);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to update game state:", error);
      setMessage("Failed to update game state");
    } finally {
      setLoading(false);
      fetchStatusAndTeams();
    }
  };

  const handleUnlockTeam = async (teamId) => {
    const passkey = getPasskey();
    try {
      const res = await fetch("/api/admin/unlock-team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passkey": passkey
        },
        body: JSON.stringify({ team_id: teamId })
      });
      const data = await res.json();
      if (data.success) {
        alert("Team answer field unlocked successfully!");
        fetchStatusAndTeams();
      } else {
        alert(data.error || "Failed to unlock team");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  const handleEditTime = async (teamId) => {
    const newTime = prompt("Enter new time in seconds for this team:");
    if (newTime === null || isNaN(Number(newTime))) return;

    const passkey = getPasskey();
    try {
      const res = await fetch("/api/admin/edit-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passkey": passkey
        },
        body: JSON.stringify({ team_id: teamId, new_time: Number(newTime), new_score: 100 })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Team time updated to ${newTime}s`);
        fetchStatusAndTeams();
      } else {
        alert(data.error || "Failed to edit time");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_passkey");
    }
    router.push("/admin");
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center p-4 pt-12 pb-10">
      <Starfield />

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        
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

          {message && (
            <p className="mt-3 text-sm font-bold text-crewCyan uppercase tracking-wider">{message}</p>
          )}
        </div>

        {/* Control Buttons Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Start / Resume Button */}
          <button
            onClick={() => updateGameState("running")}
            disabled={loading || gameState === "running"}
            className="group relative w-full bg-crewLime hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-500 active:translate-x-0.5 active:translate-y-0.5 active:shadow-comicHover text-black font-black text-xl py-6 rounded-2xl border-4 border-black shadow-comic transition-all uppercase tracking-wider overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            {gameState === "paused" ? "RESUME MISSION" : "START MISSION"}
          </button>

          {/* Pause / Lock Button */}
          <button
            onClick={() => updateGameState("paused")}
            disabled={loading || gameState === "paused" || gameState === "waiting"}
            className="w-full bg-crewOrange hover:bg-orange-400 disabled:bg-gray-700 disabled:text-gray-500 active:translate-x-0.5 active:translate-y-0.5 active:shadow-comicHover text-black font-black text-xl py-6 rounded-2xl border-4 border-black shadow-comic transition-all uppercase tracking-wider"
          >
            PAUSE / LOCK TIMERS
          </button>

          {/* Reset System to Lobby */}
          <button
            onClick={() => {
              if (confirm("DANGER: This will lock the round and reset the game state to 'Waiting'. Are you sure?")) {
                updateGameState("waiting");
              }
            }}
            disabled={loading || gameState === "waiting"}
            className="md:col-span-2 w-full bg-crewRed hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-600 active:translate-x-0.5 active:translate-y-0.5 active:shadow-comicHover text-black font-black text-xl py-4 rounded-2xl border-4 border-black shadow-comic transition-all uppercase tracking-wider flex items-center justify-center gap-2"
          >
            RESET SYSTEM TO LOBBY
          </button>
        </div>

        {/* Registered Teams & Overrides Panel */}
        <div className="w-full bg-gray-900 border-4 border-black rounded-3xl p-6 shadow-comic">
          <h2 className="text-xl font-black text-crewYellow uppercase tracking-wider mb-4 flex items-center gap-2">
            👥 Registered Crews ({teams.length})
          </h2>

          {teams.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No teams registered yet.</p>
          ) : (
            <div className="space-y-3">
              {teams.map((t) => (
                <div key={t.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-800 border-2 border-black rounded-xl p-3 gap-3">
                  <div>
                    <span className="font-extrabold text-white text-base">{t.team_name}</span>
                    <p className="text-xs text-gray-400">
                      Members: {Array.isArray(t.member_names) ? t.member_names.join(", ") : t.member_names}
                    </p>
                    <p className="text-xs font-mono text-crewCyan mt-1">
                      Status: {t.is_completed ? `✅ Completed (${t.time_taken}s)` : "⏳ In Progress / Pending"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUnlockTeam(t.id)}
                      className="bg-crewCyan hover:bg-cyan-300 text-black font-bold text-xs px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]"
                    >
                      🔓 Unlock Field
                    </button>
                    <button
                      onClick={() => handleEditTime(t.id)}
                      className="bg-crewYellow hover:bg-yellow-300 text-black font-bold text-xs px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]"
                    >
                      ⏱️ Edit Time
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}