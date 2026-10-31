import { Share2, ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'
import FavoriteButton from '../common/FavoriteButton'
import { formatPrice, truncate } from '../../utils/helpers'

export default function GunCard({ gun, onSelect, onEdit, onDelete, onAddToCart }) {
  const [copied, setCopied] = useState(false)
  const imgSrc = gun.image_url || gun.image || '/guns/pistol.svg'
  const category = gun.type || gun.category || ''
  const caliber = gun.caliber || gun.difficulty || ''
  const price = gun.price ?? gun.cook_time ?? 0

  const handleShare = (e) => {
    e.stopPropagation()
    const targetId = gun.id || encodeURIComponent(gun.name)
    const shareUrl = `${window.location.origin}${window.location.pathname}?gun=${targetId}`

    if (navigator.share) {
      navigator.share({
        title: gun.name,
        text: `Lihat spesifikasi ${gun.name} di Bore & Barrel Armory:`,
        url: shareUrl,
      }).catch(() => { })
    } else {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCart = (e) => {
    e.stopPropagation()
    if (onAddToCart) onAddToCart(gun)
  }

  return (
    <li className="card">
      <button
        type="button"
        className="card-btn"
        onClick={() => onSelect(gun)}
        aria-label={`View ${gun.name}`}
      >
        <img
          className="card-img"
          src={imgSrc}
          alt={gun.name}
          width="240"
          height="180"
          loading="lazy"
        />
        <span className="name display">{gun.name}</span>
        <span className="type">
          {category}
          {caliber ? ` · ${caliber}` : ''}
        </span>
        {gun.description && (
          <span className="card-desc">{truncate(gun.description, 72)}</span>
        )}
        <span className="price">{formatPrice(price)}</span>
      </button>

      {/* Floating Action Buttons */}
      <div className="card-actions">
        {/* Tombol Share */}
        <button
          type="button"
          className="card-act-btn"
          onClick={handleShare}
          title={copied ? 'Tautan berhasil disalin!' : 'Bagikan tautan'}
        >
          {copied ? <Check size={14} color="var(--brass)" /> : <Share2 size={14} />}
        </button>

        {/* Tombol Tambah Keranjang */}
        {onAddToCart && (
          <button
            type="button"
            className="card-act-btn"
            onClick={handleCart}
            title="Tambah ke Keranjang"
          >
            <ShoppingCart size={14} />
          </button>
        )}

        <FavoriteButton gunId={gun.id || gun.name} />

        {onEdit && (
          <button
            type="button"
            className="card-act-btn"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(gun)
            }}
            title="Edit"
          >
            ✎
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            className="card-act-btn card-act-btn--danger"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(gun)
            }}
            title="Arsipkan / Hapus"
          >
            ✕
          </button>
        )}
      </div>
    </li>
  )
}