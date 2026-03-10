import { useState, useEffect } from 'react'
import { fetchCollections, CollectionProgressResponseDto } from '../api/collection'
import type { Encyclopedia } from '../types'

interface UseEncyclopediasReturn {
  data: Encyclopedia[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Custom hook for managing encyclopedia data from backend API
 * 
 * Features:
 * - Loads data from backend Collections API
 * - Maps CollectionProgressResponseDto to Encyclopedia type
 * - Provides loading and error states
 * 
 * @returns Encyclopedia data, loading state, error state, and refresh function
 */
export function useEncyclopedias(): UseEncyclopediasReturn {
  const [data, setData] = useState<Encyclopedia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    try {
      setLoading(true)
      console.log('[useEncyclopedias] Fetching collections from API...')
      const response = await fetchCollections(0, 100)
      console.log('[useEncyclopedias] API response:', response)
      console.log('[useEncyclopedias] Number of collections:', response.content.length)
      
      // Map CollectionProgressResponseDto to Encyclopedia type
      const encyclopedias: Encyclopedia[] = response.content.map((collection: CollectionProgressResponseDto) => ({
        id: collection.collectionId.toString(),
        title: collection.name,
        description: collection.description || '',
        items: [], // Encyclopedia type requires items array
        createdAt: new Date(collection.createdAt),
        updatedAt: new Date(collection.createdAt)
      }))
      
      console.log('[useEncyclopedias] Mapped encyclopedias:', encyclopedias)
      setData(encyclopedias)
      setError(null)
    } catch (err) {
      console.error('[useEncyclopedias] Failed to load encyclopedias from API', err)
      setError('도감 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // Load data from API on mount
  useEffect(() => {
    refresh()
  }, [])

  return { data, loading, error, refresh }
}
