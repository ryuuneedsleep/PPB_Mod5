import { useState, useEffect } from 'react'
import {
    ArrowLeft,
    ShoppingBag,
    Trash2,
    Plus,
    Minus,
    CheckCircle2,
} from 'lucide-react'
import { formatPrice } from '../utils/helpers'

const CART_KEY = 'bore_barrel_cart'

export default function CartPage({ onNavigateCatalog }) {
    const [cartItems, setCartItems] = useState([])
    const [checkoutSuccess, setCheckoutSuccess] = useState(false)

    const loadCart = () => {
        try {
            const raw = localStorage.getItem(CART_KEY)
            setCartItems(raw ? JSON.parse(raw) : [])
        } catch {
            setCartItems([])
        }
    }

    useEffect(() => {
        loadCart()
        const handleStorage = () => loadCart()
        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [])

    const updateCartStorage = (newItems) => {
        setCartItems(newItems)
        localStorage.setItem(CART_KEY, JSON.stringify(newItems))
        window.dispatchEvent(new Event('cartUpdated'))
    }

    const handleUpdateQuantity = (id, delta) => {
        const updated = cartItems
            .map((item) => {
                if (item.id === id) {
                    const newQty = (item.quantity || 1) + delta
                    return newQty > 0 ? { ...item, quantity: newQty } : null
                }
                return item
            })
            .filter(Boolean)
        updateCartStorage(updated)
    }

    const handleRemoveItem = (id) => {
        const updated = cartItems.filter((item) => item.id !== id)
        updateCartStorage(updated)
    }

    const handleClearCart = () => {
        updateCartStorage([])
    }

    const totalPrice = cartItems.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
        0
    )

    const handleCheckout = () => {
        if (cartItems.length === 0) return

        // Kosongkan keranjang di penyimpanan lokal
        localStorage.removeItem(CART_KEY)
        setCartItems([])
        window.dispatchEvent(new Event('cartUpdated'))
        setCheckoutSuccess(true)

        // Arahkan kembali ke katalog
        setTimeout(() => {
            if (onNavigateCatalog) {
                onNavigateCatalog()
            }
        }, 1500)
    }

    return (
        <div className="page">
            <div
                className="masthead"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                }}
            >
                <div>
                    <h1 className="display">Hardware Requisition</h1>
                    <p className="lede">
                        Review equipment order before deployment confirmation.
                    </p>
                </div>
                {onNavigateCatalog && (
                    <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={onNavigateCatalog}
                    >
                        <ArrowLeft size={16} /> Back to Catalog
                    </button>
                )}
            </div>

            {checkoutSuccess && (
                <div className="toast toast--success" style={{ marginTop: '20px' }}>
                    <CheckCircle2 size={18} /> Requisition confirmed! Redirecting to catalog...
                </div>
            )}

            {cartItems.length === 0 && !checkoutSuccess ? (
                <div className="state-box" style={{ marginTop: '24px' }}>
                    <ShoppingBag size={36} stroke="var(--steel)" />
                    <p>Your armory requisition list is currently empty.</p>
                    {onNavigateCatalog && (
                        <button
                            type="button"
                            className="btn btn--primary"
                            onClick={onNavigateCatalog}
                            style={{ marginTop: '12px' }}
                        >
                            Browse Equipment Catalog
                        </button>
                    )}
                </div>
            ) : (
                <div className="card-box" style={{ marginTop: '24px' }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid var(--line)',
                            paddingBottom: '12px',
                            marginBottom: '16px',
                        }}
                    >
                        <h2 className="card-box-title" style={{ margin: 0 }}>
                            Order Manifest ({cartItems.length} items)
                        </h2>
                        <button
                            type="button"
                            className="btn btn--danger-ghost btn--sm"
                            onClick={handleClearCart}
                            title="Clear entire cart"
                        >
                            <Trash2 size={14} /> Clear All
                        </button>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
                        {cartItems.map((item) => (
                            <li
                                key={item.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 0',
                                    borderBottom: '1px solid var(--line)',
                                    gap: '12px',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <img
                                        src={item.image_url || item.image || '/guns/pistol.svg'}
                                        alt={item.name}
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            objectFit: 'cover',
                                            borderRadius: '4px',
                                            border: '1px solid var(--line)',
                                        }}
                                    />
                                    <div>
                                        <strong style={{ fontSize: '1rem' }}>{item.name}</strong>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--steel)' }}>
                                            {item.type || 'Hardware'} • {formatPrice(item.price)} each
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            background: 'var(--paper)',
                                            borderRadius: '4px',
                                            border: '1px solid var(--line)',
                                            padding: '2px 6px',
                                        }}
                                    >
                                        <button
                                            type="button"
                                            className="icon-btn"
                                            onClick={() => handleUpdateQuantity(item.id, -1)}
                                            style={{ border: 'none', padding: '4px' }}
                                            title="Decrease quantity"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span
                                            style={{
                                                minWidth: '24px',
                                                textAlign: 'center',
                                                fontWeight: 600,
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            {item.quantity || 1}
                                        </span>
                                        <button
                                            type="button"
                                            className="icon-btn"
                                            onClick={() => handleUpdateQuantity(item.id, 1)}
                                            style={{ border: 'none', padding: '4px' }}
                                            title="Increase quantity"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    <span
                                        style={{
                                            fontWeight: 700,
                                            color: 'var(--brass)',
                                            minWidth: '80px',
                                            textAlign: 'right',
                                        }}
                                    >
                                        {formatPrice((Number(item.price) || 0) * (item.quantity || 1))}
                                    </span>

                                    <button
                                        type="button"
                                        className="btn btn--danger-ghost"
                                        onClick={() => handleRemoveItem(item.id)}
                                        title="Remove item"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '2px solid var(--line)',
                            paddingTop: '16px',
                            marginBottom: '24px',
                        }}
                    >
                        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                            Requisition Total:
                        </span>
                        <span
                            style={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: 'var(--brass)',
                            }}
                        >
                            {formatPrice(totalPrice)}
                        </span>
                    </div>

                    <button
                        type="button"
                        className="btn btn--primary"
                        style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                        onClick={handleCheckout}
                        disabled={cartItems.length === 0}
                    >
                        Confirm Requisition &amp; Checkout
                    </button>
                </div>
            )}
        </div>
    )
}