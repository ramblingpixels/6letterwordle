import { useEffect, useState } from "react";
import { nextMidnightMs, formatCountdown } from "../lib/game.js";

export function useCountdown(active) {
  const [text, setText] = useState(() => formatCountdown(nextMidnightMs() - Date.now()));

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setText(formatCountdown(nextMidnightMs() - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  return text;
}
