import React, { useState, useRef, useEffect } from 'react'
import { Mic, Play, Volume2, CheckCircle, Clock, AlertCircle, Download, Settings, BookOpen, Upload } from 'lucide-react'
import api from '../../api'
import JSZip from 'jszip'
import { useParams } from 'react-router-dom'
import AISpeakingResults from './AISpeakingResults'

export default function CERFSpeakingExam() {
  const { id } = useParams("id")
  // ===== STATES =====
  const [audioCache, setAudioCache] = useState({})
  const [ttsLoading, setTtsLoading] = useState(false)

  const [screen, setScreen] = useState('rules')
  const [currentPart, setCurrentPart] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedMockId, setSelectedMockId] = useState(null)
  const [mocks, setMocks] = useState([])
  const [mockData, setMockData] = useState(null)


  // Timing states
  const [stage, setStage] = useState('idle')
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalTime, setTotalTime] = useState(0)

  // Recording states
  const [recordings, setRecordings] = useState({})

  // Microphone states
  const [micTestRecording, setMicTestRecording] = useState(false)
  const [micTestAudio, setMicTestAudio] = useState(null)
  const [micPermissionGranted, setMicPermissionGranted] = useState(false)

  // UI states
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // Refs
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const audioChunksRef = useRef([])
  const micTestRecorderRef = useRef(null)
  const micTestStreamRef = useRef(null)
  const micTestAudioChunksRef = useRef([])
  const recordedBlobsRef = useRef({})

  // Premium & User states
  const [isPremium, setIsPremium] = useState(false)
  const [userInfo, setUserInfo] = useState(null)

  const enterFullscreen = () => {
    const elem = document.documentElement

    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen()
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen()
    }
  }

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    if (screen === 'results') {
      exitFullscreen()
      // Fetch premium status when results screen is shown
      const fetchUserInfo = async () => {
        try {
          const response = await api.get('/user/me')
          console.log('📡 API Response:', response)
          
          // Handle different response structures
          let userData = response.data?.userData || response.data?.data || response.data
          
          if (userData && typeof userData === 'object') {
            console.log('👤 Full User Data:', userData)
            setUserInfo(userData)
            
            // Check premium_duration field - PRIMARY METHOD
            let isPrem = false
            
            if (userData.premium_duration) {
              const expiryDate = new Date(userData.premium_duration)
              const now = new Date()
              isPrem = expiryDate > now
              
              console.log('⏰ PREMIUM_DURATION CHECK:')
              console.log('   Expiry Date:', expiryDate.toISOString())
              console.log('   Now:', now.toISOString())
              console.log('   Is Premium?:', isPrem, '(Expiry > Now?)')
              console.log('   Remaining:', Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)), 'days')
            } else {
              console.log('⏰ PREMIUM_DURATION: NULL/UNDEFINED → FREE USER')
            }
            
            console.log('✅ FINAL Premium Status:', isPrem ? '🟢 PREMIUM' : '🔴 FREE')
            setIsPremium(isPrem)
          } else {
            console.error('❌ userData invalid:', userData)
            setIsPremium(false)
          }
        } catch (err) {
          console.error('❌ Error fetching user info:', err)
          setIsPremium(false)
        }
      }
      
      fetchUserInfo()
    }
  }, [screen])
  useEffect(() => {
    const fetchMocks = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await api.get('/mock/speaking/all')
        setMocks(response.data)
      } catch (err) {
        setError('Failed to load mocks')
        // console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (screen === 'rules') {
      fetchMocks()
    }
  }, [screen])

  // ===== FETCH MOCK DATA =====
  const loadMockData = async (mockId) => {
    try {
      setError('')
      setLoading(true)
      setTtsLoading(true)
      setScreen('loading')

      // 1️⃣ MOCK DATA
      const res = await api.get(`/mock/speaking/mock/${mockId}`)
      const questions = res.data.questions.questions
      setMockData(questions)
      setSelectedMockId(mockId)

      // 2️⃣ FAQAT TEXTLARNI AJRATIB OLAMIZ
      const payload = {}
      Object.values(questions)
        .flat()
        .forEach(q => {
          payload[`q${q.id}`] = q.question_text
        })
      // console.log(payload);

      // 3️⃣ TTS ZIP OLAMIZ
      const zipRes = await api.post('/tts/audio', payload, {
        responseType: 'blob'
      })

      // 4️⃣ ZIPNI O‘QISH
      const zip = await JSZip.loadAsync(zipRes.data)
      const audioMap = {}

      for (const filename of Object.keys(zip.files)) {
        const blob = await zip.files[filename].async('blob')
        const key = filename.replace('.mp3', '')
        audioMap[key] = URL.createObjectURL(blob)
      }

      setAudioCache(audioMap)

      // 5️⃣ MIC CHECK
      setScreen('miccheck')

    } catch (err) {
      // console.error(err)
      setError('Failed to load mock or TTS')
      setScreen('rules')
    } finally {
      setLoading(false)
      setTtsLoading(false)
    }
  }


  // ===== SOUND EFFECTS =====
  const playBeep = (frequency = 440, duration = 100) => {
    if (!soundEnabled) return

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)

      oscillator.start()
      setTimeout(() => {
        oscillator.stop()
      }, duration)
    } catch (e) {
      // console.log('Sound effect not supported:', e)
    }
  }

  const playLongBeep = () => {
    if (!soundEnabled) return
    playBeep(523, 500)
  }

  const playStartSound = () => {
    if (!soundEnabled) return
    playBeep(659, 300)
  }

  // ===== HELPER FUNCTIONS =====
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  // ===== gTTS TEXT-TO-SPEECH =====
  const speakTextWithGTTS = async (text, language = 'en') => {
    try {
      const encodedText = encodeURIComponent(text)
      const audioUrl = `https://gtts.vercel.app/api/speak?text=${encodedText}&lang=${language}`

      const audio = new Audio(audioUrl)

      return new Promise((resolve) => {
        audio.onended = resolve
        audio.onerror = () => {
          // console.error('gTTS error, falling back to native TTS')
          speakTextNative(text).then(resolve)
        }
        audio.play()
      })
    } catch (e) {
      // console.error('gTTS Error:', e)
      return speakTextNative(text)
    }
  }

  const speakTextNative = async (text) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      return new Promise(resolve => {
        utterance.onend = resolve
        speechSynthesis.speak(utterance)
      })
    } catch (e) {
      // console.error('TTS Error:', e)
    }
  }

  // ===== RECORDING FUNCTIONS =====
  const startRecording = async (questionId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      audioChunksRef.current = []

      const tryMimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ]

      let mimeType = ''
      let mediaRecorder

      for (const type of tryMimeTypes) {
        if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
          mimeType = type
          mediaRecorder = new MediaRecorder(stream, { mimeType })
          break
        }
      }

      if (!mediaRecorder) {
        mediaRecorder = new MediaRecorder(stream)
      }

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: mimeType || 'audio/webm'
        })

        // Save blob for submission
        recordedBlobsRef.current[`q${questionId}`] = blob

        const localUrl = URL.createObjectURL(blob)

        setRecordings(prev => ({
          ...prev,
          [`q${questionId}`]: localUrl
        }))

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop())
          streamRef.current = null
        }
      }

      mediaRecorder.start()

    } catch (error) {
      // console.error('Microphone error:', error)
      alert('Microphone access required! Please allow microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  // ===== MIC TEST FUNCTIONS =====
  const startMicTestRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micTestStreamRef.current = stream
      micTestAudioChunksRef.current = []

      const mediaRecorder = new MediaRecorder(stream)
      micTestRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          micTestAudioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(micTestAudioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setMicTestAudio(url)

        if (micTestStreamRef.current) {
          micTestStreamRef.current.getTracks().forEach(track => track.stop())
        }
      }

      mediaRecorder.start()
      setMicTestRecording(true)
    } catch (error) {
      // console.error('Mic test error:', error)
      alert('Microphone access required for testing!')
    }
  }

  const stopMicTestRecording = () => {
    if (micTestRecorderRef.current) {
      micTestRecorderRef.current.stop()
      setMicTestRecording(false)
    }
  }

  // ===== GET CURRENT QUESTION =====
  const getCurrentQuestion = () => {
    if (!mockData || !currentPart) return null

    const questions = mockData[currentPart]
    if (!questions || !questions[currentQuestion]) return null

    return questions[currentQuestion]
  }

  // ===== TIMER EFFECT =====
  useEffect(() => {
    if (timeLeft <= 0 || stage === 'idle') return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)

          if (stage === 'reading') {
            setStage('preparing')
            const q = getCurrentQuestion()
            if (q) {
              setTimeLeft(q.prep_time)
              setTotalTime(q.prep_time)
            }
            playStartSound()
          } else if (stage === 'preparing') {
            setStage('speaking')
            const q = getCurrentQuestion()
            if (q) {
              setTimeLeft(q.speak_time)
              setTotalTime(q.speak_time)
            }
            playStartSound()

            const q2 = getCurrentQuestion()
            if (q2) {
              startRecording(q2.id)
            }
          } else if (stage === 'speaking') {
            stopRecording()
            playLongBeep()
            moveToNext()
          }
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft, stage, currentPart, currentQuestion, mockData])

  const moveToNext = () => {
    if (!mockData) return

    const parts = ['1.1', '1.2', '2', '3']
    const currentIdx = parts.indexOf(currentPart)

    if (currentIdx === -1) return

    const questionsInPart = mockData[currentPart]?.length || 0

    if (currentQuestion < questionsInPart - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setStage('idle')
    } else if (currentIdx < parts.length - 1) {
      const nextPart = parts[currentIdx + 1]
      setCurrentPart(nextPart)
      setCurrentQuestion(0)
      setStage('idle')
    } else {
      submitExam()
    }
  }

  const startQuestion = async () => {
    const q = getCurrentQuestion()
    if (!q) return

    setStage('reading')
    setTimeLeft(5)
    setTotalTime(5)

    const audioUrl = audioCache[`q${q.id}`]
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      await new Promise(resolve => {
        audio.onended = resolve
        audio.play()
      })
    }

    setStage('preparing')
    setTimeLeft(q.prep_time)
    setTotalTime(q.prep_time)
  }


  useEffect(() => {
    if (screen === 'exam' && stage === 'idle' && currentPart && mockData) {
      startQuestion()
    }
  }, [screen, currentPart, currentQuestion, mockData, stage])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      if (micTestStreamRef.current) {
        micTestStreamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  // ===== DEV SHORTCUT: Ctrl+Alt+P =====
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault()
        if (screen === 'exam' && mockData) {
          if (stage === 'speaking') {
            stopRecording()
            playLongBeep()
            setTimeout(() => moveToNext(), 100)
          } else if (stage === 'idle' || stage === 'reading' || stage === 'preparing') {
            moveToNext()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [screen, stage, currentPart, currentQuestion, mockData])

  // ===== SUBMIT EXAM =====
  const submitExam = async () => {
    try {
      setUploading(true)
      setError('')

      // Calculate total duration
      let total = 0
      Object.keys(mockData).forEach(part => {
        mockData[part]?.forEach(q => {
          total += (q.prep_time || 0) + (q.speak_time || 0)
        })
      })

      // Create FormData with files
      const formData = new FormData()
      formData.append('mock_id', selectedMockId)
      formData.append('total_duration', total)

      // Add all audio blobs
      Object.entries(recordedBlobsRef.current).forEach(([key, blob]) => {
        formData.append('audios', blob, `${key}.webm`)
      })

      // console.log('📤 Submitting exam with', Object.keys(recordedBlobsRef.current).length, 'audios')

      const response = await api.post('/mock/speaking/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // console.log('✅ Exam submitted successfully:', response.data)
      setScreen('results')
      setUploading(false)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message
      setError('Failed to submit exam: ' + errorMsg)
      // console.error('Submit error:', err)
      setUploading(false)
    }
  }

  // ===== DOWNLOAD RECORDING =====
  const downloadRecording = (key, url) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `question_${key.replace('q', '')}.webm`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center w-80">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Preparing your exam
          </h2>
          <p className="text-slate-600 text-sm">
            Generating audio questions…
          </p>
        </div>
      </div>
    )
  }


  // ===== RENDER: RULES SCREEN =====
  if (screen === 'rules') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">CEFR Speaking Exam</h1>
            <p className="text-slate-600 text-sm mt-2">Select a Mock</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-slate-600">Loading mocks...</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-8 max-h-96 overflow-y-auto">
                {mocks.length > 0 ? (
                  mocks.filter(mock => mock.id == id).map((mock) => (
                    <button
                      key={mock.id}
                      onClick={() => loadMockData(mock.id)}
                      className="w-full bg-slate-100 hover:bg-emerald-100 p-4 rounded-lg text-left transition-all border-2 border-transparent hover:border-emerald-500"
                    >
                      <h3 className="font-bold text-slate-800">{mock.title}</h3>
                      <p className="text-sm text-slate-600">8 Questions • ~20 minutes</p>
                    </button>
                  ))
                ) : (
                  <p className="text-slate-600 text-center py-4">No mocks available</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // ===== RENDER: MIC CHECK =====
  if (screen === 'miccheck') {
    return (
      <div className="min-h-screen bg-slate-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">🎤 Microphone Test</h2>
          <p className="text-slate-600 mb-6">Read aloud and test your microphone</p>

          <div className="bg-sky-100 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-sky-900 italic">
              "Hello, this is a microphone test. If you can hear this message clearly, your microphone is working properly."
            </p>
          </div>

          <button
            onClick={() => {
              if (!micTestRecording) {
                startMicTestRecording()
              } else {
                stopMicTestRecording()
              }
            }}
            className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-4xl font-bold transition-all mb-4 ${micTestRecording
              ? 'bg-red-500 text-white scale-110'
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
          >
            {micTestRecording ? '⏹' : '🎙️'}
          </button>

          <p className="text-sm text-slate-600 mb-6">
            {micTestRecording ? 'Recording... Click to stop' : 'Click to record'}
          </p>

          {micTestAudio && (
            <button
              onClick={() => {
                const audio = new Audio(micTestAudio)
                audio.play()
              }}
              className="w-full bg-blue-500 text-white py-2 rounded-lg mb-4 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> Play Recording
            </button>
          )}

          <button
            onClick={() => {
              enterFullscreen()
              setMicPermissionGranted(true)
              setScreen('exam')
              setCurrentPart('1.1')
              setCurrentQuestion(0)
              setStage('idle')
            }}
            disabled={!micTestAudio}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-3 rounded-lg transition-all"
          >
            ✓ Start Exam
          </button>
        </div>
      </div>
    )
  }

  // ===== RENDER: EXAM SCREEN =====
  if (screen === 'exam' && mockData) {
    const q = getCurrentQuestion()
    if (!q) return null

    const progressPercent = totalTime ? ((totalTime - timeLeft) / totalTime) * 100 : 0

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 ">
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4 mt-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {['1.1', '1.2', '2', '3'].map(part => (
                <div
                  key={part}
                  className={`px-4 py-2 rounded-full font-bold text-sm ${part === currentPart
                    ? 'bg-emerald-500 text-white'
                    : ['1.1', '1.2', '2', '3'].indexOf(part) < ['1.1', '1.2', '2', '3'].indexOf(currentPart)
                      ? 'bg-green-300 text-white'
                      : 'bg-yellow-300 text-slate-800'
                    }`}
                >
                  {part}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold font-mono text-emerald-600 mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className="w-full bg-slate-300 rounded-full h-2 mb-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className={`text-sm font-bold ${stage === 'reading' ? 'text-blue-600' :
              stage === 'preparing' ? 'text-yellow-600' :
                stage === 'speaking' ? 'text-red-600' : ''
              }`}>
              {stage === 'reading' && '📖 Question is being read'}
              {stage === 'preparing' && '⏱️ Prepare your answer'}
              {stage === 'speaking' && '🎤 SPEAKING (Recording)'}
              {stage === 'idle' && '⏸️ Ready to begin'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Part {currentPart} - Question {q.id}
            </h2>

            <div className="mb-6">
              <p className="text-xl font-semibold text-slate-700 mb-4">{q.question_text}</p>

              {currentPart === '1.2' && q.images && q.images.length > 0 && (
                <div className="flex flex-col md:flex-row gap-4">
                  {q.images.map((img, idx) => (
                    img && (
                      <img
                        key={idx}
                        src={img}
                        alt={`image-${idx}`}
                        className="w-full justify-center md:w-1/2 rounded-lg object-contain"
                      />
                    )
                  ))}
                </div>

              )}

              {currentPart === '1.1' && q.image_url && (
                <img src={q.image_url} alt="Question" className="w-full h-64 object-cover rounded-lg mb-4" />
              )}

              {currentPart === '2' && q.bullets && q.bullets.length > 0 && (
                <ul className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4 space-y-2">
                  {q.bullets.map((b, idx) => (
                    <li key={idx} className="text-sm text-slate-700">• {b}</li>
                  ))}
                </ul>
              )}

              {currentPart === '3' && q.for_points && q.against_points && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 border-2 border-green-500 p-4 rounded-lg">
                    <h4 className="font-bold text-green-700 mb-2">FOR ✓</h4>
                    <ul className="text-sm text-slate-700 space-y-1">
                      {q.for_points.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-50 border-2 border-red-500 p-4 rounded-lg">
                    <h4 className="font-bold text-red-700 mb-2">AGAINST ✗</h4>
                    <ul className="text-sm text-slate-700 space-y-1">
                      {q.against_points.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== RENDER: RESULTS SCREEN =====
  if (screen === 'results') {
    // Show full loading screen while uploading
    if (uploading) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              <h3 className="text-xl font-bold text-slate-800">
                Your results are being received, please wait
              </h3>
            </div>
            <p className="text-slate-600 mb-8">(It can take up to 1 minute)</p>
            <div className="space-y-2">
              <p className="text-sm text-slate-500">• Uploading your recordings...</p>
              <p className="text-sm text-slate-500">• Processing your submission...</p>
              <p className="text-sm text-slate-500">• Sending to the backend...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-2">Exam Completed!</h2>
            <p className="text-slate-300 mb-2">Thank you for taking the CEFR Speaking Exam</p>
            <p className="text-slate-400 text-sm">
              Your performance has been recorded
            </p>
          </div>

          {/* AI Analysis Component - Premium Feature */}
          <div className="mb-8">
            <AISpeakingResults 
              recordings={recordings}
              mockData={mockData}
              isPremium={isPremium}
              currentPart={currentPart}
              onResultsGenerated={(report) => {
                console.log('AI Results Generated:', report)
              }}
            />
          </div>

          {/* Recordings Grid - 8 Audio Items */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Volume2 className="w-6 h-6 text-emerald-500" />
              Your Recordings (8 Questions)
            </h3>

            {Object.entries(recordings).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Part 1.1 - Questions 1-2 */}
                <div className="col-span-1">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 h-full">
                    <h4 className="font-bold text-blue-900 mb-3 text-sm">Part 1.1</h4>
                    <div className="space-y-3">
                      {[1, 2].map(qNum => {
                        const key = `q${qNum}`;
                        const url = recordings[key];
                        return (
                          <div key={key} className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="text-xs font-semibold text-slate-600 mb-2">Q{qNum}</p>
                            {url ? (
                              <audio controls className="w-full h-8 rounded">
                                <source src={url} type="audio/webm" />
                              </audio>
                            ) : (
                              <div className="bg-slate-200 h-8 rounded flex items-center justify-center">
                                <span className="text-xs text-slate-500">No recording</span>
                              </div>
                            )}
                            {url && (
                              <button
                                onClick={() => downloadRecording(key, url)}
                                className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 rounded flex items-center justify-center gap-1 transition"
                              >
                                <Download className="w-3 h-3" /> Download
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Part 1.2 - Questions 3-4 */}
                <div className="col-span-1">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 h-full">
                    <h4 className="font-bold text-purple-900 mb-3 text-sm">Part 1.2</h4>
                    <div className="space-y-3">
                      {[3, 4].map(qNum => {
                        const key = `q${qNum}`;
                        const url = recordings[key];
                        return (
                          <div key={key} className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="text-xs font-semibold text-slate-600 mb-2">Q{qNum}</p>
                            {url ? (
                              <audio controls className="w-full h-8 rounded">
                                <source src={url} type="audio/webm" />
                              </audio>
                            ) : (
                              <div className="bg-slate-200 h-8 rounded flex items-center justify-center">
                                <span className="text-xs text-slate-500">No recording</span>
                              </div>
                            )}
                            {url && (
                              <button
                                onClick={() => downloadRecording(key, url)}
                                className="mt-2 w-full bg-purple-500 hover:bg-purple-600 text-white text-xs py-1 rounded flex items-center justify-center gap-1 transition"
                              >
                                <Download className="w-3 h-3" /> Download
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Part 2 - Questions 5-6 */}
                <div className="col-span-1">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 h-full">
                    <h4 className="font-bold text-orange-900 mb-3 text-sm">Part 2</h4>
                    <div className="space-y-3">
                      {[5, 6].map(qNum => {
                        const key = `q${qNum}`;
                        const url = recordings[key];
                        return (
                          <div key={key} className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="text-xs font-semibold text-slate-600 mb-2">Q{qNum}</p>
                            {url ? (
                              <audio controls className="w-full h-8 rounded">
                                <source src={url} type="audio/webm" />
                              </audio>
                            ) : (
                              <div className="bg-slate-200 h-8 rounded flex items-center justify-center">
                                <span className="text-xs text-slate-500">No recording</span>
                              </div>
                            )}
                            {url && (
                              <button
                                onClick={() => downloadRecording(key, url)}
                                className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-1 rounded flex items-center justify-center gap-1 transition"
                              >
                                <Download className="w-3 h-3" /> Download
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Part 3 - Questions 7-8 */}
                <div className="col-span-1">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 h-full">
                    <h4 className="font-bold text-emerald-900 mb-3 text-sm">Part 3</h4>
                    <div className="space-y-3">
                      {[7, 8].map(qNum => {
                        const key = `q${qNum}`;
                        const url = recordings[key];
                        return (
                          <div key={key} className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="text-xs font-semibold text-slate-600 mb-2">Q{qNum}</p>
                            {url ? (
                              <audio controls className="w-full h-8 rounded">
                                <source src={url} type="audio/webm" />
                              </audio>
                            ) : (
                              <div className="bg-slate-200 h-8 rounded flex items-center justify-center">
                                <span className="text-xs text-slate-500">No recording</span>
                              </div>
                            )}
                            {url && (
                              <button
                                onClick={() => downloadRecording(key, url)}
                                className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs py-1 rounded flex items-center justify-center gap-1 transition"
                              >
                                <Download className="w-3 h-3" /> Download
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 rounded-lg p-8 text-center">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No recordings found</p>
              </div>
            )}

            {/* Summary Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4 pt-8 border-t">
              <div className="text-center">
                <p className="text-slate-600 text-sm mb-1">Total Questions</p>
                <p className="text-3xl font-bold text-slate-800">8</p>
              </div>
              <div className="text-center">
                <p className="text-slate-600 text-sm mb-1">Recorded</p>
                <p className="text-3xl font-bold text-emerald-600">{Object.keys(recordings).length}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-600 text-sm mb-1">Completion</p>
                <p className="text-3xl font-bold text-blue-600">
                  {Object.keys(recordings).length > 0 ? Math.round((Object.keys(recordings).length / 8) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center max-w-2xl mx-auto">
            <button
              onClick={() => {
                setScreen('rules')
                setRecordings({})
                setSelectedMockId(null)
                setMockData(null)
                recordedBlobsRef.current = {}
              }}
              disabled={uploading}
              className="flex-1 bg-slate-500 hover:bg-slate-600 disabled:bg-slate-400 text-white font-bold py-3 rounded-lg transition-all"
            >
              Back to Mocks
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              disabled={uploading}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }
  return null
}