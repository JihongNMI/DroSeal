import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Encyclopedia from './Encyclopedia'
import * as useEncyclopediasModule from '../hooks/useEncyclopedias'
import type { EncyclopediaData } from '../types'

// Mock the useEncyclopedias hook
vi.mock('../hooks/useEncyclopedias')

describe('Encyclopedia Page - useEncyclopedias Integration', () => {
  const mockSetData = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should use useEncyclopedias hook instead of local state', () => {
    const mockData: EncyclopediaData = []
    
    vi.mocked(useEncyclopediasModule.useEncyclopedias).mockReturnValue({
      data: mockData,
      setData: mockSetData,
      loading: false,
      error: null
    })

    render(<Encyclopedia />)
    
    // Verify the hook was called
    expect(useEncyclopediasModule.useEncyclopedias).toHaveBeenCalled()
  })

  it('should display loading state when hook is loading', () => {
    vi.mocked(useEncyclopediasModule.useEncyclopedias).mockReturnValue({
      data: [],
      setData: mockSetData,
      loading: true,
      error: null
    })

    render(<Encyclopedia />)
    
    expect(screen.getByText(/Loading encyclopedia/i)).toBeDefined()
  })

  it('should display error state when hook has error', () => {
    const errorMessage = 'Failed to load data'
    
    vi.mocked(useEncyclopediasModule.useEncyclopedias).mockReturnValue({
      data: [],
      setData: mockSetData,
      loading: false,
      error: errorMessage
    })

    render(<Encyclopedia />)
    
    expect(screen.getByText(/Error: Failed to load data/i)).toBeDefined()
  })

  it('should display encyclopedia items from hook data', () => {
    const mockData: EncyclopediaData = [
      {
        id: 'test-encyclopedia',
        title: 'Test Encyclopedia',
        description: 'Test description',
        items: [
          {
            id: 'item-1',
            name: 'Test Item 1',
            quantity: 5,
            notes: 'Test notes',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'item-2',
            name: 'Test Item 2',
            quantity: 3,
            notes: '',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    
    vi.mocked(useEncyclopediasModule.useEncyclopedias).mockReturnValue({
      data: mockData,
      setData: mockSetData,
      loading: false,
      error: null
    })

    render(<Encyclopedia />)
    
    expect(screen.getByText('Test Item 1')).toBeDefined()
    expect(screen.getByText('Test Item 2')).toBeDefined()
  })

  it('should update encyclopedia data through hook when quantity changes', async () => {
    const user = userEvent.setup()
    const mockData: EncyclopediaData = [
      {
        id: 'test-encyclopedia',
        title: 'Test Encyclopedia',
        description: 'Test description',
        items: [
          {
            id: 'item-1',
            name: 'Test Item',
            quantity: 5,
            notes: '',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    
    vi.mocked(useEncyclopediasModule.useEncyclopedias).mockReturnValue({
      data: mockData,
      setData: mockSetData,
      loading: false,
      error: null
    })

    render(<Encyclopedia />)
    
    // Find and click the increment button
    const incrementButtons = screen.getAllByText('+')
    await user.click(incrementButtons[0])
    
    // Verify setData was called (data persistence happens through the hook)
    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled()
    })
  })

  it('should create default encyclopedia if none exists', () => {
    vi.mocked(useEncyclopediasModule.useEncyclopedias).mockReturnValue({
      data: [],
      setData: mockSetData,
      loading: false,
      error: null
    })

    render(<Encyclopedia />)
    
    // Should create a default encyclopedia
    expect(mockSetData).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'default',
          title: 'My Collection',
          description: 'My personal collection encyclopedia',
          items: []
        })
      ])
    )
  })

  it('should display empty state when no items exist', () => {
    const mockData: EncyclopediaData = [
      {
        id: 'test-encyclopedia',
        title: 'Test Encyclopedia',
        description: 'Test description',
        items: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    
    vi.mocked(useEncyclopediasModule.useEncyclopedias).mockReturnValue({
      data: mockData,
      setData: mockSetData,
      loading: false,
      error: null
    })

    render(<Encyclopedia />)
    
    expect(screen.getByText(/No collection items yet/i)).toBeDefined()
  })
})
