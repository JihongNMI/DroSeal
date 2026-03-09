import { useState, useEffect } from 'react'
import { saveData, loadData } from '../services/localStorage'
import { STORAGE_KEYS, DEBOUNCE_DELAY } from '../constants/storage'
import type { ProfileData, UserProfile, Friend } from '../types'

interface UseProfileReturn {
  data: ProfileData
  setData: (data: ProfileData) => void
  loading: boolean
  error: string | null
}

/**
 * Custom hook for managing profile data with automatic localStorage synchronization
 * 
 * Features:
 * - Loads profile and friends data from localStorage on mount
 * - Automatically saves changes to localStorage with 500ms debounce
 * - Provides loading and error states
 * 
 * @returns Profile data (profile, friends, friend requests), setter function, loading state, and error state
 */
export function useProfile(): UseProfileReturn {
  const [data, setData] = useState<ProfileData>({
    profile: {
      id: '',
      username: '',
      displayName: '',
      bio: '',
      avatarUrl: '',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    friends: [],
    friendRequests: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const loadedProfile = loadData<UserProfile>(STORAGE_KEYS.PROFILE)
      const loadedFriends = loadData<Friend[]>(STORAGE_KEYS.FRIENDS)
      
      if (loadedProfile || loadedFriends) {
        setData({
          profile: loadedProfile || data.profile,
          friends: loadedFriends || [],
          friendRequests: [] // Friend requests are derived from friends with 'pending' status
        })
      }
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
      setLoading(false)
    }
  }, [])

  // Save data to localStorage with debounce
  useEffect(() => {
    if (loading) return // Don't save during initial load

    const timeoutId = setTimeout(() => {
      try {
        saveData(STORAGE_KEYS.PROFILE, data.profile)
        saveData(STORAGE_KEYS.FRIENDS, data.friends)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save profile')
      }
    }, DEBOUNCE_DELAY)

    return () => clearTimeout(timeoutId)
  }, [data, loading])

  return { data, setData, loading, error }
}
