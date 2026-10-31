import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'

const CART_KEY = 'bore_barrel_cart'

const NAV_ITEMS = [
  { id: 'Catalog', label: 'Catalog' },
  { id: 'Favorites', label: 'Favorites', hasBadge: true },
  { id: 'Cart', label: 'Cart', hasCartBadge: true },
  { id: 'Profile', label: 'Profile' },
  { id: 'About', label: 'About' },
  { id: 'Contact', label: 'Contact' },
]

export default function Header({ tab, onTab, onNavigateCreate }) {
  const { favorites } = useFavorites()
  const favCount = favorites ? favorites.length : 0
  const [cartCount, setCartCount] = useState(0)

  const updateCartCount = () => {
    try {
      const raw = localStorage.getItem(CART_KEY)
      if (raw) {
        const items = JSON.parse(raw)
        const total = items.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        )
        setCartCount(total)
      } else {
        setCartCount(0)
      }
    } catch {
      setCartCount(0)
    }
  }

  useEffect(() => {
    updateCartCount()
    window.addEventListener('storage', updateCartCount)
    window.addEventListener('cartUpdated', updateCartCount)
    return () => {
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cartUpdated', updateCartCount)
    }
  }, [])

  return (
    <header className="header">
      <div
        className="header-brand-wrap"
        onClick={() => onTab('Catalog')}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div className="header-logo-badge">
          <img src="/logo.png" alt="Bore & Barrel" />
        </div>
        <span className="brand display">Bore &amp; Barrel</span>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? 'nav-link active' : 'nav-link'}
            onClick={() => onTab(item.id)}
          >
            {item.label}
            {item.hasBadge && favCount > 0 && (
              <span className="nav-badge">{favCount}</span>
            )}
            {item.hasCartBadge && cartCount > 0 && (
              <span
                className="nav-badge"
                style={{ background: 'var(--ink)', color: '#fff' }}
              >
                {cartCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {onNavigateCreate && (
        <button
          type="button"
          className="btn btn--primary btn--sm header-cta"
          onClick={onNavigateCreate}
          title="Register new hardware"
        >
          <Plus size={15} /> Add Hardware
        </button>
      )}
    </header>
  )
}