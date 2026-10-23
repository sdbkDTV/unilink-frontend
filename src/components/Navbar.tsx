import React, { useState, useRef } from 'react'
import { TabType } from '../types'
import { useClickOutside } from '../hooks/useClickOutside'

interface NavbarProps {
  activeTab: TabType
  onSelectTab: (tab: TabType) => void
  savedCount: number
  pendingCount?: number
  onLogout: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  savedCount,
  pendingCount = 0,
  onLogout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useClickOutside(menuRef, () => {
    if (isMenuOpen) setIsMenuOpen(false)
  })

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'Anasayfa': return '📄 Anasayfa'
      case 'Mesajlaşma': return '💬 Mesajlaşma'
      case 'Profil': return '👤 Profil'
      case 'Settings': return '⚙️ Settings'
      case 'İlan aç': return '➕ İlan aç'
      case 'Kaydedilenler': return `🔖 Kaydedilenler (${savedCount})`
      case 'Başvurular': return `📥 Başvurular ${pendingCount > 0 ? `(${pendingCount})` : ''}`
    }
  }

  const menuItems: TabType[] = [
    'Anasayfa', 'Mesajlaşma', 'Profil', 'Settings', 'İlan aç', 'Kaydedilenler', 'Başvurular'
  ]

  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => onSelectTab('Anasayfa')}>
        🔗 UniLink
      </div>

      <div className="menu-wrapper" ref={menuRef}>
        <button className="menu-toggle-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span>{getTabLabel(activeTab)}</span>
          <span>{isMenuOpen ? '▲' : '▼'}</span>
        </button>

        {isMenuOpen && (
          <div className="popup-menu">
            {menuItems.map((tab) => (
              <button
                key={tab}
                className={`popup-item ${activeTab === tab ? 'active' : ''}`}
                onClick={() => {
                  onSelectTab(tab)
                  setIsMenuOpen(false)
                }}
              >
                {getTabLabel(tab)}
              </button>
            ))}
            <div className="popup-divider"></div>
            <button
              className="popup-item logout-popup-item"
              onClick={() => {
                setIsMenuOpen(false)
                onLogout()
              }}
            >
              🚪 Çıkış Yap
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
