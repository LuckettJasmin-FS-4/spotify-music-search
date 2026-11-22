import { useEffect, useState, type FormEvent } from 'react'

type SpotifyImage = {
  url: string
}

type SpotifyArtist = {
  id: string
  name: string
  images?: SpotifyImage[]
}

type SpotifyAlbum = {
  id: string
  name: string
  images: SpotifyImage[]
  artists: SpotifyArtist[]
}

type SpotifyTrack = {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: SpotifyAlbum
  external_urls?: { spotify?: string }
}

type SearchResults = {
  success: boolean
  query: string
  tracks: SpotifyTrack[]
  artists: SpotifyArtist[]
  albums: SpotifyAlbum[]
}
type MusicSearchProps = {
  displayName: string
  onSessionExpired: () => void
  selectedMood?: string
}
function MusicSearch({
  displayName,
  onSessionExpired,
  selectedMood,
}: MusicSearchProps) {

  const [query, setQuery] = useState(() => {
  return selectedMood ? `${selectedMood} music` : ''
})
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
const [savingTrackId, setSavingTrackId] = useState<string | null>(null)
const [savedTrackIds, setSavedTrackIds] = useState<string[]>([])
const [celebrating, setCelebrating] = useState(false)
const [celebrationCount, setCelebrationCount] = useState(0)

useEffect(() => {
  if (!celebrating) return

  const timer = window.setTimeout(() => {
    setCelebrating(false)
  }, 2600)

  return () => window.clearTimeout(timer)
}, [celebrating, celebrationCount])
const handleSaveTrack = async (trackId: string) => {
  if (savingTrackId || savedTrackIds.includes(trackId)) return

  setSavingTrackId(trackId)
  setError('')

  try {
    const response = await fetch(
      `http://127.0.0.1:3000/api/spotify/save-track/${encodeURIComponent(trackId)}`,
      {
        method: 'PUT',
        credentials: 'include',
      }
    )

    if (response.status === 401) {
      onSessionExpired()
      return
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || 'Unable to save song.')
    }

    setSavedTrackIds((current) => [...current, trackId])
    setCelebrationCount((current) => current + 1)
setCelebrating(true)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unable to save song.')
  } finally {
    setSavingTrackId(null)
  }
}
  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!query.trim()) return

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await fetch(
        `http://127.0.0.1:3000/api/spotify/search?q=${encodeURIComponent(query.trim())}`,
        { credentials: 'include' }
      )

     if (response.status === 401) {
  onSessionExpired()
  return
}

if (!response.ok) {
  throw new Error('Unable to search Spotify right now.')
}

      const data: SearchResults = await response.json()
      setResults(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="music-search">
      {celebrating && (
  <div
    className="racket-save-celebration"
    role="status"
    key={celebrationCount}
  >
    <span className="racket-celebration-sparkle sparkle-one">✦</span>
    <span className="racket-celebration-sparkle sparkle-two">✧</span>
    <span className="racket-celebration-sparkle sparkle-three">✦</span>

    <div className="racket-celebration-heart">💙</div>
    <div className="racket-celebration-face">🦝</div>

    <p>Racket loves this one!</p>
    <span>Song saved to your library</span>
  </div>
)}
      <h2>Find your next favorite song, {displayName}.</h2>
      <p className="description">
        Search for songs, artists, and albums. Your next discovery
        is just a little racket away.
      </p>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search songs, artists, or albums..."
          aria-label="Search Spotify music"
          className="search-input"
        />
        <button
          type="submit"
          className="spotify-button"
          disabled={loading || !query.trim()}
        >
          {loading ? 'Searching...' : 'Search music'}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      {results && (
        <div className="search-results">
         <h3>Songs</h3>
<div className="result-grid">
  {results.tracks?.map((track) => (
    <article className="result-card" key={track.id}>
      {track.album.images?.[0] && (
        <img
          src={track.album.images[0].url}
          alt={`${track.album.name} album cover`}
          className="result-image"
        />
      )}

      <h4>{track.name}</h4>

      <p>
        {track.artists.map((artist) => artist.name).join(', ')}
      </p>

      {track.external_urls?.spotify && (
        <a
          href={track.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Spotify
        </a>
      )}

      <button
        type="button"
        className="racket-save-button"
        onClick={() => handleSaveTrack(track.id)}
        disabled={
          savingTrackId === track.id ||
          savedTrackIds.includes(track.id)
        }
      >
        {savedTrackIds.includes(track.id)
          ? '💙 Saved!'
          : savingTrackId === track.id
            ? 'Saving...'
            : '♡ Save Song'}
      </button>
    </article>
  ))}
</div>

          <h3>Artists</h3>
          <div className="result-grid">
            {results.artists?.map((artist) => (
              <article className="result-card" key={artist.id}>
                {artist.images?.[0] && (
                  <img
                    src={artist.images[0].url}
                    alt={`${artist.name} artist`}
                    className="result-image"
                  />
                )}
                <h4>{artist.name}</h4>
              </article>
            ))}
          </div>

          <h3>Albums</h3>
          <div className="result-grid">
            {results.albums?.map((album) => (
              <article className="result-card" key={album.id}>
                {album.images?.[0] && (
                  <img
                    src={album.images[0].url}
                    alt={`${album.name} album cover`}
                    className="result-image"
                  />
                )}
                <h4>{album.name}</h4>
                <p>{album.artists.map((artist) => artist.name).join(', ')}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MusicSearch
