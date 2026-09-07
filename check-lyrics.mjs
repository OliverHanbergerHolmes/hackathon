// check-lyrics.mjs
// Kollar igenom songs.json och testar varje låt mot lyrics.ovh
// Kör med: node check-lyrics.mjs
//
// Skapar två filer:
//   songs-with-lyrics.json   -> låtar som funkar, redo att användas i spelet
//   songs-missing-lyrics.json -> låtar som gav 404 / inget svar, för info

import fs from "fs";

const INPUT_FILE = "./src/songs.json"; // ändra path om filen ligger nån annanstans
const DELAY_MS = 300; // paus mellan anrop, snäll mot APIt

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkSong(artist, title) {
  const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
  try {
    const res = await fetch(url);
    if (res.status === 404) return { ok: false, reason: "not found (404)" };
    if (!res.ok) return { ok: false, reason: `http ${res.status}` };

    const data = await res.json();
    if (!data.lyrics || data.lyrics.trim().length === 0) {
      return { ok: false, reason: "empty lyrics field" };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: `network error: ${err.message}` };
  }
}

async function main() {
  const raw = fs.readFileSync(INPUT_FILE, "utf-8");
  const songs = JSON.parse(raw);

  const withLyrics = [];
  const missing = [];

  console.log(`Kollar ${songs.length} låtar mot lyrics.ovh...\n`);

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    const result = await checkSong(song.artist, song.title);

    if (result.ok) {
      withLyrics.push(song);
      console.log(`[${i + 1}/${songs.length}] OK   - ${song.artist} - ${song.title}`);
    } else {
      missing.push({ ...song, reason: result.reason });
      console.log(`[${i + 1}/${songs.length}] MISS - ${song.artist} - ${song.title} (${result.reason})`);
    }

    await sleep(DELAY_MS);
  }

  fs.writeFileSync("songs-with-lyrics.json", JSON.stringify(withLyrics, null, 4));
  fs.writeFileSync("songs-missing-lyrics.json", JSON.stringify(missing, null, 4));

  console.log(`\nKlart!`);
  console.log(`  ${withLyrics.length} låtar har lyrics -> songs-with-lyrics.json`);
  console.log(`  ${missing.length} låtar saknar lyrics -> songs-missing-lyrics.json`);
}

main();