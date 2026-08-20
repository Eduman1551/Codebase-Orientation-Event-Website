"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Starfield from "../components/Starfield";
import { registerTeamAction } from "./actions/useraction";

const MEMBER_COLORS = [
  { color: "bg-crewCyan", label: "Cyan" },
  { color: "bg-crewRed", label: "Red" },
  { color: "bg-crewYellow", label: "Yellow" },
  { color: "bg-crewLime", label: "Lime" },
];

export default function LoginPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");

    if (!teamName.trim()) {
      setError("Please provide a Team Name!");
      return;
    }

    // At least 1 member name required
    const filledMembers = members.filter((m) => m.trim());
    if (filledMembers.length === 0) {
      setError("At least 1 crewmate name is required!");
      return;
    }

    setLoading(true);
    try {
      // Send only filled-in members
      const result = await registerTeamAction(teamName.trim(), filledMembers);

      localStorage.setItem("teamId", result.teamId);
      localStorage.setItem("teamName", result.teamName);
      localStorage.setItem("members", JSON.stringify(result.members));
      localStorage.setItem("leaderName", result.members[0]);
      localStorage.removeItem("gameStartTime");
      localStorage.removeItem("roundId");

      router.push("/rules");
    } catch (err) {
      setError(err.message || "Failed to register team. Check connection.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4">
      <Starfield />

      <div className="relative z-10 w-full max-w-xl">
        <div className="text-center mb-6">
          <div className="inline-block bg-crewRed text-black border-4 border-black px-6 py-2 rounded-full font-black text-xl tracking-wider uppercase shadow-comic mb-2">
            🚀 The Skeld Terminal
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[2px_2px_0px_#000]">
            CREWMATE AUTHENTICATION
          </h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">
            Register your crew before launching the scavenger mission.
          </p>
        </div>

        <div className="bg-spacePanel/95 border-4 border-black rounded-3xl p-6 sm:p-8 shadow-comicLg backdrop-blur-sm">
          {error && (
            <div className="mb-6 bg-crewRed/20 border-2 border-crewRed text-red-300 px-4 py-2 rounded-xl text-center font-bold text-sm animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Team Name */}
            <div>
              <label className="block text-sm font-extrabold uppercase tracking-wide text-crewYellow mb-2">
                🏷️ Team / Ship Name <span className="text-crewRed">*</span>
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g., Red Impostors..."
                className="comic-input"
              />
            </div>

            {/* Members */}
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-extrabold uppercase tracking-wide text-crewCyan">
                👥 Crew Members{" "}
                <span className="text-gray-400 font-medium normal-case">
                  (min 1, up to 4)
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {members.map((member, index) => (
                  <div key={index} className="relative flex items-center">
                    <div
                      className={`absolute left-3 w-4 h-4 rounded-full border-2 border-black ${MEMBER_COLORS[index].color} z-10`}
                    />
                    <input
                      type="text"
                      value={member}
                      onChange={(e) => handleMemberChange(index, e.target.value)}
                      placeholder={`Player ${index + 1}${index === 0 ? " (required)" : " (optional)"}`}
                      className="comic-input pl-10"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleLogin}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleLogin(e);
                }}
                disabled={loading}
                className="w-full bg-crewLime hover:bg-green-400 active:translate-x-[2px] active:translate-y-[2px] active:shadow-comicHover text-black font-black text-xl py-4 rounded-2xl border-4 border-black shadow-comic transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "INITIALIZING SHIP..." : "ENTER SPACESHIP ➔"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}