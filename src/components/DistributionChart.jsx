import { MAX_GUESSES } from "../lib/game.js";

export default function DistributionChart({ distribution }) {
  const max = Math.max(1, ...distribution);
  return (
    <div className="dist-chart">
      {Array.from({ length: MAX_GUESSES }, (_, i) => {
        const count = distribution[i];
        const pct = Math.max(8, (count / max) * 100);
        return (
          <div className="dist-row" key={i}>
            <div>{i + 1}</div>
            <div className="dist-bar-wrap">
              <div className="dist-bar" style={{ width: `${pct}%` }}>
                {count}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
