import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlarmClock, CircleCheckBig, Mic, Pause, Play, SendHorizontal, Volume2 } from "lucide-react";
import JSZip from "jszip";
import api from "../../api";
import {
  evaluateIeltsSpeakingWithGemini,
  evaluateIeltsWritingWithGemini,
  transcribeAudioWithGemini,
} from "../../services/geminiService";

const MODULE_COLORS = {
  reading: "from-sky-700 to-cyan-600",
  listening: "from-emerald-700 to-teal-600",
  writing: "from-orange-700 to-amber-600",
  speaking: "from-fuchsia-700 to-pink-600",
};

const MODULE_TOTAL_SECONDS = {
  reading: 60 * 60,
  listening: 40 * 60,
  writing: 60 * 60,
  speaking: 14 * 60,
};

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.max(0, totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function parsePremiumExpiry(rawValue) {
  if (rawValue === null || rawValue === undefined || rawValue === "") return null;
  if (rawValue instanceof Date) return Number.isNaN(rawValue.getTime()) ? null : rawValue;

  if (typeof rawValue === "number") {
    const ms = rawValue < 1000000000000 ? rawValue * 1000 : rawValue;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof rawValue === "string") {
    const trimmed = rawValue.trim();
    if (!trimmed) return null;

    if (/^\d+$/.test(trimmed)) {
      const num = Number(trimmed);
      const ms = num < 1000000000000 ? num * 1000 : num;
      const date = new Date(ms);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function safeQuestions(section) {
  const raw = section?.content?.questions;
  if (Array.isArray(raw) && raw.length > 0) return raw;

  const key = Array.isArray(section?.answer_key) ? section.answer_key : [];
  return key.map((_, index) => ({ prompt: `Question ${index + 1}` }));
}

function normalizeQuestion(item, index) {
  if (typeof item === "string") return { prompt: item, options: [], type: "text", idx: index };
  return {
    prompt: item?.prompt || `Question ${index + 1}`,
    options: Array.isArray(item?.options) ? item.options : [],
    type: item?.type || (Array.isArray(item?.options) && item.options.length > 0 ? "choice" : "text"),
    idx: index,
  };
}

export default function IeltsExamCDI() {
  const { module, id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  const [test, setTest] = useState(null);
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MODULE_TOTAL_SECONDS[module] || 3600);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const [aiChecking, setAiChecking] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [activeRecordingIndex, setActiveRecordingIndex] = useState(null);
  const [clips, setClips] = useState({});
  const [clipBlobs, setClipBlobs] = useState({});
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsMap, setTtsMap] = useState({});
  const [playingPromptIndex, setPlayingPromptIndex] = useState(null);
  const [selectedListeningAudio, setSelectedListeningAudio] = useState(0);

  const gradient = MODULE_COLORS[module] || MODULE_COLORS.reading;

  const questions = useMemo(() => safeQuestions(section).map(normalizeQuestion), [section]);
  const writingTasks = useMemo(() => {
    if (!section?.content?.tasks || !Array.isArray(section.content.tasks)) return [];
    return section.content.tasks;
  }, [section]);
  const speakingPrompts = useMemo(() => {
    if (!section?.content?.stages || !Array.isArray(section.content.stages)) return [];
    return section.content.stages;
  }, [section]);
  const listeningAudioParts = useMemo(() => {
    if (module !== "listening" || !section?.content) return [];

    const parts = [];
    if (Array.isArray(section.content.audio_parts)) {
      section.content.audio_parts.forEach((item, idx) => {
        if (item?.url) {
          parts.push({
            title: item.title || `Part ${idx + 1}`,
            url: item.url,
          });
        }
      });
    }

    if (parts.length === 0 && section.content.audio_url) {
      parts.push({ title: "Main Audio", url: section.content.audio_url });
    }

    return parts;
  }, [module, section]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [testRes, userRes] = await Promise.all([api.get(`/ielts/tests/${id}`), api.get("/user/me")]);
        const incomingTest = testRes.data?.test;
        const targetSection = incomingTest?.sections?.find((item) => item.module === module);

        if (!incomingTest || !targetSection) {
          setError("Kerakli IELTS section topilmadi.");
          return;
        }

        const userData = userRes.data;
        setUser(userData);
        const premiumUntil = parsePremiumExpiry(userData?.premium_duration);
        setIsPremium(Boolean(premiumUntil && premiumUntil.getTime() > Date.now()));

        setTest(incomingTest);
        setSection(targetSection);

        if (module === "writing") {
          const taskCount = Array.isArray(targetSection?.content?.tasks) ? targetSection.content.tasks.length : 2;
          setAnswers(Array(taskCount).fill(""));
        } else if (module === "speaking") {
          const promptCount = Array.isArray(targetSection?.content?.stages) ? targetSection.content.stages.length : 3;
          setAnswers(Array(promptCount).fill(""));
        } else {
          setAnswers(Array(safeQuestions(targetSection).length).fill(""));
        }

        if (module === "listening") {
          setSelectedListeningAudio(0);
        }

        const sectionSeconds = Math.max(1, Number(targetSection.duration_minutes || 0)) * 60;
        setTimeLeft(sectionSeconds || MODULE_TOTAL_SECONDS[module] || 3600);
      } catch (e) {
        setError("IELTS exam ma'lumotini yuklashda xatolik bo'ldi.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, module]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      Object.values(ttsMap).forEach((url) => {
        if (typeof url === "string" && url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
      Object.values(clips).forEach((url) => {
        if (typeof url === "string" && url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (module !== "speaking" || !section || speakingPrompts.length === 0) return;

    const preloadTts = async () => {
      try {
        setTtsLoading(true);
        const payload = {};
        speakingPrompts.forEach((prompt, idx) => {
          payload[`p${idx + 1}`] = prompt?.prompt || `Part ${idx + 1} prompt`;
        });

        const res = await api.post("/tts/audio", payload, { responseType: "blob" });
        const zip = await JSZip.loadAsync(res.data);

        const map = {};
        for (const fileName of Object.keys(zip.files)) {
          const fileBlob = await zip.files[fileName].async("blob");
          const key = fileName.replace(".mp3", "");
          map[key] = URL.createObjectURL(fileBlob);
        }
        setTtsMap(map);
      } catch {
        setTtsMap({});
      } finally {
        setTtsLoading(false);
      }
    };

    preloadTts();
  }, [module, section, speakingPrompts]);

  useEffect(() => {
    if (!started || result || loading) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, result, loading]);

  useEffect(() => {
    if (timeLeft === 0 && started && !result && !submitting) {
      handleSubmit();
    }
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  const setAnswer = (index, value) => {
    setAnswers((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const playSpeakingPrompt = async (index) => {
    const key = `p${index + 1}`;
    const url = ttsMap[key];
    if (!url) return;

    try {
      setPlayingPromptIndex(index);
      const audio = new Audio(url);
      await audio.play();
      await new Promise((resolve) => {
        audio.onended = resolve;
        audio.onerror = resolve;
      });
    } catch {
      // ignore playback errors
    } finally {
      setPlayingPromptIndex(null);
    }
  };

  const toggleRecord = async (index) => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        chunksRef.current = [];

        const recorder = new MediaRecorder(stream);
        recorderRef.current = recorder;
        setActiveRecordingIndex(index);

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          setClips((prev) => ({ ...prev, [index]: url }));
          setClipBlobs((prev) => ({ ...prev, [index]: blob }));
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
        };

        recorder.start();
        setIsRecording(true);
      } catch {
        alert("Mikrofon ruxsati kerak.");
      }
      return;
    }

    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setIsRecording(false);
    setActiveRecordingIndex(null);
  };

  const runPremiumAiCheck = async () => {
    if (!isPremium) return {};

    try {
      setAiChecking(true);
      setAiError("");
      let data = null;

      if (module === "writing") {
        data = await evaluateIeltsWritingWithGemini({
          testTitle: test?.title,
          task1Prompt: writingTasks[0]?.prompt || "",
          task2Prompt: writingTasks[1]?.prompt || "",
          task1Answer: answers[0] || "",
          task2Answer: answers[1] || "",
        });
      } else if (module === "speaking") {
        const prompts = speakingPrompts.map((item) => item?.prompt || "");
        const transcriptions = [];
        for (let i = 0; i < prompts.length; i += 1) {
          const blob = clipBlobs[i];
          if (blob) {
            const transcript = await transcribeAudioWithGemini(blob, blob.type || "audio/webm");
            transcriptions.push(transcript || answers[i] || "");
          } else {
            transcriptions.push(answers[i] || "");
          }
        }

        data = await evaluateIeltsSpeakingWithGemini({
          testTitle: test?.title,
          prompts,
          transcriptions,
        });
      }

      setAiResult(data);
      return data ? { ai_feedback: data } : {};
    } catch (e) {
      setAiError("AI analysis ishlamadi. Submission saqlandi.");
      return {};
    } finally {
      setAiChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (submitting || result) return;

    try {
      setSubmitting(true);
      const extra = await runPremiumAiCheck();
      const response = await api.post(`/ielts/tests/${id}/submit/${module}`, {
        answers,
        time_spent_seconds: Math.max(0, (section?.duration_minutes || 0) * 60 - timeLeft),
        ...extra,
      });
      setResult(response.data);
    } catch {
      alert("Natijani yuborishda xatolik bo'ldi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Loading IELTS CDI...</div>;
  }

  if (error || !section) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow p-6 max-w-xl">
          <p className="text-red-600 font-semibold">{error || "Section topilmadi"}</p>
          <button onClick={() => navigate("/dashboard")} className="mt-4 px-4 py-2 rounded bg-slate-900 text-white">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-5">
            <CircleCheckBig className="text-emerald-400" />
            <h2 className="text-2xl font-bold">Submission Completed</h2>
          </div>
          <p className="text-slate-300">{test?.title} - {module?.toUpperCase()}</p>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-xs text-slate-400">Score</p>
              <p className="text-2xl font-bold">{result.score ?? "Pending"}{result.max_score ? ` / ${result.max_score}` : ""}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-xs text-slate-400">Band</p>
              <p className="text-2xl font-bold">{result.band || "Pending"}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-xs text-slate-400">Submission ID</p>
              <p className="text-2xl font-bold">#{result.submission_id}</p>
            </div>
          </div>

          {isPremium && aiResult && (
            <div className="mt-6 bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="font-semibold text-white mb-2">Premium AI Evaluation</p>
              <pre className="text-xs text-slate-200 whitespace-pre-wrap">{JSON.stringify(aiResult, null, 2)}</pre>
            </div>
          )}

          {aiError && <p className="text-amber-400 mt-4 text-sm">{aiError}</p>}

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2 rounded-lg bg-white text-slate-900 font-semibold"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate(0)}
              className="px-5 py-2 rounded-lg border border-slate-600"
            >
              Retake
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200">
      <header className={`sticky top-0 z-40 bg-gradient-to-r ${gradient} text-white shadow-xl`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/80">IELTS CDI</p>
            <h1 className="text-xl font-bold">{test.title} - {section.title}</h1>
            <p className="text-[11px] text-white/80 mt-1">{isPremium ? "Premium AI enabled" : "Basic mode"}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${timeLeft <= 300 ? "bg-red-500/90 animate-pulse" : "bg-white/20"}`}>
              <AlarmClock size={16} />
              <span className="font-semibold">{formatTime(timeLeft)}</span>
            </div>
            {!started ? (
              <button onClick={() => setStarted(true)} className="px-4 py-2 bg-white text-slate-900 rounded-lg font-semibold">
                Start
              </button>
            ) : (
              <button
                disabled={submitting || aiChecking}
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-black/30 hover:bg-black/40 flex items-center gap-2 disabled:opacity-60"
              >
                <SendHorizontal size={16} /> {submitting || aiChecking ? "Processing..." : "Submit"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-5 pb-24">
        {!started && (
          <div className="bg-white rounded-2xl p-6 shadow border border-slate-200 mb-5">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Exam Rules</h2>
            <p className="text-slate-600">{section.instructions || "Section bo'yicha tartibni o'qing va Start bosib boshlang."}</p>
          </div>
        )}

        {started && module !== "writing" && module !== "speaking" && (
          <div className="space-y-4">
            {module === "listening" && listeningAudioParts.length > 0 && (
              <article className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <p className="font-semibold text-slate-800">Listening Audio</p>
                  {listeningAudioParts.length > 1 && (
                    <select
                      value={selectedListeningAudio}
                      onChange={(e) => setSelectedListeningAudio(Number(e.target.value))}
                      className="border border-slate-300 rounded-lg px-2 py-1 text-sm"
                    >
                      {listeningAudioParts.map((item, idx) => (
                        <option key={`${item.title}-${idx}`} value={idx}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <audio
                  controls
                  preload="metadata"
                  className="w-full"
                  src={listeningAudioParts[selectedListeningAudio]?.url}
                />
                <p className="mt-2 text-xs text-slate-500 break-all">
                  Source: {listeningAudioParts[selectedListeningAudio]?.url}
                </p>
              </article>
            )}
            {questions.map((question, idx) => (
              <article key={`${question.idx}-${idx}`} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <p className="font-semibold text-slate-800">{idx + 1}. {question.prompt}</p>
                {question.options.length > 0 ? (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {question.options.map((option, optionIdx) => {
                      const optionLabel = typeof option === "string" ? option : option?.label || option?.value || `Option ${optionIdx + 1}`;
                      const optionValue = typeof option === "string" ? option : option?.value || optionLabel;
                      return (
                        <label key={`${idx}-${optionIdx}`} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
                          <input
                            type="radio"
                            name={`q-${idx}`}
                            checked={answers[idx] === optionValue}
                            onChange={() => setAnswer(idx, optionValue)}
                          />
                          <span className="text-sm text-slate-700">{optionLabel}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    value={answers[idx] || ""}
                    onChange={(e) => setAnswer(idx, e.target.value)}
                    className="mt-3 w-full rounded-lg border border-slate-300 p-2"
                    placeholder="Type your answer"
                  />
                )}
              </article>
            ))}
          </div>
        )}

        {started && module === "writing" && (
          <div className="space-y-5">
            {writingTasks.map((task, idx) => (
              <article key={`task-${idx}`} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-800">Task {idx + 1}</h3>
                  <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">Min {task?.min_words || 150} words</span>
                </div>
                <p className="text-slate-700 mb-3">{task?.prompt || "Task prompt"}</p>
                <textarea
                  value={answers[idx] || ""}
                  onChange={(e) => setAnswer(idx, e.target.value)}
                  className="w-full min-h-48 rounded-lg border border-slate-300 p-3"
                  placeholder="Write your response..."
                />
                <p className="text-xs text-slate-500 mt-2">Word count: {(answers[idx] || "").trim().split(/\s+/).filter(Boolean).length}</p>
              </article>
            ))}
          </div>
        )}

        {started && module === "speaking" && (
          <div className="space-y-5">
            {speakingPrompts.map((stage, idx) => (
              <article key={`stage-${idx}`} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-slate-800">Part {idx + 1}</h3>
                  <button
                    type="button"
                    onClick={() => playSpeakingPrompt(idx)}
                    disabled={ttsLoading || !ttsMap[`p${idx + 1}`] || playingPromptIndex === idx}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Volume2 size={14} />
                    {playingPromptIndex === idx ? "Playing..." : "Play Prompt"}
                  </button>
                </div>

                <p className="text-slate-700 mt-2">{stage?.prompt || "Speaking prompt"}</p>
                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => toggleRecord(idx)}
                    className={`px-4 py-2 rounded-lg text-white inline-flex items-center gap-2 ${
                      isRecording && activeRecordingIndex === idx ? "bg-red-600" : "bg-fuchsia-600"
                    }`}
                  >
                    {isRecording && activeRecordingIndex === idx ? <Pause size={16} /> : <Mic size={16} />}
                    {isRecording && activeRecordingIndex === idx ? "Stop recording" : "Record response"}
                  </button>
                  {clips[idx] && <audio controls src={clips[idx]} className="h-10" />}
                </div>
                <textarea
                  value={answers[idx] || ""}
                  onChange={(e) => setAnswer(idx, e.target.value)}
                  className="mt-3 w-full min-h-24 rounded-lg border border-slate-300 p-3"
                  placeholder="Optional transcript / notes"
                />
              </article>
            ))}
          </div>
        )}

        {aiChecking && (
          <div className="mt-4 text-sm text-slate-600">Premium AI analysis running...</div>
        )}
      </main>

      {started && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-4 z-30 shadow">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-xs text-slate-500 inline-flex items-center gap-2"><Play size={14} /> Save often. Submit when ready.</p>
            <button
              disabled={submitting || aiChecking}
              onClick={handleSubmit}
              className="px-5 py-2 rounded-lg bg-slate-900 text-white font-semibold disabled:opacity-60"
            >
              {submitting || aiChecking ? "Processing..." : "Submit Section"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


