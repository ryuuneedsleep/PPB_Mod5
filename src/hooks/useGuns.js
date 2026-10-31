import { useState, useEffect, useCallback } from 'react'
import gunService from '../services/gunService'

// Query Cache in-memory
const queryCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 Menit TTL

export function useGuns(params = {}) {
  const [guns, setGuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  const paramKey = JSON.stringify(params)

  const fetchGuns = useCallback(async (force = false) => {
    // 1. Cek Caching
    const now = Date.now()
    const cached = queryCache.get(paramKey)
    if (!force && cached && (now - cached.timestamp < CACHE_TTL)) {
      setGuns(cached.data)
      setPagination(cached.pagination)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await gunService.getGuns(params)
      if (response.success) {
        const data = response.data || []
        const pag = response.pagination || null
        setGuns(data)
        setPagination(pag)
        // Simpan ke Cache
        queryCache.set(paramKey, { data, pagination: pag, timestamp: Date.now() })
      } else {
        setError(response.message || 'Failed to fetch products.')
      }
    } catch (err) {
      // Jika error, gunakan cache lama jika ada
      if (cached) {
        setGuns(cached.data)
      } else {
        setError(err.message || 'An error occurred while fetching products.')
        setGuns([])
      }
    } finally {
      setLoading(false)
    }
  }, [paramKey])

  useEffect(() => {
    fetchGuns()
  }, [fetchGuns])

  return { guns, loading, error, pagination, refetch: () => fetchGuns(true) }
}

export function useGunById(id) {
  const [gun, setGun] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGun = useCallback(async (force = false) => {
    if (!id) {
      setLoading(false)
      return
    }
    const cacheKey = `gun_detail_${id}`
    const cached = queryCache.get(cacheKey)
    if (!force && cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      setGun(cached.data)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await gunService.getGunById(id)
      if (response.success) {
        setGun(response.data)
        queryCache.set(cacheKey, { data: response.data, timestamp: Date.now() })
      } else {
        setError(response.message || 'Product not found.')
      }
    } catch (err) {
      setError(err.message || 'Failed to load product details.')
      setGun(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchGun()
  }, [fetchGun])

  return { gun, loading, error, refetch: () => fetchGun(true) }
}