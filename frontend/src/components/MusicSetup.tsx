
import { useState } from 'react'
import MusicSearch from './MusicSearch'
import { Cloud, Sun, Brain, Zap, Moon, Disc3 } from 'lucide-react'


const musicMoods = [
  { name: 'Chill', icon: Cloud },
  { name: 'Happy', icon: Sun },
  { name: 'Focused', icon: Brain },
  { name: 'Energetic', icon: Zap },
  { name: 'Dreamy', icon: Moon },
  { name: 'Throwbacks', icon: Disc3 },
]

type MusicSetupProps = {
  displayName: string
  onSessionExpired: () => void
  selectedMood?: string
  onPlayTrack?: (trackId: string) => Promise<void>
  isPlayerReady?: boolean
}

function MusicSetup({
  displayName,
  onSessionExpired,
  selectedMood,
  onPlayTrack,
  isPlayerReady,
}: MusicSetupProps) {

const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [completed, setCompleted] = useState(
  () => Boolean(selectedMood)
)

  const toggleMood = (mood: string) => {
    setSelectedMoods((current) =>
      current.includes(mood)
        ? current.filter((item) => item !== mood)
        : [...current, mood]
    )
  }

  const handleContinue = () => {
    if (selectedMoods.length === 0) return

    localStorage.setItem(
      'racket_music_moods',
      JSON.stringify(selectedMoods)
    )

    setCompleted(true)
  }

  if (completed) {
  return (
    <MusicSearch
      displayName={displayName}
      onSessionExpired={onSessionExpired}
      selectedMood={selectedMood}
      onPlayTrack={onPlayTrack}
      isPlayerReady={isPlayerReady}
    />
  )
}


  return (
    <div className="music-setup">
      <h2>Make yourself at home, {displayName}.</h2>

      <p className="description">
        What kind of music are you in the mood for?
        Choose as many as you like.
      </p>

      <div className="mood-grid">
        {musicMoods.map((mood) => (
          <button
            key={mood.name}
            type="button"
            className={`mood-button ${
              selectedMoods.includes(mood.name) ? 'selected' : ''
            }`}
            onClick={() => toggleMood(mood.name)}
            aria-pressed={selectedMoods.includes(mood.name)}
          >
           <span className="mood-emoji" aria-hidden="true">
  <mood.icon size={30} strokeWidth={1.6} />
</span>
            <span>{mood.name}</span>
          </button>
        ))}
      </div>

      <button
        className="spotify-button"
        type="button"
        onClick={handleContinue}
        disabled={selectedMoods.length === 0}
      >
        Start discovering music
      </button>

      <p className="footer-text">
        Your music. Your mood. Your Racket.
      </p>
    </div>
  )
}

export default MusicSetup
