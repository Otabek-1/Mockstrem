import React, { useState, useEffect, useRef } from 'react'
import { FaClock, FaCheck, FaPlus, FaMinus, FaMoon, FaSun } from 'react-icons/fa'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api'

export default function WritingExam() {
  const [examStarted, setExamStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [answers, setAnswers] = useState({ t11: '', t12: '', t2: '' })
  const [submitted, setSubmitted] = useState(false)
  const [part, setPart] = useState(null)
  const [isFullMock, setIsFullMock] = useState(false)
  const [mockData, setMockData] = useState(null)
  const [fontSize, setFontSize] = useState(100)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [leftPanelWidth, setLeftPanelWidth] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [expandedTask, setExpandedTask] = useState(null)
  const [user, setUser] = useState(null)
  const containerRef = useRef(null)
  const nav = useNavigate()
  const { id } = useParams()

  // BIRINCHI: User ma'lumotlarini olish
  useEffect(() => {
    api.get('/user/me').then(res => {
      setUser(res.data)
    }).catch(err => {
      alert("Error! Reload page or contact to support.")
      console.error(err)
    })
  }, [])

  // IKKINCHI: User yuklangandan KEYIN exam ma'lumotlarini olish
  useEffect(() => {
    if (!user) return // User yuklanmasa hech narsa qilmaymiz

    const params = new URLSearchParams(window.location.search)
    const partParam = params.get('part')
    
    if (partParam === 'all' && user.premium_duration && new Date(user.premium_duration) > new Date()) {
      setIsFullMock(true)
      setPart('all')
      setTimeLeft(3600) // 60 minutes
    } else if (partParam === '1') {
      setPart(1)
      setTimeLeft(1200) // 20 minutes
    } else if (partParam === '2') {
      setPart(2)
      setTimeLeft(1500) // 25 minutes
    } else {
      nav("/plans")
      return
    }

    setExamStarted(true)

    // Mock data olish
    api.get(`/mock/writing/mock/${id}`).then(res => {
      setMockData(res.data)
    }).catch(err => {
      alert("Error in getting mock. Reload page or contact to support.")
      console.error(err)
    })
  }, [user, id, nav])

  // Drag to resize panels
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return

      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100

      if (newWidth > 30 && newWidth < 70) {
        setLeftPanelWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // Timer
  useEffect(() => {
    if (!examStarted || submitted || timeLeft === 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [examStarted, submitted, timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length

  const handleAnswerChange = (field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    api.post(`/mock/writing/submit?token=${localStorage.getItem("access_token")}`, { 
      mock_id: id, 
      task1: `${answers.t11} ---TASK--- ${answers.t12}`, 
      task2: answers.t2 
    }).then(res => {
      if (res.status) {
        setSubmitted(true)
      }
    }).catch(err => {
      alert("Error in submitting, before reload page, make sure you've copied your writings :)")
      console.error(err)
    })
  }

  // Expanded textarea modal component
  const ExpandedTextarea = ({ taskId, title, value, onClose, onSave }) => {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className={`rounded-2xl shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-semibold transition"
            >
              ← Back
            </button>
          </div>

          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            <textarea
              autoFocus
              value={value}
              onChange={(e) => onSave(e.target.value)}
              className={`flex-1 p-4 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none font-serif text-lg transition-colors ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
            />

            <div className="mt-4 flex items-center justify-between">
              <span className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Word count: {wordCount(value)}
              </span>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 to-blue-50'}`}>
        <div className={`rounded-2xl p-12 shadow-2xl max-w-2xl text-center border-4 border-green-500 transition-colors ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <div className="text-7xl mb-6 animate-bounce">✅</div>
          <h1 className="text-4xl font-bold text-green-600 mb-4">Exam Submitted Successfully!</h1>

          <div className={`border-2 border-green-300 rounded-lg p-8 mb-8 transition-colors ${isDarkMode ? 'bg-gray-700 border-green-600' : 'bg-green-50'}`}>
            <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Your exam has been received and is being processed.
            </p>

            <div className="space-y-4 text-left mb-8">
              <div className={`flex items-center gap-3 text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <FaCheck className="text-green-600 text-2xl" />
                <span><strong>Status:</strong> Submitted for evaluation</span>
              </div>
              <div className={`flex items-center gap-3 text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <FaCheck className="text-green-600 text-2xl" />
                <span><strong>Processing Time:</strong> Maximum 24 hours</span>
              </div>
              <div className={`flex items-center gap-3 text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <FaCheck className="text-green-600 text-2xl" />
                <span><strong>Notification:</strong> Email will be sent</span>
              </div>
            </div>

            <div className={`border-l-4 p-6 rounded-lg text-left ${isDarkMode ? 'bg-gray-600 border-blue-400' : 'bg-blue-50 border-blue-600'}`}>
              <p className={`font-bold mb-3 text-lg ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>📧 What's Next?</p>
              <ul className={`space-y-2 text-base ${isDarkMode ? 'text-blue-100' : 'text-blue-800'}`}>
                <li>✓ AI-powered evaluation of your writing</li>
                <li>✓ Expert human review and feedback</li>
                <li>✓ Detailed band scores for each section</li>
                <li>✓ CEFR level assessment</li>
                <li>✓ Personalized improvement recommendations</li>
              </ul>
            </div>
          </div>

          <Link
            to="/dashboard"
            onClick={() => window.history.back()}
            className="w-full px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-xl hover:shadow-lg transition-all block"
          >
            ← Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  if (!mockData || !user) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-gray-900'}`}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <p className="text-white text-xl">Loading exam...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`} style={{ fontSize: `${fontSize}%` }}>
      {/* Exam Header */}
      <div className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white sticky top-0 z-50 shadow-2xl transition-colors ${isDarkMode ? 'from-blue-800 to-purple-800' : ''}`}>
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold">📝 Writing Exam</h1>
              <p className="text-blue-100 text-sm">
                {isFullMock ? 'Full Mock Exam - All Parts' : `Part ${part} - Timed Assessment`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Font Size Controls */}
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <button
                  onClick={() => setFontSize(Math.max(80, fontSize - 10))}
                  className="hover:bg-white/30 p-2 rounded transition"
                  title="Decrease font size"
                >
                  <FaMinus className="text-white" />
                </button>
                <span className="text-white font-semibold w-12 text-center">{fontSize}%</span>
                <button
                  onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                  className="hover:bg-white/30 p-2 rounded transition"
                  title="Increase font size"
                >
                  <FaPlus className="text-white" />
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <FaSun className="text-yellow-300" /> : <FaMoon className="text-purple-200" />}
              </button>

              {/* Timer */}
              <div className={`flex items-center gap-3 text-2xl font-bold px-8 py-3 rounded-lg transition ${timeLeft <= 300
                ? 'bg-red-500/30 text-red-200 animate-pulse'
                : 'bg-white/20 text-white'
                }`}>
                <FaClock />
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`h-1.5 transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${Math.max(0, 100 - (timeLeft / (isFullMock ? 36 : (part === 1 ? 12 : 15))))}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-full mx-auto w-full px-4 py-8 overflow-hidden" ref={containerRef}>
        <div className="flex gap-4 h-full flex-col lg:flex-row">
          {/* Left Panel - Tasks */}
          <div
            className={`overflow-y-auto transition-all duration-300`}
            style={{ flex: `0 0 ${window.innerWidth < 1024 ? '100%' : `${leftPanelWidth}%`}` }}
          >
            <div className="space-y-6 pr-4">
              {/* Part 1 */}
              {(isFullMock || part === 1) && (
                <div className={`rounded-2xl shadow-xl overflow-hidden transition-colors sticky top-0 z-20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
                    <h2 className="text-3xl font-bold mb-2">📋 PART 1</h2>
                    <p className="text-blue-100">Write two tasks.</p>
                  </div>

                  <div className="p-8">
                    {/* Scenario */}
                    <div className={`border-l-4 p-6 rounded-lg mb-8 transition-colors ${isDarkMode ? 'bg-gray-700 border-blue-600' : 'bg-blue-50 border-blue-600'}`}>
                      <h3 className={`font-bold mb-3 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>📌 Scenario Context:</h3>
                      <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        {mockData.task1.scenario}
                      </p>
                    </div>

                    {/* Task 1.1 */}
                    <div className="mb-10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Task 1.1 - Note</h3>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full transition-colors ${isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700'}`}>~50 words</span>
                      </div>
                      <p className={`mb-4 p-4 rounded-lg border-l-4 border-purple-500 transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                        {mockData.task1.task11}
                      </p>
                    </div>

                    {/* Task 1.2 */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Task 1.2 - Letter</h3>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full transition-colors ${isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700'}`}>120-150 words</span>
                      </div>
                      <p className={`mb-4 p-4 rounded-lg border-l-4 border-purple-500 transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                        {mockData.task1.task12}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Part 2 */}
              {(isFullMock || part === 2) && (
                <div className={`rounded-2xl shadow-xl overflow-hidden transition-colors sticky top-0 z-20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8">
                    <h2 className="text-3xl font-bold mb-2">✍️ PART 2</h2>
                    <p className="text-purple-100">Write a blog post.</p>
                  </div>

                  <div className="p-8">
                    <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Post Topic</h3>
                    <p className={`mb-4 p-4 rounded-lg border-l-4 border-purple-500 transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                      {mockData.task2.task2}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Divider - Draggable */}
          {window.innerWidth >= 1024 && (
            <div
              onMouseDown={() => setIsDragging(true)}
              className={`w-1.5 cursor-col-resize hover:w-2 transition-all ${isDarkMode ? 'bg-gray-600 hover:bg-blue-500' : 'bg-gray-400 hover:bg-blue-500'}`}
              title="Drag to resize"
            />
          )}

          {/* Right Panel - Writing Areas */}
          <div
            className={`overflow-y-auto transition-all duration-300`}
            style={{ flex: `0 0 ${window.innerWidth < 1024 ? '100%' : `${100 - leftPanelWidth}%`}` }}
          >
            <div className="space-y-6 pl-4">
              {/* Part 1 Writing */}
              {(isFullMock || part === 1) && (
                <div className={`rounded-2xl shadow-xl overflow-hidden transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                    <h2 className="text-2xl font-bold">✍️ PART 1 - Writing</h2>
                  </div>

                  <div className="p-6 space-y-8">
                    {/* Task 1.1 Writing Area */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Task 1.1</h3>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <strong>Words:</strong> {wordCount(answers.t11)}/50
                          </span>
                        </div>
                      </div>
                      <textarea
                        value={answers.t11}
                        onChange={(e) => handleAnswerChange('t11', e.target.value)}
                        onContextMenu={(e) => e.preventDefault()}
                        className={`w-full h-40 p-4 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none font-serif transition-colors ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
                        placeholder="Start typing your informal note here..."
                      />
                      <div className="mt-2 flex justify-end">
                        {wordCount(answers.t11) >= 45 && wordCount(answers.t11) <= 55 && (
                          <span className="text-sm text-green-600 font-semibold">✓ Within target</span>
                        )}
                      </div>
                    </div>

                    {/* Task 1.2 Writing Area */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Task 1.2</h3>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <strong>Words:</strong> {wordCount(answers.t12)}/150
                          </span>
                        </div>
                      </div>
                      <textarea
                        value={answers.t12}
                        onChange={(e) => handleAnswerChange('t12', e.target.value)}
                        onContextMenu={(e) => e.preventDefault()}
                        className={`w-full h-56 p-4 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none font-serif transition-colors ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
                        placeholder="Start typing your formal letter here..."
                      />
                      <div className="mt-2 flex justify-end">
                        {wordCount(answers.t12) >= 120 && wordCount(answers.t12) <= 150 && (
                          <span className="text-sm text-green-600 font-semibold">✓ Within target</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Part 2 Writing */}
              {(isFullMock || part === 2) && (
                <div className={`rounded-2xl shadow-xl overflow-hidden transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                    <h2 className="text-2xl font-bold">✍️ PART 2 - Writing</h2>
                  </div>

                  <div className="p-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Blog Post</h3>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <strong>Words:</strong> {wordCount(answers.t2)}/200
                          </span>
                        </div>
                      </div>
                      <textarea
                        value={answers.t2}
                        onChange={(e) => handleAnswerChange('t2', e.target.value)}
                        onContextMenu={(e) => e.preventDefault()}
                        className={`w-full h-64 p-4 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none font-serif transition-colors ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
                        placeholder="Start typing your blog post here..."
                      />
                      <div className="mt-2 flex justify-end">
                        {wordCount(answers.t2) >= 180 && wordCount(answers.t2) <= 200 && (
                          <span className="text-sm text-green-600 font-semibold">✓ Within target</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                ✅ Submit Exam
              </button>

              {/* Time Alert */}
              {timeLeft <= 300 && (
                <div className={`rounded-xl p-6 border-l-4 animate-pulse transition-colors ${isDarkMode ? 'bg-red-900/20 border-red-600' : 'bg-red-50 border-red-600'}`}>
                  <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                    <span>⚠️</span> Time Alert
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>
                    Less than 5 minutes remaining. Review your answers and submit!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Textarea Modal */}
      {expandedTask === 't11' && (
        <ExpandedTextarea
          taskId="t11"
          title="Task 1.1 - Informal Note"
          value={answers.t11}
          onClose={() => setExpandedTask(null)}
          onSave={(value) => handleAnswerChange('t11', value)}
        />
      )}
      {expandedTask === 't12' && (
        <ExpandedTextarea
          taskId="t12"
          title="Task 1.2 - Formal Letter"
          value={answers.t12}
          onClose={() => setExpandedTask(null)}
          onSave={(value) => handleAnswerChange('t12', value)}
        />
      )}
      {expandedTask === 't2' && (
        <ExpandedTextarea
          taskId="t2"
          title="Task 2 - Blog Post"
          value={answers.t2}
          onClose={() => setExpandedTask(null)}
          onSave={(value) => handleAnswerChange('t2', value)}
        />
      )}

      {/* Prevent selection outside textareas */}
      <style>{`
        body, html {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        textarea {
          user-select: text;
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
        }
      `}</style>
    </div>
  )
}