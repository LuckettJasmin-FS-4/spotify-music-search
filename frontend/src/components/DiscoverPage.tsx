import { Cloud, Sun, Brain, Zap, Moon, Disc3 } from 'lucide-react'

type DiscoverPageProps = {
  onMoodSelect: (mood: string) => void
}

export default function DiscoverPage({
  onMoodSelect,
}: DiscoverPageProps) {
  return (
    <div className="discover-page">
      <header className="discover-header">
        <p className="discover-eyebrow">EXPLORE YOUR SOUND</p>
        <h1>Discover Music</h1>
        <p>
          Find something new to love. Explore music that
          matches your mood, your energy, and your Racket.
        </p>
      </header>

      <section className="discover-featured">
        <div className="discover-featured-content">
          <span>FEATURED ON RACKET</span>
          <h2>Your next favorite sound awaits.</h2>
          <p>
            From late-night chill sessions to feel-good
            favorites, discover music for every moment.
          </p>
        </div>
      </section>

      <section className="discover-section">
        <h2>Explore by Mood</h2>

        <div className="discover-mood-grid">
          
           {[
  { name: 'Chill', icon: Cloud },
  { name: 'Happy', icon: Sun },
  { name: 'Focused', icon: Brain },
  { name: 'Energetic', icon: Zap },
  { name: 'Dreamy', icon: Moon },
  { name: 'Throwbacks', icon: Disc3 },
].map((mood) => (
           <button
  type="button"
  className="discover-mood-card"
  key={mood.name}
  onClick={() => onMoodSelect(mood.name)}
>
  <mood.icon size={32} strokeWidth={1.6} aria-hidden="true" />
  <span>{mood.name}</span>
</button>
          ))}
        </div>
      </section>
    </div>
  )
}
