"use client";

/**
 * useRoundTimer — shared hook for room pages.
 *
 * Reads gameStartTime from localStorage (set when round starts).
 * Returns { secondsLeft, urgent } and calls onExpire when time hits 0.
 *
 * Usage: const { secondsLeft, urgent } = useRoundTimer({ onExpire })
 */

import { useEffect, useRef, useState } from "react";

const ROUND_DURATION = 5 * 60; // 5 minutes in seconds

export function useRoundTimer({ onExpire }) {
  const [secondsLeft, setSecondsLeft] = useState(ROUND_DURATION);
  const expiredRef = useRef(false);

  useEffect(() => {
    const startStr = localStorage.getItem("gameStartTime");
    if (!startStr) return;

    const startMs = parseInt(startStr, 10);

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      const left = Math.max(0, ROUND_DURATION - elapsed);
      setSecondsLeft(left);

      if (left === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    };

    tick(); // run once immediately
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [onExpire]);

  const urgent = secondsLeft <= 60 && secondsLeft > 0;
  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");

  return { secondsLeft, urgent, formatted: `${mm}:${ss}` };
}
