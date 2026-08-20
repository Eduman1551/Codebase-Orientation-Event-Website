"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  startRoundAction,
  lockRoundAction,
  getAdminDashboardDataAction,
  resetTeamSubmissionAction,
  editTeamTimeAction,
} from "../../actions/adminaction";

export default function AdminActionPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Selected round for starting
  const [selectedRoundId, setSelectedRoundId] = useState("");

  // Edit time state
  const [editState, setEditState] = useState({}); // { [teamId+roundId]: newTime }

  const fetchData = useCallback(async () => {
    try {
      const result = await getAdminDashboardDataAction();
      setData(result);
      if (!selectedRoundId && result.rounds?.length > 0) {
        setSelectedRoundId(result.rounds[0].id);
      }
    } catch (err) {
      if (err.message?.includes("NEXT_REDIRECT")) {
        router.push("/adminlogin");
      } else {
        setMsg("Error loading data: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [router, selectedRoundId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const flash = (message) => {
    setMsg(message);
    setTimeout(() => setMsg(""), 4000);
  };

  const handleStartRound = async () => {
    if (!selectedRoundId) {
      flash("⚠️ Select a round first.");
      return;
    }
    setActionLoading(true);
    const res = await startRoundAction(selectedRoundId);
    setActionLoading(false);
    if (res?.success) {
      flash("✅ Round started! Teams will be redirected automatically.");
      fetchData();
    } else {
      flash("❌ Error: " + (res?.error || "Unknown error"));
    }
  };

  const handleLockRound = async (roundId) => {
    setActionLoading(true);
    const res = await lockRoundAction(roundId);
    setActionLoading(false);
    if (res?.success) {
      flash("🔒 Round locked.");
      fetchData();
    } else {
      flash("❌ Error: " + (res?.error || "Unknown error"));
    }
  };

  const handleResetSubmission = async (teamId, roundId) => {
    setActionLoading(true);
    const res = await resetTeamSubmissionAction(teamId, roundId);
    setActionLoading(false);
    if (res?.success) {
      flash("🔄 Submission reset.");
      fetchData();
    } else {
      flash("❌ Error: " + (res?.error || "Unknown error"));
    }
  };

  const handleEditTime = async (teamId, roundId, key) => {
    const newTime = editState[key];
    if (!newTime || isNaN(parseInt(newTime))) {
      flash("⚠️ Enter a valid number of seconds.");
      return;
    }
    setActionLoading(true);
    const res = await editTeamTimeAction(teamId, roundId, newTime);
    setActionLoading(false);
    if (res?.success) {
      flash("✏️ Time updated.");
      setEditState((prev) => ({ ...prev, [key]: "" }));
      fetchData();
    } else {
      flash("❌ Error: " + (res?.error || "Unknown error"));
    }
  };

  const fmtTime = (secs) => {
    if (secs == null) return "—";
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white text-xl animate-pulse">Loading dashboard...</p>
      </main>
    );
  }

  const { teams = [], rounds = [], leaderboard = [], submissionsMap = {} } = data || {};
  const activeRound = rounds.find((r) => !r.is_locked);

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-widest uppercase text-crewYellow drop-shadow">
              🛸 Admin Mission Control
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {activeRound ? `🟢 Active Round: Round ${activeRound.round_number}` : "🔴 No active round"}
            </p>
          </div>
          <button
            onClick={fetchData}
            className="bg-slate-700 hover:bg-slate-600 border border-slate-500 px-4 py-2 rounded-lg text-sm font-bold"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Flash message */}
        {msg && (
          <div className="bg-slate-800 border border-crewCyan text-crewCyan px-4 py-3 rounded-xl font-bold text-sm">
            {msg}
          </div>
        )}

        {/* ── Round Control ── */}
        <section className="bg-slate-800 border-2 border-slate-600 rounded-2xl p-6">
          <h2 className="text-xl font-black uppercase tracking-widest mb-4 text-crewCyan">
            🎮 Round Control
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Select Round</label>
              <select
                value={selectedRoundId}
                onChange={(e) => setSelectedRoundId(e.target.value)}
                className="w-full bg-slate-700 border border-slate-500 rounded-lg px-3 py-2 text-white"
              >
                {rounds.map((r) => (
                  <option key={r.id} value={r.id}>
                    Round {r.round_number} {r.is_locked ? "🔒" : "🟢"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleStartRound}
                disabled={actionLoading}
                className="w-full bg-crewLime hover:bg-green-400 text-black font-black py-2 rounded-lg border-2 border-black uppercase tracking-wider disabled:opacity-50"
              >
                🚀 Start Round
              </button>
            </div>
          </div>

          {/* Lock buttons per round */}
          <div className="flex flex-wrap gap-3">
            {rounds.map((r) => (
              <button
                key={r.id}
                onClick={() => handleLockRound(r.id)}
                disabled={r.is_locked || actionLoading}
                className="bg-crewRed hover:bg-red-600 text-black font-bold px-4 py-2 rounded-lg border-2 border-black text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                🔒 Lock Round {r.round_number}
              </button>
            ))}
          </div>
        </section>

        {/* ── Live Leaderboard ── */}
        <section className="bg-slate-800 border-2 border-slate-600 rounded-2xl p-6">
          <h2 className="text-xl font-black uppercase tracking-widest mb-4 text-crewYellow">
            🏆 Leaderboard
          </h2>
          {leaderboard.length === 0 ? (
            <p className="text-slate-400 text-sm">No submissions yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs uppercase border-b border-slate-600">
                  <th className="text-left py-2 px-2">#</th>
                  <th className="text-left py-2 px-2">Team</th>
                  <th className="text-right py-2 px-2">Score</th>
                  <th className="text-right py-2 px-2">Total Time</th>
                  <th className="text-right py-2 px-2">Rounds Done</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr key={entry.team_name} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-2 px-2 font-black text-crewYellow">{i + 1}</td>
                    <td className="py-2 px-2 font-bold">{entry.team_name}</td>
                    <td className="py-2 px-2 text-right text-crewLime font-mono">{entry.total_score}</td>
                    <td className="py-2 px-2 text-right font-mono">{fmtTime(entry.total_time)}</td>
                    <td className="py-2 px-2 text-right text-crewCyan">{entry.rounds_completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* ── Submissions per Round ── */}
        {rounds.map((round) => {
          const subs = submissionsMap[round.id] || [];
          return (
            <section key={round.id} className="bg-slate-800 border-2 border-slate-600 rounded-2xl p-6">
              <h2 className="text-lg font-black uppercase tracking-widest mb-4 text-crewCyan">
                📋 Round {round.round_number} — {round.is_locked ? "🔒 Locked" : "🟢 Active"}
              </h2>
              <p className="text-slate-400 text-xs mb-4">
                Answer: <span className="text-white font-mono">{round.expected_answer || "not set"}</span>
                {round.round_start_time && (
                  <> | Started: {new Date(round.round_start_time).toLocaleTimeString()}</>
                )}
              </p>
              {subs.length === 0 ? (
                <p className="text-slate-500 text-sm">No submissions for this round yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 text-xs uppercase border-b border-slate-600">
                        <th className="text-left py-2 px-2">Team</th>
                        <th className="text-center py-2 px-2">Status</th>
                        <th className="text-right py-2 px-2">Time</th>
                        <th className="text-right py-2 px-2">Score</th>
                        <th className="text-right py-2 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subs.map((sub) => {
                        const key = sub.team_id + round.id;
                        return (
                          <tr key={sub.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                            <td className="py-2 px-2 font-bold">{sub.teams?.team_name || sub.team_id.slice(0, 8)}</td>
                            <td className="py-2 px-2 text-center">
                              {sub.is_correct ? (
                                <span className="text-crewLime font-bold">✅ Correct</span>
                              ) : sub.submitted_at ? (
                                <span className="text-crewRed font-bold">❌ Wrong</span>
                              ) : (
                                <span className="text-slate-400">⏳ Pending</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-right font-mono">{fmtTime(sub.time_taken)}</td>
                            <td className="py-2 px-2 text-right text-crewLime font-mono">{sub.score ?? "—"}</td>
                            <td className="py-2 px-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Edit time inline */}
                                <input
                                  type="number"
                                  placeholder="secs"
                                  value={editState[key] || ""}
                                  onChange={(e) =>
                                    setEditState((prev) => ({ ...prev, [key]: e.target.value }))
                                  }
                                  className="w-20 bg-slate-700 border border-slate-500 rounded px-2 py-1 text-xs text-white"
                                />
                                <button
                                  onClick={() => handleEditTime(sub.team_id, round.id, key)}
                                  disabled={actionLoading}
                                  className="text-xs bg-crewCyan text-black font-bold px-2 py-1 rounded border border-black"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleResetSubmission(sub.team_id, round.id)}
                                  disabled={actionLoading}
                                  className="text-xs bg-crewRed text-black font-bold px-2 py-1 rounded border border-black"
                                >
                                  🔄
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })}

        {/* ── Registered Teams ── */}
        <section className="bg-slate-800 border-2 border-slate-600 rounded-2xl p-6">
          <h2 className="text-xl font-black uppercase tracking-widest mb-4 text-crewLime">
            👥 Registered Teams ({teams.length})
          </h2>
          {teams.length === 0 ? (
            <p className="text-slate-400 text-sm">No teams registered yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teams.map((team) => (
                <div key={team.id} className="bg-slate-700 border border-slate-600 rounded-xl p-4">
                  <p className="font-black text-white text-base">{team.team_name}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    {Array.isArray(team.member_names)
                      ? team.member_names.join(", ")
                      : team.member_names}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Registered: {new Date(team.created_at).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
