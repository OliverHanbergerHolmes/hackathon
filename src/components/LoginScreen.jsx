import { useState } from "react"

function LoginScreen({ initialName, onContinue }) {
  const [name, setName] = useState(initialName)

  const submit = () => {
    if (!name.trim()) return
    onContinue(name.trim())
  }

  return (
    <div className="app">
      <div className="start-screen">
        <span className="logo">🎤</span>

        <h1>Lyrics Quiz</h1>

        <p className="subtitle">Guess the song from the lyrics. No mercy.</p>

        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoFocus
          />

          {name && (
            <button className="clear" onClick={() => setName("")} aria-label="Clear">
              ×
            </button>
          )}
        </div>

        <button className="start-button" onClick={submit} disabled={!name.trim()}>
          Continue
        </button>
      </div>
    </div>
  )
}

export default LoginScreen