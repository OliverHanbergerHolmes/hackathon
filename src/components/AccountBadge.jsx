import { useState } from "react"

function AccountBadge({ playerName, onChangeName }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(playerName)

  const openEditor = () => {
    setDraft(playerName)
    setEditing(true)
  }

  const save = () => {
    const trimmed = draft.trim()
    if (trimmed) {
      onChangeName(trimmed)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="account-badge account-badge-editing">
        <input
          className="account-input"
          type="text"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save()
            if (e.key === "Escape") setEditing(false)
          }}
        />
        <button className="account-save" onClick={save} aria-label="Save name">
          ✓
        </button>
      </div>
    )
  }

  return (
    <button className="account-badge" onClick={openEditor}>
      <span className="account-avatar">
        {playerName.trim().charAt(0).toUpperCase() || "?"}
      </span>
      <span className="account-name">{playerName}</span>
    </button>
  )
}

export default AccountBadge