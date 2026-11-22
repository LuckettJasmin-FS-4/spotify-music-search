
import { useEffect, useState } from 'react'
import './SavedAlbums.css'

type SpotifyAlbum = {
  id: string
  name: string
  images: { url: string }[]
  artists: { name: string }[]
  external_urls: {
    spotify: string
  }
}

type SavedAlbum = {
  added_at: string
  album: SpotifyAlbum
}

export default function SavedAlbums() {
  const [albums, setAlbums] = useState<SavedAlbum[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadSavedAlbums() {
      try {
        const response = await fetch(
          'http://127.0.0.1:3000/api/spotify/saved-albums',
          {
            credentials: 'include',
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          throw new Error('Unable to load your saved albums.')
        }

        const data = await response.json()
        setAlbums(data.albums || [])
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

    loadSavedAlbums()

    return () => controller.abort()
  }, [])

  return (
    <section className="saved-albums">
      <h3>Saved Albums</h3>
      <p>Albums you've added to your Spotify library.</p>

      {loading && <p>Loading your saved albums...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && albums.length === 0 && (
        <p>You haven't saved any albums yet.</p>
      )}

      <div className="saved-albums-grid">
        {albums.map(({ album }) => (
          <a
            key={album.id}
            className="saved-album-card"
            href={album.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
          >
            {album.images?.[0]?.url && (
              <img
                src={album.images[0].url}
                alt={`${album.name} album cover`}
              />
            )}

            <h4>{album.name}</h4>
            <p>
              {album.artists
                .map((artist) => artist.name)
                .join(', ')}
            </p>
          </a>
        ))}
      </div>
    </section>
  )
}
