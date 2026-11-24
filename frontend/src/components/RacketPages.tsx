import type { RacketPage } from './RacketSidebar'
import DiscoverPage from './DiscoverPage'
import PlaylistsPage from './PlaylistsPage'
import LibraryPage from './LibraryPage'
import DreamMode from './DreamMode'
import LikedSongs from './LikedSongs'
import SavedAlbums from './SavedAlbums'
import FollowedArtists from './FollowedArtists'
import './DiscoverPage.css'

type RacketPagesProps = {
  activePage: RacketPage
  onSearch: () => void
  onMoodSelect: (mood: string) => void
  onNavigate: (page: RacketPage) => void
}

export default function RacketPages({
  activePage,
  onSearch,
  onMoodSelect,
  onNavigate,
}: RacketPagesProps) {

  if (activePage === 'liked-songs') {
    return (
      <div className="racket-page">
        <button
          type="button"
          className="library-back-button"
          onClick={() => onNavigate('library')}
        >
          ← Back to Library
        </button>

        <LikedSongs />
      </div>
    )
  }

  if (activePage === 'saved-albums') {
    return (
      <div className="racket-page">
        <button
          type="button"
          className="library-back-button"
          onClick={() => onNavigate('library')}
        >
          ← Back to Library
        </button>

        <SavedAlbums />
      </div>
    )
  }

  if (activePage === 'followed-artists') {
    return (
      <div className="racket-page">
        <button
          type="button"
          className="library-back-button"
          onClick={() => onNavigate('library')}
        >
          ← Back to Library
        </button>

        <FollowedArtists />
      </div>
    )
  }

  if (activePage === 'discover') {
    return <DiscoverPage onMoodSelect={onMoodSelect} />
  }

  if (activePage === 'playlists') {
    return <PlaylistsPage />
  }

  if (activePage === 'library') {
    return <LibraryPage onNavigate={onNavigate} />
  }

  if (activePage === 'dream') {
    return <DreamMode onMoodSelect={onMoodSelect} />
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

  return (
    <div className="racket-page">
      <h2>Welcome to Racket</h2>
      <p>Your music sanctuary starts here.</p>
    </div>
  )
}