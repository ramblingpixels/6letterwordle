import { useEffect, useRef, useState } from "react";
import { MAX_GUESSES, WORD_LEN } from "../lib/game.js";

function Tile({ letter, status, revealing, revealDelay, onRevealEnd, shake, bounce, bounceDelay, pop }) {
  const classes = ["tile"];
  if (letter) classes.push("filled");
  if (status && !revealing) classes.push(status);
  if (revealing) classes.push("flip", status);
  if (shake) classes.push("shake");
  if (bounce) classes.push("bounce");
  if (pop) classes.push("pop");

  const style = {};
  if (revealing) style.animationDelay = `${revealDelay}ms`;
  if (bounce) style.animationDelay = `${bounceDelay}ms`;

  return (
    <div className={classes.join(" ")} style={style} onAnimationEnd={onRevealEnd}>
      {letter ? letter.toUpperCase() : ""}
    </div>
  );
}

export default function Board({ puzzle, revealRow, onRevealDone, shakeRowIndex, bounceRowIndex }) {
  const prevInputLen = useRef(0);
  const [popCol, setPopCol] = useState(-1);

  useEffect(() => {
    const len = puzzle.currentInput.length;
    if (len > prevInputLen.current) {
      setPopCol(len - 1);
      const t = setTimeout(() => setPopCol(-1), 120);
      prevInputLen.current = len;
      return () => clearTimeout(t);
    }
    prevInputLen.current = len;
  }, [puzzle.currentInput]);

  const rows = [];
  for (let r = 0; r < MAX_GUESSES; r++) {
    const committed = puzzle.guesses[r];
    const isRevealing = revealRow && revealRow.rowIndex === r;
    const isCurrentRow = r === puzzle.guesses.length && !puzzle.gameOver;

    const tiles = [];
    for (let c = 0; c < WORD_LEN; c++) {
      let letter = "";
      let status = null;
      if (committed) {
        letter = committed[c];
        status = puzzle.statuses[r][c];
      } else if (isCurrentRow && puzzle.currentInput[c]) {
        letter = puzzle.currentInput[c];
      }
      tiles.push(
        <Tile
          key={c}
          letter={letter}
          status={status}
          revealing={isRevealing}
          revealDelay={c * 300}
          onRevealEnd={isRevealing && c === WORD_LEN - 1 ? onRevealDone : undefined}
          shake={shakeRowIndex === r}
          bounce={bounceRowIndex === r}
          bounceDelay={c * 100}
          pop={isCurrentRow && !isRevealing && popCol === c}
        />
      );
    }
    rows.push(
      <div className="board-row" key={r}>
        {tiles}
      </div>
    );
  }

  return (
    <div className="board" aria-live="polite">
      {rows}
    </div>
  );
}
