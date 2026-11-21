
import { useEffect, useState } from 'react'
import MusicSetup from './components/MusicSetup'
import './App.css'

type RacketUser = {
  id: string
  displayName: string | null
}

function App() {
  const [user, setUser] = useState<RacketUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  let active = true

  async function checkSession() {
    try {
      const response = await fetch(
        'http://127.0.0.1:3000/api/auth/me',
        {
          credentials: 'include',
          cache: 'no-store',
        }
      )

      if (!response.ok) {
        if (active) setUser(null)
        return
      }

      const data = await response.json()

      if (!active) return

      if (data.authenticated && data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Unable to check Racket session:', error)
      // A temporary network failure does not prove the session expired.
    } finally {
      if (active) setLoading(false)
    }
  }

  const handleWindowFocus = () => {
    void checkSession()
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      void checkSession()
    }
  }

  void checkSession()

  window.addEventListener('focus', handleWindowFocus)
  document.addEventListener(
    'visibilitychange',
    handleVisibilityChange
  )

  return () => {
    active = false
    window.removeEventListener('focus', handleWindowFocus)
    document.removeEventListener(
      'visibilitychange',
      handleVisibilityChange
    )
  }
}, [])

  const handleSpotifyLogin = () => {
    window.location.href =
      'http://127.0.0.1:3000/api/auth/login'
  }
  const handleSessionExpired = () => {
  setUser(null)
}
const handleLogout = async () => {
  try {
    const response = await fetch(
      'http://127.0.0.1:3000/api/auth/logout',
      {
        method: 'POST',
        credentials: 'include',
      }
    )

    if (!response.ok) {
      throw new Error('Unable to log out')
    }

    setUser(null)
  } catch (error) {
    console.error('Racket logout failed:', error)
    alert('Unable to log out. Please try again.')
  }
}

  if (loading) {
    return (
      <main className="login-page">
        <section className="login-card">
          <p>Waking up Racket...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="login-page">
      <div className="ambient-glow" />

      <section className="login-card">
        {user && (
  <div className="logout-container">
    <button
      type="button"
      className="logout-button"
      onClick={handleLogout}
    >
      Log Out
    </button>
  </div>
)}
        <div className="logo-placeholder">
          <img
            src="/racket-logo.png"
            alt="Racket sleeping raccoon wearing headphones logo"
            className="racket-logo"
          />
          <span className="logo-caption">
            YOUR MUSIC SANCTUARY
          </span>
        </div>

        {user ? (
          <MusicSetup
  displayName={user.displayName || 'music lover'}
  onSessionExpired={handleSessionExpired}
/>
        ) : (
          <>
            <h2>Your music. Your mood. Your Racket.</h2>

            <p className="description">
              Find your next favorite song, discover new sounds,
              and make a little racket.
            </p>

            <button
              className="spotify-button"
              onClick={handleSpotifyLogin}
            >
              <span className="music-icon">♫</span>
              Connect with Spotify
            </button>

            <p className="footer-text">
              Plug in. Tune out. Stay awhile.
            </p>
          </>
        )}
      </section>
    </main>
  )
}

export default App
