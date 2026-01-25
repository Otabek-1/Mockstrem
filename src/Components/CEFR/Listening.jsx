import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Clock, Volume2, VolumeX, BookOpen, Send, Download } from 'lucide-react'

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
                const response = await fetch(`${API_BASE_URL}/mock/listening/mock/${mockId}`)
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                
                const data = await response.json()
                console.log('Received data:', data)
                setMockData(data.mock)

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
            setTimeRemaining(prev => prev - 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [submitted])

    // Audio controls
    useEffect(() => {
        const audio = audioRef.current
        if (!audio || !mockData?.audio_url) return

        const handleLoadedData = () => {
            setAudioLoaded(true)
            // Auto-play
            audio.play().catch(err => console.log('Auto-play prevented:', err))
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
    }, [mockData])

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
            const response = await fetch(`${API_BASE_URL}/mock/listening/submit`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    question_id: mockId,
                    part1: answers.part1,
                    part2: answers.part2,
                    part3: answers.part3,
                    part4: answers.part4,
                    part5: answers.part5,
                    part6: answers.part6
                })
            })

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
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getTimerColor = () => {
        if (timeRemaining < 60) return 'bg-red-600 animate-pulse'
        if (timeRemaining < 300) return 'bg-yellow-600'
        return 'bg-teal-600'
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

    const renderPart = () => {
        // Placeholder - actual part rendering logic here
        return (
            <div className={`${cardBg} p-8 rounded-2xl shadow-lg`}>
                <h2 className="text-2xl font-bold mb-4 text-teal-600">Part {currentPart}</h2>
                <p className="text-gray-700">Listening content for Part {currentPart}</p>
                {/* Add actual part rendering based on mockData structure */}
            </div>
        )
    }

    return (
        <div className={`min-h-screen ${bgClass}`}>
            {/* Audio Element */}
            <audio ref={audioRef} src={mockData?.audio_url} preload="auto" />

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
                                <div className="inline-block bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-3xl p-8 shadow-2xl mb-6">
                                    <p className="text-6xl font-bold mb-2">
                                        {results?.total}/{35}
                                    </p>
                                    <p className="text-2xl opacity-90">{Math.round((results?.total / 35) * 100)}% Correct</p>
                                </div>
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
            {showReviewModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl my-8">
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
                                    {/* Review table rows will be generated here */}
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
                                <span className="font-semibold">{35 - (results?.total || 0)} Incorrect</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}