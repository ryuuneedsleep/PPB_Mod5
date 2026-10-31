import { useState } from 'react'
import { ArrowLeft, Save, CheckCircle, AlertCircle } from 'lucide-react'
import userService from '../services/userService'

export default function EditProfilePage({ onBack, onSaved }) {
    const [profile] = useState(() => userService.getUserProfile())
    const [username, setUsername] = useState(profile.username || 'Shooter')
    const [bio, setBio] = useState(profile.bio || '')
    const [feedback, setFeedback] = useState('')
    const [error, setError] = useState('')

    const handleSave = (e) => {
        e.preventDefault()
        setError('')
        setFeedback('')

        if (!username.trim()) {
            setError('Operator Callsign cannot be empty.')
            return
        }

        const updated = {
            ...profile,
            username: username.trim(),
            bio: bio.trim(),
        }

        const res = userService.saveUserProfile(updated)
        if (res.success) {
            setFeedback('Armorer credentials updated successfully!')
            setTimeout(() => {
                if (onSaved) onSaved()
                else if (onBack) onBack()
            }, 1000)
        } else {
            setError(res.message || 'Failed to save changes.')
        }
    }

    return (
        <div className="form-page">
            <div className="form-head">
                <button type="button" className="detail-back" onClick={onBack}>
                    <ArrowLeft size={18} /> Back to Profile
                </button>
            </div>

            <div className="form-title-group">
                <h1 className="display">Edit Operator Credentials</h1>
                <p className="lede">
                    Update your public callsign, station credentials, and tactical armory biography.
                </p>
            </div>

            {feedback && (
                <div className="toast toast--success">
                    <CheckCircle size={18} /> {feedback}
                </div>
            )}
            {error && (
                <div className="toast toast--error">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <form className="profile-form" onSubmit={handleSave}>
                <div className="form-group">
                    <label htmlFor="edit-username" className="form-label">
                        Operator Callsign / Alias <span className="req">*</span>
                    </label>
                    <input
                        id="edit-username"
                        type="text"
                        className="form-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. Ghost Operator, Armorer Delta"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="edit-bio" className="form-label">
                        Station Bio &amp; Tactical Notes
                    </label>
                    <textarea
                        id="edit-bio"
                        className="form-textarea"
                        rows={5}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Certified armorer, preferred weapon systems, unit deployment notes..."
                    />
                </div>

                <div className="form-actions-bar">
                    <button type="button" className="btn btn--outline" onClick={onBack}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn--primary">
                        <Save size={16} /> Save Profile Changes
                    </button>
                </div>
            </form>
        </div>
    )
}