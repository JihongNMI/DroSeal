import { useState, useEffect } from 'react'
import { saveData, loadData } from '../services/localStorage'
import { STORAGE_KEYS, DEBOUNCE_DELAY } from '../constants/storage'
import type { EncyclopediaData } from '../types'

interface UseEncyclopediasReturn {
  data: EncyclopediaData
  setData: (data: EncyclopediaData) => void
  loading: boolean
  error: string | null
}

/**
 * Custom hook for managing encyclopedia data with automatic localStorage synchronization
 * 
 * Features:
 * - Loads data from localStorage on mount
 * - Automatically saves changes to localStorage with 500ms debounce
 * - Provides loading and error states
 * 
 * @returns Encyclopedia data, setter function, loading state, and error state
 */
export function useEncyclopedias(): UseEncyclopediasReturn {
  const [data, setData] = useState<EncyclopediaData>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const loadedData = loadData<EncyclopediaData>(STORAGE_KEYS.ENCYCLOPEDIAS)
      if (loadedData) {
        setData(loadedData)
      }
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load encyclopedias')
      setLoading(false)
    }
  }, [])

  // Save data to localStorage with debounce
  useEffect(() => {
    if (loading) return // Don't save during initial load

    const timeoutId = setTimeout(() => {
      try {
        saveData(STORAGE_KEYS.ENCYCLOPEDIAS, data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save encyclopedias')
      }
    }, DEBOUNCE_DELAY)

    return () => clearTimeout(timeoutId)
  }, [data, loading])

  return { data, setData, loading, error }
}
