import { useState } from 'react'
import './App.css'
import allSongs from './songs.json'
import { saveScore, getPlayerName, savePlayerName } from './utils/leaderboard'
import { getSongsForCategory, getCategoryLabel } from './categories'
import Leaderboard from './components/Leaderboard'
import LoginScreen from './components/LoginScreen'
import CategoryScreen from './components/CategoryScreen'
import AccountBadge from './components/AccountBadge'

const TOTAL_ROUNDS = 10

function getFirstVerse(lyrics) {
  if (!lyrics) return ''

  // Split the original lyrics into sections first.
  // This preserves the original \n\n paragraph structure.
  const sections = lyrics.split(/\n\s*\n/)

  for (const section of sections) {
    // Remove anything inside (), [], or {}
    const cleaned = section
      .replace(/\([^)]*\)/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/\{[^}]*\}/g, '')
      .trim()

    // Skip empty sections
    if (!cleaned) continue

    // Make sure this is actually a lyric section
    // and not just special characters / metadata.
    const hasLetters = /[a-zA-ZÀ-ÖØ-öø-ÿ]/.test(cleaned)

    if (!hasLetters) continue

    // Clean up extra whitespace while preserving line breaks
    return cleaned
      .replace(/[ \t]+/g, ' ')
      .trim()
  }

  return 'Lyrics not found.'
}

function splitLyrics(lyrics, title) {
  if (!lyrics || !title) {
    return [{ text: lyrics, censored: false }]
  }

  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')

  return lyrics
    .split(regex)
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      censored: part.toLowerCase() === title.toLowerCase(),
    }))
}

