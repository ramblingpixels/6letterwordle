import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_GUESSES,
  WORD_LEN,
  VALID_SET,
  KEY_PRIORITY,
  WIN_MESSAGES,
  evaluateGuess,
  loadJSON,
  saveJSON,
  loadPuzzle,
  savePuzzle,
  loadStats,
  recordResult,
  freshPuzzleState,
} from "../lib/game.js";

let toastId = 0;

export function useGame() {
  const [mode, setMode] = useState(() => loadJSON("sixdle:lastMode", "daily"));
  const [diff, setDiff] = useState(() => loadJSON("sixdle:lastDiff", "medium"));
  const [puzzle, setPuzzle] = useState(() => loadPuzzle(mode, diff));
  const [stats, setStats] = useState(() => loadStats(mode, diff));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealRow, setRevealRow] = useState(null); // { rowIndex, statuses }
  const [shakeRowIndex, setShakeRowIndex] = useState(null);
  const [bounceRowIndex, setBounceRowIndex] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [endModalOpen, setEndModalOpen] = useState(false);

  // holds the win/loss verdict for the guess currently being revealed
  const pendingResultRef = useRef(null);

  // persist whenever the active puzzle changes (covers the initial/freshly-generated
  // puzzle too, so a newly created practice word survives a refresh with zero guesses)
  useEffect(() => {
    savePuzzle(puzzle);
  }, [puzzle]);

  const showToast = useCallback((msg) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 1900);
  }, []);

  const switchMode = useCallback((newMode) => {
    setMode(newMode);
    saveJSON("sixdle:lastMode", newMode);
    setPuzzle(loadPuzzle(newMode, diff));
    setStats(loadStats(newMode, diff));
    setRevealRow(null);
    setShakeRowIndex(null);
    setBounceRowIndex(null);
    setEndModalOpen(false);
    setIsSubmitting(false);
  }, [diff]);

  const switchDiff = useCallback((newDiff) => {
    setDiff(newDiff);
    saveJSON("sixdle:lastDiff", newDiff);
    setPuzzle(loadPuzzle(mode, newDiff));
    setStats(loadStats(mode, newDiff));
    setRevealRow(null);
    setShakeRowIndex(null);
    setBounceRowIndex(null);
    setEndModalOpen(false);
    setIsSubmitting(false);
  }, [mode]);

  // roll the daily puzzle over automatically if the tab is left open across midnight
  useEffect(() => {
    if (mode !== "daily") return;
    const id = setInterval(() => {
      const fresh = loadPuzzle("daily", diff);
      if (fresh.day !== puzzle.day) setPuzzle(fresh);
    }, 1000);
    return () => clearInterval(id);
  }, [mode, diff, puzzle.day]);

  const typeLetter = useCallback((letter) => {
    if (isSubmitting || puzzle.gameOver || puzzle.currentInput.length >= WORD_LEN) return;
    const next = { ...puzzle, currentInput: puzzle.currentInput + letter.toLowerCase() };
    savePuzzle(next);
    setPuzzle(next);
  }, [isSubmitting, puzzle]);

  const backspace = useCallback(() => {
    if (isSubmitting || puzzle.gameOver) return;
    const next = { ...puzzle, currentInput: puzzle.currentInput.slice(0, -1) };
    savePuzzle(next);
    setPuzzle(next);
  }, [isSubmitting, puzzle]);

  const submit = useCallback(() => {
    if (isSubmitting || puzzle.gameOver) return;
    const guess = puzzle.currentInput;
    const rowIndex = puzzle.guesses.length;
    if (guess.length < WORD_LEN) {
      showToast("Not enough letters");
      setShakeRowIndex(rowIndex);
      setTimeout(() => setShakeRowIndex(null), 500);
      return;
    }
    if (!VALID_SET.has(guess)) {
      showToast("Not in word list");
      setShakeRowIndex(rowIndex);
      setTimeout(() => setShakeRowIndex(null), 500);
      return;
    }
    const statuses = evaluateGuess(guess, puzzle.answer);
    const won = statuses.every((s) => s === "correct");
    const lost = !won && rowIndex + 1 >= MAX_GUESSES;

    setIsSubmitting(true);
    pendingResultRef.current = { rowIndex, statuses, won, lost };

    const next = {
      ...puzzle,
      guesses: [...puzzle.guesses, guess],
      statuses: [...puzzle.statuses, statuses],
      currentInput: "",
    };
    savePuzzle(next); // persist immediately so a refresh mid-animation can't lose this guess
    setPuzzle(next);
    setRevealRow({ rowIndex, statuses });
  }, [isSubmitting, puzzle, showToast]);

  // called by the Board once the last tile in the revealing row finishes its flip animation.
  // Side effects (recordResult/setStats) must run here as plain calls, not inside a setState
  // updater — React 18 StrictMode double-invokes updater functions in dev to check purity,
  // which would double-count stats if recordResult lived inside one (it did; this is the fix).
  const onRevealDone = useCallback(() => {
    const pending = pendingResultRef.current;
    pendingResultRef.current = null;
    setRevealRow(null);
    setIsSubmitting(false);
    if (!pending) return;
    const { rowIndex, won, lost } = pending;

    if (won || lost) {
      const next = { ...puzzle, gameOver: true, won };
      savePuzzle(next);
      const newStats = recordResult(next, won, next.guesses.length);
      setStats(newStats);
      setPuzzle(next);
      if (won) {
        setBounceRowIndex(rowIndex);
        setTimeout(() => setBounceRowIndex(null), 900);
      }
      setTimeout(() => setEndModalOpen(true), won ? 900 : 300);
    }
  }, [puzzle]);

  const startNewPractice = useCallback(() => {
    setEndModalOpen(false);
    const next = freshPuzzleState("practice", diff, puzzle.answer);
    savePuzzle(next);
    setPuzzle(next);
  }, [diff, puzzle.answer]);

  const closeEndModal = useCallback(() => setEndModalOpen(false), []);

  const keyboardStatuses = useMemo(() => {
    const best = {};
    for (let r = 0; r < puzzle.guesses.length; r++) {
      const guess = puzzle.guesses[r];
      const statuses = puzzle.statuses[r];
      for (let c = 0; c < WORD_LEN; c++) {
        const ch = guess[c].toUpperCase();
        const status = statuses[c];
        if (!best[ch] || KEY_PRIORITY[status] > KEY_PRIORITY[best[ch]]) best[ch] = status;
      }
    }
    return best;
  }, [puzzle.guesses, puzzle.statuses]);

  const winMessage = puzzle.won ? WIN_MESSAGES[puzzle.guesses.length - 1] : null;

  return {
    mode, diff, puzzle, stats,
    switchMode, switchDiff,
    typeLetter, backspace, submit,
    isSubmitting, revealRow, onRevealDone,
    shakeRowIndex, bounceRowIndex,
    toasts,
    endModalOpen, closeEndModal, startNewPractice,
    keyboardStatuses, winMessage,
    showToast,
  };
}
