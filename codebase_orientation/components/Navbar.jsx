"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    setTeamName(localStorage.getItem("teamName") || "");
  }, []);

  const navLinks = [
    { name: "Engine", path: "/engine" },
    { name: "Electrical", path: "/electrical" },
    { name: "MedBay", path: "/medbay" },
    { name: "Control", path: "/control" },
    { name: "SUBMIT", path: "/submit" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-spacePanel border-b-4 border-black shadow-comic min-h-20 flex items-center py-3">
      <div className="max-w-7xl mx-auto w-full px-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">

        {/* Team name badge */}
        <div className="shrink-0">
          {teamName ? (
            <span className="bg-black border-2 border-crewCyan text-crewCyan font-black text-sm px-3 py-1 rounded-lg tracking-widest uppercase">
              🚀 {teamName}
            </span>
          ) : (
            <span className="bg-black border-2 border-gray-600 text-gray-400 font-bold text-xs px-3 py-1 rounded-lg">
              Not registered
            </span>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full md:w-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            const isSubmit = link.name === "SUBMIT";
            return (
              <Link key={link.name} href={link.path}>
                <div
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm md:text-base border-4 border-black rounded-xl font-bold uppercase tracking-wide transition-transform active:scale-95 text-center ${
                    isActive
                      ? "bg-crewCyan text-black shadow-comicHover translate-y-0.5"
                      : isSubmit
                      ? "bg-crewYellow text-black shadow-comic hover:bg-yellow-300"
                      : "bg-gray-800 text-white shadow-comic hover:bg-gray-700"
                  }`}
                >
                  {link.name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}