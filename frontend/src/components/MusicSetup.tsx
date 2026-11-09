
import { useState } from 'react'

const musicMoods = [
  { name: 'Chill', emoji: '☁️' },
  { name: 'Happy', emoji: '☀️' },
  { name: 'Focused', emoji: '🎧' },
  { name: 'Energetic', emoji: '⚡' },
  { name: 'Dreamy', emoji: '🌙' },
  { name: 'Throwbacks', emoji: '💿' },
]

type MusicSetupProps = {
  displayName: string
}

function MusicSetup({ displayName }: MusicSetupProps) {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [completed, setCompleted] = useState(false)

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
      <div className="music-setup">
        <h2>You're all set, {displayName}!</h2>
        <p className="description">
          Racket is ready to help you discover your next favorite song.
        </p>
        <p className="selected-moods">
          Your vibes: {selectedMoods.join(' · ')}
        </p>
      </div>
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
            <span className="mood-emoji">{mood.emoji}</span>
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
