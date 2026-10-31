import { useState, useEffect } from 'react'
import {
  Shield,
  Copy,
  Check,
  Heart,
  FileText,
  Camera,
  Play,
  RotateCcw,
  Trash2,
  Archive,
  UserCheck,
  Edit3,
} from 'lucide-react'
import userService from '../services/userService'
import { useFavorites } from '../hooks/useFavorites'
import {
  getAllDraftIds,
  loadDraft,
  deleteDraft,
  formatDraftTime,
  getDraftTimestamp,
} from '../utils/draftStorage'
import { getArchivedGuns, restoreGun, permanentDeleteGun } from '../utils/archiveStorage'

export default function ProfilePage({ onReplaySplash, onNavigateEditProfile, onResumeDraft }) {
  const [profile, setProfile] = useState(() => userService.getUserProfile())
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState('')
  const { favorites } = useFavorites()

  // Drafts State
  const [draftIds, setDraftIds] = useState(getAllDraftIds)
  // Soft Deleted / Archived Guns State
  const [archivedGuns, setArchivedGuns] = useState(getArchivedGuns)

  useEffect(() => {
    setProfile(userService.getUserProfile())
    setDraftIds(getAllDraftIds())
    setArchivedGuns(getArchivedGuns())
  }, [])

  const handleCopyId = () => {
    if (profile.userId) {
      navigator.clipboard.writeText(profile.userId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setFeedback('Avatar image must be under 2MB.')
      setTimeout(() => setFeedback(''), 3000)
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      userService.updateAvatar(base64)
      setProfile((prev) => ({ ...prev, avatar: base64 }))
      setFeedback('Avatar updated.')
      setTimeout(() => setFeedback(''), 3000)
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteDraftItem = (id) => {
    deleteDraft(id)
    setDraftIds(getAllDraftIds())
    setFeedback('Draft removed.')
    setTimeout(() => setFeedback(''), 2000)
  }

  const handleRestoreArchived = (id) => {
    const updated = restoreGun(id)
    setArchivedGuns(updated)
    setFeedback('Weapon restored to active catalog!')
    setTimeout(() => setFeedback(''), 2000)
  }

  const handlePermanentDelete = (id) => {
    if (window.confirm('Hapus permanen dari arsip?')) {
      const updated = permanentDeleteGun(id)
      setArchivedGuns(updated)
      setFeedback('Weapon permanently removed.')
      setTimeout(() => setFeedback(''), 2000)
    }
  }

  return (
    <div className="profile-page">
      <section
        className="masthead"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 className="display">Operator Profile &amp; Headquarters</h1>
          <p className="lede">
            Credentials, armory settings, archived inventories, drafts, and shop info.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {onNavigateEditProfile && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={onNavigateEditProfile}
            >
              <Edit3 size={14} /> Edit Profile
            </button>
          )}
          {onReplaySplash && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={onReplaySplash}
            >
              <Play size={14} /> Replay Intro
            </button>
          )}
        </div>
      </section>

      {feedback && (
        <div className="toast toast--success">
          <Check size={18} /> {feedback}
        </div>
      )}

      {/* Operator Card */}
      <div className="profile-card">
        <div className="profile-card-top">
          <div className="avatar-wrap">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <Shield size={36} stroke="var(--brass)" />
              </div>
            )}
            <label htmlFor="avatar-file-input" className="avatar-upload-btn" title="Upload avatar">
              <Camera size={14} />
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden-file-input"
              />
            </label>
          </div>
          <div className="profile-identity">
            <h2 className="display">{profile.username || 'Shooter'}</h2>
            <div className="profile-id-row">
              <span className="mono-badge">{profile.userId}</span>
              <button
                type="button"
                className="icon-btn"
                onClick={handleCopyId}
                title="Copy User ID"
              >
                {copied ? <Check size={14} color="var(--brass)" /> : <Copy size={14} />}
              </button>
            </div>
            {profile.bio && (
              <p style={{ margin: '8px 0 0', color: 'var(--steel)', fontSize: '0.9rem' }}>
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="profile-stats">
          <div className="stat-item">
            <Heart size={20} className="stat-icon" stroke="var(--brass)" />
            <div className="stat-val">{favorites.length}</div>
            <div className="stat-label">Favorites</div>
          </div>
          <div className="stat-item">
            <FileText size={20} className="stat-icon" stroke="var(--steel)" />
            <div className="stat-val">{draftIds.length}</div>
            <div className="stat-label">Offline Drafts</div>
          </div>
          <div className="stat-item">
            <Archive size={20} className="stat-icon" stroke="var(--steel)" />
            <div className="stat-val">{archivedGuns.length}</div>
            <div className="stat-label">Archived Guns</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: ALL DRAFTS */}
      <div className="card-box">
        <h2 className="card-box-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} /> Uncommitted Drafts
        </h2>
        <p className="card-box-desc">
          Unfinished registrations or weapon modifications saved in your local storage.
        </p>

        {draftIds.length === 0 ? (
          <p style={{ color: 'var(--steel)' }}>No local drafts found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {draftIds.map((id) => {
              const draftData = loadDraft(id)
              const ts = getDraftTimestamp(id)
              const name = draftData?.formData?.name || (id === 'create' ? 'New Registration' : `Item #${id}`)

              return (
                <div
                  key={id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid var(--line)',
                    borderRadius: '4px',
                    background: 'var(--paper)',
                  }}
                >
                  <div>
                    <strong>{name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--steel)' }}>
                      Saved: {formatDraftTime(ts)} ({id === 'create' ? 'Create Form' : 'Edit Form'})
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {onResumeDraft && (
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={() => onResumeDraft(id, draftData)}
                      >
                        Resume
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn--danger-ghost"
                      onClick={() => handleDeleteDraftItem(id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: SOFT DELETED / ARCHIVED WEAPONS */}
      <div className="card-box">
        <h2 className="card-box-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Archive size={20} /> Archived Hardware (Soft Deleted)
        </h2>
        <p className="card-box-desc">
          Weapons decommissioned or hidden from the catalog. You can restore them anytime.
        </p>

        {archivedGuns.length === 0 ? (
          <p style={{ color: 'var(--steel)' }}>No hardware currently in archive.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {archivedGuns.map((gun) => {
              const id = gun.id || gun.name
              return (
                <div
                  key={id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid var(--line)',
                    borderRadius: '4px',
                    background: 'var(--paper)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={gun.image_url || gun.image || '/guns/pistol.svg'}
                      alt={gun.name}
                      style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div>
                      <strong>{gun.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--steel)' }}>
                        {gun.type} · {gun.caliber}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      onClick={() => handleRestoreArchived(id)}
                    >
                      <RotateCcw size={14} /> Restore
                    </button>
                    <button
                      type="button"
                      className="btn--danger-ghost"
                      onClick={() => handlePermanentDelete(id)}
                      title="Permanent Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: ABOUT US */}
      <div className="card-box">
        <h2 className="card-box-title">About Bore &amp; Barrel</h2>
        <p className="card-box-desc">
          A one-room armory. Bore &amp; Barrel sells a short, honest list of firearms. Each piece is priced from the bench — no markup theatre, no filler. All equipment adheres strictly to standard specifications.
        </p>
      </div>

      {/* SECTION 4: CONTACT & LOCATION */}
      <div className="card-box">
        <h2 className="card-box-title">Armory Headquarters &amp; Contact</h2>
        <p className="card-box-desc">
          <strong>Address:</strong> 123 Range Road, Armory District<br />
          <strong>Operational Hours:</strong> Tuesday to Saturday, 10:00 - 18:00<br />
          <strong>Direct Line:</strong> (555) 010-0100 / WhatsApp Requisition Service
        </p>
      </div>
    </div>
  )
}