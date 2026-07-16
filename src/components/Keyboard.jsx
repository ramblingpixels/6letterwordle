const KB_ROWS = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  ["ENTER", ..."ZXCVBNM".split(""), "BACK"],
];

const BACK_ICON = (
  <svg viewBox="0 0 24 24">
    <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1.59 12.59L19 17l-3.5-3.5L12 17l-1.41-1.41L14.09 12 10.6 8.5 12 7.09l3.5 3.5L19 7.09l1.41 1.41L16.91 12z" />
  </svg>
);

export default function Keyboard({ onKey, statuses }) {
  return (
    <div className="keyboard">
      {KB_ROWS.map((row, i) => (
        <div className="kb-row" key={i}>
          {row.map((key) => {
            const isWide = key === "ENTER" || key === "BACK";
            const status = statuses[key];
            const classes = ["key"];
            if (isWide) classes.push("wide");
            if (status) classes.push(status);
            return (
              <button
                key={key}
                className={classes.join(" ")}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onKey(key)}
              >
                {key === "BACK" ? BACK_ICON : key === "ENTER" ? "Enter" : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
