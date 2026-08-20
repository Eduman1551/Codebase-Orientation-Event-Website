"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Starfield from "../components/Starfield";

const MEMBER_COLORS = [
  { label: "Cyan", color: "bg-crewCyan", border: "border-cyan-400" },
  { label: "Red", color: "bg-crewRed", border: "border-red-500" },
  { label: "Yellow", color: "bg-crewYellow", border: "border-yellow-400" },
  { label: "Lime", color: "bg-crewLime", border: "border-green-400" },
];

export default function LoginPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.removeItem("gameStartTime");
  }, []);

  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");

    // 1. Mandatory Team Name Check
    if (!teamName.trim()) {
      setError("Please provide a Team Name!");
      return;
    }

    // 2. Filter out empty member inputs
    const activeMembers = members.map((m) => m.trim()).filter((m) => m !== "");

    // 3. Ensure at least 1 crewmate is registered
    if (activeMembers.length === 0) {
      setError("At least one crewmate must be registered!");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        teamName: teamName.trim(),
        members: activeMembers, // Only sends the filled-in names!
      };

      console.log("Submitting crew roster to Supabase:", payload);
      
      // Navigate to rules page
      router.push("/rules");

    } catch (err) {
      setError("Failed to register team. Check connection.");
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
            <div className="mb-6 bg-crewRed/20 border-3 border-crewRed text-red-300 px-4 py-2 rounded-xl text-center font-bold text-sm animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-extrabold uppercase tracking-wide text-crewYellow mb-2">
                🏷️ Team / Ship Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g., Red Impostors..."
                className="comic-input"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-sm font-extrabold uppercase tracking-wide text-crewCyan">
                👥 Crew Members (Up to 4)
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
                      placeholder={index === 0 ? "Player 1 Name" : `Player ${index + 1} (Optional)`}
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
                disabled={loading}
                className="w-full bg-crewLime hover:bg-green-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-comicHover text-black font-black text-xl py-4 rounded-2xl border-4 border-black shadow-comic transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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