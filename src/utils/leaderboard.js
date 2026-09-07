// src/utils/leaderboard.js
// Hanterar sparning och hämtning av leaderboard via localStorage

const STORAGE_KEY = "leaderboard";

export function getLeaderboard() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveScore(playerName, score) {
  const leaderboard = getLeaderboard();

  leaderboard.push({
    name: playerName,
    score: score,
    date: new Date().toISOString()
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
}

export function getTopScores(topN = 10) {
  const leaderboard = getLeaderboard();
  return [...leaderboard].sort((a, b) => b.score - a.score).slice(0, topN);
}

export function clearLeaderboard() {
  localStorage.removeItem(STORAGE_KEY);
}