"use client"

import { useState, useEffect } from "react"
import { FaRandom, FaCrown } from "react-icons/fa"
import { FiFilter } from "react-icons/fi"
import { MdClose } from "react-icons/md"
import { useNavigate } from "react-router-dom"
import api from "../../api"

export default function ReadingList({ isPremium = false }) {
  const navigate = useNavigate()
  const [mockData, setMockData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [mockModalOpen, setMockModalOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [selectedPart, setSelectedPart] = useState(null)
  const [userPremium, setUserPremium] = useState(isPremium)
  const [filters, setFilters] = useState({
    solved: false,
    unsolved: false,
    easy: false,
    medium: false,
    hard: false,
    recent: false,
    popular: false,
  })

  useEffect(() => {
    const fetchMocks = async () => {
      try {
        setLoading(true)
        const data = await api.get("/mock/reading/all").catch(err=>{
          alert("Error in getting reading tasks. Reload page or contact to support.")
        })
        
        setMockData(Array.isArray(data.data.mocks) ? data.data.mocks : [])
        setError(null)
      } catch (err) {
        console.log("[v0] Error fetching mocks:", err.message)
        setError("Failed to load reading tasks. Please try again later.")
        setMockData([])
      } finally {
        setLoading(false)
      }
    }

    fetchMocks()
  }, [])

  const handleFilterChange = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const filterOptions = [
    { group: "Status", items: ["solved", "unsolved"] },
    { group: "Difficulty", items: ["easy", "medium", "hard"] },
    { group: "Sorting", items: ["recent", "popular"] },
  ]

  const getLabel = (key) => {
    const labels = {
      solved: "Solved",
      unsolved: "Unsolved",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      recent: "Most Recent",
      popular: "Most Popular",
    }
    return labels[key] || key
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  const openTaskModal = (taskId) => {
    setSelectedTaskId(taskId)
    setMockModalOpen(true)
    setSelectedPart(null)
  }

  const selectRandomTask = () => {
    if (mockData.length === 0) return
    const accessibleMocks = isPremium ? mockData : mockData.slice(0, 4)
    if (accessibleMocks.length === 0) {
      alert("Premium mocks are locked. Please upgrade to access more.")
      return
    }
    const randomIndex = Math.floor(Math.random() * accessibleMocks.length)
    openTaskModal(accessibleMocks[randomIndex].id)
  }

  const closeMockModal = () => {
    setMockModalOpen(false)
    setSelectedTaskId(null)
    setSelectedPart(null)
  }

  const getDifficultyColor = (difficulty) => {
    const lowerDifficulty = difficulty?.toLowerCase()
    switch (lowerDifficulty) {
      case "easy":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
      case "hard":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
    }
  }

  const getSelectedTask = () => {
    return mockData.find((m) => m.id === selectedTaskId)
  }

  const selectedTask = getSelectedTask()

  const renderReadingParts = () => {
    const parts = [
      { num: 1, data: selectedTask.part1, time: "15 min" },
      { num: 2, data: selectedTask.part2, time: "15 min" },
      { num: 3, data: selectedTask.part3, time: "15 min" },
      { num: 4, data: selectedTask.part4, time: "10 min" },
      { num: 5, data: selectedTask.part5, time: "10 min" },
    ]

    return (
      <div className="grid grid-cols-1 gap-3">
        {parts.map((part) => (
          <div
            key={part.num}
            onClick={() => setSelectedPart(part.num)}
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all transform hover:scale-102 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Part {part.num}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {part.data?.description || `Complete Part ${part.num}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ~⏱️ {part.data?.time || part.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-start gap-5 p-6 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50">
      <h3 className="text-4xl font-bold text-gray-800 dark:text-white">CEFR reading tasks</h3>

      <div className="list w-full dark:bg-slate-700 bg-slate-200 rounded-lg p-5 flex flex-col gap-5">
        {/* Toolbar */}
        <div className="extras w-full flex items-center gap-4 flex-wrap">
          <button
            onClick={selectRandomTask}
            disabled={loading || mockData.length === 0}
            className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg rounded-full text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaRandom className="text-white" size={16} />
            <span>Select random</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-3 px-4 py-2 shadow-lg rounded-full font-semibold transition-all duration-200 cursor-pointer ${
                filterOpen
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white scale-105 dark:text-white"
                  : "bg-gray-200/50 dark:bg-gray-700 text-gray-800 dark:text-white hover:brightness-90"
              }`}
            >
              <FiFilter size={16} />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-bold text-gray-800 dark:text-white">Filter Options</h4>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <MdClose size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <div className="p-4 flex flex-col gap-6 max-h-96 overflow-y-auto">
                  {filterOptions.map((group, idx) => (
                    <div key={idx} className="flex flex-col gap-3">
                      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {group.group}
                      </h5>
                      <div className="flex flex-col gap-2 ml-2">
                        {group.items.map((item) => (
                          <label
                            key={item}
                            className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={filters[item]}
                              onChange={() => handleFilterChange(item)}
                              className="w-4 h-4 accent-blue-500 cursor-pointer"
                            />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{getLabel(item)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex gap-3">
                  <button
                    onClick={() =>
                      setFilters({
                        solved: false,
                        unsolved: false,
                        easy: false,
                        medium: false,
                        hard: false,
                        recent: false,
                        popular: false,
                      })
                    }
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tasks List */}
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Active Filters:{" "}
            {activeFiltersCount > 0
              ? Object.entries(filters)
                  .filter(([_, v]) => v)
                  .map(([k]) => getLabel(k))
                  .join(", ")
              : "None"}
          </p>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-800 dark:text-red-300">
              {error}
            </div>
          )}

          {!loading && mockData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockData.map((mock, index) => (
                <div
                  onClick={() => {
                    const canAccess = isPremium || index < 4
                    if (!canAccess) {
                      alert("Premium mock. Please upgrade to access this mock.")
                      return
                    }
                    openTaskModal(mock.id)
                  }}
                  key={mock.id}
                  className={[
                    "p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all border border-gray-200 dark:border-gray-700",
                    isPremium || index < 4
                      ? "hover:shadow-lg cursor-pointer hover:scale-105 transform"
                      : "opacity-60 cursor-not-allowed",
                  ].join(" ")}
                >
                  <h5 className="font-semibold text-gray-800 dark:text-white">
                    {mock.part1?.title || `Reading Task ${mock.id}`}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {mock.part1?.description || "Complete this reading exercise"}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${getDifficultyColor(mock.part1?.difficulty || "medium")}`}
                    >
                      {mock.part1?.difficulty || "Medium"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {isPremium || index < 4 ? "Free" : "Premium"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && mockData.length === 0 && !error && (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              <p>No reading tasks available</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Backdrop */}
      {mockModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998] transition-opacity duration-300"
          onClick={closeMockModal}
        />
      )}

      {/* Modal */}
      {mockModalOpen && selectedTask && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999] w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaCrown size={20} />
              <div>
                <p className="font-bold">Take Full Mock Exam</p>
                <p className="text-xs text-white/90">Premium feature - Complete all parts with instant feedback</p>
              </div>
            </div>
            <button
              style={{ color: "purple" }}
              onClick={() => navigate(!isPremium ? '/plans' : `/mock/cefr/reading/${selectedTask.id}?part=all`)}
              className="px-4 py-2 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 cursor-pointer"
            >
              Try Full Mock
            </button>
          </div>

          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {selectedTask.part1?.title || `Reading Task ${selectedTask.id}`}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{selectedTask.part1?.description || ""}</p>
            </div>
            <button
              onClick={closeMockModal}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MdClose size={24} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!selectedPart ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Difficulty</p>
                    <p
                      className={`text-lg font-bold ${getDifficultyColor(selectedTask.part1?.difficulty || "medium")}`}
                    >
                      {selectedTask.part1?.difficulty || "Medium"}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Time</p>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">
                      65 min
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">Select a part to start practicing:</p>

                {renderReadingParts()}
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedPart(null)}
                  className="mb-4 text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-2"
                >
                  ← Back to parts
                </button>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2">
                    Part {selectedPart}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedPart === 1 && selectedTask.part1?.description}
                    {selectedPart === 2 && selectedTask.part2?.description}
                    {selectedPart === 3 && selectedTask.part3?.description}
                    {selectedPart === 4 && selectedTask.part4?.description}
                    {selectedPart === 5 && selectedTask.part5?.description}
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <a
                    href={`/mock/cefr/reading/${selectedTask.id}?part=${selectedPart}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-center"
                  >
                    Start Reading
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .slide-in-from-top-2 {
          animation: slideInFromTop 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
