import { useState, useEffect, useCallback } from 'react'
import reviewService from '../services/reviewService'

const VOTES_KEY = 'bore_barrel_review_votes'

const getLocalVotes = () => {
  try {
    return JSON.parse(localStorage.getItem(VOTES_KEY) || '{}')
  } catch {
    return {}
  }
}

export function useReviews(gunId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [votes, setVotes] = useState(getLocalVotes)

  const fetchReviews = useCallback(async () => {
    if (!gunId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const response = await reviewService.getReviews(gunId)
      if (response.success) {
        setReviews(response.data || [])
      } else {
        setError(response.message || 'Failed to fetch reviews.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching reviews.')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [gunId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // Thumbs Up / Down Reaction
  const voteReview = (reviewId, type) => {
    setVotes((prev) => {
      const current = prev[reviewId] || { up: 0, down: 0, userVote: null }
      let newUp = current.up
      let newDown = current.down
      let newUserVote = type

      if (current.userVote === type) {
        // Toggle cancel
        if (type === 'up') newUp = Math.max(0, newUp - 1)
        if (type === 'down') newDown = Math.max(0, newDown - 1)
        newUserVote = null
      } else {
        if (current.userVote === 'up') newUp = Math.max(0, newUp - 1)
        if (current.userVote === 'down') newDown = Math.max(0, newDown - 1)
        if (type === 'up') newUp += 1
        if (type === 'down') newDown += 1
      }

      const updated = { ...prev, [reviewId]: { up: newUp, down: newDown, userVote: newUserVote } }
      localStorage.setItem(VOTES_KEY, JSON.stringify(updated))
      return updated
    })
  }

  // Update Review (CRUD)
  const updateReview = async (reviewId, reviewData) => {
    try {
      const res = await reviewService.updateReview(reviewId, reviewData)
      if (res.success) {
        await fetchReviews()
        return true
      }
      return false
    } catch {
      return false
    }
  }

  // Delete Review (CRUD)
  const deleteReview = async (reviewId) => {
    try {
      const res = await reviewService.deleteReview(reviewId)
      if (res.success) {
        await fetchReviews()
        return true
      }
      return false
    } catch {
      return false
    }
  }

  return { reviews, loading, error, refetch: fetchReviews, votes, voteReview, updateReview, deleteReview }
}

export function useCreateReview() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const createReview = async (gunId, reviewData) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      const response = await reviewService.createReview(gunId, reviewData)
      if (response.success) {
        setSuccess(true)
        return response.data
      } else {
        setError(response.message || 'Failed to submit review.')
        return null
      }
    } catch (err) {
      setError(err.message || 'An error occurred while submitting review.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createReview, loading, error, success }
}