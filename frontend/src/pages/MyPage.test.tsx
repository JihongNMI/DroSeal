import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MyPage from './MyPage'
import * as useProfileModule from '../hooks/useProfile'

// Mock the useProfile hook
vi.mock('../hooks/useProfile')

describe('MyPage', () => {
  const mockProfileData = {
    profile: {
      id: 'user-1',
      username: 'testuser',
      displayName: 'Test User',
      bio: 'Test bio',
      avatarUrl: '',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    friends: [],
    friendRequests: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading state initially', () => {
    vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({
      data: mockProfileData,
      setData: vi.fn(),
      loading: true,
      error: null
    })

    render(
      <BrowserRouter>
        <MyPage />
      </BrowserRouter>
    )

    expect(screen.getByText(/Loading profile/i)).toBeDefined()
  })

  it('should display profile data when loaded', async () => {
    vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({
      data: mockProfileData,
      setData: vi.fn(),
      loading: false,
      error: null
    })

    render(
      <BrowserRouter>
        <MyPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeDefined()
      expect(screen.getByDisplayValue('Test User')).toBeDefined()
      expect(screen.getByDisplayValue('Test bio')).toBeDefined()
    })
  })

  it('should display error message when there is an error', () => {
    const errorMessage = 'Failed to load profile'
    vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({
      data: mockProfileData,
      setData: vi.fn(),
      loading: false,
      error: errorMessage
    })

    render(
      <BrowserRouter>
        <MyPage />
      </BrowserRouter>
    )

    expect(screen.getByText(/Error: Failed to load profile/i)).toBeDefined()
  })

  it('should use useProfile hook for data management', () => {
    const mockSetData = vi.fn()
    vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({
      data: mockProfileData,
      setData: mockSetData,
      loading: false,
      error: null
    })

    render(
      <BrowserRouter>
        <MyPage />
      </BrowserRouter>
    )

    // Verify the hook was called
    expect(useProfileModule.useProfile).toHaveBeenCalled()
  })

  it('should display friends when available', () => {
    const profileDataWithFriends = {
      ...mockProfileData,
      friends: [
        {
          id: 'friend-1',
          userId: 'user-1',
          friendId: 'friend-user',
          status: 'accepted' as const,
          createdAt: new Date('2024-01-01')
        }
      ]
    }

    vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({
      data: profileDataWithFriends,
      setData: vi.fn(),
      loading: false,
      error: null
    })

    render(
      <BrowserRouter>
        <MyPage />
      </BrowserRouter>
    )

    // Use getAllByText since "Friends" appears multiple times (heading and "Friends since")
    const friendsElements = screen.getAllByText(/Friends/i)
    expect(friendsElements.length).toBeGreaterThan(0)
    expect(screen.getByText(/friend-user/i)).toBeDefined()
  })

  it('should display friend requests when available', () => {
    const profileDataWithRequests = {
      ...mockProfileData,
      friendRequests: [
        {
          id: 'request-1',
          userId: 'requester-user',
          friendId: 'user-1',
          status: 'pending' as const,
          createdAt: new Date('2024-01-01')
        }
      ]
    }

    vi.spyOn(useProfileModule, 'useProfile').mockReturnValue({
      data: profileDataWithRequests,
      setData: vi.fn(),
      loading: false,
      error: null
    })

    render(
      <BrowserRouter>
        <MyPage />
      </BrowserRouter>
    )

    expect(screen.getByText(/Friend Requests/i)).toBeDefined()
    expect(screen.getByText(/requester-user/i)).toBeDefined()
  })
})
