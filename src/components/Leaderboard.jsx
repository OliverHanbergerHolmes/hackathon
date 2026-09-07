import { getTopScores } from "../utils/leaderboard"
import { getCategoryLabel } from "../categories"

function Leaderboard({ category, refreshKey }) {
  const topScores = getTopScores(10, category)
  const title = category ? getCategoryLabel(category) : "Overall"

  return (
    <div className="leaderboard-card">
      <h2>{title} leaders</h2>

      {topScores.length === 0 ? (
        <p className="leaderboard-empty">No games played yet — be the first!</p>
      ) : (
        <ol className="leaderboard-list">
          {topScores.map((entry, index) => (
            <li key={index}>
              <span className="leaderboard-rank">{index + 1}</span>
              <span className="leaderboard-name">{entry.name}</span>
              <span className="leaderboard-points">{entry.score} pts</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default Leaderboard