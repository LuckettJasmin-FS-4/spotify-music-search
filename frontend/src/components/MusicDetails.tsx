import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Disc3,
  MicVocal,
  ExternalLink,
  Play,
  AudioLines,
} from 'lucide-react'

import { usePlayback } from '../context/PlaybackContext'
import './MusicDetails.css'

type MusicDetailsProps = {
  id: string
  type: 'album' | 'artist'
  onBack: () => void
}

type SpotifyTrack = {
  id: string
  name: string
  track_number: number
  duration_ms: number
  artists: { name: string }[]
  external_urls?: { spotify?: string }
}

type SpotifyDetails = {
  id: string
  name: string
  images?: { url: string }[]
  artists?: { name: string }[]
  release_date?: string
  total_tracks?: number
  genres?: string[]
  followers?: { total: number }
  external_urls?: { spotify?: string }
  tracks?: {
    items: SpotifyTrack[]
    total: number
  }
}

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)

  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

export default function MusicDetails({
  id,
  type,
  onBack,
}: MusicDetailsProps) {
  const [details, setDetails] = useState<SpotifyDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const {
  playTrack,
  isReady,
  currentTrack,
  isPaused,
} = usePlayback()

const trackIds = (details?.tracks?.items || [])
  .map(track => track.id)
  .filter(Boolean)
  useEffect(() => {
    const controller = new AbortController()

    async function loadDetails() {
      setLoading(true)
      setError('')
      setDetails(null)

      try {
        const resource = type === 'album'
          ? 'albums'
          : 'artists'

        const response = await fetch(
          `http://127.0.0.1:3000/api/spotify/${resource}/${id}`,
          {
            credentials: 'include',
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          throw new Error(`Unable to load ${type} details.`)
        }

        const result = await response.json()

        if (!controller.signal.aborted) {
          setDetails(result.data)
        }
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

    void loadDetails()

    return () => controller.abort()
  }, [id, type])

  return (
    <section className="music-details">

      <button
        type="button"
        className="library-back-button"
        onClick={onBack}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {loading && <p>Loading your music discovery...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && details && (
        <>
          <div className="music-details-header">

            <div className="music-details-artwork">
              {details.images?.[0]?.url ? (
                <img
                  src={details.images[0].url}
                  alt={details.name}
                />
              ) : (
                <div className="music-details-placeholder">
                  {type === 'album'
                    ? <Disc3 size={70} />
                    : <MicVocal size={70} />}
                </div>
              )}
            </div>

            <div className="music-details-info">

              <span className="music-details-type">
                {type === 'album' ? 'ALBUM' : 'ARTIST'}
              </span>

              <h2>{details.name}</h2>

              {details.artists && (
                <p>
                  {details.artists
                    .map(artist => artist.name)
                    .join(', ')}
                </p>
              )}

              {details.release_date && (
                <p>
                  Released: {details.release_date}
                </p>
              )}

              {details.total_tracks !== undefined && (
                <p>{details.total_tracks} tracks</p>
              )}

              {details.followers && (
                <p>
                  {details.followers.total.toLocaleString()} followers
                </p>
              )}

              {!!details.genres?.length && (
                <div className="music-details-genres">
                  {details.genres.map(genre => (
                    <span key={genre}>{genre}</span>
                  ))}
                </div>
              )}
{type === 'album' && trackIds.length > 0 && (
  <button
    type="button"
    className="racket-play-all"
    disabled={!isReady}
    onClick={() =>
      void playTrack(trackIds[0], trackIds)
    }
  >
    <Play size={20} />
    Play Album
  </button>
)}
              {details.external_urls?.spotify && (
                <a
                  className="music-details-spotify"
                  href={details.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Spotify
                  <ExternalLink size={16} />
                </a>
              )}

            </div>
          </div>

          {type === 'album' && details.tracks && (
            <div className="music-details-tracks">

              <h3>Track Listing</h3>

              {details.tracks.items.map(track => {
  const isPlaying =
    currentTrack?.id === track.id && !isPaused

  return (
    <div
      className={`music-details-track ${
        isPlaying ? 'album-track-playing' : ''
      }`}
      key={track.id}
    >
      <button
        type="button"
        className="album-track-play"
        disabled={!isReady || !track.id}
        aria-label={`Play ${track.name} in Racket`}
        onClick={() =>
          void playTrack(track.id, trackIds)
        }
      >
        {isPlaying ? (
          <AudioLines size={20} />
        ) : (
          <>
            <span className="album-track-number">
              {track.track_number}
            </span>

            <Play
              size={18}
              className="album-track-play-icon"
            />
          </>
        )}
      </button>

      <div className="track-information">
        <h4>{track.name}</h4>

        <p>
          {track.artists
            .map(artist => artist.name)
            .join(', ')}
        </p>

        {isPlaying && (
          <span className="album-now-playing">
            Now Playing
          </span>
        )}
      </div>

      <span className="track-duration">
        {formatDuration(track.duration_ms)}
      </span>

      {track.external_urls?.spotify && (
        <a
          href={track.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${track.name} in Spotify`}
        >
          <ExternalLink size={16} />
        </a>
      )}
    </div>
  )
})}

              {details.tracks.total > details.tracks.items.length && (
                <p>Open the album in Spotify to view all tracks.</p>
              )}

            </div>
          )}
        </>
      )}
    </section>
  )
}