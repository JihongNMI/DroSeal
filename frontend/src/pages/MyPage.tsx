import { useState } from 'react'
import { useProfile } from '../hooks/useProfile'
import type { UserProfile, Friend } from '../types'

// Local interface for component-specific friend display
interface FriendDisplay {
  id: string
  username: string
  avatarUrl?: string
  addedDate: Date
}

export default function MyPage(): JSX.Element {
  // Use the profile hook for persistent data
  const { data: profileData, setData: setProfileData, loading, error } = useProfile()
  
  // UI state
  const [isEditing, setIsEditing] = useState(false)
  const [showAddFriendModal, setShowAddFriendModal] = useState(false)
  const [newFriendUsername, setNewFriendUsername] = useState('')

  // Temporary profile state for editing
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profileData.profile)

  // Convert Friend type to FriendDisplay for rendering
  const friendsDisplay: FriendDisplay[] = profileData.friends
    .filter(f => f.status === 'accepted')
    .map(f => ({
      id: f.id,
      username: f.friendId, // In a real app, this would be looked up
      avatarUrl: undefined,
      addedDate: f.createdAt
    }))

  const friendRequestsDisplay: FriendDisplay[] = profileData.friendRequests
    .filter(f => f.status === 'pending')
    .map(f => ({
      id: f.id,
      username: f.userId, // In a real app, this would be looked up
      avatarUrl: undefined,
      addedDate: f.createdAt
    }))

  // Handle profile edit mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setProfileData({
        ...profileData,
        profile: {
          ...editedProfile,
          updatedAt: new Date()
        }
      })
      setIsEditing(false)
    } else {
      // Enter edit mode
      setEditedProfile(profileData.profile)
      setIsEditing(true)
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditedProfile(profileData.profile)
    setIsEditing(false)
  }

  // Handle accept friend request
  const handleAcceptRequest = (requestId: string) => {
    const updatedFriends = profileData.friends.map(f =>
      f.id === requestId ? { ...f, status: 'accepted' as const } : f
    )
    const updatedRequests = profileData.friendRequests.filter(r => r.id !== requestId)
    
    setProfileData({
      ...profileData,
      friends: updatedFriends,
      friendRequests: updatedRequests
    })
  }

  // Handle reject friend request
  const handleRejectRequest = (requestId: string) => {
    const updatedRequests = profileData.friendRequests.filter(r => r.id !== requestId)
    
    setProfileData({
      ...profileData,
      friendRequests: updatedRequests
    })
  }

  // Handle remove friend
  const handleRemoveFriend = (friendId: string) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      const updatedFriends = profileData.friends.filter(f => f.id !== friendId)
      
      setProfileData({
        ...profileData,
        friends: updatedFriends
      })
    }
  }

  // Handle add friend
  const handleAddFriend = () => {
    if (!newFriendUsername.trim()) {
      alert('Please enter a username')
      return
    }

    // Check if already friends
    if (friendsDisplay.some(f => f.username.toLowerCase() === newFriendUsername.toLowerCase())) {
      alert('You are already friends with this user')
      return
    }

    // Check if request already exists
    if (friendRequestsDisplay.some(r => r.username.toLowerCase() === newFriendUsername.toLowerCase())) {
      alert('A friend request from this user already exists')
      return
    }

    // In a real app, this would send a friend request to the server
    // For MVP, we'll simulate receiving a friend request
    const mockRequest: Friend = {
      id: `req-${Date.now()}`,
      userId: newFriendUsername.trim(),
      friendId: profileData.profile.id,
      status: 'pending',
      createdAt: new Date()
    }

    setProfileData({
      ...profileData,
      friendRequests: [...profileData.friendRequests, mockRequest]
    })
    
    setShowAddFriendModal(false)
    setNewFriendUsername('')
    
    alert(`Friend request sent to ${newFriendUsername}! (For demo purposes, it appears as an incoming request)`)
  }

  // Handle close add friend modal
  const handleCloseAddFriendModal = () => {
    setShowAddFriendModal(false)
    setNewFriendUsername('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Page</h1>

        {/* Loading state */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {/* Profile section */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
              <div className="flex gap-2">
                {isEditing && (
                  <button 
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  onClick={handleEditToggle}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isEditing ? 'Save' : 'Edit'}
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input 
                  type="text"
                  value={isEditing ? editedProfile.username : profileData.profile.username}
                  disabled={!isEditing}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input 
                  type="text"
                  value={isEditing ? editedProfile.displayName : profileData.profile.displayName}
                  disabled={!isEditing}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea 
                  value={isEditing ? editedProfile.bio : profileData.profile.bio}
                  disabled={!isEditing}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                <input 
                  type="text"
                  value={isEditing ? editedProfile.avatarUrl : profileData.profile.avatarUrl}
                  disabled={!isEditing}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, avatarUrl: e.target.value }))}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Friend requests section */}
        {!loading && friendRequestsDisplay.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Friend Requests</h2>
            <div className="space-y-3">
              {friendRequestsDisplay.map(request => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    {request.avatarUrl ? (
                      <img 
                        src={request.avatarUrl} 
                        alt={request.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                        <span className="text-blue-700 font-semibold text-lg">
                          {request.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{request.username}</p>
                      <p className="text-xs text-gray-500">
                        {request.addedDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAcceptRequest(request.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleRejectRequest(request.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends list section */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Friends {friendsDisplay.length > 0 && <span className="text-gray-500 text-base">({friendsDisplay.length})</span>}
              </h2>
              <button 
                onClick={() => setShowAddFriendModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Friend
              </button>
            </div>
            
            <div className="space-y-2">
              {friendsDisplay.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg mb-2">No friends yet</p>
                  <p className="text-gray-400 text-sm">Add friends to connect with other collectors</p>
                </div>
              ) : (
                friendsDisplay.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      {friend.avatarUrl ? (
                        <img 
                          src={friend.avatarUrl} 
                          alt={friend.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                          <span className="text-blue-700 font-semibold text-xl">
                            {friend.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{friend.username}</p>
                        <p className="text-sm text-gray-500">
                          Friends since {friend.addedDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Friend Modal */}
      {showAddFriendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Friend</h2>
            
            <div className="space-y-4">
              {/* Username input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newFriendUsername}
                  onChange={(e) => setNewFriendUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddFriend()
                    }
                  }}
                />
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Note:</h4>
                <p className="text-xs text-blue-800">
                  Enter the username of the person you want to add as a friend. They will receive a friend request.
                </p>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleCloseAddFriendModal}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFriend}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
