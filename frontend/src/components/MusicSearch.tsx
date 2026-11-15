
import { useState, type FormEvent } from 'react'

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
}

function MusicSearch({ displayName }: MusicSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'Your session expired. Please reconnect Spotify.'
            : 'Unable to search Spotify right now.'
        )
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
                <p>{track.artists.map((artist) => artist.name).join(', ')}</p>
                {track.external_urls?.spotify && (
                  <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Spotify
                  </a>
                )}
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
