import React, { useState, useRef, useEffect } from 'react'
import { Mic, Play, Volume2, CheckCircle, Clock, AlertCircle, Download, Settings, BookOpen } from 'lucide-react'

export default function CERFSpeakingExam() {
  // ===== STATES =====
  const [screen, setScreen] = useState('rules') // rules, miccheck, exam, results
  const [currentPart, setCurrentPart] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  
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
  
  // Refs
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const audioChunksRef = useRef([])
  const micTestRecorderRef = useRef(null)
  const micTestStreamRef = useRef(null)
  const micTestAudioChunksRef = useRef([])
  const currentQuestionRef = useRef(0)
  const currentPartRef = useRef(null)

  // ===== QUESTION DATA =====
  const questionsData = {
    '1.1': [
      {
        id: 1,
        question: "What kind of clothes do you like to wear?",
        prep: 5,
        speak: 30,
        image: "https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?w=500&h=300&fit=crop"
      },
      {
        id: 2,
        question: "Can you describe a meal you can cook?",
        prep: 5,
        speak: 30,
        image: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=300&fit=crop"
      },
      {
        id: 3,
        question: "Tell me about a TV show you enjoy",
        prep: 5,
        speak: 30,
        image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=300&fit=crop"
      }
    ],
    '1.2': [
      {
        id: 4,
        question: "What do you see in these pictures?",
        prep: 10,
        speak: 45,
        images: [
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
          "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=300&h=300&fit=crop"
        ]
      },
      {
        id: 5,
        question: "What are the benefits of spending time in nature?",
        prep: 5,
        speak: 30,
        images: [
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop",
          "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=300&h=300&fit=crop"
        ]
      },
      {
        id: 6,
        question: "Why do some people prefer living in a big city instead of the countryside?",
        prep: 5,
        speak: 30,
        images: [
          "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=300&h=300&fit=crop",
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop"
        ]
      }
    ],
    '2': [
      {
        id: 7,
        question: "Discuss: Curiosity in Learning",
        bullets: [
          "Share a time when your curiosity led you to discover something valuable",
          "How has curiosity influenced your personal or professional growth?",
          "In what ways does curiosity drive innovation and progress in society?"
        ],
        prep: 60,
        speak: 120
      }
    ],
    '3': [
      {
        id: 8,
        question: "University Degrees Are No Longer Necessary for a Successful Career",
        for: [
          "Many successful entrepreneurs never completed university",
          "Online courses and self-learning provide alternatives",
          "Some industries prioritize skills over formal qualifications"
        ],
        against: [
          "A degree often increases job opportunities and pay",
          "Some professions require formal education",
          "University offers important networking"
        ],
        prep: 60,
        speak: 120
      }
    ]
  }

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

  const speakText = async (text) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      return new Promise(resolve => {
        utterance.onend = resolve
        speechSynthesis.speak(utterance)
      })
    } catch (e) {
      console.error('TTS Error:', e)
    }
  }

  // ===== RECORDING FUNCTIONS - FIXED LOGIC =====
  const startRecording = async (questionId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      // Try to use optimal MIME type
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
      
      // Fallback if no optimal type found
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
        // Create blob from all collected chunks
        const blob = new Blob(audioChunksRef.current, { 
          type: mimeType || 'audio/webm' 
        });
        const url = URL.createObjectURL(blob);
        
        // Save recording with proper question ID
        setRecordings(prev => ({
          ...prev,
          [`q${questionId}`]: url
        }));
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.onerror = (e) => {
        console.error('Recording error:', e);
      };

      // Start recording with timeslice to collect chunks every 100ms
      // This ensures audio data is captured continuously
      mediaRecorder.start(100);
      
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

      // Start recording with timeslice to collect chunks every 100ms
      mediaRecorder.start(100);
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
            const q = questionsData[currentPart][currentQuestion];
            setTimeLeft(q.prep);
            setTotalTime(q.prep);
            playStartSound();
          } else if (stage === 'preparing') {
            setStage('speaking');
            const q = questionsData[currentPart][currentQuestion];
            setTimeLeft(q.speak);
            setTotalTime(q.speak);
            playStartSound();
            
            // Start recording with the actual question ID
            startRecording(q.id);
          } else if (stage === 'speaking') {
            stopRecording();
            playLongBeep();
            moveToNext();
          }
          return 0;
        }
        
        if (prev <= 5 && stage === 'speaking') {
          playBeep(440, 100);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, stage, currentPart, currentQuestion]);

  const moveToNext = () => {
    const parts = ['1.1', '1.2', '2', '3'];
    const currentIdx = parts.indexOf(currentPart);
    const questionsInPart = questionsData[currentPart].length;

    if (currentQuestion < questionsInPart - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setStage('idle');
    } else if (currentIdx < parts.length - 1) {
      const nextPart = parts[currentIdx + 1];
      setCurrentPart(nextPart);
      setCurrentQuestion(0);
      setStage('idle');
    } else {
      setScreen('results');
    }
  }

  const startQuestion = async () => {
    const q = questionsData[currentPart][currentQuestion];
    setStage('reading');
    setTimeLeft(5);
    setTotalTime(5);
    
    await speakText(q.question);
    
    setStage('preparing');
    setTimeLeft(q.prep);
    setTotalTime(q.prep);
  }

  // Auto-start first question when entering exam screen
  useEffect(() => {
    if (screen === 'exam' && stage === 'idle' && currentPart && currentQuestion >= 0) {
      startQuestion();
    }
  }, [screen, currentPart, currentQuestion]);

  // Cleanup on unmount
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

  // ===== DOWNLOAD INDIVIDUAL RECORDINGS =====
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
            <p className="text-slate-600 text-sm mt-2">Rules & Guidelines</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Exam Rules</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 8 Questions across 3 parts</li>
                <li>• Total time: ~15-20 minutes</li>
                <li>• Microphone required</li>
                <li>• All answers recorded automatically</li>
                <li>• No breaks between questions</li>
                <li>• Speak clearly into your microphone</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Ensure your microphone works before starting</li>
                <li>• Test your equipment in quiet environment</li>
                <li>• Do not pause during speaking time</li>
                <li>• Your recordings will be saved for review</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setScreen('miccheck')}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-all"
            >
              🔊 Test Microphone
            </button>
            <button
              onClick={() => {
                if (micPermissionGranted) {
                  setScreen('exam');
                  setCurrentPart('1.1');
                  setCurrentQuestion(0);
                  setStage('idle');
                } else {
                  alert('Please test your microphone first');
                }
              }}
              disabled={!micPermissionGranted}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white font-bold py-3 rounded-lg transition-all"
            >
              🚀 Start Exam
            </button>
          </div>
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
            className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-4xl font-bold transition-all mb-4 ${
              micTestRecording
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
  if (screen === 'exam') {
    const q = questionsData[currentPart]?.[currentQuestion];
    if (!q) return null;

    const progressPercent = totalTime ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        {/* TOP BAR */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              {['1.1', '1.2', '2', '3'].map(part => (
                <div
                  key={part}
                  className={`px-4 py-2 rounded-full font-bold text-sm ${
                    part === currentPart
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

          {/* TIMER */}
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
            <div className={`text-sm font-bold ${
              stage === 'reading' ? 'text-blue-600' :
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

        {/* MAIN CONTENT */}
        <div className="flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Part {currentPart} - Question {q.id}
            </h2>

            <div className="mb-6">
              <p className="text-xl font-semibold text-slate-700 mb-4">{q.question}</p>

              {/* Show images only for Part 1.2 (multiple images) */}
              {currentPart === '1.2' && q.images && (
                <div className="flex gap-4 mb-4">
                  {q.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Image ${idx + 1}`} className="w-1/2 h-40 object-cover rounded-lg" />
                  ))}
                </div>
              )}

              {/* Show bullet points only for Part 2 */}
              {currentPart === '2' && q.bullets && (
                <ul className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4 space-y-2">
                  {q.bullets.map((b, idx) => (
                    <li key={idx} className="text-sm text-slate-700">• {b}</li>
                  ))}
                </ul>
              )}

              {/* Show FOR/AGAINST for Part 3 */}
              {currentPart === '3' && q.for && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 border-2 border-green-500 p-4 rounded-lg">
                    <h4 className="font-bold text-green-700 mb-2">FOR ✓</h4>
                    <ul className="text-sm text-slate-700 space-y-1">
                      {q.for.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-50 border-2 border-red-500 p-4 rounded-lg">
                    <h4 className="font-bold text-red-700 mb-2">AGAINST ✗</h4>
                    <ul className="text-sm text-slate-700 space-y-1">
                      {q.against.map((item, idx) => (
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
          <p className="text-slate-500 text-sm mb-8">Your performance has been recorded</p>

          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-emerald-900 mb-4">📊 Your Recordings</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {Object.entries(recordings).map(([key, url]) => (
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
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setScreen('rules');
                setRecordings({});
              }}
              className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold py-3 rounded-lg transition-all"
            >
              Back to Mocks
            </button>
            <button
              onClick={() => {
                if (Object.keys(recordings).length > 0) {
                  alert('Download individual recordings using the buttons above');
                } else {
                  alert('No recordings to download');
                }
              }}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download All
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
