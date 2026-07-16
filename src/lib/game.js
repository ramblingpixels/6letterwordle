import { VALID_WORDS, WORDS_EASY, WORDS_MEDIUM, WORDS_HARD } from "../data/words.js";

export const WORD_LEN = 6;
export const MAX_GUESSES = 6;
const EPOCH_MS = Date.UTC(2024, 0, 1); // day #1 of the daily puzzle, UTC-anchored so it's the same for everyone

export const POOLS = { easy: WORDS_EASY, medium: WORDS_MEDIUM, hard: WORDS_HARD };

export const VALID_SET = new Set(VALID_WORDS);
// answer pools must always be guessable even if frequency-list filtering missed them
for (const diff of Object.keys(POOLS)) for (const w of POOLS[diff]) VALID_SET.add(w);

// ---------- seeded RNG (deterministic per string seed) ----------
function hashStr(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seededShuffle(arr, seedStr) {
  const rng = mulberry32(hashStr(seedStr));
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DAILY_ORDER = {};
for (const diff of Object.keys(POOLS)) {
  DAILY_ORDER[diff] = seededShuffle(POOLS[diff], "sixdle-daily-order-v1-" + diff);
}

export function currentDayNumber() {
  return Math.floor((Date.now() - EPOCH_MS) / 86400000) + 1;
}

export function dailyAnswer(diff, dayNumber) {
  const order = DAILY_ORDER[diff];
  const idx = (((dayNumber - 1) % order.length) + order.length) % order.length;
  return order[idx];
}

export function randomPracticeAnswer(diff, avoid) {
  const pool = POOLS[diff];
  let w;
  do {
    w = pool[Math.floor(Math.random() * pool.length)];
  } while (pool.length > 1 && w === avoid);
  return w;
}

export function nextMidnightMs() {
  const days = Math.floor((Date.now() - EPOCH_MS) / 86400000) + 1;
  return EPOCH_MS + days * 86400000;
}

export function formatCountdown(ms) {
  if (ms < 0) ms = 0;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

// ---------- evaluation ----------
export function evaluateGuess(guess, answer) {
  const result = new Array(WORD_LEN).fill("absent");
  const counts = {};
  for (const ch of answer) counts[ch] = (counts[ch] || 0) + 1;
  for (let i = 0; i < WORD_LEN; i++) {
    if (guess[i] === answer[i]) { result[i] = "correct"; counts[guess[i]]--; }
  }
  for (let i = 0; i < WORD_LEN; i++) {
    if (result[i] === "correct") continue;
    const ch = guess[i];
    if (counts[ch] > 0) { result[i] = "present"; counts[ch]--; }
  }
  return result;
}

export const KEY_PRIORITY = { correct: 3, present: 2, absent: 1 };

export const WIN_MESSAGES = ["Genius", "Magnificent", "Impressive", "Splendid", "Great", "Phew"];

// ---------- storage helpers ----------
export function loadJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
export function saveJSON(key, val) {
  try { window.localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ }
}

export function stateKey(mode, diff) { return `sixdle:state:${mode}:${diff}`; }
export function statsKey(mode, diff) { return `sixdle:stats:${mode}:${diff}`; }

export function freshStats() {
  return { played: 0, wins: 0, currentStreak: 0, maxStreak: 0, lastWinDay: null, distribution: [0, 0, 0, 0, 0, 0] };
}

export function loadStats(mode, diff) {
  return loadJSON(statsKey(mode, diff), freshStats());
}
export function saveStats(mode, diff, stats) {
  saveJSON(statsKey(mode, diff), stats);
}

export function freshPuzzleState(mode, diff, avoidWord) {
  if (mode === "daily") {
    const day = currentDayNumber();
    return { mode, diff, day, answer: dailyAnswer(diff, day), guesses: [], statuses: [], currentInput: "", gameOver: false, won: false };
  }
  const answer = randomPracticeAnswer(diff, avoidWord || null);
  return { mode, diff, day: null, answer, guesses: [], statuses: [], currentInput: "", gameOver: false, won: false };
}

export function loadPuzzle(mode, diff) {
  const saved = loadJSON(stateKey(mode, diff), null);
  if (mode === "daily") {
    const day = currentDayNumber();
    if (saved && saved.day === day) return saved;
    return freshPuzzleState(mode, diff);
  }
  if (saved) return saved;
  return freshPuzzleState(mode, diff);
}

export function savePuzzle(puzzle) {
  saveJSON(stateKey(puzzle.mode, puzzle.diff), puzzle);
}

export function recordResult(puzzle, won, guessCount) {
  const stats = loadStats(puzzle.mode, puzzle.diff);
  stats.played++;
  if (won) {
    stats.wins++;
    stats.distribution[guessCount - 1]++;
    if (puzzle.mode === "daily") {
      const prevDay = stats.lastWinDay;
      stats.currentStreak = prevDay !== null && prevDay === puzzle.day - 1 ? stats.currentStreak + 1 : 1;
      stats.lastWinDay = puzzle.day;
    } else {
      stats.currentStreak = (stats.currentStreak || 0) + 1;
    }
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  } else {
    stats.currentStreak = 0;
  }
  saveStats(puzzle.mode, puzzle.diff, stats);
  return stats;
}

export function buildShareText(puzzle) {
  const diffLabel = puzzle.diff.charAt(0).toUpperCase() + puzzle.diff.slice(1);
  const scoreLabel = puzzle.won ? `${puzzle.guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const header =
    puzzle.mode === "daily"
      ? `Sixdle ${diffLabel} #${puzzle.day} ${scoreLabel}`
      : `Sixdle ${diffLabel} (Practice) ${scoreLabel}`;
  const emojiMap = { correct: "🟩", present: "🟨", absent: "⬛" };
  const grid = puzzle.statuses.map((row) => row.map((s) => emojiMap[s]).join("")).join("\n");
  return `${header}\n\n${grid}`;
}
