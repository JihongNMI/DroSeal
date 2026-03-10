import { useState, useEffect, useCallback } from 'react'
import { fetchCollections, createCollection as apiCreateCollection } from '../api/collection'
import type { EncyclopediaData, Encyclopedia } from '../types'

interface UseEncyclopediasReturn {
  data: EncyclopediaData
  loading: boolean
  error: string | null
  addCollection: (name: string, categoryId: number, description?: string) => Promise<void>
  refresh: () => Promise<void>
}

/**
 * Custom hook for managing encyclopedia data with backend API integration
 * 
 * Features:
 * - Fetches collections from backend API
 * - Provides add functionality with individual refresh
 * - Handles loading and error states for API transactions
 */
export function useEncyclopedias(): UseEncyclopediasReturn {
  const [data, setData] = useState<EncyclopediaData>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetchCollections(0, 50) // Adjust page/size as needed

      // Map API CollectionProgressResponseDto to the app's internal Encyclopedia interface
      const mappedData: Encyclopedia[] = response.content.map(dto => ({
        id: dto.collectionId.toString(),
        title: dto.name,
        description: dto.description || '',
        items: [], // Items are loaded separately via Encyclopedia.tsx when an album is opened
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.createdAt) // Fallback as updatedAt might be missing
      }))

      setData(mappedData)
      setError(null)
    } catch (err) {
      console.error('Failed to load collections', err)
      setError('도감 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addCollection = async (name: string, categoryId: number, description?: string) => {
    try {
      setLoading(true)
      await apiCreateCollection({
        name,
        categoryId,
        description,
        gridX: 9, // Default grid size for Encyclopedia
        gridY: 10
      })
      await refresh()
    } catch (err) {
      setError('도감 생성에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, addCollection, refresh }
}
