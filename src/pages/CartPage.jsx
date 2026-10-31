import { ArrowLeft, Trash2, Plus, Minus, MessageCircle, PackageX } from 'lucide-react'
import { formatPrice } from '../utils/helpers'

export default function CartPage({ cartData, onBack, onNavigateCatalog }) {
    const { cart, updateQty, removeFromCart, clearCart, checkoutWhatsApp, totalPrice } = cartData

    return (
        <div className="fav-page">
            <section className="masthead" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <button type="button" className="detail-back" onClick={onBack} style={{ marginBottom: '12px' }}>
                        <ArrowLeft size={18} /> Continue Browsing
                    </button>
                    <h1 className="display">Procurement Cart</h1>
                    <p className="lede">Review your selected armory inventory before checkout.</p>
                </div>
                {cart.length > 0 && (
                    <button type="button" className="btn btn--outline btn--sm" onClick={clearCart}>
                        Clear Cart
                    </button>
                )}
            </section>

            <section className="fav-content">
                {cart.length === 0 ? (
                    <div className="state-box">
                        <PackageX size={42} stroke="var(--steel)" />
                        <h3>Your procurement cart is empty</h3>
                        <p className="lede">Browse the catalog to add weapons and accessories to your requisition order.</p>
                        {onNavigateCatalog && (
                            <button
                                type="button"
                                className="btn btn--primary"
                                onClick={onNavigateCatalog}
                                style={{ marginTop: '16px' }}
                            >
                                Browse Catalog
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {cart.map((item) => {
                                const id = item.id || item.name
                                const price = Number(item.price ?? item.cook_time ?? 0)
                                const img = item.image_url || item.image || '/guns/pistol.svg'

                                return (
                                    <div
                                        key={id}
                                        className="card-box"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap',
                                            gap: '16px',
                                            padding: '16px',
                                            marginBottom: 0,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <img
                                                src={img}
                                                alt={item.name}
                                                style={{ width: '70px', height: '55px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                            <div>
                                                <h3 style={{ margin: 0 }}>{item.name}</h3>
                                                <span style={{ color: 'var(--brass)', fontWeight: 'bold' }}>
                                                    {formatPrice(price)}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <button
                                                    type="button"
                                                    className="icon-btn"
                                                    onClick={() => updateQty(id, -1)}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span style={{ fontWeight: 'bold', minWidth: '24px', textAlign: 'center' }}>
                                                    {item.qty}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="icon-btn"
                                                    onClick={() => updateQty(id, 1)}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            <span style={{ fontWeight: 'bold', minWidth: '80px', textAlign: 'right' }}>
                                                {formatPrice(price * item.qty)}
                                            </span>

                                            <button
                                                type="button"
                                                className="btn--danger-ghost"
                                                onClick={() => removeFromCart(id)}
                                                title="Remove"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Total & Checkout WhatsApp */}
                        <div
                            className="card-box"
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '16px',
                            }}
                        >
                            <div>
                                <span className="form-label">Total Estimation:</span>
                                <h2 style={{ color: 'var(--brass)', margin: 0 }}>
                                    {formatPrice(totalPrice)}
                                </h2>
                            </div>
                            <button
                                type="button"
                                className="btn btn--primary"
                                style={{ background: '#25D366', borderColor: '#25D366' }}
                                onClick={() => checkoutWhatsApp('6281234567890')}
                            >
                                <MessageCircle size={18} /> Checkout via WhatsApp
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}