import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useHistory } from './useHistory'
import * as localStorageService from '../services/localStorage'
import type { HistoryRecord } from '../types'

// Mock the localStorage service
vi.mock('../services/localStorage', () => ({
  saveData: vi.fn(),
  loadData: vi.fn(),
  isStorageNearQuota: vi.fn(() => false),
  cleanupOldHistory: vi.fn(() => 0),
  STORAGE_KEYS: {
    HISTORY: 'droseal_inventory_history'
  }
}))

// Mock constants
vi.mock('../constants/storage', () => ({
  STORAGE_KEYS: {
    HISTORY: 'droseal_inventory_history'
  },
  DEBOUNCE_DELAY: 500
}))

describe('useHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: return empty array
    vi.mocked(localStorageService.loadData).mockReturnValue([])
  })

  it('should initialize with empty history when no data exists', () => {
    const { result } = renderHook(() => useHistory())

    expect(result.current.loading).toBe(false)
    expect(result.current.history).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should load existing history from localStorage', () => {
    const existingHistory: HistoryRecord[] = [
      {
        id: '1',
        itemId: 'item-1',
        itemName: 'Test Item',
        changeType: 'quantity_change',
        previousQuantity: 5,
        newQuantity: 10,
        timestamp: new Date('2024-01-01')
      }
    ]
    vi.mocked(localStorageService.loadData).mockReturnValue(existingHistory)

    const { result } = renderHook(() => useHistory())

    expect(result.current.history).toEqual(existingHistory)
    expect(result.current.loading).toBe(false)
  })

  it('should add history record with auto-generated id and timestamp', () => {
    const { result } = renderHook(() => useHistory())

    act(() => {
      result.current.addHistoryRecord({
        itemId: 'item-1',
        itemName: 'Test Item',
        changeType: 'quantity_change',
        previousQuantity: 5,
        newQuantity: 10
      })
    })

    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0]).toMatchObject({
      itemId: 'item-1',
      itemName: 'Test Item',
      changeType: 'quantity_change',
      previousQuantity: 5,
      newQuantity: 10
    })
    expect(result.current.history[0].id).toBeDefined()
    expect(result.current.history[0].timestamp).toBeInstanceOf(Date)
  })

  it('should filter history by itemId', () => {
    const existingHistory: HistoryRecord[] = [
      {
        id: '1',
        itemId: 'item-1',
        itemName: 'Item 1',
        changeType: 'quantity_change',
        previousQuantity: 5,
        newQuantity: 10,
        timestamp: new Date('2024-01-01')
      },
      {
        id: '2',
        itemId: 'item-2',
        itemName: 'Item 2',
        changeType: 'quantity_change',
        previousQuantity: 3,
        newQuantity: 7,
        timestamp: new Date('2024-01-02')
      },
      {
        id: '3',
        itemId: 'item-1',
        itemName: 'Item 1',
        changeType: 'item_deleted',
        previousQuantity: 10,
        newQuantity: 0,
        timestamp: new Date('2024-01-03')
      }
    ]
    vi.mocked(localStorageService.loadData).mockReturnValue(existingHistory)

    const { result } = renderHook(() => useHistory())

    const item1History = result.current.getItemHistory('item-1')
    expect(item1History).toHaveLength(2)
    expect(item1History[0].itemId).toBe('item-1')
    expect(item1History[1].itemId).toBe('item-1')

    const item2History = result.current.getItemHistory('item-2')
    expect(item2History).toHaveLength(1)
    expect(item2History[0].itemId).toBe('item-2')
  })

  it('should save to localStorage with debounce after adding record', async () => {
    const { result } = renderHook(() => useHistory())

    act(() => {
      result.current.addHistoryRecord({
        itemId: 'item-1',
        itemName: 'Test Item',
        changeType: 'quantity_change',
        previousQuantity: 5,
        newQuantity: 10
      })
    })

    // Should not save immediately
    expect(localStorageService.saveData).not.toHaveBeenCalled()

    // Wait for debounce (500ms)
    await waitFor(
      () => {
        expect(localStorageService.saveData).toHaveBeenCalledWith(
          'droseal_inventory_history',
          expect.arrayContaining([
            expect.objectContaining({
              itemId: 'item-1',
              itemName: 'Test Item',
              changeType: 'quantity_change'
            })
          ])
        )
      },
      { timeout: 1000 }
    )
  })

  it('should support item_deleted change type', () => {
    const { result } = renderHook(() => useHistory())

    act(() => {
      result.current.addHistoryRecord({
        itemId: 'item-1',
        itemName: 'Deleted Item',
        changeType: 'item_deleted',
        previousQuantity: 5,
        newQuantity: 0
      })
    })

    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].changeType).toBe('item_deleted')
    expect(result.current.history[0].newQuantity).toBe(0)
  })

  it('should handle load errors gracefully', () => {
    vi.mocked(localStorageService.loadData).mockImplementation(() => {
      throw new Error('Load failed')
    })

    const { result } = renderHook(() => useHistory())

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Load failed')
    expect(result.current.history).toEqual([])
  })

  it('should handle save errors gracefully', async () => {
    vi.mocked(localStorageService.saveData).mockImplementation(() => {
      throw new Error('Save failed')
    })

    const { result } = renderHook(() => useHistory())

    act(() => {
      result.current.addHistoryRecord({
        itemId: 'item-1',
        itemName: 'Test Item',
        changeType: 'quantity_change',
        previousQuantity: 5,
        newQuantity: 10
      })
    })

    // Wait for debounce
    await waitFor(
      () => {
        expect(result.current.error).toBe('Save failed')
      },
      { timeout: 1000 }
    )
  })

  it('should add multiple history records', () => {
    const { result } = renderHook(() => useHistory())

    act(() => {
      result.current.addHistoryRecord({
        itemId: 'item-1',
        itemName: 'Item 1',
        changeType: 'quantity_change',
        previousQuantity: 5,
        newQuantity: 10
      })
      result.current.addHistoryRecord({
        itemId: 'item-2',
        itemName: 'Item 2',
        changeType: 'quantity_change',
        previousQuantity: 3,
        newQuantity: 7
      })
    })

    expect(result.current.history).toHaveLength(2)
    expect(result.current.history[0].itemId).toBe('item-1')
    expect(result.current.history[1].itemId).toBe('item-2')
  })
})
