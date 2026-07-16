import Modal from "./Modal.jsx";
import DistributionChart from "./DistributionChart.jsx";
import { useCountdown } from "../hooks/useCountdown.js";
import { buildShareText } from "../lib/game.js";

export default function StatsModal({ open, onClose, mode, stats, puzzle, showToast }) {
  const countdown = useCountdown(open && mode === "daily");
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

  return (
    <Modal id="modal-stats" open={open} onClose={onClose}>
      <h2>Statistics</h2>
      <div className="stats-grid">
        <div className="stat"><div className="stat-num">{stats.played}</div><div className="stat-label">Played</div></div>
        <div className="stat"><div className="stat-num">{winPct}</div><div className="stat-label">Win %</div></div>
        <div className="stat"><div className="stat-num">{stats.currentStreak}</div><div className="stat-label">Streak</div></div>
        <div className="stat"><div className="stat-num">{stats.maxStreak}</div><div className="stat-label">Max Streak</div></div>
      </div>
      <h3>Guess Distribution</h3>
      <DistributionChart distribution={stats.distribution} />
      <p className="stats-scope">Showing stats for the current mode &amp; difficulty.</p>
      {puzzle.gameOver && (
        <div className="share-wrap">
          <button className="share-btn" onClick={share}>Share</button>
        </div>
      )}
      {mode === "daily" && (
        <div className="countdown">
          <div className="countdown-label">Next Sixdle</div>
          <div className="countdown-timer">{countdown}</div>
        </div>
      )}
    </Modal>
  );
}
