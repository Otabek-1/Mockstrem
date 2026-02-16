import React, { useState, useEffect, useRef } from 'react'
import { FaClock, FaCheck, FaPlus, FaMinus, FaMoon, FaSun } from 'react-icons/fa'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api'
import { evaluateWritingWithGemini } from '../../services/geminiService'

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
  const [mobileSplit, setMobileSplit] = useState(52)
  const [isMobileDragging, setIsMobileDragging] = useState(false)
  const [activeTask, setActiveTask] = useState(null)
  const [expandedTask, setExpandedTask] = useState(null)
  const [user, setUser] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState('')
  const [aiEvaluating, setAiEvaluating] = useState(false)
  const [aiEvalError, setAiEvalError] = useState('')
  const [aiEvaluation, setAiEvaluation] = useState(null)
  const containerRef = useRef(null)
  const mobileContainerRef = useRef(null)
  const nav = useNavigate()
  const { id } = useParams()

  const parsePremiumExpiry = (rawPremiumDuration) => {
    if (rawPremiumDuration === null || rawPremiumDuration === undefined || rawPremiumDuration === '') {
      return null
    }

    let dateValue = null
    if (rawPremiumDuration instanceof Date) {
      dateValue = rawPremiumDuration
    } else if (typeof rawPremiumDuration === 'number') {
      const ms = rawPremiumDuration < 1000000000000 ? rawPremiumDuration * 1000 : rawPremiumDuration
      dateValue = new Date(ms)
    } else if (typeof rawPremiumDuration === 'string') {
      const trimmed = rawPremiumDuration.trim()
      if (!trimmed) return null
      if (/^\d+$/.test(trimmed)) {
        const num = Number(trimmed)
        const ms = num < 1000000000000 ? num * 1000 : num
        dateValue = new Date(ms)
      } else {
        dateValue = new Date(trimmed)
      }
    }

    if (!dateValue || Number.isNaN(dateValue.getTime())) return null
    return dateValue
  }

  const premiumExpiry = parsePremiumExpiry(user?.premium_duration)
  const isPremiumActive = !!premiumExpiry && premiumExpiry.getTime() > Date.now()

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
    
    if (partParam === 'all' && isPremiumActive) {
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
  }, [user, id, nav, isPremiumActive])

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

  // Drag to resize panels on mobile (vertical)
  useEffect(() => {
    const handleMove = (clientY) => {
      const container = mobileContainerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const newHeight = ((clientY - rect.top) / rect.height) * 100

      if (newHeight > 25 && newHeight < 75) {
        setMobileSplit(newHeight)
      }
    }

    const handleMouseMove = (e) => {
      if (!isMobileDragging) return
      handleMove(e.clientY)
    }

    const handleTouchMove = (e) => {
      if (!isMobileDragging || e.touches.length === 0) return
      e.preventDefault()
      handleMove(e.touches[0].clientY)
    }

    const handleEnd = () => {
      setIsMobileDragging(false)
    }

    if (isMobileDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleEnd)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [isMobileDragging])

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

  const handleSubmit = async () => {
    setSubmitted(true)
    setIsSubmitting(true)
    setSubmissionError('')
    setAiEvaluating(false)
    setAiEvalError('')
    setAiEvaluation(null)

    try {
      await api.post(`/mock/writing/submit?token=${localStorage.getItem("access_token")}`, {
        mock_id: id,
        task1: `${answers.t11} ---TASK--- ${answers.t12}`,
        task2: answers.t2
      })

      setIsSubmitting(false)

      if (isPremiumActive && isFullMock) {
        setAiEvaluating(true)
        try {
          const result = await evaluateWritingWithGemini({
            contextT1: mockData?.task1?.context || mockData?.task1?.scenario || 'N/A',
            scenarioT1: mockData?.task1?.scenario || mockData?.task1?.context || 'N/A',
            promptT11: mockData?.task1?.task11 || 'N/A',
            promptT12: mockData?.task1?.task12 || 'N/A',
            promptT2: mockData?.task2?.task2 || 'N/A',
            t11: answers.t11,
            t12: answers.t12,
            t2: answers.t2
          })
          setAiEvaluation(result)
        } catch (aiErr) {
          setAiEvalError(aiErr?.message || 'Failed to generate AI evaluation')
        } finally {
          setAiEvaluating(false)
        }
      }
    } catch (err) {
      setIsSubmitting(false)
      setSubmissionError(err?.response?.data?.detail || err?.message || 'Submission failed')
    }
  }

  useEffect(() => {
    if (activeTask) return
    if (part === 2) {
      setActiveTask('t2')
      return
    }
    if (part === 1 || isFullMock) {
      setActiveTask('t11')
    }
  }, [part, isFullMock, activeTask])

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

  const isMobile = window.innerWidth < 1024

  const availableTasks = () => {
    if (isFullMock) return [
      { id: 't11', label: '1.1' },
      { id: 't12', label: '1.2' },
      { id: 't2', label: '2' },
    ]
    if (part === 1) return [
      { id: 't11', label: '1.1' },
      { id: 't12', label: '1.2' },
    ]
    return [{ id: 't2', label: '2' }]
  }

  const renderMobileTaskContent = () => {
    if (activeTask === 't2') {
      return (
        <div className={`rounded-2xl shadow-xl overflow-hidden transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
            <h2 className="text-2xl font-bold">âœï¸ PART 2</h2>
            <p className="text-purple-100">Write a blog post.</p>
          </div>
          <div className="p-6">
            <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Post Topic</h3>
            <p className={`p-4 rounded-lg border-l-4 border-purple-500 transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
              {mockData.task2.task2}
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className={`rounded-2xl shadow-xl overflow-hidden transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <h2 className="text-2xl font-bold">ğŸ“‹ PART 1</h2>
          <p className="text-blue-100">Write two tasks.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className={`border-l-4 p-4 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 border-blue-600' : 'bg-blue-50 border-blue-600'}`}>
            <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>ğŸ“Œ Scenario Context:</h3>
            <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
              {mockData.task1.scenario}
            </p>
          </div>

          {activeTask === 't11' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Task 1.1 - Note</h3>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700'}`}>~50 words</span>
              </div>
              <p className={`p-4 rounded-lg border-l-4 border-purple-500 transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                {mockData.task1.task11}
              </p>
            </div>
          )}

          {activeTask === 't12' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Task 1.2 - Letter</h3>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700'}`}>120-150 words</span>
              </div>
              <p className={`p-4 rounded-lg border-l-4 border-purple-500 transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                {mockData.task1.task12}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderMobileWritingArea = () => {
    if (activeTask === 't2') {
      return (
        <div className={`rounded-2xl shadow-xl overflow-hidden transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-5">
            <h2 className="text-xl font-bold">âœï¸ PART 2 - Writing</h2>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Blog Post</h3>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>Words:</strong> {wordCount(answers.t2)}/200
              </span>
            </div>
            <textarea
              value={answers.t2}
              onChange={(e) => handleAnswerChange('t2', e.target.value)}
              onContextMenu={(e) => e.preventDefault()}
              className={`w-full h-48 p-4 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none font-serif transition-colors ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
              placeholder="Start typing your blog post here..."
            />
            <div className="mt-2 flex justify-end">
              {wordCount(answers.t2) >= 180 && wordCount(answers.t2) <= 200 && (
                <span className="text-sm text-green-600 font-semibold">âœ“ Within target</span>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={`rounded-2xl shadow-xl overflow-hidden transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5">
          <h2 className="text-xl font-bold">âœï¸ PART 1 - Writing</h2>
        </div>
        <div className="p-5">
          {activeTask === 't11' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Task 1.1</h3>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Words:</strong> {wordCount(answers.t11)}/50
                </span>
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
                  <span className="text-sm text-green-600 font-semibold">âœ“ Within target</span>
                )}
              </div>
            </div>
          )}

          {activeTask === 't12' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Task 1.2</h3>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Words:</strong> {wordCount(answers.t12)}/150
                </span>
              </div>
              <textarea
                value={answers.t12}
                onChange={(e) => handleAnswerChange('t12', e.target.value)}
                onContextMenu={(e) => e.preventDefault()}
                className={`w-full h-48 p-4 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none font-serif transition-colors ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'}`}
                placeholder="Start typing your formal letter here..."
              />
              <div className="mt-2 flex justify-end">
                {wordCount(answers.t12) >= 120 && wordCount(answers.t12) <= 150 && (
                  <span className="text-sm text-green-600 font-semibold">âœ“ Within target</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 to-blue-50'}`}>
        <div className={`rounded-2xl p-12 shadow-2xl max-w-3xl w-full text-center border-4 border-green-500 transition-colors ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <div className="text-7xl mb-6 animate-bounce">?</div>
          <h1 className="text-4xl font-bold text-green-600 mb-4">Exam Submitted Successfully!</h1>

          <div className={`border-2 border-green-300 rounded-lg p-8 mb-8 transition-colors ${isDarkMode ? 'bg-gray-700 border-green-600' : 'bg-green-50'}`}>
            {isSubmitting && (
              <div className="text-center py-6">
                <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Submitting your exam...</p>
              </div>
            )}

            {!isSubmitting && submissionError && (
              <div className="text-center py-4">
                <p className="text-red-600 font-semibold mb-3">Submission failed</p>
                <p className={`${isDarkMode ? 'text-red-300' : 'text-red-700'} text-sm mb-4`}>{submissionError}</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold"
                >
                  Back to Exam
                </button>
              </div>
            )}

            {!isSubmitting && !submissionError && (
              <>
                <div className="space-y-4 text-left mb-6">
                  <div className={`flex items-center gap-3 text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    <FaCheck className="text-green-600 text-2xl" />
                    <span><strong>Status:</strong> Submitted successfully</span>
                  </div>
                  {isPremiumActive && isFullMock && (
                    <div className={`flex items-center gap-3 text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      <FaCheck className="text-green-600 text-2xl" />
                      <span><strong>AI:</strong> Evaluation is processing</span>
                    </div>
                  )}
                </div>

                {isPremiumActive && isFullMock && aiEvaluating && (
                  <div className={`border-l-4 p-6 rounded-lg text-left mb-4 ${isDarkMode ? 'bg-gray-600 border-blue-400' : 'bg-blue-50 border-blue-600'}`}>
                    <p className={`font-bold mb-3 text-lg ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>AI is analyzing your writing...</p>
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {isPremiumActive && isFullMock && aiEvalError && (
                  <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded text-left mb-4">
                    <p className="font-semibold text-red-700">AI evaluation failed</p>
                    <p className="text-sm text-red-600">{aiEvalError}</p>
                  </div>
                )}

                {isPremiumActive && isFullMock && aiEvaluation && (
                  <div className={`border-l-4 p-6 rounded-lg text-left ${isDarkMode ? 'bg-gray-600 border-blue-400' : 'bg-blue-50 border-blue-600'}`}>
                    <p className={`font-bold mb-3 text-lg ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>AI Evaluation Result</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div className="bg-white rounded p-3 border"><p className="text-xs text-gray-500">Raw Score</p><p className="text-xl font-bold text-gray-900">{aiEvaluation.raw_score ?? '-'}</p></div>
                      <div className="bg-white rounded p-3 border"><p className="text-xs text-gray-500">Certificate</p><p className="text-xl font-bold text-gray-900">{aiEvaluation.certificate_score ?? '-'}</p></div>
                      <div className="bg-white rounded p-3 border"><p className="text-xs text-gray-500">CEFR</p><p className="text-xl font-bold text-gray-900">{aiEvaluation.cefr_level ?? '-'}</p></div>
                    </div>
                    <div className="bg-white rounded p-4 border">
                      <p className="text-sm text-gray-500 mb-1">Overall feedback</p>
                      <p className="text-sm text-gray-800">{aiEvaluation.overall_feedback || 'No feedback returned.'}</p>
                    </div>
                  </div>
                )}

                {(!isPremiumActive || !isFullMock) && (
                  <div className={`border-l-4 p-6 rounded-lg text-left ${isDarkMode ? 'bg-gray-600 border-blue-400' : 'bg-blue-50 border-blue-600'}`}>
                    <p className={`font-bold mb-3 text-lg ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>What's Next?</p>
                    <p className={`text-base ${isDarkMode ? 'text-blue-100' : 'text-blue-800'}`}>
                      AI evaluation is available for premium full mock submissions.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <Link
            to="/dashboard"
            onClick={() => window.history.back()}
            className="w-full px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-xl hover:shadow-lg transition-all block"
          >
            � Back to Courses
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
      <div className={`flex-1 max-w-full mx-auto w-full px-4 py-8 overflow-hidden ${isMobile ? 'pb-28' : ''}`} ref={containerRef}>
        {isMobile ? (
          <div className="flex flex-col gap-4 h-full" ref={mobileContainerRef}>
            {/* Mobile Task Switcher */}
            <div className="flex items-center gap-3">
              {availableTasks().map((task) => (
                <button
                  key={task.id}
                  onClick={() => setActiveTask(task.id)}
                  className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${activeTask === task.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-200 border-gray-700'
                      : 'bg-white text-gray-700 border-gray-200'
                    }`}
                >
                  {task.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 flex-1 min-h-[60vh]">
              <div
                className="overflow-y-auto"
                style={{ flex: `0 0 ${mobileSplit}%` }}
              >
                {renderMobileTaskContent()}
              </div>

              <div
                onMouseDown={() => setIsMobileDragging(true)}
                onTouchStart={() => setIsMobileDragging(true)}
                className={`h-2 rounded-full cursor-row-resize transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
                title="Drag to resize"
              />

              <div
                className="overflow-y-auto"
                style={{ flex: `0 0 ${100 - mobileSplit}%` }}
              >
                {renderMobileWritingArea()}
              </div>
            </div>

            {timeLeft <= 300 && (
              <div className={`rounded-xl p-4 border-l-4 animate-pulse transition-colors ${isDarkMode ? 'bg-red-900/20 border-red-600' : 'bg-red-50 border-red-600'}`}>
                <h3 className={`font-bold mb-1 flex items-center gap-2 ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                  <span>Time Alert</span>
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>
                  Less than 5 minutes remaining. Review your answers and submit!
                </p>
              </div>
            )}
          </div>
        ) : (
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
        )}
      </div>

      {isMobile && (
        <div className={`fixed bottom-0 left-0 right-0 border-t p-4 shadow-2xl z-40 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-300"
          >
            Submit Exam
          </button>
        </div>
      )}

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
