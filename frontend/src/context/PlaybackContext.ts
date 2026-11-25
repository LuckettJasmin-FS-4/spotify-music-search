import { createContext, useContext } from 'react'
import type useSpotifyPlayer from '../hooks/useSpotifyPlayer'

type PlaybackContextValue = ReturnType<typeof useSpotifyPlayer>

export const PlaybackContext =
  createContext<PlaybackContextValue | null>(null)

export function usePlayback() {
  const context = useContext(PlaybackContext)

  if (!context) {
    throw new Error(
      'usePlayback must be used inside PlaybackContext.Provider'
    )
  }

  return context
}