import { useEffect, useState } from "react";
import { useGame } from "./hooks/useGame.js";
import { loadJSON, saveJSON } from "./lib/game.js";
import TopBar from "./components/TopBar.jsx";
import Board from "./components/Board.jsx";
import Keyboard from "./components/Keyboard.jsx";
import ToastContainer from "./components/ToastContainer.jsx";
import HelpModal from "./components/HelpModal.jsx";
import StatsModal from "./components/StatsModal.jsx";
import EndModal from "./components/EndModal.jsx";

export default function App() {
  const game = useGame();
  const [helpOpen, setHelpOpen] = useState(() => !loadJSON("sixdle:seenHelp", false));
  const [statsOpen, setStatsOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = loadJSON("sixdle:theme", null);
    if (saved) return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function closeHelp() {
    setHelpOpen(false);
    saveJSON("sixdle:seenHelp", true);
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (helpOpen || statsOpen || game.endModalOpen) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === "Enter") { game.submit(); return; }
      if (k === "Backspace") { game.backspace(); return; }
      if (/^[a-zA-Z]$/.test(k)) game.typeLetter(k.toUpperCase());
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [helpOpen, statsOpen, game.endModalOpen, game.submit, game.backspace, game.typeLetter]);

  // Buttons shouldn't retain focus after a mouse click — otherwise a later physical
  // Enter (meant to submit a guess) can also re-activate whichever button was last
  // clicked (native button-activation behavior), clobbering in-progress game state.
  useEffect(() => {
    function onMouseDown(e) {
      const btn = e.target.closest("button");
      if (btn) e.preventDefault();
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function handleKey(key) {
    if (key === "ENTER") game.submit();
    else if (key === "BACK") game.backspace();
    else game.typeLetter(key);
  }

  const showNewWordButton = game.mode === "practice" && game.puzzle.gameOver;

  return (
    <>
      <TopBar
        mode={game.mode}
        diff={game.diff}
        onModeChange={game.switchMode}
        onDiffChange={game.switchDiff}
        onHelp={() => setHelpOpen(true)}
        onStats={() => setStatsOpen(true)}
        onThemeToggle={() => setTheme((t) => {
          const next = t === "dark" ? "light" : "dark";
          saveJSON("sixdle:theme", next);
          return next;
        })}
      />

      <main className="game-wrap">
        <ToastContainer toasts={game.toasts} />

        <Board
          puzzle={game.puzzle}
          revealRow={game.revealRow}
          onRevealDone={game.onRevealDone}
          shakeRowIndex={game.shakeRowIndex}
          bounceRowIndex={game.bounceRowIndex}
        />

        {showNewWordButton && (
          <button className="share-btn new-word-btn" onMouseDown={(e) => e.preventDefault()} onClick={game.startNewPractice}>
            New Word
          </button>
        )}

        <Keyboard onKey={handleKey} statuses={game.keyboardStatuses} />
      </main>

      <HelpModal open={helpOpen} onClose={closeHelp} />
      <StatsModal
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        mode={game.mode}
        stats={game.stats}
        puzzle={game.puzzle}
        showToast={game.showToast}
      />
      <EndModal
        open={game.endModalOpen}
        onClose={game.closeEndModal}
        puzzle={game.puzzle}
        stats={game.stats}
        onPlayAgain={game.startNewPractice}
        showToast={game.showToast}
      />
    </>
  );
}
