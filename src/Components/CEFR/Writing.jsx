import React, { useState, useEffect } from 'react'
import { FaClock, FaCheck } from 'react-icons/fa'

export default function WritingExam() {
  const [examStarted, setExamStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [answers, setAnswers] = useState({ t11: '', t12: '', t2: '' })
  const [submitted, setSubmitted] = useState(false)
  const [part, setPart] = useState(null)
  const [isFullMock, setIsFullMock] = useState(false)

  // Get query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const partParam = params.get('part')
    
    if (partParam === 'all') {
      setIsFullMock(true)
      setPart('all')
      setTimeLeft(3600) // 60 minutes
    } else if (partParam === '1') {
      setPart(1)
      setTimeLeft(1200) // 20 minutes
    } else if (partParam === '2') {
      setPart(2)
      setTimeLeft(1500) // 25 minutes
    }
    
    setExamStarted(true)
  }, [])

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
  }, [examStarted, submitted])

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
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-12 shadow-2xl max-w-2xl text-center border-4 border-green-500">
          <div className="text-7xl mb-6 animate-bounce">✅</div>
          <h1 className="text-4xl font-bold text-green-600 mb-4">Exam Submitted Successfully!</h1>
          
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-8 mb-8">
            <p className="text-gray-700 text-lg mb-6">
              Your exam has been received and is being processed.
            </p>
            
            <div className="space-y-4 text-left mb-8">
              <div className="flex items-center gap-3 text-gray-700 text-lg">
                <FaCheck className="text-green-600 text-2xl" />
                <span><strong>Status:</strong> Submitted for evaluation</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 text-lg">
                <FaCheck className="text-green-600 text-2xl" />
                <span><strong>Processing Time:</strong> Maximum 24 hours</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 text-lg">
                <FaCheck className="text-green-600 text-2xl" />
                <span><strong>Notification:</strong> Email will be sent</span>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg text-left">
              <p className="text-blue-900 font-bold mb-3 text-lg">📧 What's Next?</p>
              <ul className="space-y-2 text-blue-800 text-base">
                <li>✓ AI-powered evaluation of your writing</li>
                <li>✓ Expert human review and feedback</li>
                <li>✓ Detailed band scores for each section</li>
                <li>✓ CEFR level assessment</li>
                <li>✓ Personalized improvement recommendations</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => window.history.back()}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-xl hover:shadow-lg transition-all"
          >
            ← Back to Courses
          </button>
        </div>
      </div>
    )
  }

  if (!part) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <p className="text-white text-xl">Loading exam...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Exam Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">📝 Writing Exam</h1>
            <p className="text-blue-100 text-sm">
              {isFullMock ? 'Full Mock Exam - All Parts' : `Part ${part} - Timed Assessment`}
            </p>
          </div>
          
          <div className={`flex items-center gap-3 text-2xl font-bold px-8 py-3 rounded-lg ${
            timeLeft <= 300 
              ? 'bg-red-500/30 text-red-200 animate-pulse' 
              : 'bg-white/20 text-white'
          }`}>
            <FaClock />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-gray-700">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${Math.max(0, 100 - (timeLeft / (isFullMock ? 36 : 10)))}%` }}
        />
      </div>

      {/* Exam Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Part 1 */}
            {(isFullMock || part === 1) && (
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
                  <h2 className="text-3xl font-bold mb-2">📋 PART 1: Correspondence</h2>
                  <p className="text-blue-100">Write two pieces of correspondence based on the scenario</p>
                </div>

                <div className="p-8">
                  {/* Scenario */}
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
                    <h3 className="font-bold text-blue-900 mb-3">📌 Scenario Context:</h3>
                    <p className="text-gray-800 leading-relaxed">
                      You are a student at a language school. You received this message from the school magazine editor: "Dear Student, We are starting a new section in the school magazine called Student Voices. We'd like to include more opinions and ideas. What topics would you like to read about? Would you be interested in writing something? What would you write about?"
                    </p>
                  </div>

                  {/* Task 1.1 */}
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-800">Task 1.1 - Informal Note</h3>
                      <span className="text-sm font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full">~50 words</span>
                    </div>
                    <p className="text-gray-700 mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                      Write an informal note to your friend about the magazine and share your thoughts on what topics they should include.
                    </p>
                    <textarea
                      value={answers.t11}
                      onChange={(e) => handleAnswerChange('t11', e.target.value)}
                      className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none font-serif text-base"
                      placeholder="Start typing your informal note here..."
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        <strong>Word count:</strong> {wordCount(answers.t11)}
                      </span>
                      {wordCount(answers.t11) >= 45 && wordCount(answers.t11) <= 55 && (
                        <span className="text-sm text-green-600 font-semibold">✓ Within target</span>
                      )}
                    </div>
                  </div>

                  {/* Task 1.2 */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-800">Task 1.2 - Formal Letter</h3>
                      <span className="text-sm font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full">120-150 words</span>
                    </div>
                    <p className="text-gray-700 mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                      Write a formal letter to the magazine manager with your suggestions and ideas for the new Student Voices section.
                    </p>
                    <textarea
                      value={answers.t12}
                      onChange={(e) => handleAnswerChange('t12', e.target.value)}
                      className="w-full h-56 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none font-serif text-base"
                      placeholder="Start typing your formal letter here..."
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        <strong>Word count:</strong> {wordCount(answers.t12)}
                      </span>
                      {wordCount(answers.t12) >= 120 && wordCount(answers.t12) <= 150 && (
                        <span className="text-sm text-green-600 font-semibold">✓ Within target</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Part 2 */}
            {(isFullMock || part === 2) && (
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8">
                  <h2 className="text-3xl font-bold mb-2">✍️ PART 2: Blog Post</h2>
                  <p className="text-purple-100">Write a blog post expressing your opinion with supporting examples</p>
                </div>

                <div className="p-8">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-800">Blog Post</h3>
                      <span className="text-sm font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full">180-200 words</span>
                    </div>
                    <p className="text-gray-700 mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                      Write a blog post about the advantages and disadvantages of working from home. Include your personal opinion and provide specific examples to support your ideas.
                    </p>
                    <textarea
                      value={answers.t2}
                      onChange={(e) => handleAnswerChange('t2', e.target.value)}
                      className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none font-serif text-base"
                      placeholder="Start typing your blog post here..."
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        <strong>Word count:</strong> {wordCount(answers.t2)}
                      </span>
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
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sticky top-28 space-y-6">
              {/* Writing Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-blue-600">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                  <span>💡</span> Writing Tips
                </h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Plan your ideas before writing</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Check grammar and spelling</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Meet word count targets</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Use varied vocabulary</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Organize ideas clearly</span>
                  </li>
                </ul>
              </div>

              {/* Time Alert */}
              {timeLeft <= 300 && (
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-l-4 border-red-600 animate-pulse">
                  <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                    <span>⚠️</span> Time Alert
                  </h3>
                  <p className="text-sm text-red-700">
                    Less than 5 minutes remaining. Review your answers and submit!
                  </p>
                </div>
              )}

              {/* Auto-Save Status */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-l-4 border-green-600">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>💾</span> Auto-Save Status
                </h3>
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  All answers are being saved
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}