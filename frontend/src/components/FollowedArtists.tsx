import { useEffect, useState } from 'react'
import { MicVocal } from 'lucide-react'
import MusicDetails from './MusicDetails'
import './FollowedArtists.css'

type SpotifyArtist = {
  id: string
  name: string
  images: { url: string }[]
  external_urls: {
    spotify: string
  }
}

export default function FollowedArtists() {
  const [artists, setArtists] = useState<SpotifyArtist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadFollowedArtists() {
      try {
        const response = await fetch(
          'http://127.0.0.1:3000/api/spotify/followed-artists',
          {
            credentials: 'include',
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          throw new Error('Unable to load your followed artists.')
        }

        const data = await response.json()
        setArtists(data.artists || [])
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

    void loadFollowedArtists()

    return () => controller.abort()
  }, [])

  if (selectedArtist) {
    return (
      <MusicDetails
        id={selectedArtist}
        type="artist"
        onBack={() => setSelectedArtist(null)}
      />
    )
  }

  return (
    <section className="followed-artists">
      <h3>Followed Artists</h3>

      <p>Keep up with the artists you follow on Spotify.</p>

      {loading && <p>Loading your followed artists...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && artists.length === 0 && (
        <p>You aren't following any artists yet.</p>
      )}

      <div className="followed-artists-grid">
        {artists.map((artist) => (
          <button
            type="button"
            key={artist.id}
            className="followed-artist-card"
            onClick={() => setSelectedArtist(artist.id)}
          >
            {artist.images?.[0]?.url ? (
              <img
                src={artist.images[0].url}
                alt={`${artist.name} profile`}
              />
            ) : (
              <div className="followed-artist-placeholder">
                <MicVocal size={48} />
              </div>
            )}

            <h4>{artist.name}</h4>
            <p>Artist</p>
          </button>
        ))}
      </div>
    </section>
  )
}