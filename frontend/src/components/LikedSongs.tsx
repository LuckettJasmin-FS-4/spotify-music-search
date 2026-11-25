import { useEffect, useState } from 'react'
import { Play, Music2 } from 'lucide-react'
import { usePlayback } from '../context/PlaybackContext'
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

  const {
    playTrack,
    isReady,
    currentTrack,
    isPaused,
  } = usePlayback()

  const trackIds = songs
    .map(({ track }) => track?.id)
    .filter(Boolean)

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

        setSongs(
          (data.tracks || []).filter(
            (item: LikedSong) => item.track?.id
          )
        )
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

      {trackIds.length > 0 && (
        <button
          type="button"
          className="racket-play-all"
          disabled={!isReady}
          onClick={() =>
            void playTrack(trackIds[0], trackIds)
          }
        >
          <Play size={20} />
          Play All
        </button>
      )}

      {loading && <p>Loading your liked songs...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && songs.length === 0 && (
        <p>You haven't liked any songs yet.</p>
      )}

      <div className="liked-songs-grid">
        {songs.map(({ track }) => {
          const isPlaying =
            currentTrack?.id === track.id && !isPaused

          return (
            <article
              key={track.id}
              className={`liked-song-card ${
                isPlaying ? 'liked-song-playing' : ''
              }`}
            >
              {track.album.images?.[0]?.url ? (
                <img
                  src={track.album.images[0].url}
                  alt={`${track.album.name} album cover`}
                />
              ) : (
                <div className="liked-song-placeholder">
                  <Music2 size={36} />
                </div>
              )}

              <div>
                <h4>{track.name}</h4>

                <p>
                  {track.artists
                    .map(artist => artist.name)
                    .join(', ')}
                </p>

                <button
                  type="button"
                  className="racket-track-play"
                  disabled={!isReady}
                  aria-label={`Play ${track.name} in Racket`}
                  onClick={() =>
                    void playTrack(track.id, trackIds)
                  }
                >
                  <Play size={16} />
                  {isPlaying ? 'Now Playing' : 'Play in Racket'}
                </button>

                {track.external_urls?.spotify && (
                  <a
                    className="liked-song-spotify-link"
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Spotify
                  </a>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}