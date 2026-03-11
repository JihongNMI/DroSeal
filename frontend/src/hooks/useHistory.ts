import { useState, useEffect, useCallback } from 'react'
import { saveData, loadData, isStorageNearQuota, cleanupOldHistory } from '../services/localStorage'
import { STORAGE_KEYS, DEBOUNCE_DELAY } from '../constants/storage'
import type { HistoryRecord, HistoryChangeType } from '../types'

interface UseHistoryReturn {
  history: HistoryRecord[]
  addHistoryRecord: (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => void
  getItemHistory: (itemId: string) => HistoryRecord[]
  cleanupHistory: (daysToKeep?: number) => number
  loading: boolean
  error: string | null
  storageWarning: string | null
}

/**
 * Custom hook for managing inventory history records with localStorage persistence
 * 
 * Features:
 * - Auto-generates unique ID and timestamp for new history records
 * - Provides filtering by itemId
 * - Uses debounced save to localStorage (500ms delay)
 * - Supports both quantity_change and item_deleted change types
 * 
 * @returns History array, add function, filter function, loading state, and error state
 */
export function useHistory(): UseHistoryReturn {
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storageWarning, setStorageWarning] = useState<string | null>(null)

  // Check storage quota on mount and after saves
  useEffect(() => {
    if (isStorageNearQuota()) {
      setStorageWarning('저장 공간이 부족합니다. 오래된 이력을 정리하는 것을 권장합니다.')
    } else {
      setStorageWarning(null)
    }
  }, [history])

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const loadedHistory = loadData<HistoryRecord[]>(STORAGE_KEYS.HISTORY) || []
      setHistory(loadedHistory)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
      setLoading(false)
    }
  }, [])

  // Save history to localStorage with debounce
  useEffect(() => {
    if (loading) return // Don't save during initial load

    const timeoutId = setTimeout(() => {
      try {
        saveData(STORAGE_KEYS.HISTORY, history)
        setError(null)
      } catch (err) {
        if (err instanceof Error) {
          // Check if it's a quota exceeded error
          if (err.message.includes('quota exceeded') || err.message.includes('QuotaExceededError')) {
            setError('저장 공간이 부족합니다. 오래된 이력을 정리하거나 일부 데이터를 삭제해주세요.')
          } else {
            setError(err.message)
          }
        } else {
          setError('Failed to save history')
        }
      }
    }, DEBOUNCE_DELAY)

    return () => clearTimeout(timeoutId)
  }, [history, loading])

  /**
   * Add a new history record with auto-generated id and timestamp
   * 
   * @param record - History record without id and timestamp
   */
  const addHistoryRecord = useCallback((record: Omit<HistoryRecord, 'id' | 'timestamp'>) => {
    const newRecord: HistoryRecord = {
      ...record,
      id: crypto.randomUUID(),
      timestamp: new Date()
    }

    setHistory(prev => {
      const updated = [...prev, newRecord]
      // Immediately save to localStorage for critical operations
      try {
        saveData(STORAGE_KEYS.HISTORY, updated)
      } catch (err) {
        console.error('Failed to save history immediately:', err)
      }
      return updated
    })
  }, [])

  /**
   * Get history records for a specific item
   * 
   * @param itemId - Item ID to filter by
   * @returns Array of history records for the specified item
   */
  const getItemHistory = useCallback((itemId: string): HistoryRecord[] => {
    return history.filter(record => record.itemId === itemId)
  }, [history])

  /**
   * Cleanup old history records to free up storage space
   * 
   * @param daysToKeep - Number of days of history to keep (default: 90)
   * @returns Number of records deleted
   */
  const cleanupHistory = useCallback((daysToKeep: number = 90): number => {
    const deletedCount = cleanupOldHistory(daysToKeep)
    
    // Reload history after cleanup
    const updatedHistory = loadData<HistoryRecord[]>(STORAGE_KEYS.HISTORY) || []
    setHistory(updatedHistory)
    
    return deletedCount
  }, [])

  return {
    history,
    addHistoryRecord,
    getItemHistory,
    cleanupHistory,
    loading,
    error,
    storageWarning
  }
}
