import { useState } from 'react'
import './RacketSidebar.css'

export type RacketPage =
  | 'home'
  | 'discover'
  | 'search'
  | 'library'
  | 'playlists'
  | 'dream'

type RacketSidebarProps = {
  activePage: RacketPage
  onNavigate: (page: RacketPage) => void
}

const menuItems: {
  id: RacketPage
  icon: string
  label: string
}[] = [
  { id: 'home', icon: '⌂', label: 'Home' },
  { id: 'discover', icon: '✧', label: 'Discover' },
  { id: 'search', icon: '⌕', label: 'Search' },
  { id: 'library', icon: '♫', label: 'Your Library' },
  { id: 'playlists', icon: '☷', label: 'Playlists' },
  { id: 'dream', icon: '☾', label: 'Dream Mode' },
]

export default function RacketSidebar({
  activePage,
  onNavigate,
}: RacketSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`racket-sidebar ${collapsed ? 'collapsed' : ''}`}
    >
      <div className="sidebar-header">
        {!collapsed && (
          <span className="sidebar-brand">RACKET</span>
        )}

        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
          aria-expanded={!collapsed}
        >
          ☰
        </button>
      </div>

      <nav className="sidebar-navigation" aria-label="Main navigation">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-link ${
              activePage === item.id ? 'active' : ''
            }`}
            onClick={() => onNavigate(item.id)}
            title={collapsed ? item.label : undefined}
            aria-label={item.label}
            aria-current={activePage === item.id ? 'page' : undefined}
          >
            <span className="sidebar-icon" aria-hidden="true">
              {item.icon}
            </span>

            {!collapsed && (
              <span className="sidebar-label">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  )
}