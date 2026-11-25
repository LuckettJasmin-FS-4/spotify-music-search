import { useEffect, useRef, useState } from 'react'

const API_URL = 'http://127.0.0.1:3000'
export default function useSpotifyPlayer(enabled: boolean) {
  const playerRef = useRef<Spotify.Player | null>(null)

  const [deviceId, setDeviceId] = useState('')
  const [isReady, setIsReady] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [currentTrack, setCurrentTrack] =
    useState<Spotify.Track | null>(null)

  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.5)
  const [error, setError] = useState('')

  useEffect(() => {
  if (!enabled) return

  let disposed = false
    const initializePlayer = () => {
      if (disposed || playerRef.current) return

      const player = new window.Spotify.Player({
        name: 'Racket Music Player',

        getOAuthToken: (callback) => {
          void fetch(`${API_URL}/api/auth/playback-token`, {
            credentials: 'include',
})
            .then(async (response) => {
              if (!response.ok) {
                throw new Error(
                  'Unable to authorize Spotify playback.'
                )
              }

              const data = await response.json()

              if (!data.accessToken) {
                throw new Error('Spotify token unavailable.')
              }

              if (!disposed) {
                callback(data.accessToken)
              }
            })
            .catch(() => {
              if (!disposed) {
                setError(
                  'Unable to authorize Spotify. Please log in again.'
                )
              }
            })
        },

        volume: 0.5,
      })

      playerRef.current = player

      player.addListener('ready', ({ device_id }) => {
        if (disposed) return

        setDeviceId(device_id)
        setIsReady(true)
        setError('')

        console.log('Racket playback device is ready')
      })

      player.addListener('not_ready', () => {
        if (disposed) return

        setIsReady(false)
        setDeviceId('')
      })

      player.addListener(
        'player_state_changed',
        (state) => {
          if (!state || disposed) return

          setCurrentTrack(
            state.track_window.current_track
          )

          setIsPaused(state.paused)
          setPosition(state.position)
          setDuration(state.duration)
        }
      )

      player.addListener(
        'initialization_error',
        ({ message }) => {
          if (!disposed) setError(message)
        }
      )

      player.addListener(
        'authentication_error',
        ({ message }) => {
          if (!disposed) setError(message)
        }
      )

      player.addListener(
        'account_error',
        () => {
          if (!disposed) {
            setError(
              'Spotify Premium is required for full music playback.'
            )
          }
        }
      )

      player.addListener(
        'playback_error',
        ({ message }) => {
          if (!disposed) setError(message)
        }
      )

      void player.connect()
        .then((connected) => {
          if (!connected && !disposed) {
            setError('Unable to connect Spotify player.')
          }
        })
        .catch(() => {
          if (!disposed) {
            setError('Spotify player connection failed.')
          }
        })
    }

    window.onSpotifyWebPlaybackSDKReady =
      initializePlayer

    if (window.Spotify?.Player) {
      initializePlayer()
    }

    return () => {
      disposed = true
      playerRef.current?.disconnect()
      playerRef.current = null

      window.onSpotifyWebPlaybackSDKReady = () => {}
    }
  }, [enabled])

  useEffect(() => {
    if (!isReady || isPaused) return

    const timer = window.setInterval(() => {
      setPosition((previous) =>
        Math.min(previous + 1000, duration)
      )
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isReady, isPaused, duration])

  const playTrack = async (trackId: string) => {
    if (!deviceId || !playerRef.current) {
      setError('Spotify player is not ready yet.')
      return
    }

    try {
      setError('')

      await playerRef.current.activateElement()

      const tokenResponse = await fetch(
        `${API_URL}/api/auth/playback-token`,
        {
          credentials: 'include',
        }
      )

      if (!tokenResponse.ok) {
        throw new Error('Unable to authorize playback.')
      }

      const data = await tokenResponse.json()

      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId)}`,
        {
          method: 'PUT',

          headers: {
            Authorization: `Bearer ${data.accessToken}`,
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            uris: [`spotify:track:${trackId}`],
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Spotify playback failed (${response.status}).`
        )
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to play this track.'
      )
    }
  }

  const togglePlayback = async () => {
    await playerRef.current?.togglePlay()
  }

  const nextTrack = async () => {
    await playerRef.current?.nextTrack()
  }

  const previousTrack = async () => {
    await playerRef.current?.previousTrack()
  }

  const changeVolume = async (value: number) => {
    const safeVolume = Math.max(0, Math.min(1, value))

    await playerRef.current?.setVolume(safeVolume)
    setVolume(safeVolume)
  }

  const seek = async (milliseconds: number) => {
    const safePosition = Math.max(
      0,
      Math.min(duration, milliseconds)
    )

    await playerRef.current?.seek(safePosition)
    setPosition(safePosition)
  }

  return {
    deviceId,
    isReady,
    isPaused,
    currentTrack,
    position,
    duration,
    volume,
    error,
    playTrack,
    togglePlayback,
    nextTrack,
    previousTrack,
    changeVolume,
    seek,
  }
}