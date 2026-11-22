import { useEffect, useState } from 'react'
import './PlaylistsPage.css'

type SpotifyPlaylist = {
  id: string
  name: string
  description: string | null
  images: { url: string }[]
  external_urls: {
    spotify: string
  }
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadPlaylists() {
      try {
        const response = await fetch(
          'http://127.0.0.1:3000/api/spotify/playlists',
          {
            credentials: 'include',
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          throw new Error('Unable to load your Spotify playlists.')
        }

        const data = await response.json()
        setPlaylists(data.playlists || [])
      } catch (err) {
        if (controller.signal.aborted) return

        setError(
          err instanceof Error ? err.message : 'Something went wrong.'
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadPlaylists()

    return () => controller.abort()
  }, [])

  return (
    <div className="racket-page">
      <h2>Your Playlists</h2>
      <p>Your favorite soundtracks, all in one place.</p>

      {loading && <p>Loading your playlists...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && playlists.length === 0 && (
        <p>No playlists found in your Spotify account yet.</p>
      )}

      <div className="playlist-grid">
        {playlists.map((playlist) => (
          <a
            key={playlist.id}
            className="playlist-card"
            href={playlist.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
          >
            {playlist.images?.[0]?.url && (
              <img
                src={playlist.images[0].url}
                alt={`${playlist.name} cover`}
              />
            )}

            <h3>{playlist.name}</h3>
            <p>{playlist.description || 'Your Spotify playlist'}</p>
          </a>
        ))}
      </div>
    </div>
  )
}