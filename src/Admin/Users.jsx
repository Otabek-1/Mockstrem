import React, { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Search, MoreVertical, Shield, Crown, ListChecks, X, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../api'

const PAGE_SIZE = 15

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
  const [page, setPage] = useState(1)

  const [userPermissions, setUserPermissions] = useState({
    users: [],
    cefr: {
      reading: [],
      listening: [],
      speaking: [],
      writing: []
    }
  })

  // Qidiruv: username, email va ID bo'yicha (masalan "42" yoki "id:42")
  const filteredUsers = useMemo(() => {
    if (!users) return []
    const q = searchQuery.trim().toLowerCase()
    if (!q) return users
    return users.filter((user) => {
      const byUsername = user.username?.toLowerCase().includes(q)
      const byEmail = user.email?.toLowerCase().includes(q)
      const idStr = String(user.id)
      const byIdExact = idStr === q
      const byIdInclude = idStr.includes(q)
      const idPrefix = q.startsWith('id:') ? q.slice(3).trim() : null
      const byIdPrefix = idPrefix !== null && (idStr === idPrefix || idStr.includes(idPrefix))
      return byUsername || byEmail || byIdExact || byIdInclude || byIdPrefix
    })
  }, [users, searchQuery])

  const totalPages = Math.max(1, Math.ceil((filteredUsers?.length || 0) / PAGE_SIZE))
  const paginatedUsers = useMemo(() => {
    const list = filteredUsers || []
    const start = (page - 1) * PAGE_SIZE
    return list.slice(start, start + PAGE_SIZE)
  }, [filteredUsers, page])

  useEffect(() => setPage(1), [searchQuery])

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
      setUserSessions(Array.isArray(response.data) ? response.data : [])
      setShowSessionsModal(true)
    } catch (error) {
      console.error("Error fetching user sessions:", error)
      
      // Helpful error message for different cases
      let errorMsg = "Failed to load user sessions."
      if (error.response?.status === 404) {
        errorMsg += " Endpoint /sessions/user/{id} not yet implemented in backend."
        errorMsg += " Ask backend team to implement admin sessions endpoint."
      } else if (error.response?.status === 403) {
        errorMsg += " You don't have permission to view this user's sessions."
      }
      
      alert(errorMsg)
      setUserSessions([])
      setShowSessionsModal(true)  // Still show modal so user can see error context
    } finally {
      setSessionsLoading(false)
    }
  }

  // ✅ View user sessions
  const handleViewSessions = (user) => {
    setSelectedUser(user)
    fetchUserSessions(user.id)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (!users) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/10 border-t-violet-500 mx-auto mb-4"></div>
          <p className="text-white/60">Foydalanuvchilar yuklanmoqda...</p>
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
    <div className="w-full h-full flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-white text-2xl font-bold">Foydalanuvchilar</h2>
          <p className="text-gray-400 text-sm mt-0.5">ID, username yoki email bo&apos;yicha qidirish</p>
        </div>
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
          <input
            type="text"
            placeholder="ID, username yoki email (masalan: 42 yoki id:42)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
            disabled={loading}
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0f1012] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.06]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Premium</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Sessions</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-[#0c0d0f]">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                    Foydalanuvchilar topilmadi. ID, username yoki email orqali qidiring.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.06] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-violet-300">#{user.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{user.username}</span>
                        {user.is_admin && <Shield className="w-4 h-4 text-violet-400 shrink-0" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.premium_duration && new Date(user.premium_duration) > new Date() ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 w-fit">
                            <Crown className="w-3 h-3" />
                            Premium
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(user.premium_duration).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/15 text-gray-200">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/20 text-violet-300">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/15 text-gray-200">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewSessions(user)}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/50 text-white hover:bg-cyan-500/60 transition-colors border border-cyan-400/30"
                      >
                        Sessions
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                        disabled={loading}
                        className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors disabled:opacity-50"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openDropdown === user.id && (
                        <div className="z-[999]">
                          <div className="fixed inset-0" onClick={() => setOpenDropdown(null)} />
                          <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-[#1a1b1f] border border-white/15 py-1 z-20">
                            <button
                              onClick={() => toggleAdmin(user.id)}
                              disabled={loading}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white hover:bg-violet-500/25 transition-colors disabled:opacity-50 font-medium"
                            >
                              <Shield className="w-4 h-4 text-violet-400 shrink-0" />
                              {user.role === "admin" ? "Adminlikdan olish" : "Admin qilish"}
                            </button>
                            <button
                              onClick={() => togglePremium(user.id)}
                              disabled={loading}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white hover:bg-amber-500/25 transition-colors disabled:opacity-50 font-medium"
                            >
                              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                              {user.premium_duration && new Date(user.premium_duration) > new Date()
                                ? "Premium olib tashlash"
                                : "Premium berish"}
                            </button>
                            {user.role == "admin" && (
                              <button
                                onClick={() => openPermissionModal(user)}
                                disabled={loading}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors disabled:opacity-50 font-medium"
                              >
                                <ListChecks className="w-4 h-4 shrink-0" />
                                Ruxsatlarni boshqarish
                              </button>
                            )}
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
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-white/60">
          Ko&apos;rsatilmoqda: <span className="text-white font-medium">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredUsers?.length || 0)}</span> / <span className="text-violet-300 font-medium">{filteredUsers?.length ?? 0}</span> (jami {users?.length ?? 0})
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/15 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-300 min-w-[80px] text-center">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/15 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {showPermissionModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#16161a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6 gap-4 overflow-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-1">
                  Ruxsatlar: <span className="text-violet-400">{selectedUser?.username}</span>
                </h3>
                <p className="text-sm text-white/50">Ushbu foydalanuvchi uchun ruxsatlarni tanlang</p>
              </div>
              <button
                onClick={closePermissionModal}
                disabled={loading}
                className="p-2 hover:bg-white/10 rounded-lg transition disabled:opacity-50 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-t border-white/10 pt-4">
              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUsersCategoryChecked}
                  onChange={(e) => handleCategoryChange('users', e.target.checked)}
                  disabled={loading}
                  className="w-5 h-5 rounded cursor-pointer disabled:opacity-50 accent-violet-500"
                />
                <span className="text-lg font-semibold text-white">Foydalanuvchilar boshqaruvi</span>
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
                      className="w-4 h-4 rounded cursor-pointer disabled:opacity-50 accent-violet-500"
                    />
                    <label htmlFor={`users-${permission}`} className="cursor-pointer text-white/80">
                      {permission === 'promote_admin' ? 'Admin qilish/olish' :
                        permission === 'give_premium' ? 'Premium berish' :
                          'Ruxsatlarni boshqarish'}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-white/10 pt-4">
              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCEFRCategoryChecked}
                  onChange={(e) => handleCEFRChange(e.target.checked)}
                  disabled={loading}
                  className="w-5 h-5 rounded cursor-pointer disabled:opacity-50 accent-violet-500"
                />
                <span className="text-lg font-semibold text-white">CEFR boshqaruvi</span>
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
                          className="w-4 h-4 rounded cursor-pointer disabled:opacity-50 accent-violet-500"
                        />
                        <span className="font-semibold text-white capitalize">{subject}</span>
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
                              className="w-4 h-4 rounded cursor-pointer disabled:opacity-50 accent-violet-500"
                            />
                            <label htmlFor={`cefr-${subject}-${permission}`} className="cursor-pointer text-white/70 text-sm">
                              {permission === 'add' ? 'Yangi mock qo\'shish' :
                                permission === 'update_delete' ? 'Tahrirlash/o\'chirish' :
                                  'Natijalarni ko\'rish'}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                onClick={submitPermissions}
                disabled={loading}
                className="px-6 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-500 transition font-medium disabled:opacity-50"
              >
                {loading ? 'Saqlanmoqda...' : 'Ruxsatlarni saqlash'}
              </button>
              <button
                onClick={closePermissionModal}
                disabled={loading}
                className="px-6 py-2.5 border border-white/20 text-white/80 rounded-xl hover:bg-white/10 transition font-medium disabled:opacity-50"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showSessionsModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#16161a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6 gap-4 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-1">
                  Faol sessions: <span className="text-cyan-400">{selectedUser?.username}</span>
                </h3>
                <p className="text-sm text-white/50">Qurilmalar bo&apos;yicha kirishlar</p>
              </div>
              <button
                onClick={() => setShowSessionsModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3">
              {sessionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-cyan-500"></div>
                </div>
              ) : userSessions && userSessions.length > 0 ? (
                userSessions.map((session) => (
                  <div key={session.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="font-semibold text-white">
                      {session.device_type === "mobile" ? "📱 Mobile" : "💻 " + (session.browser || "Web")}
                    </p>
                    <p className="text-sm text-white/60">{session.device_name?.substring(0, 50) || "Unknown"}</p>
                    <div className="flex gap-4 mt-2 text-xs text-white/40">
                      <span>Oxirgi faol: {new Date(session.last_activity).toLocaleString()}</span>
                      {session.ip_address && <span>IP: {session.ip_address}</span>}
                    </div>
                  </div>
                ))
              ) : userSessions?.length === 0 ? (
                <p className="text-center text-white/50 py-8">Faol session yo&apos;q</p>
              ) : (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <p className="font-semibold text-amber-300">⚠️ Sessions yuklanmadi</p>
                  <p className="text-sm text-white/70 mt-2">
                    Backend da foydalanuvchi sessions endpoint hali mavjud emas.
                  </p>
                  <p className="text-xs text-white/50 mt-3">
                    Kerak: GET /sessions/user/{selectedUser?.id}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowSessionsModal(false)}
                className="px-6 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/15 transition font-medium"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}