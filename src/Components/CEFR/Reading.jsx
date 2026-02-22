import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Send, BookOpen, Clock, ArrowLeft, Download } from 'lucide-react'
import { useParams } from 'react-router-dom'

const API_BASE_URL = 'https://english-server-p7y6.onrender.com'

export default function ReadingExamInterface() {
    const { id } = useParams();
    const [currentPart, setCurrentPart] = useState(1)
    const [fontSize, setFontSize] = useState(16)
    const [isDark, setIsDark] = useState(false)
    const [answers, setAnswers] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [results, setResults] = useState(null)
    const [mockData, setMockData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [timeRemaining, setTimeRemaining] = useState(60 * 60)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [showReviewModal, setShowReviewModal] = useState(false)

    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token')
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const response = await fetch(`${API_BASE_URL}/mock/reading/mock/${id}`)
                const data = await response.json()
                setMockData(data.mock)
                console.log(response);

                setAnswers({
                    part1: Array(6).fill(''),
                    part2: Array(10).fill(''),
                    part3: Array(6).fill(''),
                    part4MC: Array(4).fill(''),
                    part4TF: Array(5).fill(''),
                    part5Mini: Array(5).fill(''),
                    part5MC: Array(2).fill('')
                })

                setError(null)
            } catch (err) {
                console.error('Error fetching data:', err)
                setError('Failed to load reading task')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    useEffect(() => {
        if (submitted) return
        const interval = setInterval(() => {
            setTimeRemaining(prev => prev - 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [submitted])

    const handleAnswerChange = (part, index, value) => {
        setAnswers(prev => ({
            ...prev,
            [part]: prev[part].map((ans, i) => i === index ? value : ans)
        }))
    }

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/mock/reading/submit`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    question_id: id,
                    part1: answers.part1,
                    part2: answers.part2,
                    part3: answers.part3,
                    part4MC: answers.part4MC,
                    part4TF: answers.part4TF,
                    part5Mini: answers.part5Mini,
                    part5MC: answers.part5MC
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.detail || `Submit failed (${response.status})`)
            }

            const result = await response.json()
            setResults(result)
            setSubmitted(true)
            setShowConfirmModal(false)
        } catch (err) {
            console.error('Error submitting:', err)
            alert('Error submitting answers')
        }
    }

    const formatTime = (seconds) => {
        const isNegative = seconds < 0
        const absSeconds = Math.abs(seconds)
        const mins = Math.floor(absSeconds / 60)
        const secs = absSeconds % 60
        return `${isNegative ? '-' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getTimerColor = () => {
        if (timeRemaining < 0) return 'bg-red-600 animate-pulse'
        if (timeRemaining <= 300) return 'bg-red-600'
        if (timeRemaining <= 600) return 'bg-yellow-600'
        return 'bg-teal-600'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading reading task...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
                <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
                    <p className="text-red-600 font-bold mb-4 text-xl">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all transform hover:scale-105">
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (!mockData) {
        return <div className="flex items-center justify-center min-h-screen text-gray-600">No reading data found</div>
    }

    const bgClass = isDark ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-teal-50 to-emerald-50 text-gray-900'
    const cardBg = isDark ? 'bg-gray-800' : 'bg-white'
    const borderClass = isDark ? 'border-gray-700' : 'border-gray-200'

    const renderPart = () => {
        switch (currentPart) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className={`${cardBg} p-6 rounded-2xl shadow-lg border-l-4 border-teal-600`}>
                            <h2 className="text-2xl font-bold mb-2 text-teal-600">Part 1: {mockData.part1.task}</h2>
                        </div>
                        <div className={`${cardBg} p-8 rounded-2xl shadow-lg border ${borderClass}`}>
                            <div style={{ fontSize: `${fontSize}px`, lineHeight: '2' }} className="select-text">
                                {(() => {
                                    const textParts = mockData.part1.text.split(/(\(\d+\))/g)
                                    let gapIndex = 0
                                    return (
                                        <span>
                                            {textParts.map((segment, idx) => {
                                                const gapMatch = segment.match(/\((\d+)\)/)
                                                if (gapMatch) {
                                                    const currentGapIndex = gapIndex
                                                    gapIndex++
                                                    return (
                                                        <span key={idx} className="inline-flex items-center gap-2 mx-1">
                                                            <span className="bg-teal-600 text-white px-3 py-1 rounded-md text-sm font-bold">{currentGapIndex + 1}</span>
                                                            <input
                                                                type="text"
                                                                value={answers.part1[currentGapIndex] || ''}
                                                                onChange={(e) => handleAnswerChange('part1', currentGapIndex, e.target.value)}
                                                                disabled={submitted}
                                                                style={{ fontSize: `${fontSize}px` }}
                                                                className={`w-32 px-3 py-2 border-2 rounded-xl text-center font-semibold transition-all ${submitted
                                                                    ? results?.part1 >= currentGapIndex + 1
                                                                        ? 'border-green-500 bg-green-100'
                                                                        : 'border-red-500 bg-red-100'
                                                                    : 'border-teal-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none'
                                                                    }`}
                                                            />
                                                        </span>
                                                    )
                                                }
                                                return <span key={idx}>{segment}</span>
                                            })}
                                        </span>
                                    )
                                })()}
                            </div>
                        </div>
                        {submitted && (
                            <div className="p-6 bg-blue-100 dark:bg-blue-900/30 rounded-2xl shadow-lg">
                                <p className="font-bold text-lg">Part 1: {results.part1}/6 Correct</p>
                            </div>
                        )}
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-6">
                        <div className={`${cardBg} p-6 rounded-2xl shadow-lg border-l-4 border-teal-600`}>
                            <h2 className="text-2xl font-bold mb-2 text-teal-600">Part 2: {mockData.part2.task}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Match each statement with a text (1-7)</p>
                        </div>

                        <div className="mb-6 p-6 bg-teal-50 dark:bg-teal-900/20 rounded-2xl shadow-lg">
                            <h3 className="font-bold mb-4 text-lg text-teal-700">Texts:</h3>
                            {mockData.part2.texts.map((text, idx) => (
                                <div key={idx} className="mb-4 p-4 bg-white dark:bg-gray-700 rounded-xl shadow">
                                    <p className="font-bold text-teal-600 mb-2">Text {idx + 1}:</p>
                                    <p style={{ fontSize: `${fontSize}px` }} className="text-sm leading-relaxed">{text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold mb-3 text-lg">Statements:</h3>
                            {mockData.part2.statements.map((statement, idx) => (
                                <div key={idx} className={`p-5 rounded-xl border-2 shadow-md ${cardBg} ${borderClass} hover:border-teal-400 transition-all`}>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-teal-600 mb-2">Statement {idx + 1}</p>
                                            <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed">{statement}</p>
                                        </div>
                                        <input
                                            type="text"
                                            value={answers.part2[idx] || ''}
                                            onChange={(e) => handleAnswerChange('part2', idx, e.target.value)}
                                            disabled={submitted}
                                            placeholder="Text #"
                                            maxLength="1"
                                            className={`w-16 p-3 border-2 rounded-xl text-center font-bold text-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {submitted && (
                            <div className="p-6 bg-blue-100 dark:bg-blue-900/30 rounded-2xl shadow-lg">
                                <p className="font-bold text-lg">Part 2: {results.part2}/10 Correct</p>
                            </div>
                        )}
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-6">
                        <div className={`${cardBg} p-6 rounded-2xl shadow-lg border-l-4 border-teal-600`}>
                            <h2 className="text-2xl font-bold mb-2 text-teal-600">Part 3: {mockData.part3.task}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Match each paragraph with a heading (1-8)</p>
                        </div>

                        <div className="mb-6 p-6 bg-teal-50 dark:bg-teal-900/20 rounded-2xl shadow-lg">
                            <h3 className="font-bold mb-4 text-lg text-teal-700">Available Headings:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {mockData.part3.headings.map((heading, idx) => (
                                    <div key={idx} className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow text-sm">
                                        <span className="font-bold text-teal-600">{idx + 1}.</span> {heading}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {mockData.part3.paragraphs.map((para, idx) => (
                                <div key={idx} className={`p-5 rounded-xl border-2 shadow-md ${cardBg} ${borderClass} hover:border-teal-400 transition-all`}>
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-teal-600 mb-3">Paragraph {idx + 1}:</p>
                                            <p style={{ fontSize: `${fontSize}px` }} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl leading-relaxed">{para}</p>
                                        </div>
                                        <input
                                            type="text"
                                            value={answers.part3[idx] || ''}
                                            onChange={(e) => handleAnswerChange('part3', idx, e.target.value)}
                                            disabled={submitted}
                                            placeholder="Head #"
                                            maxLength="1"
                                            className={`w-16 p-3 border-2 rounded-xl text-center font-bold text-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {submitted && (
                            <div className="p-6 bg-blue-100 dark:bg-blue-900/30 rounded-2xl shadow-lg">
                                <p className="font-bold text-lg">Part 3: {results.part3}/6 Correct</p>
                            </div>
                        )}
                    </div>
                )

            case 4:
                return (
                    <div className="space-y-8">
                        <div className={`${cardBg} p-6 rounded-2xl shadow-lg border-l-4 border-teal-600`}>
                            <h2 className="text-2xl font-bold mb-2 text-teal-600">Part 4: {mockData.part4.task}</h2>
                        </div>

                        <div className={`${cardBg} p-8 rounded-2xl shadow-lg border ${borderClass}`}>
                            <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed mb-4">{mockData.part4.text}</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold border-b-2 border-teal-600 pb-3 mb-6">Multiple Choice (4 questions)</h3>
                            {mockData.part4.multipleChoice.map((q, idx) => (
                                <div key={idx} className="mb-6 p-6 bg-teal-50 dark:bg-teal-900/20 rounded-2xl shadow-md">
                                    <p style={{ fontSize: `${fontSize}px` }} className="font-semibold mb-4">{idx + 1}. {q.question}</p>
                                    <div className="space-y-3 ml-2">
                                        {q.options.map((opt, oIdx) => (
                                            <label key={oIdx} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all">
                                                <input
                                                    type="radio"
                                                    name={`part4-mc-${idx}`}
                                                    value={opt}
                                                    checked={answers.part4MC[idx] === opt}
                                                    onChange={(e) => handleAnswerChange('part4MC', idx, e.target.value)}
                                                    disabled={submitted}
                                                    className="w-5 h-5 text-teal-600"
                                                />
                                                <span style={{ fontSize: `${fontSize}px` }}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <h3 className="text-xl font-bold border-b-2 border-teal-600 pb-3 mb-6">True / False / Not Given (5 statements)</h3>
                            {mockData.part4.trueFalse.map((tf, idx) => (
                                <div key={idx} className="mb-6 p-6 bg-teal-50 dark:bg-teal-900/20 rounded-2xl shadow-md">
                                    <p style={{ fontSize: `${fontSize}px` }} className="font-semibold mb-4">{idx + 1}. {tf.statement}</p>
                                    <div className="flex gap-4 ml-2 flex-wrap">
                                        {['True', 'False', 'Not Given'].map(opt => (
                                            <label key={opt} className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl bg-white dark:bg-gray-700 hover:bg-teal-100 transition-all">
                                                <input
                                                    type="radio"
                                                    name={`part4-tf-${idx}`}
                                                    value={opt}
                                                    checked={answers.part4TF[idx] === opt}
                                                    onChange={(e) => handleAnswerChange('part4TF', idx, e.target.value)}
                                                    disabled={submitted}
                                                    className="w-5 h-5 text-teal-600"
                                                />
                                                <span style={{ fontSize: `${fontSize}px` }}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {submitted && (
                            <div className="p-6 bg-blue-100 dark:bg-blue-900/30 rounded-2xl shadow-lg">
                                <p className="font-bold text-lg">Part 4 MC: {results.part4MC}/4 Correct</p>
                                <p className="font-bold text-lg">Part 4 TF: {results.part4TF}/5 Correct</p>
                            </div>
                        )}
                    </div>
                )

            case 5:
                return (
                    <div className="space-y-8">
                        <div className={`${cardBg} p-6 rounded-2xl shadow-lg border-l-4 border-teal-600`}>
                            <h2 className="text-2xl font-bold mb-2 text-teal-600">Part 5: {mockData.part5.task}</h2>
                        </div>

                        <div className={`${cardBg} p-8 rounded-2xl shadow-lg border ${borderClass}`}>
                            <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed">{mockData.part5.mainText}</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold border-b-2 border-teal-600 pb-3 mb-6">Fill in the gaps (5)</h3>
                            <div className={`${cardBg} p-8 rounded-2xl shadow-lg border ${borderClass}`}>
                                <div style={{ fontSize: `${fontSize}px`, lineHeight: '2' }}>
                                    {(() => {
                                        const textParts = mockData.part5.miniText.split(/(\(\d+\))/g)
                                        let gapIndex = 0
                                        return (
                                            <span>
                                                {textParts.map((segment, idx) => {
                                                    const gapMatch = segment.match(/\((\d+)\)/)
                                                    if (gapMatch) {
                                                        const currentGapIndex = gapIndex
                                                        gapIndex++
                                                        return (
                                                            <span key={idx} className="inline-flex items-center gap-2 mx-1">
                                                                <span className="bg-teal-600 text-white px-3 py-1 rounded-md text-sm font-bold">{currentGapIndex + 1}</span>
                                                                <input
                                                                    type="text"
                                                                    value={answers.part5Mini[currentGapIndex] || ''}
                                                                    onChange={(e) => handleAnswerChange('part5Mini', currentGapIndex, e.target.value)}
                                                                    disabled={submitted}
                                                                    style={{ fontSize: `${fontSize}px` }}
                                                                    className={`w-32 px-3 py-2 border-2 rounded-xl text-center font-semibold transition-all ${submitted
                                                                        ? 'border-green-500 bg-green-100'
                                                                        : 'border-teal-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-200 outline-none'
                                                                        }`}
                                                                />
                                                            </span>
                                                        )
                                                    }
                                                    return <span key={idx}>{segment}</span>
                                                })}
                                            </span>
                                        )
                                    })()}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold border-b-2 border-teal-600 pb-3 mb-6">Multiple Choice (2 questions)</h3>
                            {mockData.part5.multipleChoice.map((q, idx) => (
                                <div key={idx} className="mb-6 p-6 bg-teal-50 dark:bg-teal-900/20 rounded-2xl shadow-md">
                                    <p style={{ fontSize: `${fontSize}px` }} className="font-semibold mb-4">{idx + 1}. {q.question}</p>
                                    <div className="space-y-3 ml-2">
                                        {q.options.map((opt, oIdx) => (
                                            <label key={oIdx} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all">
                                                <input
                                                    type="radio"
                                                    name={`part5-mc-${idx}`}
                                                    value={opt}
                                                    checked={answers.part5MC[idx] === opt}
                                                    onChange={(e) => handleAnswerChange('part5MC', idx, e.target.value)}
                                                    disabled={submitted}
                                                    className="w-5 h-5 text-teal-600"
                                                />
                                                <span style={{ fontSize: `${fontSize}px` }}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {submitted && (
                            <div className="p-6 bg-blue-100 dark:bg-blue-900/30 rounded-2xl shadow-lg">
                                <p className="font-bold text-lg">Part 5 Mini: {results.part5Mini}/5 Correct</p>
                                <p className="font-bold text-lg">Part 5 MC: {results.part5MC}/2 Correct</p>
                            </div>
                        )}
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className={`min-h-screen ${bgClass} pt-10`}>
            {/* Header */}
            <div className={`sticky top-0 z-40 ${cardBg} shadow-lg border-b ${borderClass}`}>
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-7 h-7 text-teal-600" />
                        <h1 className="text-xl font-bold">{mockData?.title}</h1>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Font Size */}
                        <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 rounded-xl p-1 shadow-md">
                            <button
                                onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                                className="p-2 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-all"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold">{fontSize}</span>
                            <button
                                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                                className="p-2 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-all"
                            >
                                <ChevronUp className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Timer */}
                        <div className={`${getTimerColor()} text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2`}>
                            <Clock className="w-5 h-5" />
                            <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
                        </div>

                        {/* Dark Mode */}
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-lg transition-all transform hover:scale-105"
                        >
                            {isDark ? '☀️' : '🌙'}
                        </button>

                        {/* Submit */}
                        {!submitted && (
                            <button
                                onClick={() => setShowConfirmModal(true)}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg transition-all transform hover:scale-105"
                            >
                                <Send className="w-5 h-5" />
                                Submit
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
                <div className={`rounded-2xl p-8 ${cardBg} shadow-xl`}>
                    {!submitted ? renderPart() : (
                        <div className="space-y-8">
                            <div className="text-center">
                                <h2 className="text-4xl font-bold mb-4 text-teal-600">🎉 Results</h2>
                                <div className="inline-block bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-3xl p-8 shadow-2xl mb-6">
                                    <p className="text-6xl font-bold mb-2">
                                        {results.total}/{38}
                                    </p>
                                    <p className="text-2xl opacity-90">{Math.round((results.total / 38) * 100)}% Correct</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {[1, 2, 3, 4, 5].map(part => {
                                    const partMap = { 1: 'part1', 2: 'part2', 3: 'part3', 4: 'part4MC', 5: 'part5Mini' }
                                    const score = results[partMap[part]]
                                    const totals = [6, 10, 6, 4, 5]
                                    return (
                                        <button
                                            key={part}
                                            onClick={() => setCurrentPart(part)}
                                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all transform hover:scale-105 shadow-lg ${currentPart === part
                                                ? 'border-teal-600 bg-teal-100 dark:bg-teal-900/30'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-teal-400'
                                                }`}
                                        >
                                            <p className="font-bold text-lg">Part {part}</p>
                                            <p className="text-sm opacity-75">{score}/{totals[part - 1]}</p>
                                        </button>
                                    )
                                })}
                            </div>

                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg transition-all transform hover:scale-105"
                            >
                                📋 Review Answers
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Navigation */}
            {!submitted && (
                <div className={`fixed bottom-0 left-0 right-0 ${cardBg} border-t ${borderClass} p-4 shadow-2xl z-40`}>
                    <div className="max-w-7xl mx-auto flex gap-3 justify-center flex-wrap">
                        {[1, 2, 3, 4, 5].map(part => (
                            <button
                                key={part}
                                onClick={() => setCurrentPart(part)}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-md ${currentPart === part
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Part {part}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">📖</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Submit Your Test?</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                Are you sure you want to submit? You won't be able to change your answers after submission.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Submit Test
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-4xl w-full shadow-2xl my-8">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-3xl font-bold text-teal-600 flex items-center gap-3">
                                📋 Answer Review
                            </h2>
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="text-4xl hover:text-red-500 transition-all"
                            >
                                ×
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-teal-600 text-white">
                                        <th className="p-4 text-left rounded-tl-xl">Q#</th>
                                        <th className="p-4 text-left">Your Answer</th>
                                        <th className="p-4 text-left">Correct Answer</th>
                                        <th className="p-4 text-center rounded-tr-xl">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Generate review rows here based on results */}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-center gap-6 mt-6 pt-6 border-t">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                <span className="font-semibold">{results?.total || 0} Correct</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                <span className="font-semibold">{38 - (results?.total || 0)} Incorrect</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
