import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Highlighter, Send, BookOpen } from 'lucide-react'
import { useParams } from 'react-router-dom'

const API_BASE_URL = 'https://english-server-p7y6.onrender.com' // O'zingizning API URL

export default function ReadingExamInterface() {
    const { id } = useParams();
    const [mockId, setMockId] = useState(1) // URL dan olish mumkin
    const [currentPart, setCurrentPart] = useState(1)
    const [fontSize, setFontSize] = useState(16)
    const [isDark, setIsDark] = useState(false)
    const [answers, setAnswers] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [results, setResults] = useState(null)
    const [mockData, setMockData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const getAuthHeaders = () => {
        const token = localStorage.getItem('access_token')
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    }
    // Data fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                setMockId(id)
                setLoading(true)
                const response = await fetch(`${API_BASE_URL}/mock/reading/mock/${id}`)
                const data = await response.json()
                setMockData(data.mock)

                // Initialize answers
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
    }, [mockId])

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
                    question_id: mockId,
                    part1: answers.part1,
                    part2: answers.part2,
                    part3: answers.part3,
                    part4MC: answers.part4MC,
                    part4TF: answers.part4TF,
                    part5Mini: answers.part5Mini,
                    part5MC: answers.part5MC
                })
            })

            const result = await response.json()
            setResults(result)
            setSubmitted(true)
        } catch (err) {
            console.error('Error submitting:', err)
            alert('Error submitting answers')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading reading task...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-600 font-bold mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (!mockData) {
        return <div className="flex items-center justify-center h-screen text-gray-600">No reading data found</div>
    }

    const bgClass = isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    const containerClass = isDark ? 'bg-gray-800' : 'bg-gray-50'
    const borderClass = isDark ? 'border-gray-700' : 'border-gray-200'

    const renderPart = () => {
        switch (currentPart) {
            // ===== PART 1: Fill in the gaps (6) =====
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Part 1: {mockData.part1.task}</h2>
                        </div>
                        <div className={`p-6 rounded-lg border ${containerClass} ${borderClass}`}>
                            <div style={{ fontSize: `${fontSize}px`, lineHeight: '2' }} className="leading-relaxed select-text">
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
                                                        <span key={idx}>
                                                            <span className="text-gray-500 font-semibold">({currentGapIndex + 1})</span>
                                                            <input
                                                                type="text"
                                                                value={answers.part1[currentGapIndex] || ''}
                                                                onChange={(e) => handleAnswerChange('part1', currentGapIndex, e.target.value)}
                                                                disabled={submitted}
                                                                style={{ fontSize: `${fontSize}px` }}
                                                                className={`inline-block w-24 mx-2 px-2 py-1 border-b-2 focus:outline-none text-center font-semibold transition ${submitted
                                                                    ? results.part1 >= currentGapIndex + 1
                                                                        ? 'border-green-500 bg-green-100'
                                                                        : 'border-red-500 bg-red-100'
                                                                    : 'border-blue-400'
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
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded">
                                <p className="font-bold">Part 1: {results.part1}/6 Correct</p>
                            </div>
                        )}
                    </div>
                )

            // ===== PART 2: Matching (10 statements -> 7 texts) =====
            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Part 2: {mockData.part2.task}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Kiritish: Statement qaysi text raqami bilan match bo'lsa, shu raqamni yozing (1-7)</p>
                        </div>
                        <div className="space-y-4">
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                                <h3 className="font-bold mb-3">Texts:</h3>
                                {mockData.part2.texts.map((text, idx) => (
                                    <div key={idx} className="mb-4 p-3 bg-white dark:bg-gray-700 rounded">
                                        <p className="font-bold text-blue-600 mb-2">Text {idx + 1}:</p>
                                        <p style={{ fontSize: `${fontSize}px` }} className="text-sm">{text}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-6">
                                <h3 className="font-bold mb-3">Statements:</h3>
                                {mockData.part2.statements.map((statement, idx) => (
                                    <div key={idx} className={`p-4 rounded-lg border mb-3 ${containerClass} ${borderClass}`}>
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-blue-600 mb-2">Statement {idx + 1}</p>
                                                <p style={{ fontSize: `${fontSize}px` }}>{statement}</p>
                                            </div>
                                            <input
                                                type="text"
                                                value={answers.part2[idx] || ''}
                                                onChange={(e) => handleAnswerChange('part2', idx, e.target.value)}
                                                disabled={submitted}
                                                placeholder="Text #"
                                                maxLength="1"
                                                className={`w-16 p-2 border rounded text-center font-bold ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {submitted && (
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded">
                                <p className="font-bold">Part 2: {results.part2}/10 Correct</p>
                            </div>
                        )}
                    </div>
                )

            // ===== PART 3: Headings & Paragraphs (6 paragraphs -> 8 headings) =====
            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Part 3: {mockData.part3.task}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Kiritish: Paragraph qaysi heading raqami bilan match bo'lsa, shu raqamni yozing (1-8)</p>
                        </div>

                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <h3 className="font-bold mb-3">Available Headings:</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {mockData.part3.headings.map((heading, idx) => (
                                    <div key={idx} className="p-2 bg-white dark:bg-gray-700 rounded text-sm">
                                        <span className="font-bold text-blue-600">{idx + 1}.</span> {heading}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {mockData.part3.paragraphs.map((para, idx) => (
                                <div key={idx} className={`p-4 rounded-lg border ${containerClass} ${borderClass}`}>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-blue-600 mb-2">Paragraph {idx + 1}:</p>
                                            <p style={{ fontSize: `${fontSize}px` }} className="bg-gray-100 dark:bg-gray-700 p-3 rounded">{para}</p>
                                        </div>
                                        <input
                                            type="text"
                                            value={answers.part3[idx] || ''}
                                            onChange={(e) => handleAnswerChange('part3', idx, e.target.value)}
                                            disabled={submitted}
                                            placeholder="Head #"
                                            maxLength="1"
                                            className={`w-16 p-2 border rounded text-center font-bold ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                                }`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {submitted && (
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded">
                                <p className="font-bold">Part 3: {results.part3}/6 Correct</p>
                            </div>
                        )}
                    </div>
                )

            // ===== PART 4: MC (4) + TF/NG (5) =====
            case 4:
                return (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Part 4: {mockData.part4.task}</h2>
                        </div>

                        <div className={`p-6 rounded-lg border ${containerClass} ${borderClass}`}>
                            <p style={{ fontSize: `${fontSize}px` }} className="mb-4">{mockData.part4.text}</p>
                        </div>

                        {/* Multiple Choice */}
                        <div>
                            <h3 className="text-xl font-bold border-b pb-2 mb-4">Multiple Choice (4 questions)</h3>
                            {mockData.part4.multipleChoice.map((q, idx) => (
                                <div key={idx} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg mb-4">
                                    <p style={{ fontSize: `${fontSize}px` }} className="font-semibold">{idx + 1}. {q.question}</p>
                                    <div className="space-y-2 ml-4">
                                        {q.options.map((opt, oIdx) => (
                                            <label key={oIdx} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20">
                                                <input
                                                    type="radio"
                                                    name={`part4-mc-${idx}`}
                                                    value={opt}
                                                    checked={answers.part4MC[idx] === opt}
                                                    onChange={(e) => handleAnswerChange('part4MC', idx, e.target.value)}
                                                    disabled={submitted}
                                                    className="w-4 h-4"
                                                />
                                                <span style={{ fontSize: `${fontSize}px` }}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* True/False/Not Given */}
                        <div>
                            <h3 className="text-xl font-bold border-b pb-2 mb-4">True / False / Not Given (5 statements)</h3>
                            {mockData.part4.trueFalse.map((tf, idx) => (
                                <div key={idx} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg mb-4">
                                    <p style={{ fontSize: `${fontSize}px` }} className="font-semibold">{idx + 1}. {tf.statement}</p>
                                    <div className="flex gap-4 ml-4">
                                        {['True', 'False', 'Not Given'].map(opt => (
                                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`part4-tf-${idx}`}
                                                    value={opt}
                                                    checked={answers.part4TF[idx] === opt}
                                                    onChange={(e) => handleAnswerChange('part4TF', idx, e.target.value)}
                                                    disabled={submitted}
                                                    className="w-4 h-4"
                                                />
                                                <span style={{ fontSize: `${fontSize}px` }}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {submitted && (
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded">
                                <p className="font-bold">Part 4 MC: {results.part4MC}/4 Correct</p>
                                <p className="font-bold">Part 4 TF: {results.part4TF}/5 Correct</p>
                            </div>
                        )}
                    </div>
                )

            // ===== PART 5: Mini text (5 gaps) + MC (2) =====
            case 5:
                return (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Part 5: {mockData.part5.task}</h2>
                        </div>

                        {/* Main Text */}
                        <div className={`p-6 rounded-lg border ${containerClass} ${borderClass}`}>
                            <p style={{ fontSize: `${fontSize}px` }} className="leading-relaxed">{mockData.part5.mainText}</p>
                        </div>

                        {/* Mini Text with gaps */}
                        <div>
                            <h3 className="text-xl font-bold border-b pb-2 mb-4">Fill in the gaps (5)</h3>
                            <div className={`p-6 rounded-lg border ${containerClass} ${borderClass}`}>
                                <div style={{ fontSize: `${fontSize}px`, lineHeight: '2' }} className="leading-relaxed">
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
                                                            <span key={idx}>
                                                                <span className="text-gray-500 font-semibold">({currentGapIndex + 1})</span>
                                                                <input
                                                                    type="text"
                                                                    value={answers.part5Mini[currentGapIndex] || ''}
                                                                    onChange={(e) => handleAnswerChange('part5Mini', currentGapIndex, e.target.value)}
                                                                    disabled={submitted}
                                                                    style={{ fontSize: `${fontSize}px` }}
                                                                    className={`inline-block w-24 mx-2 px-2 py-1 border-b-2 focus:outline-none text-center font-semibold transition ${submitted
                                                                        ? 'border-green-500 bg-green-100'
                                                                        : 'border-blue-400'
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

                        {/* Multiple Choice */}
                        <div>
                            <h3 className="text-xl font-bold border-b pb-2 mb-4">Multiple Choice (2 questions)</h3>
                            {mockData.part5.multipleChoice.map((q, idx) => (
                                <div key={idx} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg mb-4">
                                    <p style={{ fontSize: `${fontSize}px` }} className="font-semibold">{idx + 1}. {q.question}</p>
                                    <div className="space-y-2 ml-4">
                                        {q.options.map((opt, oIdx) => (
                                            <label key={oIdx} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20">
                                                <input
                                                    type="radio"
                                                    name={`part5-mc-${idx}`}
                                                    value={opt}
                                                    checked={answers.part5MC[idx] === opt}
                                                    onChange={(e) => handleAnswerChange('part5MC', idx, e.target.value)}
                                                    disabled={submitted}
                                                    className="w-4 h-4"
                                                />
                                                <span style={{ fontSize: `${fontSize}px` }}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {submitted && (
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded">
                                <p className="font-bold">Part 5 Mini: {results.part5Mini}/5 Correct</p>
                                <p className="font-bold">Part 5 MC: {results.part5MC}/2 Correct</p>
                            </div>
                        )}
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-40 border-b ${borderClass} ${containerClass}`}>
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-6 h-6" />
                        <h1 className="text-xl font-bold">{mockData?.title}</h1>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Font Size */}
                        <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                                className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-sm">{fontSize}</span>
                            <button
                                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                                className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                            >
                                <ChevronUp className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Dark Mode */}
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            {isDark ? '☀️' : '🌙'}
                        </button>

                        {/* Submit */}
                        {!submitted && (
                            <button
                                onClick={handleSubmit}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
                            >
                                <Send className="w-5 h-5" />
                                Submit
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className={`rounded-lg p-8 ${containerClass}`}>
                    {!submitted ? renderPart() : (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold mb-2">Results</h2>
                                <p className="text-5xl font-bold text-blue-600 mb-2">
                                    {results.total}/{6 + 10 + 6 + 4 + 5 + 5 + 2}
                                </p>
                                <p className="text-2xl opacity-80">{Math.round((results.total / 38) * 100)}% Correct</p>
                            </div>

                            <div className="grid grid-cols-5 gap-2 my-8">
                                {[1, 2, 3, 4, 5].map(part => {
                                    const partMap = { 1: 'part1', 2: 'part2', 3: 'part3', 4: 'part4MC', 5: 'part5Mini' }
                                    const score = results[partMap[part]]
                                    const totals = [6, 10, 6, 4, 5]
                                    return (
                                        <button
                                            key={part}
                                            onClick={() => setCurrentPart(part)}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition ${currentPart === part
                                                ? 'border-blue-600 bg-blue-100 dark:bg-blue-900/30'
                                                : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                        >
                                            <p className="font-bold">Part {part}</p>
                                            <p className="text-sm opacity-75">{score}/{totals[part - 1]}</p>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            {!submitted && (
                <div className={`sticky bottom-0 border-t ${borderClass} ${containerClass} p-4`}>
                    <div className="max-w-6xl mx-auto flex gap-2">
                        {[1, 2, 3, 4, 5].map(part => (
                            <button
                                key={part}
                                onClick={() => setCurrentPart(part)}
                                className={`px-4 py-2 rounded-lg font-semibold transition ${currentPart === part
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Part {part}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}