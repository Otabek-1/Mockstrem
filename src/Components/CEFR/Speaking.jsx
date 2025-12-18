import React, { useState, useRef, useEffect } from 'react'
import { Mic, Play, Volume2, CheckCircle, Clock, AlertCircle, Download, Settings, BookOpen, Upload } from 'lucide-react'
import api from '../../api'

export default function CERFSpeakingExam() {
  // ===== STATES =====
  const [screen, setScreen] = useState('rules')
  const [currentPart, setCurrentPart] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [mockData, setMockData] = useState(null)
  const [selectedMockId, setSelectedMockId] = useState(null)
  const [mocks, setMocks] = useState([])

  // Timing states
  const [stage, setStage] = useState('idle')
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalTime, setTotalTime] = useState(0)

  // Recording states
  const recordedBlobsRef = useRef({});
  const [recordings, setRecordings] = useState({});
  const [uploading, setUploading] = useState(false)

  // Microphone states
  const [micTestRecording, setMicTestRecording] = useState(false)
  const [micTestAudio, setMicTestAudio] = useState(null)
  const [micPermissionGranted, setMicPermissionGranted] = useState(false)

  // UI states
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Refs
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const audioChunksRef = useRef([])
  const micTestRecorderRef = useRef(null)
  const micTestStreamRef = useRef(null)
  const micTestAudioChunksRef = useRef([])

  // ===== FETCH MOCKS =====
  useEffect(() => {
    const fetchMocks = async () => {
      try {
        setLoading(true)
        const response = await api.get('/mock/speaking/all')
        setMocks(response.data)
      } catch (err) {
        setError('Failed to load mocks')
        console.error(err)
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
      setLoading(true);
      const response = await api.get(`/mock/speaking/mock/${mockId}`);
      setMockData(response.data.questions.questions);
      setSelectedMockId(mockId);
    } catch (err) {
      setError('Failed to load mock');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ===== SOUND EFFECTS =====
  const playBeep = (frequency = 440, duration = 100) => {
    if (!soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, duration);
    } catch (e) {
      console.log('Sound effect not supported:', e);
    }
  }

  const playLongBeep = () => {
    if (!soundEnabled) return;
    playBeep(523, 500);
  }

  const playStartSound = () => {
    if (!soundEnabled) return;
    playBeep(659, 300);
  }

  // ===== HELPER FUNCTIONS =====
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  // ===== gTTS TEXT-TO-SPEECH =====
  const speakTextWithGTTS = async (text, language = 'en') => {
    try {
      const encodedText = encodeURIComponent(text);
      const audioUrl = `https://gtts.vercel.app/api/speak?text=${encodedText}&lang=${language}`;

      const audio = new Audio(audioUrl);

      return new Promise((resolve) => {
        audio.onended = resolve;
        audio.onerror = () => {
          console.error('gTTS error, falling back to native TTS');
          speakTextNative(text).then(resolve);
        };
        audio.play();
      });
    } catch (e) {
      console.error('gTTS Error:', e);
      return speakTextNative(text);
    }
  }

  const speakTextNative = async (text) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      return new Promise(resolve => {
        utterance.onend = resolve;
        speechSynthesis.speak(utterance);
      });
    } catch (e) {
      console.error('TTS Error:', e);
    }
  }

  // ===== UPLOAD AUDIO TO S3 =====
  const uploadAudioToS3 = async (blob, questionId) => {
    try {
      const formData = new FormData()
      formData.append('file', blob, `q${questionId}.webm`)
      formData.append('question_id', questionId)

      const response = await api.post('/upload/audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      return response.data.url
    } catch (err) {
      console.error('Upload error:', err)
      return null
    }
  }

  // ===== RECORDING FUNCTIONS =====
  const startRecording = async (questionId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const tryMimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ];

      let mimeType = '';
      let mediaRecorder;

      for (const type of tryMimeTypes) {
        if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          mediaRecorder = new MediaRecorder(stream, { mimeType });
          break;
        }
      }

      if (!mediaRecorder) {
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: mimeType || 'audio/webm'
        });

        // ✅ Saqlash: faqat blob, URL emas
        recordedBlobsRef.current[`q${questionId}`] = blob;

        // Optional: preview uchun URL yaratish
        const localUrl = URL.createObjectURL(blob);
        setRecordings(prev => ({
          ...prev,
          [`q${questionId}`]: localUrl
        }));

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.onerror = (e) => {
        console.error('Recording error:', e);
      };

      mediaRecorder.start();

    } catch (error) {
      console.error('Microphone error:', error);
      alert('Microphone access required! Please allow microphone permissions.');
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }

  // ===== MIC TEST FUNCTIONS =====
  const startMicTestRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micTestStreamRef.current = stream;
      micTestAudioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      micTestRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          micTestAudioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(micTestAudioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setMicTestAudio(url);

        if (micTestStreamRef.current) {
          micTestStreamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setMicTestRecording(true);
    } catch (error) {
      console.error('Mic test error:', error);
      alert('Microphone access required for testing!');
    }
  }

  const stopMicTestRecording = () => {
    if (micTestRecorderRef.current) {
      micTestRecorderRef.current.stop();
      setMicTestRecording(false);
    }
  }

  // ===== TIMER EFFECT =====
  useEffect(() => {
    if (timeLeft <= 0 || stage === 'idle') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);

          if (stage === 'reading') {
            setStage('preparing');
            const q = getCurrentQuestion();
            setTimeLeft(q.prep_time);
            setTotalTime(q.prep_time);
            playStartSound();
          } else if (stage === 'preparing') {
            setStage('speaking');
            const q = getCurrentQuestion();
            setTimeLeft(q.speak_time);
            setTotalTime(q.speak_time);
            playStartSound();

            startRecording(q.id);
          } else if (stage === 'speaking') {
            stopRecording();
            playLongBeep();
            moveToNext();
          }
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, stage, currentPart, currentQuestion]);

  // ===== GET CURRENT QUESTION =====
  const getCurrentQuestion = () => {
    if (!mockData || !currentPart || !mockData[currentPart]) return null;

    const questions = mockData[currentPart];
    if (currentQuestion < 0 || currentQuestion >= questions.length) return null;

    return questions[currentQuestion];
  };

  const moveToNext = () => {
    if (!mockData) return;

    const parts = ['1.1', '1.2', '2', '3'];
    const currentIdx = parts.indexOf(currentPart);
    if (currentIdx === -1) return;

    const questionsInPart = mockData[currentPart]?.length || 0;

    if (currentQuestion < questionsInPart - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setStage('idle');
    } else if (currentIdx < parts.length - 1) {
      const nextPart = parts[currentIdx + 1];
      setCurrentPart(nextPart);
      setCurrentQuestion(0);
      setStage('idle');
    } else {
      submitExam();
    }
  };

  const startQuestion = async () => {
    const q = getCurrentQuestion();
    if (!q) return;

    setStage('reading');
    setTimeLeft(5);
    setTotalTime(5);

    await speakTextWithGTTS(q.question_text, 'en');

    setStage('preparing');
    setTimeLeft(q.prep_time);
    setTotalTime(q.prep_time);
  }

  useEffect(() => {
    if (screen === 'exam' && stage === 'idle' && currentPart && currentQuestion >= 0 && mockData) {
      startQuestion();
    }
  }, [screen, currentPart, currentQuestion, mockData]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (micTestStreamRef.current) {
        micTestStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);


  // ===== DEV SHORTCUT: Ctrl+Alt+P ➜ next or submit =====
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Alt+P yoki Cmd+Option+P
      if (
        (e.ctrlKey || e.metaKey) &&
        e.altKey &&
        (e.key === 'p' || e.key === 'P')
      ) {
        e.preventDefault();
        if (screen === 'exam' && mockData) {
          if (stage === 'speaking') {
            // Agar hozir recording davom etayotgan bo'lsa, to'xtatish
            stopRecording();
            playLongBeep();
            setTimeout(() => moveToNext(), 100);
          } else if (stage === 'idle' || stage === 'reading' || stage === 'preparing') {
            // Darhol keyingisiga o'tish
            moveToNext();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [screen, stage, currentPart, currentQuestion, mockData]);

  // ===== SUBMIT EXAM =====
  const submitExam = async () => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("mock_id", selectedMockId);
      let total = 0;
      ['1.1', '1.2', '2', '3'].forEach(part => {
        mockData[part]?.forEach(q => {
          total += (q.prep_time || 0) + (q.speak_time || 0);
        });
      });
      formData.append("total_duration", total);

      // ✅ Barcha blob’larni qo'shish
      Object.entries(recordedBlobsRef.current).forEach(([key, blob]) => {
        formData.append("audios", blob, `${key}.webm`);
      });

      const response = await api.post('/mock/speaking/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setScreen('results');
    } catch (err) {
      setError('Failed to submit exam');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // ===== DOWNLOAD RECORDING =====
  const downloadRecording = (key, url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `question_${key.replace('q', '')}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                {mocks.map((mock) => (
                  <button
                    key={mock.id}
                    onClick={() => {
                      loadMockData(mock.id);
                    }}
                    className="w-full bg-slate-100 hover:bg-emerald-100 p-4 rounded-lg text-left transition-all border-2 border-transparent hover:border-emerald-500"
                  >
                    <h3 className="font-bold text-slate-800">{mock.title}</h3>
                    <p className="text-sm text-slate-600">8 Questions • ~20 minutes</p>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setScreen('miccheck')}
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-3 rounded-lg transition-all"
              >
                🔊 Test Microphone
              </button>
            </>
          )}
        </div>
      </div>
    );
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
                startMicTestRecording();
              } else {
                stopMicTestRecording();
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
                const audio = new Audio(micTestAudio);
                audio.play();
              }}
              className="w-full bg-blue-500 text-white py-2 rounded-lg mb-4 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> Play Recording
            </button>
          )}

          <button
            onClick={() => {
              setMicPermissionGranted(true);
              setScreen('exam');
              setCurrentPart('1.1');
              setCurrentQuestion(0);
              setStage('idle');
            }}
            disabled={!micTestAudio}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-3 rounded-lg transition-all"
          >
            ✓ Start Exam
          </button>
        </div>
      </div>
    );
  }

  // ===== RENDER: EXAM SCREEN =====
  if (screen === 'exam' && mockData) {
    const q = getCurrentQuestion();
    if (!q) return null;

    const progressPercent = totalTime ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
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

              {currentPart === '1.2' && q.images && (
                <div className="flex gap-4 mb-4">
                  {q.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Image ${idx + 1}`} className="w-1/2 h-40 object-cover rounded-lg" />
                  ))}
                </div>
              )}

              {currentPart === '1.1' && q.image_url && (
                <img src={q.image_url} alt="Question" className="w-full h-64 object-cover rounded-lg mb-4" />
              )}

              {currentPart === '2' && q.bullets && (
                <ul className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4 space-y-2">
                  {q.bullets.map((b, idx) => (
                    <li key={idx} className="text-sm text-slate-700">• {b}</li>
                  ))}
                </ul>
              )}

              {currentPart === '3' && q.for_points && (
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
    );
  }

  // ===== RENDER: RESULTS SCREEN =====
  if (screen === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Exam Completed!</h2>
          <p className="text-slate-600 mb-2">Thank you for taking the CEFR Speaking Exam</p>
          <p className="text-slate-500 text-sm mb-8">
            {uploading ? 'Uploading your recordings...' : 'Your performance has been recorded'}
          </p>

          {uploading && (
            <div className="bg-blue-50 border border-blue-400 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 justify-center">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-blue-700">Processing your submission...</span>
              </div>
            </div>
          )}

          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-emerald-900 mb-4">📊 Your Recordings</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {Object.entries(recordings).length > 0 ? (
                Object.entries(recordings).map(([key, url]) => (
                  <div key={key} className="bg-white p-3 rounded-lg flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Question {key.replace('q', '')}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const audio = new Audio(url);
                          audio.play();
                        }}
                        className="bg-emerald-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" /> Play
                      </button>
                      <button
                        onClick={() => downloadRecording(key, url)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-600">No recordings yet</p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setScreen('rules');
                setRecordings({});
                setSelectedMockId(null);
                setMockData(null);
              }}
              disabled={uploading}
              className="flex-1 bg-slate-300 hover:bg-slate-400 disabled:bg-slate-300 text-slate-800 font-bold py-3 rounded-lg transition-all"
            >
              Back to Mocks
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}