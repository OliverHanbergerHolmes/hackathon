import { useState } from 'react'
import './App.css'
import songs from './songs.json'
import { saveScore } from './utils/leaderboard'
import Leaderboard from './components/Leaderboard'

const TOTAL_ROUNDS = 10

function censorTitle(lyrics, title) {
  if (!lyrics || !title) return lyrics

  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(escaped, 'gi')

  return lyrics.replace(regex, (match) => '█'.repeat(match.length))
}

function App() {
  const [playerName, setPlayerName] = useState('')
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const [round, setRound] = useState(1)
  const [loading, setLoading] = useState(false)
  const [lyrics, setLyrics] = useState('')
  const [currentSong, setCurrentSong] = useState(null)

  const [artistGuess, setArtistGuess] = useState('')
  const [titleGuess, setTitleGuess] = useState('')

  const [points, setPoints] = useState(0)
  const [message, setMessage] = useState('')
  const [wasCorrect, setWasCorrect] = useState(null)
  const [leaderboardKey, setLeaderboardKey] = useState(0)

  const fetchLyrics = async () => {
    setLoading(true)
    setMessage('')
    setArtistGuess('')
    setTitleGuess('')

    try {
      const song = songs[Math.floor(Math.random() * songs.length)]
      setCurrentSong(song)

      const response = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch lyrics')
      }

      const lyricsData = await response.json()
      const rawLyrics = lyricsData.lyrics || 'Lyrics not found.'
      setLyrics(censorTitle(rawLyrics, song.title))
    } catch (error) {
      console.error('Error fetching lyrics:', error)
      setLyrics('Could not fetch lyrics.')
    } finally {
      setLoading(false)
    }
  }

  const startGame = () => {
    if (!playerName.trim()) return
    setGameStarted(true)
    setGameOver(false)
    setRound(1)
    setPoints(0)
    fetchLyrics()
  }

  const handleGuess = () => {
    if (!currentSong) return

    const correctArtist =
      artistGuess.trim().toLowerCase() === currentSong.artist.trim().toLowerCase()
    const correctTitle =
      titleGuess.trim().toLowerCase() === currentSong.title.trim().toLowerCase()

    let newPoints = points

    if (correctArtist && correctTitle) {
      newPoints = points + 100
      setMessage('Correct! +100 points 🎉')
      setWasCorrect('full')
    } else if (correctArtist || correctTitle) {
      newPoints = points + 50
      setMessage(`Close! You got the ${correctArtist ? 'artist' : 'title'} right. +50 points`)
      setWasCorrect('partial')
    } else {
      newPoints = points - 50
      setMessage(`Wrong! It was "${currentSong.title}" by ${currentSong.artist}. -50 points`)
      setWasCorrect('none')
    }

    setPoints(newPoints)
    advanceRound(newPoints)
  }

  const handleSkip = () => {
    advanceRound(points)
  }

  const advanceRound = (currentPoints) => {
    if (round >= TOTAL_ROUNDS) {
      saveScore(playerName, currentPoints)
      setLeaderboardKey((k) => k + 1)
      setGameOver(true)
      return
    }

    setTimeout(() => {
      setRound((r) => r + 1)
      fetchLyrics()
    }, 1500)
  }

  const playAgain = () => {
    setGameStarted(false)
    setGameOver(false)
    setPlayerName('')
  }

  // -------- Start screen --------
  if (!gameStarted) {
    return (
      <div className="app">
        <div className="start-screen">
          <span className="logo">🎤</span>
          <h1>Lyrics Quiz</h1>
          <p className="subtitle">Guess the song from the lyrics. 10 rounds. No mercy.</p>

          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startGame()}
            />
            {playerName && (
              <button className="clear" onClick={() => setPlayerName('')} aria-label="Clear">
                ×
              </button>
            )}
          </div>

          <button className="start-button" onClick={startGame} disabled={!playerName.trim()}>
            Start game
          </button>
        </div>

        <Leaderboard refreshKey={leaderboardKey} />
      </div>
    )
  }

  // -------- Game over screen --------
  if (gameOver) {
    return (
      <div className="app">
        <div className="game-over">
          <span className="game-over-emoji">{points >= 500 ? '🏆' : '🎵'}</span>
          <h1>Game over!</h1>
          <span className="final-score-label">{playerName}'s score</span>
          <p className="final-score">{points}</p>

          <button className="play-again-button" onClick={playAgain}>
            Play again
          </button>
        </div>

        <Leaderboard refreshKey={leaderboardKey} />
      </div>
    )
  }

  // -------- Quiz screen --------
  return (
    <div className="app">
      <div className="header">
        <h1>Lyrics Quiz</h1>
        <div className="score-row">
          <div className="score">
            <span>Round</span>
            <strong>{round}/{TOTAL_ROUNDS}</strong>
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
              <p className="lyrics">{lyrics.split('\n\n')[0]}</p>
            </div>

            <div className="controls">
              <div className="inputs">
                <div className="input-group">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Artist"
                      value={artistGuess}
                      onChange={(e) => setArtistGuess(e.target.value)}
                    />
                    {artistGuess && (
                      <button className="clear" onClick={() => setArtistGuess('')} aria-label="Clear">
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
                      onChange={(e) => setTitleGuess(e.target.value)}
                    />
                    {titleGuess && (
                      <button className="clear" onClick={() => setTitleGuess('')} aria-label="Clear">
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button className="guess-button" onClick={handleGuess}>
                Guess
              </button>

              <button className="skip-button" onClick={handleSkip}>
                Skip
              </button>
            </div>

            {message && (
              <p className={`message ${
                wasCorrect === 'full' ? 'correct' :
                wasCorrect === 'partial' ? 'partial' : 'wrong'
              }`}>{message}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App