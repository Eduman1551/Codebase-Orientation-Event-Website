"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // 1. Import useRouter
import Starfield from "../components/Starfield";

const MEMBER_COLORS = [
  { label: "Cyan", color: "bg-crewCyan", border: "border-cyan-400" },
  { label: "Red", color: "bg-crewRed", border: "border-red-500" },
  { label: "Yellow", color: "bg-crewYellow", border: "border-yellow-400" },
  { label: "Lime", color: "bg-crewLime", border: "border-green-400" },
];

export default function LoginPage() {
  const router = useRouter(); // 2. Initialize the router
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
    e.preventDefault();
    setError("");

    // Basic Validation
    if (!teamName.trim()) {
      setError("Please provide a Team Name!");
      return;
    }
    if (members.some((m) => !m.trim())) {
      setError("All 4 crewmate names must be filled out!");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        teamName: teamName.trim(),
        members: members.map((m) => m.trim()),
      };

      // Backend simulation
      console.log("Submitting crew roster to Supabase:", payload);
      
      // 3. Navigate to the rules page after a slight delay for effect
      setTimeout(() => {
        router.push("/rules");
      }, 800);

    } catch (err) {
      setError("Failed to register team. Check connection.");
      setLoading(false); // Only stop loading if there's an error, otherwise let it transition
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
            <div className="mb-6 bg-crewRed/20 border-3 border-crewRed text-red-300 px-4 py-2 rounded-xl text-center font-bold text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-extrabold uppercase tracking-wide text-crewYellow mb-2">
                🏷️ Team / Ship Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g., Red Impostors, Alpha Squad..."
                className="comic-input"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-sm font-extrabold uppercase tracking-wide text-crewCyan">
                👥 Crew Members (4 Players)
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
                      placeholder={`Player ${index + 1} Name`}
                      className="comic-input pl-10"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-crewLime hover:bg-green-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-comicHover text-black font-black text-xl py-4 rounded-2xl border-4 border-black shadow-comic transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "INITIALIZING SHIP..." : "ENTER SPACESHIP ➔"}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4 uppercase font-bold tracking-widest">
          SYSTEM STATUS: ONLINE • ALL TASKS PENDING
        </p>
      </div>
    </main>
  );
}