function App() {
  const [playerName, setPlayerName] = useState(getPlayerName())
  const [screen, setScreen] = useState('login') // 'login' | 'category' | 'quiz' | 'gameover'
  const [category, setCategory] = useState(null)

  const [round, setRound] = useState(1)
  const [loading, setLoading] = useState(false)
  const [lyricsParts, setLyricsParts] = useState([])
  const [currentSong, setCurrentSong] = useState(null)

  const [artistGuess, setArtistGuess] = useState('')
  const [titleGuess, setTitleGuess] = useState('')

  const [points, setPoints] = useState(0)
  const [message, setMessage] = useState('')
  const [wasCorrect, setWasCorrect] = useState(null)
  const [leaderboardKey, setLeaderboardKey] = useState(0)

  const handleChangeName = (name) => {
    setPlayerName(name)
    savePlayerName(name)
  }

  const fetchLyrics = async (categoryId) => {
    setLoading(true)
    setMessage('')
    setArtistGuess('')
    setTitleGuess('')

    try {
      const pool = getSongsForCategory(allSongs, categoryId)

      if (!pool || pool.length === 0) {
        throw new Error('No songs available for this category')
      }

      const song = pool[Math.floor(Math.random() * pool.length)]
      setCurrentSong(song)

      const response = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch lyrics')
      }

      const lyricsData = await response.json()

      const rawLyrics = lyricsData.lyrics || 'Lyrics not found.'

      // Get ONLY the first actual lyric section.
      // This removes things like [Chorus], (Artist Name), etc.
      const snippet = getFirstVerse(rawLyrics)

      setLyricsParts(splitLyrics(snippet, song.title))
    } catch (error) {
      console.error('Error fetching lyrics:', error)

      setLyricsParts([
        {
          text: 'Could not fetch lyrics.',
          censored: false,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const continueFromLogin = (name) => {
    handleChangeName(name)
    setScreen('category')
  }

  const startGame = (categoryId) => {
    setCategory(categoryId)
    setRound(1)
    setPoints(0)
    setScreen('quiz')

    fetchLyrics(categoryId)
  }

  const handleGuess = () => {
    if (!currentSong) return

    const correctArtist =
      artistGuess.trim().toLowerCase() ===
      currentSong.artist.trim().toLowerCase()

    const correctTitle =
      titleGuess.trim().toLowerCase() ===
      currentSong.title.trim().toLowerCase()

    let newPoints = points

    if (correctArtist && correctTitle) {
      newPoints = points + 100
      setMessage('Correct! +100 points 🎉')
      setWasCorrect('full')
    } else if (correctArtist || correctTitle) {
      newPoints = points + 50
      setMessage(
        `Almost right! The answer was "${currentSong.title}" by ${currentSong.artist}. +50 points`
      )
      setWasCorrect('partial')
    } else {
      newPoints = points - 50
      setMessage(
        `Wrong! It was "${currentSong.title}" by ${currentSong.artist}. -50 points`
      )
      setWasCorrect('none')
    }

    setPoints(newPoints)
    advanceRound(newPoints)
  }

  const handleSkip = () => {
    if (currentSong) {
      setMessage(
        `Skipped! The answer was "${currentSong.title}" by ${currentSong.artist}.`
      )
      setWasCorrect('skip')
    }
    advanceRound(points)
  }

  const advanceRound = (currentPoints) => {
    if (round >= TOTAL_ROUNDS) {
      saveScore(playerName, currentPoints, category)
      setLeaderboardKey((k) => k + 1)
      setScreen('gameover')
      return
    }

    setTimeout(() => {
      setRound((r) => r + 1)
      fetchLyrics(category)
    }, 1500)
  }

  const playAgain = () => {
    setScreen('category')
  }

  // -------- Login screen --------
  if (screen === 'login') {
    return <LoginScreen initialName={playerName} onContinue={continueFromLogin} />
  }

  // -------- Category screen --------
  if (screen === 'category') {
    return (
      <CategoryScreen
        playerName={playerName}
        onChangeName={handleChangeName}
        leaderboardKey={leaderboardKey}
        onStart={startGame}
      />
    )
  }

  // -------- Game over screen --------
  if (screen === 'gameover') {
    return (
      <div className="app">
        <div className="top-bar">
          <AccountBadge playerName={playerName} onChangeName={handleChangeName} />
        </div>

        <div className="game-over">
          <span className="game-over-emoji">
            {points >= 500 ? '🏆' : '🎵'}
          </span>

          <h1>Game over!</h1>

          <span className="final-score-label">
            {playerName}'s score · {getCategoryLabel(category)}
          </span>

          <p className="final-score">{points}</p>

          <button
            className="play-again-button"
            onClick={playAgain}
          >
            Play again
          </button>
        </div>

        <Leaderboard category={category} refreshKey={leaderboardKey} />
      </div>
    )
  }

  // -------- Quiz screen --------
  return (
    <div className="app">
      <div className="top-bar">
        <AccountBadge playerName={playerName} onChangeName={handleChangeName} />
      </div>

      <div className="header">
        <h1>Lyrics Quiz</h1>

        <div className="score-row">
          <div className="score">
            <span>Round</span>

            <strong>
              {round}/{TOTAL_ROUNDS}
            </strong>
          </div>

          <div className="score">
            <span>Points</span>

            <strong>{points}</strong>
          </div>
        </div>
      </div>

      <div className="quiz">
        {loading ? (
          <div className="loading">
            <div className="spinner" />
            <p>Loading lyrics...</p>
          </div>
        ) : (
          <>
            <div className="lyrics-card">
              <p className="lyrics">
                {lyricsParts.map((part, i) =>
                  part.censored ? (
                    <span
                      key={i}
                      className="censored-word"
                    >
                      {part.text}
                    </span>
                  ) : (
                    <span key={i}>{part.text}</span>
                  )
                )}
              </p>
            </div>

            <div className="controls">
              <div className="inputs">
                <div className="input-group">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Artist"
                      value={artistGuess}
                      onChange={(e) =>
                        setArtistGuess(e.target.value)
                      }
                    />

                    {artistGuess && (
                      <button
                        className="clear"
                        onClick={() => setArtistGuess('')}
                        aria-label="Clear"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Song title"
                      value={titleGuess}
                      onChange={(e) =>
                        setTitleGuess(e.target.value)
                      }
                    />

                    {titleGuess && (
                      <button
                        className="clear"
                        onClick={() => setTitleGuess('')}
                        aria-label="Clear"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button
                className="guess-button"
                onClick={handleGuess}
              >
                Guess
              </button>

              <button
                className="skip-button"
                onClick={handleSkip}
              >
                Skip
              </button>
            </div>

            {message && (
              <p
                className={`message ${
                  wasCorrect === 'full'
                    ? 'correct'
                    : wasCorrect === 'partial'
                      ? 'partial'
                      : wasCorrect === 'skip'
                        ? 'skip'
                        : 'wrong'
                }`}
              >
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App