import './DreamMode.css'
import { Moon, Cloud, Sparkles, CloudRain } from 'lucide-react'

type DreamModeProps = {
  onMoodSelect: (mood: string) => void
}


const dreamMoods = [
  {
    name: 'Sleep',
    icon: Moon,
    description: 'Gentle sounds for peaceful nights.',
    search: 'peaceful sleep music',
  },
  {
    name: 'Unwind',
    icon: Cloud,
    description: 'Let the stress of the day drift away.',
    search: 'relaxing chill music',
  },
  {
    name: 'Dreamy',
    icon: Sparkles,
    description: 'Float away with atmospheric melodies.',
    search: 'dreamy ambient music',
  },
  {
    name: 'Rainy Day',
    icon: CloudRain,
    description: 'Cozy music for rainy afternoons.',
    search: 'rainy day lofi music',
  },
]


export default function DreamMode({
  onMoodSelect,
}: DreamModeProps) {
  return (
  <div className="racket-page dream-mode">
    <div className="dream-sky" aria-hidden="true">
      <div className="dream-stars dream-stars-small" />
      <div className="dream-stars dream-stars-medium" />
      <div className="dream-stars dream-stars-large" />

      <div className="dream-cloud dream-cloud-one" />
      <div className="dream-cloud dream-cloud-two" />
      <div className="dream-cloud dream-cloud-three" />
    </div>

    <div className="dream-mode-header">
        <span className="dream-mode-moon" aria-hidden="true">
          🌙
        </span>

        <h2>Welcome to Dream Mode</h2>

        <p>
          A peaceful escape where the music slows down
          and your imagination takes flight.
        </p>
      </div>

      <div className="dream-mode-moods">
        {dreamMoods.map((mood) => (
          <button
            key={mood.name}
            type="button"
            className="dream-mood-card"
            onClick={() => onMoodSelect(mood.search)}
          >
            <span className="dream-mood-icon" aria-hidden="true">
  <mood.icon size={38} strokeWidth={1.5} />
</span>

            <h3>{mood.name}</h3>
            <p>{mood.description}</p>
          </button>
        ))}
      </div>

      <p className="dream-mode-footer">
        Close your eyes. Find your calm. Let Racket play.
      </p>
    </div>
  )
}
