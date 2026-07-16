import Modal from "./Modal.jsx";
import { useCountdown } from "../hooks/useCountdown.js";
import { buildShareText } from "../lib/game.js";

export default function EndModal({ open, onClose, puzzle, stats, onPlayAgain, showToast }) {
  const countdown = useCountdown(open && puzzle.mode === "daily");
  const winPct = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;

  function share() {
    const text = buildShareText(puzzle);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showToast("Copied results to clipboard"),
        () => showToast("Could not copy — try manually")
      );
    } else {
      showToast("Copied results to clipboard");
    }
  }

  const title = puzzle.won
    ? ["Genius", "Magnificent", "Impressive", "Splendid", "Great", "Phew"][puzzle.guesses.length - 1]
    : "Better luck next time!";

  return (
    <Modal id="modal-end" open={open} onClose={onClose} className="modal-end">
      <h2>{title}</h2>
      {!puzzle.won && <p className="end-word">The word was {puzzle.answer.toUpperCase()}</p>}
      <div className="stats-grid">
        <div className="stat"><div className="stat-num">{stats.played}</div><div className="stat-label">Played</div></div>
        <div className="stat"><div className="stat-num">{winPct}</div><div className="stat-label">Win %</div></div>
        <div className="stat"><div className="stat-num">{stats.currentStreak}</div><div className="stat-label">Streak</div></div>
        <div className="stat"><div className="stat-num">{stats.maxStreak}</div><div className="stat-label">Max Streak</div></div>
      </div>
      <div className="end-actions">
        <button className="share-btn" onClick={share}>Share Result</button>
        {puzzle.mode === "practice" && (
          <button className="share-btn secondary" onClick={onPlayAgain}>Play Again</button>
        )}
      </div>
      {puzzle.mode === "daily" && (
        <div className="countdown">
          <div className="countdown-label">Next Sixdle</div>
          <div className="countdown-timer">{countdown}</div>
        </div>
      )}
    </Modal>
  );
}
