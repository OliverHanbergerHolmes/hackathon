// src/categories.js

export const CATEGORIES = [
  { id: "70s", label: "70s", emoji: "🕺", type: "decade", minYear: 1970, maxYear: 1979 },
  { id: "90s", label: "90s", emoji: "📼", type: "decade", minYear: 1990, maxYear: 1999 },
  { id: "00s", label: "00s+", emoji: "📱", type: "decade", minYear: 2000, maxYear: 9999 },
  { id: "rock", label: "Rock", emoji: "🎸", type: "genre", tag: "rock" },
  { id: "pop", label: "Pop", emoji: "🎤", type: "genre", tag: "pop" },
  { id: "hiphop", label: "Hip-Hop", emoji: "🎧", type: "genre", tag: "hiphop" },
]

// Shown as its own wide button below the grid, not part of CATEGORIES —
// it plays from every song regardless of decade or genre.
export const NO_CATEGORY = { id: "none", label: "No Category", emoji: "🎲", type: "all" }

export function getCategoryLabel(id) {
  if (id === NO_CATEGORY.id) return NO_CATEGORY.label
  const found = CATEGORIES.find((c) => c.id === id)
  return found ? found.label : "Overall"
}

export function getSongsForCategory(songs, categoryId) {
  if (categoryId === NO_CATEGORY.id) return songs

  const category = CATEGORIES.find((c) => c.id === categoryId)
  if (!category) return songs

  const filtered =
    category.type === "decade"
      ? songs.filter((song) => song.year >= category.minYear && song.year <= category.maxYear)
      : songs.filter((song) => song.categories?.includes(category.tag))

  if (filtered.length === 0) {
    console.warn(
      `No songs match category "${categoryId}" — check songs.json. Falling back to the full song list.`
    )
    return songs
  }

  return filtered
}