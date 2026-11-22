
import { useEffect, useState } from 'react'
import './LikedSongs.css'

type SpotifyTrack = {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string }[]
  }
  external_urls: {
    spotify: string
  }
}

type LikedSong = {
  added_at: string
  track: SpotifyTrack
}

export default function LikedSongs() {
  const [songs, setSongs] = useState<LikedSong[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadLikedSongs() {
      try {
        const response = await fetch(
          'http://127.0.0.1:3000/api/spotify/liked-songs',
          {
            credentials: 'include',
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          throw new Error('Unable to load your liked songs.')
        }

        const data = await response.json()
        setSongs(data.tracks || [])
      } catch (err) {
        if (controller.signal.aborted) return

        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong.'
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadLikedSongs()

    return () => controller.abort()
  }, [])

  return (
    <div className="liked-songs">
      <h3>Liked Songs</h3>
      <p>Music you've saved to your Spotify library.</p>

      {loading && <p>Loading your liked songs...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && songs.length === 0 && (
        <p>You haven't liked any songs yet.</p>
      )}

      <div className="liked-songs-grid">
        {songs.map(({ track }) => (
          <a
            key={track.id}
            className="liked-song-card"
            href={track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
          >
            {track.album.images?.[0]?.url && (
              <img
                src={track.album.images[0].url}
                alt={`${track.album.name} album cover`}
              />
            )}

            <div>
              <h4>{track.name}</h4>
              <p>{track.artists.map(artist => artist.name).join(', ')}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
