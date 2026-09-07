import { useState } from "react"
import { CATEGORIES, NO_CATEGORY } from "../categories"
import Leaderboard from "./Leaderboard"
import AccountBadge from "./AccountBadge"

function CategoryScreen({ playerName, onChangeName, leaderboardKey, onStart }) {
  const [selectedCategory, setSelectedCategory] = useState(null)

  return (
    <div className="app">
      <div className="top-bar">
        <AccountBadge playerName={playerName} onChangeName={onChangeName} />
      </div>

      <div className="header">
        <h1>Lyrics Quiz</h1>
        <p className="subtitle">Pick a category to play</p>
      </div>

      <div className="category-grid">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            className={`category-button${
              selectedCategory === category.id ? " selected" : ""
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-emoji">{category.emoji}</span>
            <span className="category-label">{category.label}</span>
          </button>
        ))}
      </div>

      <button
        className={`category-button category-button-wide${
          selectedCategory === NO_CATEGORY.id ? " selected" : ""
        }`}
        onClick={() => setSelectedCategory(NO_CATEGORY.id)}
      >
        <span className="category-emoji">{NO_CATEGORY.emoji}</span>
        <span className="category-label">{NO_CATEGORY.label}</span>
      </button>

      <button
        className="start-button"
        disabled={!selectedCategory}
        onClick={() => onStart(selectedCategory)}
      >
        {selectedCategory ? "Start game" : "Choose a category"}
      </button>

      <Leaderboard category={selectedCategory} refreshKey={leaderboardKey} />
    </div>
  )
}

export default CategoryScreen