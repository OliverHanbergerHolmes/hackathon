import { useEffect, useState } from 'react'
import './App.css'
import songs from './songs.json'

function App() {
  const [loading, setLoading] = useState(false)
  const [lyrics, setLyrics] = useState('')
  const [currentSong, setCurrentSong] = useState(null)

  const [artistGuess, setArtistGuess] = useState('')
  const [titleGuess, setTitleGuess] = useState('')

  const [points, setPoints] = useState(0)
  const [message, setMessage] = useState('')

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

  useEffect(() => {
    fetchLyrics()
  }, [])

  const handleGuess = () => {
    if (!currentSong) return

    const correctArtist =
      artistGuess.trim().toLowerCase() === currentSong.artist.trim().toLowerCase()

    const correctTitle =
      titleGuess.trim().toLowerCase() === currentSong.title.trim().toLowerCase()

    if (correctArtist && correctTitle) {
      setPoints(points + 100)
      setMessage('Correct! +100 points 🎉')
    } else {
      setPoints(points - 50)
      setMessage(
        `Wrong! The song was "${currentSong.title}" by ${currentSong.artist}. -50 points`
      )
    }

    setTimeout(() => {
      fetchLyrics()
    }, 1500)
  }

  const handleSkip = () => {
    fetchLyrics()
  }

  return (
    <div className="App">
      <h1>Lyrics Quiz</h1>

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

            <button onClick={handleGuess}>
              Guess
            </button>

            <button onClick={handleSkip}>
              Skip
            </button>
          </div>

          {message && <p>{message}</p>}
        </>
      )}
    </div>
  )
}

export default App
