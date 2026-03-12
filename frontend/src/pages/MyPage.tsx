import { useState } from 'react'
import { useProfile } from '../hooks/useProfile'
import { useCursorSkin } from '../hooks/useCursorSkin'
import CursorTestBoard from '../components/CursorTestBoard'
import type { UserProfile, Friend, FriendDisplay } from '../types'

export default function MyPage(): JSX.Element {
  // Use the profile hook for persistent data
  const { data: profileData, setData: setProfileData, loading, error } = useProfile()
  const { skins, selectedSkinId, selectSkin, isLoading: skinsLoading, isSaving } = useCursorSkin()
  
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
    // TODO: JWT 활성화 후 실제 API 호출로 교체 필요
    // 현재는 MVP 데모용 로컬 시뮬레이션
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
    <div className="p-6 min-h-screen dark:bg-[#0d0b2b] transition-colors duration-300">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">My Page</h1>

        {/* Loading state */}
        {loading && (
          <div className="bg-white dark:bg-[#1a1740] rounded-lg shadow-md p-6 mb-6 text-center transition-colors">
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 mb-6 transition-colors">
            <p className="text-red-800 dark:text-red-400">Error: {error}</p>
          </div>
        )}

        {/* Profile section */}
        {!loading && (
          <div className="bg-white dark:bg-[#1a1740] rounded-lg shadow-md p-6 mb-6 transition-colors">
            <div className="flex justify-between items-center mb-4 transition-colors">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 transition-colors">Profile</h2>
              <div className="flex gap-2">
                {isEditing && (
                  <button 
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  onClick={handleEditToggle}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  {isEditing ? 'Save' : 'Edit'}
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Username</label>
                <input 
                  type="text"
                  value={isEditing ? editedProfile.username : profileData.profile.username}
                  disabled={!isEditing}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 rounded-lg bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-[#13112c]/50 disabled:text-gray-600 dark:disabled:text-gray-400 transition-colors"
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Display Name</label>
                <input 
                  type="text"
                  value={isEditing ? editedProfile.displayName : profileData.profile.displayName}
                  disabled={!isEditing}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 rounded-lg bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-[#13112c]/50 disabled:text-gray-600 dark:disabled:text-gray-400 transition-colors"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Bio</label>
                <textarea 
                  value={isEditing ? editedProfile.bio : profileData.profile.bio}
                  disabled={!isEditing}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 rounded-lg bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-[#13112c]/50 disabled:text-gray-600 dark:disabled:text-gray-400 transition-colors"
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Avatar URL</label>
                <input 
                  type="text"
                  value={isEditing ? editedProfile.avatarUrl : profileData.profile.avatarUrl}
                  disabled={!isEditing}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, avatarUrl: e.target.value }))}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 rounded-lg bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-[#13112c]/50 disabled:text-gray-600 dark:disabled:text-gray-400 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Cursor Skin section */}
        {!loading && (
          <div className="bg-white dark:bg-[#1a1740] rounded-lg shadow-md p-6 mb-6 transition-colors">
            <div className="flex justify-between items-center mb-4 transition-colors">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 transition-colors">커서 스킨</h2>
              {isSaving && (
                <span className="text-xs text-blue-500 font-medium animate-pulse transition-colors">저장 중...</span>
              )}
            </div>

            {skinsLoading ? (
              <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-6 transition-colors">스킨 목록 불러오는 중...</p>
            ) : skins.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-6 transition-colors">등록된 커서 스킨이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {skins.filter(skin => skin.folderPath).map(skin => {
                  const isSelected = skin.id === selectedSkinId
                  const previewUrl = `/cursors/${skin.folderPath}/normal/frame_00.png`
                  return (
                    <button
                      key={skin.id}
                      onClick={() => !isSaving && selectSkin(skin.id)}
                      disabled={isSaving}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
                        ${isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-2 ring-blue-300 dark:ring-blue-800/50'
                          : 'border-gray-200 dark:border-purple-900/30 bg-gray-50 dark:bg-[#13112c]/50 hover:border-blue-300 dark:hover:border-blue-700/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'}
                        ${isSaving ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-black/20 rounded-lg border border-gray-200 dark:border-purple-900/50 shadow-inner overflow-hidden transition-colors">
                        <img
                          src={previewUrl}
                          alt={skin.name}
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                      <span className={`text-xs font-semibold text-center leading-tight transition-colors
                        ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {skin.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] bg-blue-500 dark:bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold transition-colors">
                          적용 중
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Cursor Test Board */}
        {!loading && (
          <div className="mb-6">
            <CursorTestBoard />
          </div>
        )}

        {/* Friend requests section */}
        {!loading && friendRequestsDisplay.length > 0 && (
          <div className="bg-white dark:bg-[#1a1740] rounded-lg shadow-md p-6 mb-6 transition-colors">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors">Friend Requests</h2>
            <div className="space-y-3">
              {friendRequestsDisplay.map(request => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#13112c]/50 border border-transparent dark:border-purple-900/20 rounded-lg hover:bg-gray-100 dark:hover:bg-[#13112c] transition-colors">
                  <div className="flex items-center gap-3">
                    {request.avatarUrl ? (
                      <img 
                        src={request.avatarUrl} 
                        alt={request.username}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-purple-900/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-900/30 flex items-center justify-center transition-colors">
                        <span className="text-blue-700 dark:text-blue-400 font-semibold text-lg">
                          {request.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors">{request.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                        {request.addedDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAcceptRequest(request.id)}
                      className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 text-sm transition-colors"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleRejectRequest(request.id)}
                      className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 text-sm transition-colors"
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
          <div className="bg-white dark:bg-[#1a1740] rounded-lg shadow-md p-6 transition-colors">
            <div className="flex justify-between items-center mb-4 transition-colors">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                Friends {friendsDisplay.length > 0 && <span className="text-gray-500 dark:text-gray-400 text-base">({friendsDisplay.length})</span>}
              </h2>
              <button 
                onClick={() => setShowAddFriendModal(true)}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Add Friend
              </button>
            </div>
            
            <div className="space-y-2">
              {friendsDisplay.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2 transition-colors">No friends yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm transition-colors">Add friends to connect with other collectors</p>
                </div>
              ) : (
                friendsDisplay.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#13112c]/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      {friend.avatarUrl ? (
                        <img 
                          src={friend.avatarUrl} 
                          alt={friend.username}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-purple-900/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-200 dark:bg-blue-900/30 flex items-center justify-center transition-colors">
                          <span className="text-blue-700 dark:text-blue-400 font-semibold text-xl">
                            {friend.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors">{friend.username}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                          Friends since {friend.addedDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium transition-colors"
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
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-colors">
          <div className="bg-white dark:bg-[#1a1740] rounded-2xl shadow-xl p-6 max-w-md w-full border border-transparent dark:border-purple-900/50 animate-in fade-in zoom-in duration-200 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">Add Friend</h2>
            
            <div className="space-y-4">
              {/* Username input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newFriendUsername}
                  onChange={(e) => setNewFriendUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-purple-900/50 rounded-lg bg-white dark:bg-[#13112c] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddFriend()
                    }
                  }}
                />
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-lg p-3 transition-colors">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-1 transition-colors">Note:</h4>
                <p className="text-xs text-blue-800 dark:text-blue-300 transition-colors">
                  Enter the username of the person you want to add as a friend. They will receive a friend request.
                </p>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-purple-900/30 transition-colors">
              <button
                onClick={handleCloseAddFriendModal}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFriend}
                className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 shadow-md transition-colors"
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
