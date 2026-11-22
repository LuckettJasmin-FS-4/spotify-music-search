import './LibraryPage.css'
import { Heart, Disc3, MicVocal, ListMusic } from 'lucide-react'
import LikedSongs from './LikedSongs'
import SavedAlbums from './SavedAlbums'
import FollowedArtists from './FollowedArtists'
import type { RacketPage } from './RacketSidebar'

type LibraryPageProps = {
  onNavigate: (page: RacketPage) => void
}

export default function LibraryPage({
  onNavigate,
}: LibraryPageProps) {
  return (
    <div className="racket-page library-page">
      <div className="library-header">
        <h2>Your Library</h2>
        <p>Your favorite music, all in one place.</p>
      </div>

      <div className="library-sections">
        <div className="library-section-card">
         <Heart className="library-section-icon" size={32} />
          <h3>Liked Songs</h3>
          <p>All the songs you've saved on Spotify.</p>
        </div>

        <div className="library-section-card">
          <Disc3 className="library-section-icon" size={32} />
          <h3>Saved Albums</h3>
          <p>Albums you love and want to revisit.</p>
        </div>

        <div className="library-section-card">
          <MicVocal className="library-section-icon" size={32} />
          <h3>Followed Artists</h3>
          <p>Keep up with your favorite artists.</p>
        </div>

       
<button
  type="button"
  className="library-section-card"
  onClick={() => onNavigate('playlists')}
>
  <ListMusic className="library-section-icon" size={32} />
  <h3>Your Playlists</h3>
  <p>Music collections for every mood.</p>
</button>
 </div>

      <LikedSongs />
      <SavedAlbums />
      <FollowedArtists />
    </div>
  )
}