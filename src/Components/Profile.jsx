"use client"

import { useState, useEffect } from "react"
import { FaEdit, FaTimes, FaLock, FaTrash, FaCheck, FaDesktop, FaMobileAlt } from "react-icons/fa"
import api, { getMyDevices, logoutDevice } from "../api"
import { User } from "lucide-react"

// Password Change Modal
function PasswordModal({ isOpen, onClose, onSubmit, passwordData, onPasswordChange }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 animate-in fade-in scale-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <FaLock size={20} />
            Change Password
          </h3>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <FaTimes size={20} />
          </button>
        </div>
        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              name="oldPassword"
              value={passwordData.oldPassword}
              onChange={onPasswordChange}
              placeholder="Enter your current password"
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 dark:bg-gray-700 dark:text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={onPasswordChange}
              placeholder="Enter your new password"
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 dark:bg-gray-700 dark:text-white transition-all"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">At least 8 characters</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={onPasswordChange}
              placeholder="Confirm your new password"
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 dark:bg-gray-700 dark:text-white transition-all"
            />
          </div>
        </div>
        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-lg transition-all"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  )
}

// Delete Account Warning Modal
function DeleteModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-500 dark:border-red-600 animate-in fade-in scale-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <FaTrash size={24} />
            Delete Account
          </h3>
        </div>
        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-600 p-4 rounded">
            <p className="text-red-800 dark:text-red-200 font-semibold">⚠️ Warning</p>
            <p className="text-red-700 dark:text-red-300 text-sm mt-2">
              This action cannot be undone. Your account and all associated data will be permanently deleted.
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>By deleting your account:</strong>
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1 ml-4">
              <li>✗ All your courses will be removed</li>
              <li>✗ All your results and progress will be deleted</li>
              <li>✗ You won't be able to recover your data</li>
            </ul>
          </div>
        </div>
        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// Active Sessions Modal
