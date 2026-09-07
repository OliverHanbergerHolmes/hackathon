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

    try {x
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
      artistGuess.trim().toLowerCase() ===
      currentSong.artist.trim().toLowerCase()

    const correctTitle =
      titleGuess.trim().toLowerCase() ===
      currentSong.title.trim().toLowerCase()

    if (correctArtist && correctTitle) {
      setPoints((prev) => prev + 100)
      setMessage('Correct! +100 🎉')
    } else {
      setPoints((prev) => prev - 50)
      setMessage(
        `Wrong! It was "${currentSong.title}" by ${currentSong.artist} · -50`
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
    <main className="app">
      <header className="header">
        <h1>Lyrics Quiz</h1>

        <div className="score">
          <span>Score</span>
          <strong>{points}</strong>
        </div>
      </header>

      <section className="quiz">
        <div className="lyrics-card">
          {loading ? (
            <div className="loading">
              <span className="spinner" />
              <p>Loading lyrics...</p>
            </div>
          ) : (
            <p className="lyrics">{lyrics.split('\n\n')[0]}</p>
          )}
        </div>

        {!loading && (
          <div className="controls">
            <div className="inputs">
              <div className="input-group">
                <label htmlFor="artist">Artist</label>

                <div className="input-wrapper">
                  <input
                    id="artist"
                    type="text"
                    placeholder="Who sings it?"
                    value={artistGuess}
                    onChange={(e) => setArtistGuess(e.target.value)}
                    autoComplete="off"
                  />

                  {artistGuess && (
                    <button
                      className="clear"
                      type="button"
                      onClick={() => setArtistGuess('')}
                      aria-label="Clear artist"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="title">Song title</label>

                <div className="input-wrapper">
                  <input
                    id="title"
                    type="text"
                    placeholder="What's the song?"
                    value={titleGuess}
                    onChange={(e) => setTitleGuess(e.target.value)}
                    autoComplete="off"
                  />

                  {titleGuess && (
                    <button
                      className="clear"
                      type="button"
                      onClick={() => setTitleGuess('')}
                      aria-label="Clear song title"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button className="guess-button" onClick={handleGuess}>
              Guess
              <span>+100 / −50</span>
            </button>

            <button className="skip-button" onClick={handleSkip}>
              Skip
            </button>

            {message && (
              <div
                className={`message ${
                  message.startsWith('Correct') ? 'correct' : 'wrong'
                }`}
              >
                {message}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

export default App
