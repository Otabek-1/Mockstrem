import React, { useEffect, useState } from 'react'
import { Search, MoreVertical, Shield, Crown, ListChecks, X } from 'lucide-react'
import api, { getMyDevices } from '../api'

const permissions = {
  users: ["promote_admin", "give_premium", "manage_permissions"],
  cefr: {
    reading: ["add", "update_delete"],
    listening: ["add", "update_delete"],
    speaking: ["add", "update_delete", "check_result"],
    writing: ["add", "update_delete", "check_result"]
  }
}

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openDropdown, setOpenDropdown] = useState(null)
  const [users, setUsers] = useState(null)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [currentUserPermissions, setCurrentUserPermissions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSessionsModal, setShowSessionsModal] = useState(false)
  const [userSessions, setUserSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(false)

  const [userPermissions, setUserPermissions] = useState({
    users: [],
    cefr: {
      reading: [],
      listening: [],
      speaking: [],
      writing: []
    }
  })

  const filteredUsers = users?.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function fetchUsers() {
    api.get("/user/users")
      .then(res => {
        // console.log("Users fetched:", res.data)
        setUsers(res.data)
      })
      .catch(err => {
        // console.error("Error fetching users:", err)
        alert("Error loading users")
      })
  }

  // ✅ FIX 1: Toggle Admin - Promise chain o'zgartirildi
  const toggleAdmin = (userId) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    setLoading(true)

    if (user.role === "user") {
      api.post("/user/promote", { id: userId })
        .then(res => {
          // console.log("User promoted:", res.data)

          const defaultPermissions = {
            permissions: {
              users: [],
              cefr: {
                reading: [],
                listening: [],
                speaking: [],
                writing: []
              }
            }
          }

          return api.post(`/permissions/${userId}`, defaultPermissions)
        })
        .then(res => {
          // console.log("Permissions created:", res.data)
          alert("User promoted to Admin successfully!")
          fetchUsers()
          setOpenDropdown(null)
        })
        .catch(err => {
          console.error("Error promoting user:", err.response?.data || err)
          alert(err.response?.data?.detail || "Error in promoting")
        })
        .finally(() => setLoading(false))
    } else {
      api.post("/user/demote", { id: userId })
        .then(res => {
          // console.log("User demoted:", res.data)
          return api.delete(`/permissions/${userId}`)
        })
        .then(res => {
          // console.log("Permissions deleted:", res.data)
          alert("User demoted from Admin successfully!")
          fetchUsers()
          setOpenDropdown(null)
        })
        .catch(err => {
          // console.error("Error demoting user:", err.response?.data || err)
          alert(err.response?.data?.detail || "Error in demoting")
        })
        .finally(() => setLoading(false))
    }
  }

  const togglePremium = (userId) => {
    setLoading(true)
    api.post("/user/premium", { id: userId })
      .then(res => {
        // console.log("Premium toggled:", res.data)
        alert("Premium status updated successfully!")
        fetchUsers()
      })
      .catch(err => {
        console.error("Error toggling premium:", err.response?.data || err)
        alert(err.response?.data?.detail || "Error updating premium")
      })
      .finally(() => {
        setLoading(false)
        setOpenDropdown(null)
      })
  }

  // ✅ FIX 2: Permission modal - /user/me dan ID olib /permissions/{id} chaqirish
  const openPermissionModal = (user) => {
    setLoading(true)

    // ✅ First, get current logged in user ID
    api.get("/user/me")
      .then(res => {
        // console.log("Current user:", res.data)
        const currentUserId = res.data.id

        // ✅ Get current user permissions using their ID
        return api.get(`/permissions/${currentUserId}`)
      })
      .then(res => {
        // console.log("Current user permissions:", res.data)

        let currentPerms = {
          users: [],
          cefr: {
            reading: [],
            listening: [],
            speaking: [],
            writing: []
          }
        }

        // Extract permissions correctly
        if (res.data?.data && res.data.data !== "not_added") {
          if (res.data.data.permissions) {
            currentPerms = res.data.data.permissions
          }
        }

        // ✅ Check manage_permissions
        if (!currentPerms.users?.includes("manage_permissions")) {
          alert("You don't have permission to manage user permissions")
          setLoading(false)
          return
        }

        setCurrentUserPermissions(currentPerms)

        // ✅ Then, get target user permissions
        return api.get(`/permissions/${user.id}`)
      })
      .then(res => {
        // console.log("Target user permissions:", res.data)

        if (res.data.data !== "not_added" && res.data.data.permissions) {
          setUserPermissions(res.data.data.permissions)
        } else {
          setUserPermissions({
            users: [],
            cefr: {
              reading: [],
              listening: [],
              speaking: [],
              writing: []
            }
          })
        }

        setSelectedUser(user)
        setShowPermissionModal(true)
        setOpenDropdown(null)
      })
      .catch(err => {
        console.error("Error fetching permissions:", err.response?.data || err)
        // If no permissions exist, still allow modal
        if (err.response?.status === 404 || err.response?.data?.data === "not_added") {
          setUserPermissions({
            users: [],
            cefr: {
              reading: [],
              listening: [],
              speaking: [],
              writing: []
            }
          })
          setSelectedUser(user)
          setShowPermissionModal(true)
          setOpenDropdown(null)
        } else {
          alert("Error loading permissions")
        }
      })
      .finally(() => setLoading(false))
  }

  const closePermissionModal = () => {
    setShowPermissionModal(false)
    setSelectedUser(null)
    setUserPermissions({
      users: [],
      cefr: {
        reading: [],
        listening: [],
        speaking: [],
        writing: []
      }
    })
  }

  const handlePermissionChange = (category, permission, checked) => {
    setUserPermissions(prev => {
      if (category === 'users') {
        return {
          ...prev,
          users: checked
            ? [...prev.users, permission]
            : prev.users.filter(p => p !== permission)
        }
      } else {
        return {
          ...prev,
          cefr: {
            ...prev.cefr,
            [category]: checked
              ? [...prev.cefr[category], permission]
              : prev.cefr[category].filter(p => p !== permission)
          }
        }
      }
    })
  }

  const handleCategoryChange = (category, checked) => {
    if (category === 'users') {
      setUserPermissions(prev => ({
        ...prev,
        users: checked ? permissions.users : []
      }))
    } else {
      setUserPermissions(prev => ({
        ...prev,
        cefr: {
          ...prev.cefr,
          [category]: checked ? permissions.cefr[category] : []
        }
      }))
    }
  }

  const handleCEFRChange = (checked) => {
    setUserPermissions(prev => ({
      ...prev,
      cefr: checked ? {
        reading: permissions.cefr.reading,
        listening: permissions.cefr.listening,
        speaking: permissions.cefr.speaking,
        writing: permissions.cefr.writing
      } : {
        reading: [],
        listening: [],
        speaking: [],
        writing: []
      }
    }))
  }

  // ✅ FIX 3: Submit permissions with proper error handling
  const submitPermissions = () => {
    if (!selectedUser) return

    setLoading(true)
    const permissionData = {
      permissions: userPermissions
    }

    api.put(`/permissions/${selectedUser.id}`, permissionData)
      .then(res => {
        // console.log("Permissions updated:", res.data)
        alert("Permissions updated successfully!")
        closePermissionModal()
        fetchUsers()
      })
      .catch(err => {
        console.error("Error updating permissions:", err.response?.data || err)
        alert(err.response?.data?.detail || "Error updating permissions")
      })
      .finally(() => setLoading(false))
  }

  // ✅ Fetch user sessions
  const fetchUserSessions = async (userId) => {
    try {
      setSessionsLoading(true)
      // Backend should have endpoint: GET /sessions/user/{userId} 
      // va bu endpoint user sessions qaytaradi
      const response = await api.get(`/sessions/user/${userId}`)
      setUserSessions(response.data || [])
      setShowSessionsModal(true)
    } catch (error) {
      console.log("Error fetching user sessions:", error)
      alert("Failed to load user sessions")
    } finally {
      setSessionsLoading(false)
    }
  }

  // ✅ View user sessions
  const handleViewSessions = (user) => {
    fetchUserSessions(user.id)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (!users) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Loading users...</p>
        </div>
      </div>
    )
  }

  const isUsersCategoryChecked = userPermissions.users.length === permissions.users.length
  const isCEFRCategoryChecked =
    userPermissions.cefr.reading.length === permissions.cefr.reading.length &&
    userPermissions.cefr.listening.length === permissions.cefr.listening.length &&
    userPermissions.cefr.speaking.length === permissions.cefr.speaking.length &&
    userPermissions.cefr.writing.length === permissions.cefr.writing.length &&
    userPermissions.cefr.reading.length > 0

  return (
    <div className='w-full h-full flex flex-col gap-5 p-6'>
      <h2 className="text-slate-700 text-4xl font-semibold">Users</h2>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search users by username or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
      </div>

      <div className="bg-white rounded-lg shadow ">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Premium</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sessions</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredUsers?.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers?.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">#{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{user.username}</span>
                      {user.is_admin && <Shield className="w-4 h-4 text-blue-600" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.premium_duration && new Date(user.premium_duration) > new Date() ? (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 w-fit">
                          <Crown className="w-3 h-3" />
                          Premium
                        </span>
                        <span className="text-xs text-slate-500">
                          Until {new Date(user.premium_duration).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        Free
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {user.role === "admin" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewSessions(user)}
                      className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-cyan-100 text-cyan-800 hover:bg-cyan-200 transition-colors"
                    >
                      View Sessions
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                      disabled={loading}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100 disabled:opacity-50"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {openDropdown === user.id && (
                      <div className='z-[999]'>
                        <div className="fixed inset-0" onClick={() => setOpenDropdown(null)} />
                        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                          <div className="py-1">
                            <button
                              onClick={() => toggleAdmin(user.id)}
                              disabled={loading}
                              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
                            >
                              <Shield className="w-4 h-4" />
                              {user.role === "admin" ? 'Demote from Admin' : 'Promote to Admin'}
                            </button>
                            <button
                              onClick={() => togglePremium(user.id)}
                              disabled={loading}
                              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
                            >
                              <Crown className="w-4 h-4" />
                              {user.premium_duration ? 'Remove Premium' : 'Give Premium'}
                            </button>
                            {user.role == "admin" && (
                              <button
                                onClick={() => openPermissionModal(user)}
                                disabled={loading}
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
                              >
                                <ListChecks className="w-4 h-4" />
                                View permissions
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-slate-500">
        Showing {filteredUsers?.length || 0} of {users?.length || 0} users
      </div>

      {showPermissionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6 gap-4 overflow-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div>
                <h3 className="text-2xl font-semibold text-slate-800 mb-1">
                  Manage <span className="text-blue-600">{selectedUser?.username}</span>'s Permissions
                </h3>
                <p className="text-sm text-slate-500">Choose which features this user can access</p>
              </div>
              <button
                onClick={closePermissionModal}
                disabled={loading}
                className="p-1 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="border-t pt-4">
              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUsersCategoryChecked}
                  onChange={(e) => handleCategoryChange('users', e.target.checked)}
                  disabled={loading}
                  className="w-5 h-5 rounded cursor-pointer disabled:opacity-50"
                />
                <span className="text-lg font-semibold text-slate-800">Users Management</span>
              </label>
              <ul className="flex flex-col gap-3 ml-8">
                {permissions.users.map(permission => (
                  <li key={permission} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`users-${permission}`}
                      checked={userPermissions.users.includes(permission)}
                      onChange={(e) => handlePermissionChange('users', permission, e.target.checked)}
                      disabled={loading}
                      className="w-4 h-4 rounded cursor-pointer disabled:opacity-50"
                    />
                    <label htmlFor={`users-${permission}`} className="cursor-pointer text-slate-700">
                      {permission === 'promote_admin' ? 'Promote/Demote Admin' :
                        permission === 'give_premium' ? 'Give Premium' :
                          'Manage Permissions'}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-4">
              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCEFRCategoryChecked}
                  onChange={(e) => handleCEFRChange(e.target.checked)}
                  disabled={loading}
                  className="w-5 h-5 rounded cursor-pointer disabled:opacity-50"
                />
                <span className="text-lg font-semibold text-slate-800">CEFR Management</span>
              </label>

              <div className="ml-8 flex flex-col gap-6">
                {['reading', 'listening', 'speaking', 'writing'].map(subject => {
                  const isSubjectChecked =
                    userPermissions.cefr[subject].length === permissions.cefr[subject].length

                  return (
                    <div key={subject}>
                      <label className="flex items-center gap-3 mb-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSubjectChecked}
                          onChange={(e) => handleCategoryChange(subject, e.target.checked)}
                          disabled={loading}
                          className="w-4 h-4 rounded cursor-pointer disabled:opacity-50"
                        />
                        <span className="font-semibold text-slate-800 capitalize">{subject}</span>
                      </label>
                      <ul className="flex flex-col gap-2 ml-7">
                        {permissions.cefr[subject].map(permission => (
                          <li key={permission} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id={`cefr-${subject}-${permission}`}
                              checked={userPermissions.cefr[subject].includes(permission)}
                              onChange={(e) => handlePermissionChange(subject, permission, e.target.checked)}
                              disabled={loading}
                              className="w-4 h-4 rounded cursor-pointer disabled:opacity-50"
                            />
                            <label htmlFor={`cefr-${subject}-${permission}`} className="cursor-pointer text-slate-700 text-sm">
                              {permission === 'add' ? 'Add new mock' :
                                permission === 'update_delete' ? 'Update/Delete mock' :
                                  'Check results'}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <button
                onClick={submitPermissions}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Permissions'}
              </button>
              <button
                onClick={closePermissionModal}
                disabled={loading}
                className="px-6 py-2 border-2 border-slate-300 text-slate-800 rounded-lg hover:bg-slate-50 transition font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showSessionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6 gap-4 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div>
                <h3 className="text-2xl font-semibold text-slate-800 mb-1">
                  <span className="text-cyan-600">{selectedUser?.username}</span>'s Active Sessions
                </h3>
                <p className="text-sm text-slate-500">User is currently logged in from these devices</p>
              </div>
              <button
                onClick={() => setShowSessionsModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3">
              {sessionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                </div>
              ) : userSessions && userSessions.length > 0 ? (
                userSessions.map((session) => (
                  <div key={session.id} className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">
                        {session.device_type === "mobile" ? "📱 Mobile" : "💻 " + (session.browser || "Web")}
                      </p>
                      <p className="text-sm text-slate-600">{session.device_name?.substring(0, 50) || "Unknown"}</p>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500">
                        <span>Last active: {new Date(session.last_activity).toLocaleString()}</span>
                        {session.ip_address && <span>IP: {session.ip_address}</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">No active sessions</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setShowSessionsModal(false)}
                className="px-6 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}