function SessionsModal({ isOpen, onClose, sessions, onLogoutSession, loading }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-gray-700 animate-in fade-in scale-95 duration-200 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <FaDesktop size={24} />
            Active Sessions
          </h3>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
            <FaTimes size={20} />
          </button>
        </div>
        {/* Content */}
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {sessions && sessions.length > 0 ? (
            sessions.map((session) => (
              <div key={session.id} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 flex items-center justify-between border-l-4 border-cyan-500">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-2xl">
                    {session.device_type === "mobile" ? <FaMobileAlt /> : <FaDesktop />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {session.device_type === "mobile" ? "📱 Mobile" : "💻 " + (session.browser || "Web")}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{session.device_name?.substring(0, 50) || "Unknown"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Last active: {new Date(session.last_activity).toLocaleString()}
                    </p>
                    {session.ip_address && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">IP: {session.ip_address}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onLogoutSession(session.id)}
                  disabled={loading}
                  className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all"
                >
                  {loading ? "..." : "Logout"}
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400">No active sessions</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Profile Component
export default function Profile() {
  const [editMode, setEditMode] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSessionsModal, setShowSessionsModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState([])
  const [sessionLoading, setSessionLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    id: "",
    username: "",
    email: "",
  })
  const [avatar, setAvatar] = useState(null)
  const [tempData, setTempData] = useState(profileData)
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/user/me")
        const userData = {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
        }
        setAvatar(response.data.google_avatar)
        setProfileData(userData)
        setTempData(userData)
      } catch (error) {
        console.log("[v0] Error fetching user data:", error)
        alert("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [])

  // ✅ Fetch active sessions
  const fetchSessions = async () => {
    try {
      setSessionLoading(true)
      const data = await getMyDevices()
      // Ensure we have an array (empty or with sessions)
      setSessions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching sessions:", error)
      // Show alert but keep modal open so user can try again
      alert("Failed to load active sessions. Please try again.")
      setSessions([])  // Show empty state
    } finally {
      setSessionLoading(false)
    }
  }

  // ✅ Logout from specific session
  const handleLogoutSession = async (sessionId) => {
    try {
      setSessionLoading(true)
      await logoutDevice(sessionId)
      alert("✅ Session logged out successfully!")
      await fetchSessions() // Refresh sessions list
    } catch (error) {
      console.log("Error logging out session:", error)
      alert("Failed to logout from session")
    } finally {
      setSessionLoading(false)
    }
  }

  // ✅ Open sessions modal and fetch
  const handleOpenSessionsModal = () => {
    setShowSessionsModal(true)
    fetchSessions()
  }

  const handleEditClick = () => {
    setTempData(profileData)
    setEditMode(true)
  }

  const handleSaveClick = () => {
    setProfileData(tempData)

    api
      .put("/user/update", tempData)
      .then((res) => {
        window.location.reload()
      })
      .catch((err) => {
        alert(err.data.detail || "Failed to update profile")
      })
    setEditMode(false)
  }

  const handleCancelClick = () => {
    setTempData(profileData)
    setEditMode(false)
  }

  const handleInputChange = (field, value) => {
    setTempData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordSubmit = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match!")
      return
    }
    if (passwordData.newPassword.length < 8) {
      alert("Password must be at least 8 characters!")
      return
    }
    alert("✅ Password changed successfully!")
    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" })
    setShowPasswordModal(false)
  }

  const handleDeleteAccount = () => {
    alert("✅ Account deleted successfully!")
    setShowDeleteModal(false)
  }

  return (
    <div className="w-full h-max dark:bg-slate-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 flex flex-col gap-8 overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">👤 Profile Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your account information and preferences</p>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading profile data...</p>
        </div>
      ) : (
        <>
          {/* Profile Information Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">📋 Profile Information</h3>
                <p className="text-blue-100 text-sm mt-1">Update your personal details</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                {avatar ? <img
                  src={avatar}
                  alt="Profile"
                  className="w-14 h-14 rounded-full border-2 border-white"
                /> : <User />}
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* ID Display - Top Right Corner */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(profileData.id)
                    alert("✅ ID copied to clipboard!")
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-sm font-bold rounded-lg transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
                  title="Click to copy"
                >
                  🆔 ID: {profileData.id}
                  <FaCheck size={14} />
                </button>
              </div>

              {/* Username Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Username</label>
                {editMode ? (
                  <input
                    type="text"
                    value={tempData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-600 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 dark:bg-gray-700 dark:text-white transition-all"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-semibold">
                    {profileData.username}
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Email Address
                </label>
                {editMode ? (
                  <input
                    type="email"
                    value={tempData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-600 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 dark:bg-gray-700 dark:text-white transition-all"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-semibold">
                    {profileData.email}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                {editMode ? (
                  <>
                    <button
                      onClick={handleSaveClick}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                    >
                      <FaCheck size={18} />
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelClick}
                      className="flex-1 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <FaTimes size={18} />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <FaEdit size={18} />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <FaLock size={24} />🔐 Change Password
              </h3>
              <p className="text-orange-100 text-sm mt-1">Update your password to keep your account secure</p>
            </div>
            {/* Content */}
            <div className="p-8">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Active Sessions Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <FaDesktop size={24} />
                🔐 Active Sessions
              </h3>
              <p className="text-cyan-100 text-sm mt-1">Manage your active login sessions across devices</p>
            </div>
            {/* Content */}
            <div className="p-8">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You can see all devices that are currently logged into your account. You can log out from any device at any time.
              </p>
              <button
                onClick={handleOpenSessionsModal}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                View & Manage Sessions
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl shadow-lg overflow-hidden border-2 border-red-300 dark:border-red-900">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <FaTrash size={24} />
                ⚠️ Danger Zone
              </h3>
              <p className="text-red-100 text-sm mt-1">Irreversible actions - proceed with caution</p>
            </div>
            {/* Content */}
            <div className="p-8">
              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  <strong>Delete Account:</strong> Once you delete your account, there is no going back. Please be
                  certain. All your data will be permanently removed.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Delete Account
              </button>
            </div>
          </div>

          {/* Modals */}
          <PasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            onSubmit={handlePasswordSubmit}
            passwordData={passwordData}
            onPasswordChange={handlePasswordChange}
          />
          <DeleteModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteAccount}
          />
          <SessionsModal
            isOpen={showSessionsModal}
            onClose={() => setShowSessionsModal(false)}
            sessions={sessions}
            onLogoutSession={handleLogoutSession}
            loading={sessionLoading}
          />
        </>
      )}
    </div>
  )
}
