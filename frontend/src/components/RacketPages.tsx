import type { RacketPage } from './RacketSidebar'
import DiscoverPage from './DiscoverPage'
import './DiscoverPage.css'

type RacketPagesProps = {
  activePage: RacketPage
  onSearch: () => void
  onMoodSelect: (mood: string) => void
}

const pageDetails = {
  home: {
    title: 'Welcome to Racket',
    description: 'Your music sanctuary starts here.',
  },
  discover: {
    title: 'Discover Music',
    description: 'Explore new sounds, artists, and albums.',
  },
  library: {
    title: 'Your Library',
    description: 'Your favorite music, all in one place.',
  },
  playlists: {
    title: 'Your Playlists',
    description: 'Find the perfect soundtrack for every mood.',
  },
  dream: {
    title: 'Dream Mode',
    description: 'Relax, unwind, and let Racket dream with you.',
  },
}

export default function RacketPages({
  activePage,
  onSearch,
  onMoodSelect,
}: RacketPagesProps) {
  if (activePage === 'discover') {
    return <DiscoverPage onMoodSelect={onMoodSelect} />
  }
  if (activePage === 'search') {
    return (
      <div className="racket-page">
        <h2>Music Search</h2>
        <p>Find your next favorite song.</p>
        <button type="button" onClick={onSearch}>
          Open Music Search
        </button>
      </div>
    )
  }

  const page = pageDetails[activePage]

  return (
    <div className="racket-page">
      <h2>{page.title}</h2>
      <p>{page.description}</p>
    </div>
  )
}