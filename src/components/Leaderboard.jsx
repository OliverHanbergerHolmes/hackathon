// src/components/Leaderboard.jsx
import { getTopScores } from "../utils/leaderboard";

function Leaderboard({ refreshKey }) {
  const topScores = getTopScores(10);

  if (topScores.length === 0) {
    return <p>Ingen har spelat än — bli den första på listan!</p>;
  }

  return (
    <div>
      <h2>Leaderboard</h2>
      <ol>
        {topScores.map((entry, index) => (
          <li key={index}>
            {entry.name} — {entry.score} pts
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Leaderboard;