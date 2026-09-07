import { useState } from 'react'
import './App.css'
import songs from './songs.json'
import { saveScore } from './utils/leaderboard'
import Leaderboard from './components/Leaderboard'

const TOTAL_ROUNDS = 10

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
      setLyrics(lyricsData.lyrics || 'Lyrics not found.')
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
    } else {
      newPoints = points - 50
      setMessage(
        `Wrong! The song was "${currentSong.title}" by ${currentSong.artist}. -50 points`
      )
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

  if (!gameStarted) {
    return (
      <div className="App">
        <h1>Lyrics Quiz</h1>
        <input
          type="text"
          placeholder="Your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <button onClick={startGame}>Start game</button>
        <Leaderboard refreshKey={leaderboardKey} />
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="App">
        <h1>Game over!</h1>
        <h2>{playerName} scored {points} points</h2>
        <button onClick={playAgain}>Play again</button>
        <Leaderboard refreshKey={leaderboardKey} />
      </div>
    )
  }

  return (
    <div className="App">
      <h1>Lyrics Quiz</h1>
      <h2>Round {round}/{TOTAL_ROUNDS}</h2>
      <h2>Points: {points}</h2>

      {loading ? (
        <p>Loading lyrics...</p>
      ) : (
        <>
          <pre>{lyrics.split('\n\n')[0]}</pre>

          <div className="guess-container">
            <input
              type="text"
              placeholder="Artist"
              value={artistGuess}
              onChange={(e) => setArtistGuess(e.target.value)}
            />
            <input
              type="text"
              placeholder="Song title"
              value={titleGuess}
              onChange={(e) => setTitleGuess(e.target.value)}
            />
            <button onClick={handleGuess}>Guess</button>
            <button onClick={handleSkip}>Skip</button>
          </div>

          {message && <p>{message}</p>}
        </>
      )}
    </div>
  )
}

export default App
