export default function TopBar({ mode, diff, onModeChange, onDiffChange, onHelp, onStats, onThemeToggle }) {
  const stop = (e) => e.preventDefault();
  return (
    <>
      <header className="app-header">
        <button className="icon-btn" title="How to play" aria-label="How to play" onMouseDown={stop} onClick={onHelp}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" /><text x="12" y="16.5" textAnchor="middle" fontSize="12" fill="currentColor" stroke="none">?</text></svg>
        </button>

        <h1>Sixdle</h1>

        <div className="header-actions">
          <button className="icon-btn" title="Statistics" aria-label="Statistics" onMouseDown={stop} onClick={onStats}>
            <svg viewBox="0 0 24 24"><rect x="3" y="12" width="4" height="9" /><rect x="10" y="6" width="4" height="15" /><rect x="17" y="2" width="4" height="19" /></svg>
          </button>
          <button className="icon-btn" title="Toggle dark mode" aria-label="Toggle dark mode" onMouseDown={stop} onClick={onThemeToggle}>
            <svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z" fill="currentColor" /></svg>
          </button>
        </div>
      </header>

      <nav className="mode-bar">
        <div className="mode-tabs">
          {["daily", "practice"].map((m) => (
            <button
              key={m}
              data-mode={m}
              className={"mode-tab" + (mode === m ? " active" : "")}
              onMouseDown={stop}
              onClick={() => onModeChange(m)}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="diff-tabs">
          {["easy", "medium", "hard"].map((d) => (
            <button
              key={d}
              data-diff={d}
              className={"diff-tab" + (diff === d ? " active" : "")}
              onMouseDown={stop}
              onClick={() => onDiffChange(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
