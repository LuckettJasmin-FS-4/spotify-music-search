import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Play,
  Music2,
  AudioLines,
  ExternalLink,
} from 'lucide-react'
import { usePlayback } from '../context/PlaybackContext'
import './PlaylistDetails.css'

type SpotifyTrack = {
  id: string
  name: string
  duration_ms: number
  is_local?: boolean
  is_playable?: boolean
  type?: string
  artists: { name: string }[]
  album?: {
    images?: { url: string }[]
  }
}

type PlaylistItem = {
  track?: SpotifyTrack | null
  item?: SpotifyTrack | null
}

type PlaylistDetailsProps = {
  playlist: {
    id: string
    name: string
    description: string | null
    images: { url: string }[]
    external_urls: {
      spotify: string
    }
  }
  onBack: () => void
}

function formatDuration(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)

  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

export default function PlaylistDetails({
  playlist,
  onBack,
}: PlaylistDetailsProps) {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)

  const {
    playTrack,
    isReady,
    currentTrack,
    isPaused,
  } = usePlayback()

  useEffect(() => {
    const controller = new AbortController()

    async function loadTracks() {
      setLoading(true)
      setError('')
      setTracks([])
      setTotal(0)

      try {
        const response = await fetch(
          `http://127.0.0.1:3000/api/spotify/playlists/${playlist.id}/items`,
          {
            credentials: 'include',
            signal: controller.signal,
          }
        )

        if (response.status === 403) {
          throw new Error(
            'Spotify does not allow Racket to access the songs in this playlist.'
          )
        }

        if (!response.ok) {
          throw new Error('Unable to load playlist songs.')
        }

        const data = await response.json()

        const items: PlaylistItem[] =
          data.data?.items || []

        const songs = items
          .map(entry => entry.item ?? entry.track)
          .filter(
            (track): track is SpotifyTrack =>
              Boolean(
                track?.id &&
                !track.is_local &&
                track.is_playable !== false &&
                (!track.type || track.type === 'track')
              )
          )

        setTracks(songs)
        setTotal(data.data?.total ?? items.length)
      } catch (err) {
        if (controller.signal.aborted) return

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load this playlist.'
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadTracks()

    return () => controller.abort()
  }, [playlist.id])

  const trackIds = tracks.map(track => track.id)

  return (
    <section className="playlist-details">
      <button
        type="button"
        className="playlist-back-button"
        onClick={onBack}
      >
        <ArrowLeft size={18} />
        Back to Playlists
      </button>

      <div className="playlist-details-header">
        <div className="playlist-details-artwork">
          {playlist.images?.[0]?.url ? (
            <img
              src={playlist.images[0].url}
              alt={playlist.name}
            />
          ) : (
            <Music2 size={70} />
          )}
        </div>

        <div className="playlist-details-info">
          <span className="playlist-details-label">
            PLAYLIST
          </span>

          <h2>{playlist.name}</h2>

          <p>
            {playlist.description ||
              'Your personal music collection.'}
          </p>

          {!loading && !error && (
            <p>{total} playlist items</p>
          )}

          <div className="playlist-details-actions">
            <button
              type="button"
              className="racket-play-all"
              disabled={!isReady || tracks.length === 0}
              onClick={() => {
                if (tracks[0]) {
                  void playTrack(tracks[0].id, trackIds)
                }
              }}
            >
              <Play size={18} fill="currentColor" />
              Play Playlist
            </button>

            {playlist.external_urls?.spotify && (
              <a
                href={playlist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="playlist-spotify-link"
              >
                Open in Spotify
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </div>

      {loading && <p>Loading playlist songs...</p>}

      {error && (
        <p className="playlist-error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && tracks.length === 0 && (
        <p>No playable songs found in this playlist.</p>
      )}

      {!loading && !error && tracks.length > 0 && (
        <div className="playlist-track-list">
          <h3>Track Listing</h3>

          {tracks.map((track, index) => {
            const isCurrent =
              currentTrack?.id === track.id

            const isPlaying =
              isCurrent && !isPaused

            return (
              <div
                key={`${track.id}-${index}`}
                className={`playlist-track ${
                  isCurrent ? 'playlist-track-active' : ''
                }`}
              >
                <button
                  type="button"
                  className="playlist-track-play"
                  disabled={!isReady}
                  aria-label={`Play ${track.name}`}
                  onClick={() =>
                    void playTrack(track.id, trackIds)
                  }
                >
                  {isPlaying ? (
                    <AudioLines
                      size={20}
                      className="playlist-playing-icon"
                    />
                  ) : (
                    <Play size={18} />
                  )}
                </button>

                <div className="playlist-track-artwork">
                  {track.album?.images?.[0]?.url ? (
                    <img
                      src={track.album.images[0].url}
                      alt=""
                    />
                  ) : (
                    <Music2 size={22} />
                  )}
                </div>

                <div className="playlist-track-info">
                  <h4>{track.name}</h4>

                  <p>
                    {track.artists
                      .map(artist => artist.name)
                      .join(', ')}
                  </p>
                </div>

                <span className="playlist-track-duration">
                  {formatDuration(track.duration_ms)}
                </span>
              </div>
            )
          })}

          {total > tracks.length && (
            <p className="playlist-track-notice">
              Showing {tracks.length} playable songs
              from the currently loaded playlist items.
            </p>
          )}
        </div>
      )}
    </section>
  )
}