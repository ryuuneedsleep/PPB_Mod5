import React, { useState, useEffect, Suspense, lazy } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import PWABadge from './components/PWABadge.jsx'
import SplashScreen from './components/common/SplashScreen.jsx'
import { useCart } from './hooks/useCart.js'
import './App.css'

// 1. IMPLEMENTASI LAZY LOAD (React.lazy)
const Catalog = lazy(() => import('./pages/Catalog.jsx'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))
const CreateGunPage = lazy(() => import('./pages/CreateGunPage.jsx'))
const EditGunPage = lazy(() => import('./pages/EditGunPage.jsx'))
const EditProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const CartPage = lazy(() => import('./pages/CartPage.jsx'))
const GunDetail = lazy(() => import('./components/gun/GunDetail.jsx'))

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [tab, setTab] = useState('Catalog')
  const [mode, setMode] = useState('list') // 'list' | 'create' | 'edit' | 'detail' | 'edit-profile' | 'cart'
  const [selectedGun, setSelectedGun] = useState(null)
  const [editingGun, setEditingGun] = useState(null)

  const cartData = useCart()

  // 2. CEK SHARE LINK TAUTAN UNIK (?gun=...) SAAT PERTAMA KALI DIBUKA
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const gunParam = params.get('gun')
    if (gunParam) {
      // Buka otomatis detail gun
      setSelectedGun({ id: gunParam, name: decodeURIComponent(gunParam) })
      setMode('detail')
    }
  }, [])

  const handleNavigate = (target, payload) => {
    if (target === 'Create') {
      setMode('create')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'Edit') {
      setEditingGun(payload)
      setMode('edit')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'Detail') {
      setSelectedGun(payload)
      setMode('detail')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'EditProfile') {
      setMode('edit-profile')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'Cart') {
      setTab('Cart')
      setMode('cart')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setTab(target)
      setMode(target === 'Cart' ? 'cart' : 'list')
      setSelectedGun(null)
      setEditingGun(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBackToList = () => {
    setMode('list')
    setSelectedGun(null)
    setEditingGun(null)
  }

  return (
    <div className="shell">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <Header
        tab={mode === 'list' || mode === 'cart' ? tab : ''}
        onTab={(newTab) => handleNavigate(newTab)}
        onNavigateCreate={() => handleNavigate('Create')}
        cartCount={cartData.totalItems}
      />

      <main className="main">
        {/* Lazy load Suspense container */}
        <Suspense
          fallback={
            <div className="state-box">
              <div className="spin" style={{ fontSize: '24px' }}>⚙</div>
              <p>Loading application component...</p>
            </div>
          }
        >
          {/* Sub-page Views */}
          {mode === 'create' && (
            <CreateGunPage
              onBack={handleBackToList}
              onSuccess={() => {
                handleBackToList()
                setTab('Catalog')
              }}
            />
          )}

          {mode === 'edit' && (
            <EditGunPage
              gun={editingGun}
              gunId={editingGun?.id}
              onBack={handleBackToList}
              onSuccess={() => {
                handleBackToList()
                setTab('Catalog')
              }}
            />
          )}

          {mode === 'edit-profile' && (
            <EditProfilePage
              onBack={() => {
                setMode('list')
                setTab('Profile')
              }}
              onSaved={() => {
                setMode('list')
                setTab('Profile')
              }}
            />
          )}

          {mode === 'cart' && (
            <CartPage
              cartData={cartData}
              onBack={handleBackToList}
              onNavigateCatalog={() => {
                setTab('Catalog')
                setMode('list')
              }}
            />
          )}

          {mode === 'detail' && selectedGun && (
            <GunDetail
              gun={selectedGun}
              onBack={handleBackToList}
              onEdit={(g) => handleNavigate('Edit', g)}
              onDelete={handleBackToList}
              onAddToCart={cartData.addToCart}
            />
          )}

          {/* Top-level Tabs */}
          {mode === 'list' && (
            <>
              {tab === 'Catalog' && (
                <Catalog
                  onNavigate={(dest, payload) => handleNavigate(dest, payload)}
                  onAddToCart={cartData.addToCart}
                />
              )}
              {tab === 'Favorites' && (
                <FavoritesPage
                  onSelectGun={(g) => handleNavigate('Detail', g)}
                  onNavigateCatalog={() => setTab('Catalog')}
                />
              )}
              {tab === 'Profile' && (
                <ProfilePage
                  onReplaySplash={() => setShowSplash(true)}
                  onNavigateEditProfile={() => handleNavigate('EditProfile')}
                  onResumeDraft={(id, draft) => {
                    if (id === 'create') handleNavigate('Create')
                    else handleNavigate('Edit', { id, ...draft?.formData })
                  }}
                />
              )}
            </>
          )}
        </Suspense>
      </main>

      <PWABadge />
      <Footer />
    </div>
  )
}

export default App