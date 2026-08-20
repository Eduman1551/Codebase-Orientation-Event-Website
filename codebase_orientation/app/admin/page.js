"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Starfield from "../../components/Starfield";

export default function AdminLogin() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");

    if (!passcode.trim()) {
      setError("Passcode is required to access system controls.");
      return;
    }

    setLoading(true);

    // =======================================================================
    // 🟢 BACKEND DEVELOPER ZONE 🟢
    // =======================================================================
    // DEV BYPASS: Hardcoded for frontend testing. 
    // TODO: Replace this with Supabase Edge Function or secure DB check.
    if (passcode === "ADMIN123") {
      router.push("/admin/panel"); // Navigates to the control dashboard
      return;
    }
    // =======================================================================

    // Simulated network delay for incorrect passwords
    setTimeout(() => {
      setError("ACCESS DENIED. Invalid security clearance.");
      setLoading(false);
    }, 800);
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4">
      <Starfield />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-block bg-crewRed text-black border-4 border-black px-6 py-2 rounded-full font-black text-xl tracking-wider uppercase shadow-comic mb-2">
            🔒 System Override
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[2px_2px_0px_#000]">
            COMMAND AUTH
          </h1>
        </div>

        <div className="bg-spacePanel/95 border-4 border-black rounded-3xl p-6 sm:p-8 shadow-comicLg backdrop-blur-sm">
          {error && (
            <div className="mb-6 bg-crewRed/20 border-3 border-crewRed text-red-300 px-4 py-2 rounded-xl text-center font-bold text-sm animate-pulse">
              ⚠️ {error}
            </div>
          )}

          {/* Using <div> instead of <form> to prevent mobile refresh bugs */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-extrabold uppercase tracking-wide text-crewCyan mb-2">
                🔑 Enter Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin(e); // Lets you press Enter on laptop
                }}
                placeholder="Enter secret key..."
                className="comic-input font-mono tracking-widest text-center"
              />
            </div>

            <div className="pt-4">
              <button
                type="button" 
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-crewRed hover:bg-red-500 active:translate-x-[2px] active:translate-y-[2px] active:shadow-comicHover text-black font-black text-xl py-4 rounded-2xl border-4 border-black shadow-comic transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "VERIFYING..." : "GRANT ACCESS ➔"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}