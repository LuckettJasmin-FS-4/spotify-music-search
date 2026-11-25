import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Music2,
  Headphones,
} from 'lucide-react'

import type useSpotifyPlayer from '../hooks/useSpotifyPlayer'
import './RacketPlayer.css'

type RacketPlayerProps = {
  player: ReturnType<typeof useSpotifyPlayer>
}

function formatTime(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)

  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

export default function RacketPlayer({
  player,
}: RacketPlayerProps) {
  const {
    isReady,
    isPaused,
    currentTrack,
    position,
    duration,
    volume,
    error,
    togglePlayback,
    nextTrack,
    previousTrack,
    changeVolume,
    seek,
  } = player

  return (
    <footer className="racket-player">
      <div className="player-track-info">
        {currentTrack?.album.images?.[0]?.url ? (
          <img
            className="player-artwork"
            src={currentTrack.album.images[0].url}
            alt={`${currentTrack.album.name} cover`}
          />
        ) : (
          <div className="player-artwork-placeholder">
            <Music2 size={28} />
          </div>
        )}

        <div className="player-track-text">
          <h4>
            {currentTrack?.name || 'Nothing playing yet'}
          </h4>

          <p>
            {currentTrack?.artists
              .map((artist) => artist.name)
              .join(', ') ||
              'Select a song to start listening'}
          </p>

          <span
            className={`player-status ${
              isReady ? 'connected' : ''
            }`}
          >
            <Headphones size={12} />
            {isReady ? 'Spotify connected' : 'Connecting to Spotify'}
          </span>
        </div>
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button
            type="button"
            aria-label="Previous track"
            disabled={!isReady || !currentTrack}
            onClick={() => void previousTrack()}
          >
            <SkipBack size={22} />
          </button>

          <button
            type="button"
            className="player-play-button"
            aria-label={isPaused ? 'Play' : 'Pause'}
            disabled={!isReady || !currentTrack}
            onClick={() => void togglePlayback()}
          >
            {isPaused ? (
              <Play size={25} />
            ) : (
              <Pause size={25} />
            )}
          </button>

          <button
            type="button"
            aria-label="Next track"
            disabled={!isReady || !currentTrack}
            onClick={() => void nextTrack()}
          >
            <SkipForward size={22} />
          </button>
        </div>

        <div className="player-progress">
          <span>{formatTime(position)}</span>

          <input
            type="range"
            min={0}
            max={duration || 1}
            value={position}
            disabled={!isReady || !currentTrack}
            aria-label="Song progress"
            onChange={(event) =>
              void seek(Number(event.target.value))
            }
          />

          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-volume">
        <Volume2 size={20} />

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          disabled={!isReady}
          aria-label="Playback volume"
          onChange={(event) =>
            void changeVolume(Number(event.target.value))
          }
        />
      </div>

      {error && (
        <div className="player-error" role="alert">
          {error}
        </div>
      )}
    </footer>
  )
}