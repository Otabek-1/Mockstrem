import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Clock, Volume2, VolumeX, BookOpen, Send, Download } from 'lucide-react'
import api from '../../api'
import { 
    getListeningAnswers, 
    calculateListeningScore, 
    getCEFRLevel, 
    getPerformanceMessage 
} from './listeningAnswerService'

const API_BASE_URL = 'https://english-server-p7y6.onrender.com'

export default function ListeningExamInterface() {
    const { id } = useParams()
    const [mockId, setMockId] = useState(id || 1)
    const [currentPart, setCurrentPart] = useState(1)
    const [answers, setAnswers] = useState({
        part1: Array(8).fill(''),
        part2: Array(6).fill(''),
        part3: Array(4).fill(''),
        part4: Array(5).fill(''),
        part5: Array(6).fill(''),
        part6: Array(6).fill('')
    })
    const [submitted, setSubmitted] = useState(false)
    const [results, setResults] = useState(null)
    const [mockData, setMockData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [timeRemaining, setTimeRemaining] = useState(40 * 60)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [audioLoaded, setAudioLoaded] = useState(false)
    const [audioPlaying, setAudioPlaying] = useState(false)
    const [audioProgress, setAudioProgress] = useState(0)
    const [volume, setVolume] = useState(1)
    const [muted, setMuted] = useState(false)
    
    const audioRef = useRef(null)

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
                const response = await api.get(`/cefr/listening/${mockId}`)
                                
                if (response.status !== 200) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                
                const data = response.data
                console.log('Received data:', data)
                setMockData(data)

                setAnswers({
                    part1: Array(8).fill(''),
                    part2: Array(6).fill(''),
                    part3: Array(4).fill(''),
                    part4: Array(5).fill(''),
                    part5: Array(6).fill(''),
                    part6: Array(6).fill('')
                })

                setError(null)
            } catch (err) {
                console.error('Error fetching data:', err)
                setError('Failed to load listening task')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [mockId])

    useEffect(() => {
        if (submitted) return
        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 0) {
                    clearInterval(interval)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [submitted])

    // Get current audio URL based on part
    const getCurrentAudioUrl = () => {
        if (!mockData) return null
        const audioKeys = {
            1: 'audio_part_1',
            2: 'audio_part_2',
            3: 'audio_part_3',
            4: 'audio_part_4',
            5: 'audio_part_5',
            6: 'audio_part_6'
        }
        return mockData[audioKeys[currentPart]] || null
    }

    // Audio controls
    useEffect(() => {
        const audio = audioRef.current
        const audioUrl = getCurrentAudioUrl()
        
        if (!audio || !audioUrl) return

        // Reset audio state when changing parts
        setAudioLoaded(false)
        setAudioPlaying(false)
        setAudioProgress(0)
        audio.src = audioUrl
        audio.load()

        const handleLoadedData = () => {
            setAudioLoaded(true)
        }

        const handlePlay = () => setAudioPlaying(true)
        const handlePause = () => setAudioPlaying(false)
        const handleTimeUpdate = () => {
            if (audio.duration) {
                setAudioProgress((audio.currentTime / audio.duration) * 100)
            }
        }

        audio.addEventListener('loadeddata', handleLoadedData)
        audio.addEventListener('play', handlePlay)
        audio.addEventListener('pause', handlePause)
        audio.addEventListener('timeupdate', handleTimeUpdate)

        return () => {
            audio.removeEventListener('loadeddata', handleLoadedData)
            audio.removeEventListener('play', handlePlay)
            audio.removeEventListener('pause', handlePause)
            audio.removeEventListener('timeupdate', handleTimeUpdate)
        }
    }, [mockData, currentPart])

    const toggleAudio = () => {
        if (audioRef.current) {
            if (audioPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play()
            }
        }
    }

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !muted
            setMuted(!muted)
        }
    }

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value)
        setVolume(newVolume)
        if (audioRef.current) {
            audioRef.current.volume = newVolume
        }
    }

    const handleAnswerChange = (part, index, value) => {
        setAnswers(prev => ({
            ...prev,
            [part]: prev[part].map((ans, i) => i === index ? value : ans)
        }))
    }

    const handleSubmit = async () => {
        try {
            setShowConfirmModal(false)
            
            // Show loading state
            const loadingToast = document.createElement('div')
            loadingToast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
            loadingToast.textContent = 'Calculating results...'
            document.body.appendChild(loadingToast)

            // Fetch correct answers from backend
            const correctAnswers = await getListeningAnswers(mockId)
            
            // Calculate score on client side
            const calculatedResults = calculateListeningScore(answers, correctAnswers)
            
            // Optionally, you can also submit to backend for record keeping
            // await submitListeningAnswers(mockId, answers)
            
            setResults(calculatedResults)
            setSubmitted(true)

            // Remove loading toast
            document.body.removeChild(loadingToast)

        } catch (err) {
            console.error('Error submitting:', err)
            alert('Error calculating results. Please try again.')
        }
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getTimerColor = () => {
        if (timeRemaining < 60) return 'bg-red-600 animate-pulse'
        if (timeRemaining < 300) return 'bg-yellow-600'
        return 'bg-teal-600'
    }

    // Render Part 1 - Multiple Choice Questions
    const renderPart1 = () => {
        const part1Data = mockData?.data?.part_1 || []
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-xl">
                    <h2 className="text-2xl font-bold mb-2">Part 1: Multiple Choice</h2>
                    <p className="opacity-90">Listen and choose the best response for each question</p>
                </div>
                
                {part1Data.map((options, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                        <h3 className="font-bold text-lg mb-4 text-teal-600">Question {index + 1}</h3>
                        <div className="space-y-3">
                            {options.map((option, optionIndex) => (
                                <label key={optionIndex} className="flex items-center gap-3 p-4 bg-white rounded-lg cursor-pointer hover:bg-teal-50 transition-all border-2 border-transparent hover:border-teal-300">
                                    <input
                                        type="radio"
                                        name={`part1-q${index}`}
                                        value={String.fromCharCode(65 + optionIndex)}
                                        checked={answers.part1[index] === String.fromCharCode(65 + optionIndex)}
                                        onChange={(e) => handleAnswerChange('part1', index, e.target.value)}
                                        className="w-5 h-5 text-teal-600"
                                    />
                                    <span className="font-semibold text-gray-700">{String.fromCharCode(65 + optionIndex)}.</span>
                                    <span className="text-gray-800">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // Render Part 2 - Fill in the blanks
    const renderPart2 = () => {
        const part2Data = mockData?.data?.part_2 || []
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-xl">
                    <h2 className="text-2xl font-bold mb-2">Part 2: Note Completion</h2>
                    <p className="opacity-90">Listen and complete the notes with ONE or TWO words</p>
                </div>
                
                {part2Data.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                        <div className="mb-3">
                            <span className="inline-block bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                {item.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-gray-700">{item.before}</span>
                            <input
                                type="text"
                                value={answers.part2[index]}
                                onChange={(e) => handleAnswerChange('part2', index, e.target.value)}
                                className="px-4 py-2 border-2 border-teal-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none min-w-[200px]"
                                placeholder={`Answer ${index + 9}`}
                            />
                            <span className="text-gray-700">{item.after}</span>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // Render Part 3 - Matching
    const renderPart3 = () => {
        const part3Data = mockData?.data?.part_3 || {}
        const speakers = part3Data.speakers || []
        const options = part3Data.options || []
        
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-xl">
                    <h2 className="text-2xl font-bold mb-2">Part 3: Matching</h2>
                    <p className="opacity-90">Match each speaker with what they need most</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-3">Options:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="font-bold text-blue-600">{String.fromCharCode(65 + index)}.</span>
                                <span className="text-gray-700">{option}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {speakers.map((speaker, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                        <h3 className="font-bold text-lg mb-4 text-teal-600">{speaker}</h3>
                        <select
                            value={answers.part3[index]}
                            onChange={(e) => handleAnswerChange('part3', index, e.target.value)}
                            className="w-full px-4 py-3 border-2 border-teal-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-lg"
                        >
                            <option value="">Select an option...</option>
                            {options.map((option, optionIndex) => (
                                <option key={optionIndex} value={String.fromCharCode(65 + optionIndex)}>
                                    {String.fromCharCode(65 + optionIndex)}. {option}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        )
    }

    // Render Part 4 - Map labeling
    const renderPart4 = () => {
        const part4Data = mockData?.data?.part_4 || {}
        const questions = part4Data.questions || []
        
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-xl">
                    <h2 className="text-2xl font-bold mb-2">Part 4: Map Labeling</h2>
                    <p className="opacity-90">Listen and label the map with the correct letters</p>
                </div>

                {part4Data.mapUrl && (
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                        <img 
                            src={part4Data.mapUrl} 
                            alt="Map for labeling" 
                            className="w-full rounded-lg shadow-lg"
                        />
                    </div>
                )}
                
                {questions.map((question, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                        <div className="flex items-center gap-4 flex-wrap">
                            <span className="font-bold text-xl text-teal-600">{question.num}.</span>
                            <span className="text-gray-700 text-lg flex-1">{question.place}</span>
                            <select
                                value={answers.part4[index]}
                                onChange={(e) => handleAnswerChange('part4', index, e.target.value)}
                                className="px-4 py-3 border-2 border-teal-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-lg min-w-[100px]"
                            >
                                <option value="">-</option>
                                {(part4Data.mapLabels || []).map((label) => (
                                    <option key={label} value={label}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // Render Part 5 - Multiple extracts with questions
    const renderPart5 = () => {
        const part5Data = mockData?.data?.part_5 || []
        let questionNumber = 23
        
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-xl">
                    <h2 className="text-2xl font-bold mb-2">Part 5: Multiple Choice (Extracts)</h2>
                    <p className="opacity-90">Listen to three extracts and answer the questions</p>
                </div>
                
                {part5Data.map((extract, extractIndex) => (
                    <div key={extractIndex} className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                        <h3 className="text-xl font-bold mb-4 text-purple-700">{extract.name}</h3>
                        
                        {extract.questions.map((question, qIndex) => {
                            const currentQ = questionNumber++
                            const answerIndex = extractIndex * 2 + qIndex
                            
                            return (
                                <div key={qIndex} className="mb-6 last:mb-0 bg-white p-5 rounded-lg">
                                    <p className="font-semibold mb-4 text-gray-800">
                                        <span className="text-teal-600">{currentQ}.</span> {question.text}
                                    </p>
                                    <div className="space-y-3">
                                        {question.options.map((option, optionIndex) => (
                                            <label key={optionIndex} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-purple-50 transition-all border-2 border-transparent hover:border-purple-300">
                                                <input
                                                    type="radio"
                                                    name={`part5-q${answerIndex}`}
                                                    value={String.fromCharCode(65 + optionIndex)}
                                                    checked={answers.part5[answerIndex] === String.fromCharCode(65 + optionIndex)}
                                                    onChange={(e) => handleAnswerChange('part5', answerIndex, e.target.value)}
                                                    className="w-5 h-5 text-purple-600"
                                                />
                                                <span className="font-semibold text-gray-700">{String.fromCharCode(65 + optionIndex)}.</span>
                                                <span className="text-gray-800">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        )
    }

    // Render Part 6 - Sentence completion
    const renderPart6 = () => {
        const part6Data = mockData?.data?.part_6 || {}
        const questions = part6Data.questions || []
        
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-xl">
                    <h2 className="text-2xl font-bold mb-2">Part 6: Sentence Completion</h2>
                    <p className="opacity-90">Complete each sentence with ONE or TWO words</p>
                </div>
                
                {questions.map((question, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                        <div className="flex items-start gap-3 flex-wrap">
                            <span className="font-bold text-xl text-teal-600 mt-2">{question.num}.</span>
                            <div className="flex-1 min-w-[300px]">
                                <div className="flex items-center gap-2 flex-wrap text-gray-700 text-lg">
                                    <span>{question.before}</span>
                                    <input
                                        type="text"
                                        value={answers.part6[index]}
                                        onChange={(e) => handleAnswerChange('part6', index, e.target.value)}
                                        className="px-4 py-2 border-2 border-teal-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none min-w-[200px]"
                                        placeholder="Your answer"
                                    />
                                    <span>{question.after}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderPart = () => {
        switch (currentPart) {
            case 1: return renderPart1()
            case 2: return renderPart2()
            case 3: return renderPart3()
            case 4: return renderPart4()
            case 5: return renderPart5()
            case 6: return renderPart6()
            default: return null
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading listening task...</p>
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
        return <div className="flex items-center justify-center min-h-screen text-gray-600">No listening data found</div>
    }

    const bgClass = 'bg-gradient-to-br from-teal-50 to-emerald-50'
    const cardBg = 'bg-white'

    return (
        <div className={`min-h-screen ${bgClass}`}>
            {/* Audio Element */}
            <audio ref={audioRef} preload="auto" />

            {/* Header */}
            <div className="sticky top-0 z-40 bg-gradient-to-r from-teal-600 to-emerald-600 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-7 h-7 text-white" />
                        <h1 className="text-xl font-bold text-white">{mockData?.title}</h1>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Timer */}
                        <div className={`${getTimerColor()} text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2`}>
                            <Clock className="w-5 h-5" />
                            <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
                        </div>

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

                {/* Audio Player Bar */}
                <div className="bg-teal-700/50 backdrop-blur-sm px-4 py-3">
                    <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
                        <button
                            onClick={toggleAudio}
                            disabled={!audioLoaded}
                            className="w-10 h-10 rounded-full bg-white text-teal-600 flex items-center justify-center hover:bg-gray-100 transition-all disabled:opacity-50"
                        >
                            {audioPlaying ? '⏸' : '▶'}
                        </button>

                        <div className="flex-1 min-w-[200px]">
                            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all"
                                    style={{ width: `${audioProgress}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleMute}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-20"
                            />
                        </div>

                        {!audioLoaded && (
                            <span className="text-white text-sm">Loading audio...</span>
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
                                
                                {/* Main Score Card */}
                                <div className="inline-block bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-3xl p-8 shadow-2xl mb-6">
                                    <p className="text-7xl font-bold mb-2">
                                        {results?.total}/{results?.maxScore || 35}
                                    </p>
                                    <p className="text-3xl opacity-90 mb-4">
                                        {results?.percentage}% Correct
                                    </p>
                                    <div className="bg-white/20 rounded-xl px-6 py-3 inline-block">
                                        <p className="text-xl font-semibold">
                                            CEFR Level: {getCEFRLevel(results?.percentage || 0)}
                                        </p>
                                    </div>
                                </div>

                                {/* Performance Message */}
                                <p className="text-xl text-gray-700 mb-6">
                                    {getPerformanceMessage(results?.percentage || 0)}
                                </p>

                                {/* Part-by-Part Breakdown */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                    {results?.partScores && Object.entries(results.partScores).map(([part, score]) => (
                                        <div key={part} className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-200">
                                            <p className="text-sm text-gray-600 font-semibold uppercase mb-2">
                                                {part.replace('part', 'Part ')}
                                            </p>
                                            <p className="text-2xl font-bold text-teal-600">
                                                {score.correct}/{score.total}
                                            </p>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div 
                                                    className="bg-teal-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${(score.correct / score.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                📋 Review All Answers
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Navigation */}
            {!submitted && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-40 p-4">
                    <div className="max-w-7xl mx-auto flex gap-3 justify-center flex-wrap">
                        {[1, 2, 3, 4, 5, 6].map(part => (
                            <button
                                key={part}
                                onClick={() => setCurrentPart(part)}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-md ${currentPart === part
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
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
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">🎧</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Submit Your Test?</h3>
                            <p className="text-gray-600 mb-8">
                                Are you sure you want to submit? You won't be able to change your answers after submission.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 px-6 py-3 bg-gray-200 rounded-xl font-semibold hover:bg-gray-300 transition-all"
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
            {showReviewModal && results && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl p-8 max-w-5xl w-full shadow-2xl my-8">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-3xl font-bold text-teal-600 flex items-center gap-3">
                                📋 Detailed Answer Review
                            </h2>
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="text-4xl hover:text-red-500 transition-all"
                            >
                                ×
                            </button>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                                <p className="text-sm text-green-600 font-semibold mb-1">Correct</p>
                                <p className="text-3xl font-bold text-green-700">{results.total}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                                <p className="text-sm text-red-600 font-semibold mb-1">Incorrect</p>
                                <p className="text-3xl font-bold text-red-700">{results.maxScore - results.total}</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                                <p className="text-sm text-blue-600 font-semibold mb-1">Score</p>
                                <p className="text-3xl font-bold text-blue-700">{results.percentage}%</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                                <p className="text-sm text-purple-600 font-semibold mb-1">CEFR</p>
                                <p className="text-3xl font-bold text-purple-700">{getCEFRLevel(results.percentage)}</p>
                            </div>
                        </div>

                        {/* Answers Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-teal-600 text-white">
                                        <th className="p-4 text-left rounded-tl-xl w-16">Q#</th>
                                        <th className="p-4 text-left w-20">Part</th>
                                        <th className="p-4 text-left">Your Answer</th>
                                        <th className="p-4 text-left">Correct Answer</th>
                                        <th className="p-4 text-center rounded-tr-xl w-20">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.details && results.details.map((detail, index) => (
                                        <tr 
                                            key={index} 
                                            className={`border-b hover:bg-gray-50 ${
                                                detail.is_correct ? 'bg-green-50/30' : 'bg-red-50/30'
                                            }`}
                                        >
                                            <td className="p-4 font-bold text-gray-700">{detail.question}</td>
                                            <td className="p-4">
                                                <span className="inline-block bg-teal-100 text-teal-700 px-2 py-1 rounded text-sm font-semibold">
                                                    Part {detail.part}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`font-semibold ${
                                                    detail.is_correct ? 'text-green-700' : 'text-red-700'
                                                }`}>
                                                    {detail.user_answer || <span className="text-gray-400 italic">No answer</span>}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-bold text-teal-600">
                                                    {detail.correct_answer}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {detail.is_correct ? (
                                                    <span className="text-green-500 text-3xl">✓</span>
                                                ) : (
                                                    <span className="text-red-500 text-3xl">✗</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-between items-center mt-6 pt-6 border-t">
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                    <span className="font-semibold text-green-700">{results.total} Correct</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                    <span className="font-semibold text-red-700">{results.maxScore - results.total} Incorrect</span>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all"
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