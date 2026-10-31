import { useState } from 'react'
import {
  ArrowLeft,
  Star,
  Send,
  Loader,
  Share2,
  ShoppingCart,
  Check,
  ThumbsUp,
  ThumbsDown,
  Edit2,
  Trash2,
  X,
} from 'lucide-react'
import FavoriteButton from '../common/FavoriteButton'
import { useReviews, useCreateReview } from '../../hooks/useReviews'
import { getUserIdentifier } from '../../services/userService'
import { formatPrice, averageRating } from '../../utils/helpers'

export default function GunDetail({ gun, onBack, onEdit, onDelete, onAddToCart }) {
  const imgSrc = gun.image_url || gun.image || '/guns/pistol.svg'
  const category = gun.type || gun.category || ''
  const caliber = gun.caliber || gun.difficulty || ''
  const price = gun.price ?? gun.cook_time ?? 0

  const {
    reviews,
    loading: reviewsLoading,
    refetch: refetchReviews,
    votes,
    voteReview,
    updateReview,
    deleteReview,
  } = useReviews(gun.id)

  const { createReview, loading: submitting } = useCreateReview()

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [copied, setCopied] = useState(false)

  // Edit Review Modal State
  const [editingRev, setEditingRev] = useState(null)
  const [editComment, setEditComment] = useState('')
  const [editRating, setEditRating] = useState(5)

  const currentUserId = getUserIdentifier()
  const avgRating = gun.average_rating || averageRating(reviews)
  const reviewCount = gun.review_count ?? reviews.length

  const handleShare = () => {
    const targetId = gun.id || encodeURIComponent(gun.name)
    const shareUrl = `${window.location.origin}${window.location.pathname}?gun=${targetId}`

    if (navigator.share) {
      navigator.share({
        title: gun.name,
        text: `Lihat spesifikasi ${gun.name} di Bore & Barrel:`,
        url: shareUrl,
      }).catch(() => { })
    } else {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setReviewError('')
    setReviewSuccess('')
    if (rating < 1 || rating > 5) {
      setReviewError('Rating must be between 1 and 5.')
      return
    }
    const result = await createReview(gun.id, {
      user_identifier: currentUserId,
      rating,
      comment: comment.trim(),
    })
    if (result) {
      setReviewSuccess('Review submitted!')
      setComment('')
      setRating(5)
      refetchReviews()
    } else {
      setReviewError('Could not submit review. The server may be unavailable.')
    }
  }

  const handleOpenEdit = (rev) => {
    setEditingRev(rev)
    setEditComment(rev.comment || '')
    setEditRating(rev.rating || 5)
  }

  const handleSaveEditReview = async (e) => {
    e.preventDefault()
    if (!editingRev) return
    const success = await updateReview(editingRev.id, {
      rating: editRating,
      comment: editComment.trim(),
    })
    if (success) {
      setEditingRev(null)
      refetchReviews()
    }
  }

  const handleDeleteReview = async (revId) => {
    if (window.confirm('Hapus review ini?')) {
      await deleteReview(revId)
    }
  }

  return (
    <div className="detail">
      <button type="button" className="detail-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to Catalog
      </button>

      <div className="detail-hero">
        <img className="detail-img" src={imgSrc} alt={gun.name} />
        <div className="detail-info">
          <h1 className="display">{gun.name}</h1>
          <p className="type">
            {category}
            {caliber ? ` · ${caliber}` : ''}
          </p>
          <p className="price detail-price">{formatPrice(price)}</p>

          {avgRating > 0 && (
            <p className="detail-rating">
              <Star size={16} fill="var(--brass)" stroke="var(--brass)" />
              {avgRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
            </p>
          )}

          <div className="detail-actions" style={{ flexWrap: 'wrap' }}>
            {onAddToCart && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => onAddToCart(gun)}
              >
                <ShoppingCart size={16} /> Add to Cart
              </button>
            )}

            <button type="button" className="btn btn--outline" onClick={handleShare}>
              {copied ? <Check size={16} color="var(--brass)" /> : <Share2 size={16} />}
              {copied ? 'Link Copied' : 'Share'}
            </button>

            <FavoriteButton gunId={gun.id || gun.name} />

            {onEdit && (
              <button type="button" className="btn btn--outline" onClick={() => onEdit(gun)}>
                Edit
              </button>
            )}
            {onDelete && (
              <button type="button" className="btn btn--danger" onClick={() => onDelete(gun)}>
                Arsipkan
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="detail-section">
        <h2>Description</h2>
        <p>{gun.description || 'No description available.'}</p>
      </section>

      {gun.ingredients && gun.ingredients.length > 0 && (
        <section className="detail-section">
          <h2>Specifications</h2>
          <ul className="detail-specs">
            {gun.ingredients.map((ing, i) => (
              <li key={ing.id || i}>
                <strong>{ing.name}: </strong>
                {ing.quantity}
              </li>
            ))}
          </ul>
        </section>
      )}

      {gun.steps && gun.steps.length > 0 && (
        <section className="detail-section">
          <h2>Assembly &amp; Maintenance Protocol</h2>
          <ol className="detail-steps">
            {gun.steps.map((step, i) => (
              <li key={step.id || i}>{step.instruction || step}</li>
            ))}
          </ol>
        </section>
      )}

      {/* REVIEWS SECTION */}
      <section className="detail-section">
        <h2>Reviews &amp; Ratings</h2>

        <form className="review-form" onSubmit={handleSubmitReview}>
          <div className="review-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="star-btn"
                onClick={() => setRating(n)}
                aria-label={`${n} star`}
              >
                <Star
                  size={22}
                  fill={n <= rating ? 'var(--brass)' : 'none'}
                  stroke={n <= rating ? 'var(--brass)' : 'var(--steel)'}
                />
              </button>
            ))}
          </div>

          <textarea
            className="review-input"
            rows="3"
            placeholder="Write an operational evaluation review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
          />

          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting || !gun.id}
          >
            {submitting ? (
              <>
                <Loader size={16} className="spin" /> Submitting...
              </>
            ) : (
              <>
                <Send size={16} /> Submit Review
              </>
            )}
          </button>
          {reviewError && <p className="form-error">{reviewError}</p>}
          {reviewSuccess && <p className="form-success">{reviewSuccess}</p>}
        </form>

        {/* Edit Review Inline Box */}
        {editingRev && (
          <div
            className="card-box"
            style={{ marginBottom: '20px', border: '1px solid var(--brass)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Edit Your Review</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setEditingRev(null)}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveEditReview} style={{ marginTop: '10px' }}>
              <div className="review-stars" style={{ marginBottom: '10px' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="star-btn"
                    onClick={() => setEditRating(n)}
                  >
                    <Star
                      size={20}
                      fill={n <= editRating ? 'var(--brass)' : 'none'}
                      stroke={n <= editRating ? 'var(--brass)' : 'var(--steel)'}
                    />
                  </button>
                ))}
              </div>
              <textarea
                className="review-input"
                rows="3"
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="submit" className="btn btn--primary btn--sm">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => setEditingRev(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Reviews */}
        {reviewsLoading ? (
          <p className="detail-loading">Loading reviews...</p>
        ) : reviews.length > 0 ? (
          <ul className="review-list">
            {reviews.map((rev) => {
              const revVote = votes[rev.id] || { up: 0, down: 0, userVote: null }
              const isOwner =
                rev.user_identifier?.includes(currentUserId.substring(0, 8)) ||
                rev.user_id === currentUserId

              return (
                <li key={rev.id} className="review-item">
                  <div className="review-head">
                    <span className="review-user">
                      {rev.user_identifier || 'Anonymous Operator'}
                    </span>
                    <span className="review-stars-display">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < rev.rating ? 'var(--brass)' : 'none'}
                          stroke={i < rev.rating ? 'var(--brass)' : 'var(--line)'}
                        />
                      ))}
                    </span>
                  </div>

                  {rev.comment && <p className="review-comment">{rev.comment}</p>}

                  {/* Actions & Reactions Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '8px',
                    }}
                  >
                    {/* Thumbs Up / Down */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="icon-btn"
                        style={{
                          display: 'inline-flex',
                          gap: '4px',
                          alignItems: 'center',
                          color: revVote.userVote === 'up' ? 'var(--brass)' : 'inherit',
                        }}
                        onClick={() => voteReview(rev.id, 'up')}
                      >
                        <ThumbsUp size={14} />
                        <span>{revVote.up}</span>
                      </button>

                      <button
                        type="button"
                        className="icon-btn"
                        style={{
                          display: 'inline-flex',
                          gap: '4px',
                          alignItems: 'center',
                          color: revVote.userVote === 'down' ? '#c0392b' : 'inherit',
                        }}
                        onClick={() => voteReview(rev.id, 'down')}
                      >
                        <ThumbsDown size={14} />
                        <span>{revVote.down}</span>
                      </button>
                    </div>

                    {/* Edit / Delete Review (CRUD) */}
                    {isOwner && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Edit review"
                          onClick={() => handleOpenEdit(rev)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          style={{ color: '#c0392b' }}
                          title="Delete review"
                          onClick={() => handleDeleteReview(rev.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="detail-empty">No reviews yet. Be the first to evaluate!</p>
        )}
      </section>
    </div>
  )
}