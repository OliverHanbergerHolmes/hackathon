// src/utils/leaderboard.js
// Hanterar sparning och hämtning av leaderboard samt spelarnamn via localStorage

const STORAGE_KEY = "leaderboard";
const NAME_KEY = "lyricsQuizPlayerName";

export function getPlayerName() {
  return localStorage.getItem(NAME_KEY) || "";
}

export function savePlayerName(name) {
  localStorage.setItem(NAME_KEY, name);
}

export function getLeaderboard() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveScore(playerName, score, category) {
  const leaderboard = getLeaderboard();

  leaderboard.push({
    name: playerName,
    score: score,
    category: category,
    date: new Date().toISOString(),
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
}

// Pass a category id to filter, or omit/null for the overall leaderboard.
export function getTopScores(topN = 10, category = null) {
  const leaderboard = getLeaderboard();
  const filtered = category
    ? leaderboard.filter((entry) => entry.category === category)
    : leaderboard;

  return [...filtered].sort((a, b) => b.score - a.score).slice(0, topN);
}

export function clearLeaderboard() {
  localStorage.removeItem(STORAGE_KEY);
}