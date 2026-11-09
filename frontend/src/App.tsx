
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
    async function checkSession() {
      try {
        const response = await fetch(
          'http://127.0.0.1:3000/api/auth/me',
          {
            credentials: 'include',
          }
        )

        if (!response.ok) {
          setUser(null)
          return
        }

        const data = await response.json()

        if (data.authenticated && data.user) {
          setUser(data.user)
        }
      } catch (error) {
        console.error('Unable to check Racket session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const handleSpotifyLogin = () => {
    window.location.href =
      'http://127.0.0.1:3000/api/auth/login'
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
